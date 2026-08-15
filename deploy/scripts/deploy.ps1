param(
    [switch]$SkipGitUpdate,
    [string]$BackendImage = '',
    [string]$AiImage = '',
    [string]$RegistryUser = '',
    [string]$RegistryToken = '',
    [string]$RollbackCommit = ''
)

$ErrorActionPreference = 'Stop'


function Read-DotEnv {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $values = @{}

    foreach ($line in Get-Content -LiteralPath $Path -Encoding UTF8) {
        $trimmed = $line.Trim()

        if (
            [string]::IsNullOrWhiteSpace($trimmed) -or
            $trimmed.StartsWith('#') -or
            -not $trimmed.Contains('=')
        ) {
            continue
        }

        $separator = $trimmed.IndexOf('=')
        $key = $trimmed.Substring(0, $separator).Trim()
        $value = $trimmed.Substring($separator + 1).Trim()

        if (-not [string]::IsNullOrWhiteSpace($key)) {
            $values[$key] = $value
        }
    }

    return $values
}


function Get-ConfigValue {
    param(
        [hashtable]$Values,
        [string]$Key,
        [string]$DefaultValue
    )

    if (
        $Values.ContainsKey($Key) -and
        -not [string]::IsNullOrWhiteSpace([string]$Values[$Key])
    ) {
        return [string]$Values[$Key]
    }

    return $DefaultValue
}


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


    # Docker config.json의 auth 값은
    # "username:token" 문자열을 Base64로 인코딩한 값이다.
    #
    # Windows SSH 비대화형 세션에서는 docker login이
    # Docker Desktop Credential Manager를 사용하려다 실패할 수 있으므로
    # docker login을 사용하지 않고 임시 config.json을 직접 생성한다.

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
        Write-Warning "Could not remove temporary Docker CI config: $($_.Exception.Message)"
    }
}


function Invoke-Compose {
    param(
        [string[]]$Arguments,
        [string]$EnvFile,
        [string]$ComposeFile
    )

    & docker compose `
        --env-file $EnvFile `
        -f $ComposeFile `
        @Arguments

    if ($LASTEXITCODE -ne 0) {
        throw "docker compose failed: $($Arguments -join ' ')"
    }
}


function Wait-DahumHealthy {
    param(
        [int]$HostPort,
        [int]$TimeoutSeconds = 180
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    $lastMessage = 'No health response yet.'

    while ((Get-Date) -lt $deadline) {
        try {
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
                Write-Host "Dahum health check passed: $lastMessage"
                return
            }
        }
        catch {
            $lastMessage = $_.Exception.Message
        }

        Start-Sleep -Seconds 5
    }

    throw "Dahum did not become healthy within $TimeoutSeconds seconds. Last result: $lastMessage"
}


function Get-ImageBase {
    param(
        [string]$Image
    )

    $lastSlash = $Image.LastIndexOf('/')
    $lastColon = $Image.LastIndexOf(':')

    if ($lastColon -gt $lastSlash) {
        return $Image.Substring(0, $lastColon)
    }

    return $Image
}


function Try-RollbackImages {
    param(
        [string]$PreviousCommit,
        [string]$CurrentBackendImage,
        [string]$CurrentAiImage,
        [string]$EnvFile,
        [string]$ComposeFile,
        [int]$HostPort
    )

    if ([string]::IsNullOrWhiteSpace($PreviousCommit)) {
        Write-Warning 'No previous commit is available; image rollback skipped.'
        return
    }


    $backendBase = Get-ImageBase -Image $CurrentBackendImage
    $aiBase = Get-ImageBase -Image $CurrentAiImage

    $previousBackend = "$backendBase`:$PreviousCommit"
    $previousAi = "$aiBase`:$PreviousCommit"


    Write-Warning "Attempting image rollback to commit $PreviousCommit"


    $env:BACKEND_IMAGE = $previousBackend
    $env:AI_IMAGE = $previousAi


    try {
        Invoke-Compose `
            -Arguments @(
                'pull',
                'backend',
                'ai'
            ) `
            -EnvFile $EnvFile `
            -ComposeFile $ComposeFile


        Invoke-Compose `
            -Arguments @(
                'up',
                '-d',
                '--remove-orphans'
            ) `
            -EnvFile $EnvFile `
            -ComposeFile $ComposeFile


        Wait-DahumHealthy `
            -HostPort $HostPort `
            -TimeoutSeconds 120


        Write-Warning 'Previous GHCR images were restored successfully.'
    }
    catch {
        Write-Warning "Automatic image rollback failed: $($_.Exception.Message)"
    }
}


