param(
    [string]$BackendImage = '',
    [string]$AiImage = '',
    [string]$RegistryUser = '',
    [string]$RegistryToken = '',
    [string]$RuntimeConfigBase64 = ''
)

$ErrorActionPreference = 'Stop'

function Import-RuntimeConfig {
    param([Parameter(Mandatory = $true)][string]$EncodedConfig)

    if ([string]::IsNullOrWhiteSpace($EncodedConfig)) {
        throw 'Runtime configuration was not supplied by GitHub Actions.'
    }

    try {
        $json = [System.Text.Encoding]::UTF8.GetString(
            [System.Convert]::FromBase64String($EncodedConfig)
        )
        $config = $json | ConvertFrom-Json
    }
    catch {
        throw ('Could not decode runtime configuration: ' + $_.Exception.Message)
    }

    foreach ($property in $config.PSObject.Properties) {
        [Environment]::SetEnvironmentVariable(
            [string]$property.Name,
            [string]$property.Value,
            'Process'
        )
    }

    Write-Host 'Runtime configuration loaded from GitHub Actions.'
}

function Assert-RequiredEnv {
    param([Parameter(Mandatory = $true)][string[]]$Names)

    $missing = @()
    foreach ($name in $Names) {
        $value = [Environment]::GetEnvironmentVariable($name, 'Process')
        if ([string]::IsNullOrWhiteSpace($value)) {
            $missing += $name
        }
    }

    if ($missing.Count -gt 0) {
        throw ('Required environment variables are missing: ' + ($missing -join ', '))
    }
}

function Initialize-DockerConfig {
    param(
        [string]$ProjectRoot,
        [string]$User,
        [string]$Token
    )

    if ([string]::IsNullOrWhiteSpace($User)) {
        throw 'GHCR registry user is required.'
    }
    if ([string]::IsNullOrWhiteSpace($Token)) {
        throw 'GHCR registry token is required.'
    }

    $dockerConfig = Join-Path $ProjectRoot '.docker-ci'
    if (Test-Path -LiteralPath $dockerConfig) {
        Remove-Item -LiteralPath $dockerConfig -Recurse -Force
    }

    New-Item -ItemType Directory -Path $dockerConfig -Force | Out-Null

    $credential = [System.Convert]::ToBase64String(
        [System.Text.Encoding]::UTF8.GetBytes("${User}:${Token}")
    )

    $config = @{
        auths = @{
            'ghcr.io' = @{
                auth = $credential
            }
        }
    } | ConvertTo-Json -Depth 5

    [System.IO.File]::WriteAllText(
        (Join-Path $dockerConfig 'config.json'),
        $config,
        [System.Text.UTF8Encoding]::new($false)
    )

    $env:DOCKER_CONFIG = $dockerConfig
    return $dockerConfig
}

function Wait-WebHealth {
    param(
        [int]$Port,
        [int]$TimeoutSeconds = 150
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    $url = "http://127.0.0.1:$Port/"

    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 5
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
                Write-Host "Web health passed: $url"
                return
            }
        }
        catch {
            Start-Sleep -Seconds 4
        }
    }

    throw "Web health check timed out: $url"
}

$DeployDir = Split-Path -Parent $PSScriptRoot
$AppPath = Split-Path -Parent $DeployDir
$DahumHome = Split-Path -Parent $AppPath
$RuntimePath = Join-Path $DahumHome 'runtime'
$ComposePath = Join-Path $DeployDir 'docker-compose.yml'
$BackupPath = Join-Path $PSScriptRoot 'backup_mariadb.ps1'
$DockerConfigPath = $null

try {
    Import-RuntimeConfig -EncodedConfig $RuntimeConfigBase64

    Assert-RequiredEnv -Names @(
        'MARIADB_DATABASE',
        'MARIADB_USER',
        'MARIADB_PASSWORD',
        'MARIADB_ROOT_PASSWORD',
        'SPRING_DATASOURCE_URL',
        'SPRING_DATASOURCE_USERNAME',
        'SPRING_DATASOURCE_PASSWORD',
        'AI_BASE_URL',
        'DAHUM_RUNTIME',
        'DAHUM_HOST_PORT'
    )

    if ([string]::IsNullOrWhiteSpace($BackendImage) -or [string]::IsNullOrWhiteSpace($AiImage)) {
        throw 'BackendImage and AiImage are required.'
    }

    if (-not (Test-Path -LiteralPath $ComposePath)) {
        throw "Compose file not found: $ComposePath"
    }

    $env:BACKEND_IMAGE = $BackendImage
    $env:AI_IMAGE = $AiImage

    # Windows SSH 비대화형 세션에서도 Docker Desktop Linux Engine을 직접 사용한다.
    $env:DOCKER_HOST = 'npipe:////./pipe/dockerDesktopLinuxEngine'

    New-Item -ItemType Directory -Path $RuntimePath -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $RuntimePath 'data') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $RuntimePath 'backup') -Force | Out-Null

    $DockerConfigPath = Initialize-DockerConfig `
        -ProjectRoot $AppPath `
        -User $RegistryUser `
        -Token $RegistryToken

    & docker info *> $null
    if ($LASTEXITCODE -ne 0) {
        throw 'Docker Desktop Linux engine is not available.'
    }

    & docker compose -f $ComposePath config *> $null
    if ($LASTEXITCODE -ne 0) {
        throw 'Docker Compose configuration validation failed.'
    }

    $running = @(
        & docker compose -f $ComposePath ps --status running --services
    )

    if (($running -contains 'mariadb') -and (Test-Path -LiteralPath $BackupPath)) {
        Write-Host 'Backing up MariaDB before deployment...'
        & $BackupPath -ComposePath $ComposePath -RuntimePath $RuntimePath
        if ($LASTEXITCODE -ne 0) {
            throw 'MariaDB backup failed.'
        }
    }
    else {
        Write-Host 'MariaDB backup skipped because the service is not running yet.'
    }

    & docker compose -f $ComposePath pull backend ai caddy mariadb
    if ($LASTEXITCODE -ne 0) {
        throw 'Docker image pull failed.'
    }

    & docker compose -f $ComposePath up -d --remove-orphans
    if ($LASTEXITCODE -ne 0) {
        throw 'Docker Compose up failed.'
    }

    $hostPort = [int]$env:DAHUM_HOST_PORT
    Wait-WebHealth -Port $hostPort -TimeoutSeconds 150

    Write-Host 'Python-first Dahum deployment completed.'
}
finally {
    if ($DockerConfigPath -and (Test-Path -LiteralPath $DockerConfigPath)) {
        Remove-Item -LiteralPath $DockerConfigPath -Recurse -Force -ErrorAction SilentlyContinue
    }
}
