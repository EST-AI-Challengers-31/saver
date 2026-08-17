param(
    [switch]$SkipGitUpdate,
    [string]$BackendImage = '',
    [string]$AiImage = '',
    [string]$RegistryUser = '',
    [string]$RegistryToken = '',
    [string]$RollbackCommit = ''
)

$ErrorActionPreference = 'Stop'


# ============================================================
# Environment helpers
# GitHub Actions에서 전달된 프로세스 환경변수를 읽는다.
# 서버의 .env 파일은 사용하지 않는다.
# ============================================================

function Get-EnvValue {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,

        [string]$DefaultValue = ''
    )

    $value = [Environment]::GetEnvironmentVariable($Name)

    if (-not [string]::IsNullOrWhiteSpace($value)) {
        return $value
    }

    return $DefaultValue
}


function Assert-RequiredEnv {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Names
    )

    $missing = @()

    foreach ($name in $Names) {

        $value = [Environment]::GetEnvironmentVariable($name)

        if ([string]::IsNullOrWhiteSpace($value)) {
            $missing += $name
        }
    }

    if ($missing.Count -gt 0) {

        throw (
            'Required environment variables are missing: ' +
            ($missing -join ', ')
        )
    }
}


# ============================================================
# Docker SSH / GHCR authentication
# Windows 비대화형 SSH에서 docker login을 사용하지 않는다.
# ============================================================

function Initialize-DockerSshConfig {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ProjectRoot,

        [Parameter(Mandatory = $true)]
        [string]$RegistryUser,

        [Parameter(Mandatory = $true)]
        [string]$RegistryToken
    )

    if ([string]::IsNullOrWhiteSpace($RegistryUser)) {
        throw 'GHCR registry user was not supplied by GitHub Actions.'
    }

    if ([string]::IsNullOrWhiteSpace($RegistryToken)) {
        throw 'GHCR registry token was not supplied by GitHub Actions.'
    }

    $dockerConfig = Join-Path $ProjectRoot '.docker-ci'

    if (Test-Path -LiteralPath $dockerConfig) {

        Remove-Item `
            -LiteralPath $dockerConfig `
            -Recurse `
            -Force
    }

    New-Item `
        -ItemType Directory `
        -Path $dockerConfig `
        -Force | Out-Null


    # GitHub 사용자명:토큰 값을 Base64로 인코딩한다.
    $credentialText = "${RegistryUser}:${RegistryToken}"

    $credentialBytes = [System.Text.Encoding]::UTF8.GetBytes(
        $credentialText
    )

    $encodedCredential = [System.Convert]::ToBase64String(
        $credentialBytes
    )


    $config = @{
        auths = @{
            'ghcr.io' = @{
                auth = $encodedCredential
            }
        }

        cliPluginsExtraDirs = @(
            (Join-Path $env:USERPROFILE '.docker\cli-plugins')
        )
    } | ConvertTo-Json -Depth 6


    $configPath = Join-Path $dockerConfig 'config.json'

    [System.IO.File]::WriteAllText(
        $configPath,
        $config,
        [System.Text.UTF8Encoding]::new($false)
    )


    $env:DOCKER_CONFIG = $dockerConfig

    # Docker Desktop Linux Engine
    $env:DOCKER_HOST = 'npipe:////./pipe/dockerDesktopLinuxEngine'

    Write-Host "Using Docker CI config: $dockerConfig"
    Write-Host 'GHCR authentication configured for non-interactive deployment.'
}