# ============================================================
# Paths
# ============================================================

$DeployDir = Split-Path -Parent $PSScriptRoot

$AppPath = Split-Path -Parent $DeployDir

$DahumHome = Split-Path -Parent $AppPath

$RuntimePath = Join-Path $DahumHome 'runtime'

$EnvPath = Join-Path $RuntimePath '.env'

$ComposePath = Join-Path $DeployDir 'docker-compose.yml'

$EnsureDockerPath = Join-Path $PSScriptRoot 'ensure_docker.ps1'

$BackupPath = Join-Path $PSScriptRoot 'backup_mariadb.ps1'

$PublicRoutePath = Join-Path $PSScriptRoot 'ensure_public_route.ps1'


# ============================================================
# Required files
# ============================================================

if (-not (Test-Path -LiteralPath $EnvPath)) {
    throw "Runtime env file not found: $EnvPath"
}

if (-not (Test-Path -LiteralPath $ComposePath)) {
    throw "Compose file not found: $ComposePath"
}

if (-not (Test-Path -LiteralPath $EnsureDockerPath)) {
    throw "Docker readiness script not found: $EnsureDockerPath"
}


# ============================================================
# Runtime configuration
# ============================================================

$config = Read-DotEnv -Path $EnvPath


$hostPort = [int](
    Get-ConfigValue `
        -Values $config `
        -Key 'DAHUM_HOST_PORT' `
        -DefaultValue '9000'
)


$publicDomain = Get-ConfigValue `
    -Values $config `
    -Key 'PUBLIC_DOMAIN' `
    -DefaultValue 'yellow.it.kr'


$publicBaseUrl = Get-ConfigValue `
    -Values $config `
    -Key 'PUBLIC_BASE_URL' `
    -DefaultValue "https://$publicDomain"


$moveAiRoot = Get-ConfigValue `
    -Values $config `
    -Key 'MOVEAI_ROOT' `
    -DefaultValue 'C:/MOVEAI'


$autoConfigureOuterCaddy = (
    Get-ConfigValue `
        -Values $config `
        -Key 'OUTER_CADDY_AUTO_CONFIGURE' `
        -DefaultValue 'false'
).ToLowerInvariant() -eq 'true'


$verifyPublicUrl = (
    Get-ConfigValue `
        -Values $config `
        -Key 'VERIFY_PUBLIC_URL' `
        -DefaultValue 'false'
).ToLowerInvariant() -eq 'true'


# ============================================================
# Docker images
# ============================================================

if ([string]::IsNullOrWhiteSpace($BackendImage)) {
    $BackendImage = Get-ConfigValue `
        -Values $config `
        -Key 'BACKEND_IMAGE' `
        -DefaultValue ''
}


if ([string]::IsNullOrWhiteSpace($AiImage)) {
    $AiImage = Get-ConfigValue `
        -Values $config `
        -Key 'AI_IMAGE' `
        -DefaultValue ''
}


if (
    [string]::IsNullOrWhiteSpace($BackendImage) -or
    [string]::IsNullOrWhiteSpace($AiImage)
) {
    throw 'BACKEND_IMAGE and AI_IMAGE must be supplied by Actions or runtime .env.'
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
        throw 'Server repository contains uncommitted changes. Deployment stopped.'
    }


    if ([string]::IsNullOrWhiteSpace($RollbackCommit)) {
        $RollbackCommit = (git rev-parse HEAD).Trim()
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


# docker login을 사용하지 않는다.
#
# GitHub Actions에서 받은 RegistryUser + RegistryToken을 이용해
# 임시 Docker config.json을 만든다.

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


    Write-Host 'Validating Docker Compose configuration...'

    Invoke-Compose `
        -Arguments @(
            'config'
        ) `
        -EnvFile $EnvPath `
        -ComposeFile $ComposePath `
        *> $null


    # ========================================================
    # Existing services
    # ========================================================

    $running = & docker compose `
        --env-file $EnvPath `
        -f $ComposePath `
        ps `
        --status running `
        --services


    if ($LASTEXITCODE -ne 0) {
        throw 'Could not inspect current Docker services.'
    }


    # ========================================================
    # MariaDB backup
    # ========================================================

    if ($running -contains 'mariadb') {

        Write-Host 'Backing up MariaDB before deployment...'

        & $BackupPath `
            -EnvPath $EnvPath `
            -ComposePath $ComposePath `
            -RuntimePath $RuntimePath


        if ($LASTEXITCODE -ne 0) {
            throw 'MariaDB backup failed.'
        }
    }
    else {
        Write-Host 'MariaDB is not running yet; backup skipped for first deployment.'
    }


    # ========================================================
    # Pull
    # ========================================================

    Write-Host 'Pulling immutable application images and infrastructure images...'

    Invoke-Compose `
        -Arguments @(
            'pull',
            'backend',
            'ai',
            'mariadb',
            'caddy'
        ) `
        -EnvFile $EnvPath `
        -ComposeFile $ComposePath


    # ========================================================
    # Start
    # ========================================================

    Write-Host 'Starting containers without building on the mini PC...'

    Invoke-Compose `
        -Arguments @(
            'up',
            '-d',
            '--remove-orphans'
        ) `
        -EnvFile $EnvPath `
        -ComposeFile $ComposePath


    # ========================================================
    # Health check
    # ========================================================

    Write-Host 'Waiting for Dahum health check...'

    Wait-DahumHealthy `
        -HostPort $hostPort `
        -TimeoutSeconds 180


    # ========================================================
    # Cleanup Docker images
    # ========================================================

    Write-Host 'Removing dangling Docker layers only; rollback-tagged images are retained.'

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

        Write-Host 'OUTER_CADDY_AUTO_CONFIGURE=false; existing MOVEAI Caddyfile was not modified.'
    }


    # ========================================================
    # Public URL
    # ========================================================

    if ($verifyPublicUrl) {

        $publicHealth = Invoke-RestMethod `
            -Uri "$publicBaseUrl/api/health" `
            -TimeoutSec 20


        if ($publicHealth.status -ne 'UP') {
            throw 'Public health endpoint did not report UP.'
        }


        Write-Host 'Public domain verification passed.'
    }
    else {

        Write-Host 'VERIFY_PUBLIC_URL=false; public URL check skipped.'
    }


    # ========================================================
    # Final status
    # ========================================================

    Write-Host 'Final Docker Compose status:'

    & docker compose `
        --env-file $EnvPath `
        -f $ComposePath `
        ps


    if ($LASTEXITCODE -ne 0) {
        throw 'Could not display final Docker Compose status.'
    }


    Write-Host "Deployment completed. Local gateway: http://127.0.0.1:$hostPort"
    Write-Host "Public URL: $publicBaseUrl"
}
catch {

    $deploymentError = $_


    Write-Error "Application deployment failed: $($deploymentError.Exception.Message)"


    try {

        Write-Host 'Docker Compose status after deployment failure:'

        & docker compose `
            --env-file $EnvPath `
            -f $ComposePath `
            ps |
            Out-Host
    }
    catch {
    }


    try {

        Write-Host 'Recent Docker logs:'

        & docker compose `
            --env-file $EnvPath `
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
        -EnvFile $EnvPath `
        -ComposeFile $ComposePath `
        -HostPort $hostPort


    throw $deploymentError
}
finally {

    # Docker 인증 파일에는 GitHub Token 정보가 포함되므로
    # 성공/실패 여부와 관계없이 마지막에 삭제한다.

    Remove-DockerSshConfig `
        -DockerConfigPath $temporaryDockerConfig
}
