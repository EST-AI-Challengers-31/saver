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
        [string]$ProjectRoot
    )

    $dockerConfig = Join-Path $ProjectRoot '.docker-ci'

    New-Item `
        -ItemType Directory `
        -Path $dockerConfig `
        -Force | Out-Null

    $config = @{
        auths = @{}
        cliPluginsExtraDirs = @(
            (Join-Path $env:USERPROFILE '.docker\cli-plugins')
        )
    } | ConvertTo-Json -Depth 4

    [System.IO.File]::WriteAllText(
        (Join-Path $dockerConfig 'config.json'),
        $config,
        [System.Text.UTF8Encoding]::new($false)
    )

    $env:DOCKER_CONFIG = $dockerConfig
    $env:DOCKER_HOST = 'npipe:////./pipe/dockerDesktopLinuxEngine'

    Write-Host "Using Docker config: $env:DOCKER_CONFIG"
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


function Login-Ghcr {
    param(
        [string]$User,
        [string]$Token
    )

    if (
        [string]::IsNullOrWhiteSpace($User) -or
        [string]::IsNullOrWhiteSpace($Token)
    ) {
        throw 'GHCR credentials were not supplied by GitHub Actions.'
    }

    Write-Host "Logging in to GHCR as $User..."

    $Token | & docker login ghcr.io `
        -u $User `
        --password-stdin

    if ($LASTEXITCODE -ne 0) {
        throw 'docker login ghcr.io failed.'
    }

    Write-Host 'GHCR login succeeded.'
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


$DeployDir = Split-Path -Parent $PSScriptRoot
$AppPath = Split-Path -Parent $DeployDir
$DahumHome = Split-Path -Parent $AppPath
$RuntimePath = Join-Path $DahumHome 'runtime'

$EnvPath = Join-Path $RuntimePath '.env'
$ComposePath = Join-Path $DeployDir 'docker-compose.yml'
$EnsureDockerPath = Join-Path $PSScriptRoot 'ensure_docker.ps1'
$BackupPath = Join-Path $PSScriptRoot 'backup_mariadb.ps1'
$PublicRoutePath = Join-Path $PSScriptRoot 'ensure_public_route.ps1'


if (-not (Test-Path $EnvPath)) {
    throw "Runtime env file not found: $EnvPath"
}

if (-not (Test-Path $ComposePath)) {
    throw "Compose file not found: $ComposePath"
}


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


Write-Host 'Ensuring Docker is available...'

& $EnsureDockerPath

if ($LASTEXITCODE -ne 0) {
    throw 'Docker readiness check failed.'
}


Initialize-DockerSshConfig -ProjectRoot $AppPath


if (-not [string]::IsNullOrWhiteSpace($env:DOCKER_CONFIG)) {
    $dockerConfigFile = Join-Path $env:DOCKER_CONFIG 'config.json'

    if (Test-Path $dockerConfigFile) {
        Write-Host "Docker CI config file: $dockerConfigFile"
    }
}


Login-Ghcr `
    -User $RegistryUser `
    -Token $RegistryToken


try {
    Write-Host "Deploying backend image: $BackendImage"
    Write-Host "Deploying AI image: $AiImage"


    Invoke-Compose `
        -Arguments @('config') `
        -EnvFile $EnvPath `
        -ComposeFile $ComposePath `
        *> $null


    $running = & docker compose `
        --env-file $EnvPath `
        -f $ComposePath `
        ps `
        --status running `
        --services

    if ($LASTEXITCODE -ne 0) {
        throw 'Could not inspect current Docker services.'
    }


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


    Write-Host 'Starting containers without building on the mini PC...'

    Invoke-Compose `
        -Arguments @(
            'up',
            '-d',
            '--remove-orphans'
        ) `
        -EnvFile $EnvPath `
        -ComposeFile $ComposePath


    Wait-DahumHealthy `
        -HostPort $hostPort `
        -TimeoutSeconds 180


    Write-Host 'Removing dangling Docker layers only; rollback-tagged images are retained.'

    & docker image prune -f | Out-Host
}
catch {
    $deploymentError = $_

    Write-Error "Application deployment failed: $($deploymentError.Exception.Message)"

    try {
        & docker compose `
            --env-file $EnvPath `
            -f $ComposePath `
            ps |
            Out-Host
    }
    catch {
    }

    try {
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
    try {
        & docker logout ghcr.io *> $null
    }
    catch {
    }
}


if ($autoConfigureOuterCaddy) {
    & $PublicRoutePath `
        -MoveAiRoot $moveAiRoot `
        -Domain $publicDomain `
        -DahumHostPort $hostPort
}
else {
    Write-Host 'OUTER_CADDY_AUTO_CONFIGURE=false; existing MOVEAI Caddyfile was not modified.'
}


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


& docker compose `
    --env-file $EnvPath `
    -f $ComposePath `
    ps


Write-Host "Deployment completed. Local gateway: http://127.0.0.1:$hostPort"
Write-Host "Public URL: $publicBaseUrl"