function Remove-DockerSshConfig {
    param(
        [string]$DockerConfigPath
    )

    if ([string]::IsNullOrWhiteSpace($DockerConfigPath)) {
        return
    }

    if (-not (Test-Path -LiteralPath $DockerConfigPath)) {
        return
    }

    try {

        Remove-Item `
            -LiteralPath $DockerConfigPath `
            -Recurse `
            -Force

        Write-Host 'Temporary Docker CI credentials removed.'
    }
    catch {

        Write-Warning (
            "Could not remove temporary Docker CI config: " +
            "$($_.Exception.Message)"
        )
    }
}


# ============================================================
# Docker Compose
# --env-file 사용 안 함.
# 현재 PowerShell 프로세스의 환경변수를 Compose가 사용한다.
# ============================================================

function Invoke-Compose {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments,

        [Parameter(Mandatory = $true)]
        [string]$ComposeFile
    )

    & docker compose `
        -f $ComposeFile `
        @Arguments

    if ($LASTEXITCODE -ne 0) {

        throw (
            "docker compose failed: " +
            ($Arguments -join ' ')
        )
    }
}


# ============================================================
# Health check
#
# web:
#   현재 개발 단계
#   웹 서비스가 HTTP 응답을 하면 성공
#
# full:
#   backend + database + ai 모두 UP이어야 성공
# ============================================================

function Wait-DahumHealthy {
    param(
        [Parameter(Mandatory = $true)]
        [int]$HostPort,

        [ValidateSet('web', 'full')]
        [string]$Mode = 'web',

        [int]$TimeoutSeconds = 180
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    $lastMessage = 'No health response yet.'

    while ((Get-Date) -lt $deadline) {

        try {

            if ($Mode -eq 'web') {

                $response = Invoke-WebRequest `
                    -Uri "http://127.0.0.1:$HostPort/" `
                    -UseBasicParsing `
                    -TimeoutSec 10


                $lastMessage = (
                    "HTTP status: " +
                    [string]$response.StatusCode
                )


                if (
                    $response.StatusCode -ge 200 -and
                    $response.StatusCode -lt 400
                ) {

                    Write-Host (
                        "Dahum WEB health check passed: " +
                        $lastMessage
                    )

                    return
                }
            }
            else {

                $status = Invoke-RestMethod `
                    -Uri "http://127.0.0.1:$HostPort/api/system/status" `
                    -TimeoutSec 10


                $lastMessage = (
                    $status |
                    ConvertTo-Json -Compress -Depth 5
                )


                if (
                    $status.backend -eq 'UP' -and
                    $status.database -eq 'UP' -and
                    $status.ai -eq 'UP'
                ) {

                    Write-Host (
                        "Dahum FULL health check passed: " +
                        $lastMessage
                    )

                    return
                }
            }
        }
        catch {

            $lastMessage = $_.Exception.Message
        }

        Start-Sleep -Seconds 5
    }


    throw (
        "Dahum did not become healthy within " +
        "$TimeoutSeconds seconds. " +
        "Mode=$Mode. " +
        "Last result: $lastMessage"
    )
}


# ============================================================
# Docker image helpers
# ============================================================

function Get-ImageBase {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Image
    )

    $lastSlash = $Image.LastIndexOf('/')
    $lastColon = $Image.LastIndexOf(':')

    if ($lastColon -gt $lastSlash) {

        return $Image.Substring(
            0,
            $lastColon
        )
    }

    return $Image
}


# ============================================================
# Rollback
# ============================================================

function Try-RollbackImages {
    param(
        [string]$PreviousCommit,

        [string]$CurrentBackendImage,

        [string]$CurrentAiImage,

        [string]$ComposeFile,

        [int]$HostPort,

        [ValidateSet('web', 'full')]
        [string]$HealthMode = 'web'
    )

    if ([string]::IsNullOrWhiteSpace($PreviousCommit)) {

        Write-Warning (
            'No previous commit is available; ' +
            'image rollback skipped.'
        )

        return
    }


    $backendBase = Get-ImageBase `
        -Image $CurrentBackendImage

    $aiBase = Get-ImageBase `
        -Image $CurrentAiImage


    $previousBackend = "$backendBase`:$PreviousCommit"
    $previousAi = "$aiBase`:$PreviousCommit"


    Write-Warning (
        "Attempting image rollback to commit " +
        $PreviousCommit
    )


    $env:BACKEND_IMAGE = $previousBackend
    $env:AI_IMAGE = $previousAi


    try {

        Invoke-Compose `
            -Arguments @(
                'pull',
                'backend',
                'ai'
            ) `
            -ComposeFile $ComposeFile


        Invoke-Compose `
            -Arguments @(
                'up',
                '-d',
                '--remove-orphans'
            ) `
            -ComposeFile $ComposeFile


        Wait-DahumHealthy `
            -HostPort $HostPort `
            -Mode $HealthMode `
            -TimeoutSeconds 120


        Write-Warning (
            'Previous GHCR images were restored successfully.'
        )
    }
    catch {

        Write-Warning (
            "Automatic image rollback failed: " +
            "$($_.Exception.Message)"
        )
    }
}


# ============================================================
# Paths
# ============================================================

$DeployDir = Split-Path -Parent $PSScriptRoot

$AppPath = Split-Path -Parent $DeployDir

$DahumHome = Split-Path -Parent $AppPath

$RuntimePath = Join-Path $DahumHome 'runtime'

$ComposePath = Join-Path $DeployDir 'docker-compose.yml'

$EnsureDockerPath = Join-Path `
    $PSScriptRoot `
    'ensure_docker.ps1'

$BackupPath = Join-Path `
    $PSScriptRoot `
    'backup_mariadb.ps1'

$PublicRoutePath = Join-Path `
    $PSScriptRoot `
    'ensure_public_route.ps1'


# ============================================================
# Required files
# .env 파일은 검사하지 않는다.
# ============================================================

if (-not (Test-Path -LiteralPath $ComposePath)) {

    throw "Compose file not found: $ComposePath"
}

if (-not (Test-Path -LiteralPath $EnsureDockerPath)) {

    throw (
        "Docker readiness script not found: " +
        $EnsureDockerPath
    )
}


# ============================================================
# Runtime configuration
# GitHub Actions가 전달한 환경변수를 읽는다.
# ============================================================

$hostPort = [int](
    Get-EnvValue `
        -Name 'DAHUM_HOST_PORT' `
        -DefaultValue '9000'
)


$publicDomain = Get-EnvValue `
    -Name 'PUBLIC_DOMAIN' `
    -DefaultValue 'yellow.it.kr'


$publicBaseUrl = Get-EnvValue `
    -Name 'PUBLIC_BASE_URL' `
    -DefaultValue "https://$publicDomain"


$moveAiRoot = Get-EnvValue `
    -Name 'MOVEAI_ROOT' `
    -DefaultValue 'C:/MOVEAI'


$autoConfigureOuterCaddy = (
    Get-EnvValue `
        -Name 'OUTER_CADDY_AUTO_CONFIGURE' `
        -DefaultValue 'false'
).ToLowerInvariant() -eq 'true'


$verifyPublicUrl = (
    Get-EnvValue `
        -Name 'VERIFY_PUBLIC_URL' `
        -DefaultValue 'false'
).ToLowerInvariant() -eq 'true'


$healthMode = (
    Get-EnvValue `
        -Name 'DEPLOY_HEALTH_MODE' `
        -DefaultValue 'web'
).ToLowerInvariant()


if ($healthMode -notin @('web', 'full')) {

    throw (
        'DEPLOY_HEALTH_MODE must be either ' +
        "'web' or 'full'."
    )
}


# ============================================================
# Required runtime environment variables
#
# 실제 값은 GitHub Actions에서 전달되어야 한다.
# 외부 API 키는 아직 미연동이므로 현재 필수 목록에서 제외한다.
# ============================================================

Assert-RequiredEnv `
    -Names @(
        'MARIADB_DATABASE',
        'MARIADB_USER',
        'MARIADB_PASSWORD',
        'MARIADB_ROOT_PASSWORD',
        'SPRING_DATASOURCE_URL',
        'SPRING_DATASOURCE_USERNAME',
        'SPRING_DATASOURCE_PASSWORD',
        'AI_BASE_URL'
    )


# ============================================================
# Docker images
# Actions parameter가 우선.
# 없으면 GitHub Actions가 주입한 환경변수를 사용한다.
# ============================================================

if ([string]::IsNullOrWhiteSpace($BackendImage)) {

    $BackendImage = Get-EnvValue `
        -Name 'BACKEND_IMAGE'
}


if ([string]::IsNullOrWhiteSpace($AiImage)) {

    $AiImage = Get-EnvValue `
        -Name 'AI_IMAGE'
}


if (
    [string]::IsNullOrWhiteSpace($BackendImage) -or
    [string]::IsNullOrWhiteSpace($AiImage)
) {

    throw (
        'BACKEND_IMAGE and AI_IMAGE must be ' +
        'supplied by GitHub Actions.'
    )
}


$env:BACKEND_IMAGE = $BackendImage
$env:AI_IMAGE = $AiImage


# ============================================================
# Repository
# ============================================================

Set-Location -LiteralPath $AppPath


if (-not $SkipGitUpdate) {

    $dirty = @(git status --porcelain)


    if ($LASTEXITCODE -ne 0) {

        throw 'git status failed.'
    }


    if ($dirty.Count -gt 0) {

        throw (
            'Server repository contains uncommitted changes. ' +
            'Deployment stopped.'
        )
    }


    if ([string]::IsNullOrWhiteSpace($RollbackCommit)) {

        $RollbackCommit = (
            git rev-parse HEAD
        ).Trim()
    }


    git fetch --prune origin main


    if ($LASTEXITCODE -ne 0) {

        throw 'git fetch failed.'
    }


    git checkout main


    if ($LASTEXITCODE -ne 0) {

        throw 'git checkout main failed.'
    }


    git pull --ff-only origin main


    if ($LASTEXITCODE -ne 0) {

        throw 'git pull failed.'
    }
}


# ============================================================
# Docker
# ============================================================

Write-Host 'Ensuring Docker is available...'

& $EnsureDockerPath


if ($LASTEXITCODE -ne 0) {

    throw 'Docker readiness check failed.'
}


Initialize-DockerSshConfig `
    -ProjectRoot $AppPath `
    -RegistryUser $RegistryUser `
    -RegistryToken $RegistryToken


$temporaryDockerConfig = $env:DOCKER_CONFIG


try {

    # ========================================================
    # Deploy
    # ========================================================

    Write-Host "Deploying backend image: $BackendImage"
    Write-Host "Deploying AI image: $AiImage"
    Write-Host "Deployment health mode: $healthMode"


    Write-Host (
        'Validating Docker Compose configuration...'
    )


    Invoke-Compose `
        -Arguments @(
            'config'
        ) `
        -ComposeFile $ComposePath `
        *> $null


    # ========================================================
    # Existing services
    # ========================================================

    $running = & docker compose `
        -f $ComposePath `
        ps `
        --status running `
        --services


    if ($LASTEXITCODE -ne 0) {

        throw (
            'Could not inspect current Docker services.'
        )
    }


    # ========================================================
    # MariaDB backup
    #
    # 주의:
    # backup_mariadb.ps1도 .env 없는 방식으로
    # 수정되어 있어야 한다.
    # ========================================================

    if ($running -contains 'mariadb') {

        if (Test-Path -LiteralPath $BackupPath) {

            Write-Host (
                'Backing up MariaDB before deployment...'
            )


            & $BackupPath `
                -ComposePath $ComposePath `
                -RuntimePath $RuntimePath


            if ($LASTEXITCODE -ne 0) {

                throw 'MariaDB backup failed.'
            }
        }
        else {

            Write-Warning (
                'MariaDB backup script was not found. ' +
                'Deployment will continue without backup.'
            )
        }
    }
    else {

        Write-Host (
            'MariaDB is not running yet; ' +
            'backup skipped for first deployment.'
        )
    }


    # ========================================================
    # Pull
    # ========================================================

    Write-Host (
        'Pulling immutable application images ' +
        'and infrastructure images...'
    )


    Invoke-Compose `
        -Arguments @(
            'pull',
            'backend',
            'ai',
            'mariadb',
            'caddy'
        ) `
        -ComposeFile $ComposePath


    # ========================================================
    # Start
    # ========================================================

    Write-Host (
        'Starting containers without building ' +
        'on the mini PC...'
    )


    Invoke-Compose `
        -Arguments @(
            'up',
            '-d',
            '--remove-orphans'
        ) `
        -ComposeFile $ComposePath


    # ========================================================
    # Health check
    # ========================================================

    Write-Host 'Waiting for Dahum health check...'


    Wait-DahumHealthy `
        -HostPort $hostPort `
        -Mode $healthMode `
        -TimeoutSeconds 180


    # ========================================================
    # Cleanup Docker images
    # ========================================================

    Write-Host (
        'Removing dangling Docker layers only; ' +
        'rollback-tagged images are retained.'
    )


    & docker image prune -f | Out-Host


    # ========================================================
    # Outer MOVEAI Caddy
    # ========================================================

    if ($autoConfigureOuterCaddy) {

        & $PublicRoutePath `
            -MoveAiRoot $moveAiRoot `
            -Domain $publicDomain `
            -DahumHostPort $hostPort
    }
    else {

        Write-Host (
            'OUTER_CADDY_AUTO_CONFIGURE=false; ' +
            'existing MOVEAI Caddyfile was not modified.'
        )
    }


    # ========================================================
    # Public URL
    # ========================================================

    if ($verifyPublicUrl) {

        $publicHealth = Invoke-RestMethod `
            -Uri "$publicBaseUrl/api/health" `
            -TimeoutSec 20


        if ($publicHealth.status -ne 'UP') {

            throw (
                'Public health endpoint did not report UP.'
            )
        }


        Write-Host (
            'Public domain verification passed.'
        )
    }
    else {

        Write-Host (
            'VERIFY_PUBLIC_URL=false; ' +
            'public URL check skipped.'
        )
    }


    # ========================================================
    # Final status
    # ========================================================

    Write-Host 'Final Docker Compose status:'


    & docker compose `
        -f $ComposePath `
        ps


    if ($LASTEXITCODE -ne 0) {

        throw (
            'Could not display final Docker Compose status.'
        )
    }


    Write-Host (
        "Deployment completed. " +
        "Local gateway: http://127.0.0.1:$hostPort"
    )

    Write-Host "Public URL: $publicBaseUrl"
}
catch {

    $deploymentError = $_


    Write-Error (
        "Application deployment failed: " +
        "$($deploymentError.Exception.Message)"
    )


    try {

        Write-Host (
            'Docker Compose status ' +
            'after deployment failure:'
        )


        & docker compose `
            -f $ComposePath `
            ps |
            Out-Host
    }
    catch {
    }


    try {

        Write-Host 'Recent Docker logs:'


        & docker compose `
            -f $ComposePath `
            logs `
            --tail 120 `
            backend `
            ai `
            mariadb `
            caddy |
            Out-Host
    }
    catch {
    }


    Try-RollbackImages `
        -PreviousCommit $RollbackCommit `
        -CurrentBackendImage $BackendImage `
        -CurrentAiImage $AiImage `
        -ComposeFile $ComposePath `
        -HostPort $hostPort `
        -HealthMode $healthMode


    throw $deploymentError
}
finally {

    # 임시 Docker 인증 파일에는 GitHub Token 정보가
    # 포함되므로 성공/실패 여부와 관계없이 삭제한다.

    Remove-DockerSshConfig `
        -DockerConfigPath $temporaryDockerConfig
}
