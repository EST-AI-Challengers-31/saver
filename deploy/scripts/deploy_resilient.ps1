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

function Invoke-DockerChecked {
    param(
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [Parameter(Mandatory = $true)][string]$FailureMessage,
        [switch]$Quiet
    )

    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        if ($Quiet) {
            & docker @Arguments *> $null
        }
        else {
            & docker @Arguments
        }
        $exitCode = $LASTEXITCODE
    }
    catch {
        $exitCode = 1
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }

    if ($exitCode -ne 0) {
        throw ("$FailureMessage (exit code: $exitCode)")
    }
}

function Invoke-DockerBestEffort {
    param(
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [Parameter(Mandatory = $true)][string]$WarningMessage
    )

    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        & docker @Arguments
        $exitCode = $LASTEXITCODE
    }
    catch {
        $exitCode = 1
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }

    if ($exitCode -ne 0) {
        Write-Warning $WarningMessage
    }
}

function Get-DahumMariaDbContainerId {
    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $ids = @(
            & docker ps `
                --filter 'label=com.docker.compose.project=dahum' `
                --filter 'label=com.docker.compose.service=mariadb' `
                --format '{{.ID}}' `
                2>$null
        )
        $exitCode = $LASTEXITCODE
    }
    catch {
        return $null
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }

    if ($exitCode -ne 0) {
        return $null
    }

    return @(
        $ids |
            ForEach-Object { [string]$_ } |
            Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
    ) | Select-Object -First 1
}

function Test-MariaDbCredential {
    param(
        [Parameter(Mandatory = $true)][string]$ContainerId,
        [Parameter(Mandatory = $true)][string]$Database,
        [Parameter(Mandatory = $true)][string]$User,
        [Parameter(Mandatory = $true)][string]$Password
    )

    if (
        [string]::IsNullOrWhiteSpace($ContainerId) -or
        [string]::IsNullOrWhiteSpace($Database) -or
        [string]::IsNullOrWhiteSpace($User) -or
        [string]::IsNullOrWhiteSpace($Password)
    ) {
        return $false
    }

    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        & docker exec `
            -e "MYSQL_PWD=$Password" `
            $ContainerId `
            mariadb `
            "-u$User" `
            $Database `
            '-Nse' `
            'SELECT 1;' `
            *> $null
        return ($LASTEXITCODE -eq 0)
    }
    catch {
        return $false
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }
}

function Try-MariaDbBackup {
    param(
        [Parameter(Mandatory = $true)][string]$BackupScript,
        [Parameter(Mandatory = $true)][string]$RuntimePath
    )

    if (-not (Test-Path -LiteralPath $BackupScript)) {
        Write-Host 'MariaDB backup script is not present; backup skipped.'
        return
    }

    $containerId = Get-DahumMariaDbContainerId
    if ([string]::IsNullOrWhiteSpace($containerId)) {
        Write-Host 'MariaDB is not running yet; backup skipped.'
        return
    }

    try {
        # backup_mariadb.ps1가 기존 컨테이너 자격증명과 현재 RuntimeConfig를 각각 검증한다.
        # 기존 DB 자격증명은 백업에만 사용하고 새 운영 RuntimeConfig를 덮어쓰지 않는다.
        & $BackupScript -RuntimePath $RuntimePath
        Write-Host 'MariaDB backup step completed.'
    }
    catch {
        Write-Warning ('MariaDB backup failed but deployment will continue without deleting or modifying existing DB data: ' + $_.Exception.Message)
    }
}

function Initialize-DockerAuthConfig {
    param(
        [Parameter(Mandatory = $true)][string]$ProjectRoot,
        [Parameter(Mandatory = $true)][string]$User,
        [Parameter(Mandatory = $true)][string]$Token
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

    return $dockerConfig
}

function Wait-WebHealth {
    param(
        [Parameter(Mandatory = $true)][int]$Port,
        [int]$TimeoutSeconds = 240
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

function Show-DahumDiagnostics {
    param([Parameter(Mandatory = $true)][string]$ComposePath)

    Write-Host '--- Dahum deployment diagnostics ---'
    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        & docker version 2>&1 | Select-Object -First 40 | ForEach-Object { Write-Host $_ }
        & docker compose version 2>&1 | ForEach-Object { Write-Host $_ }
        & docker compose -f $ComposePath ps 2>&1 | ForEach-Object { Write-Host $_ }
        Write-Host '--- Recent Dahum container logs ---'
        & docker compose -f $ComposePath logs --tail 160 backend ai mariadb caddy 2>&1 | ForEach-Object { Write-Host $_ }
    }
    catch {
        Write-Host ('Diagnostics could not be completed: ' + $_.Exception.Message)
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }
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
    $env:DOCKER_HOST = 'npipe:////./pipe/dockerDesktopLinuxEngine'

    New-Item -ItemType Directory -Path $RuntimePath -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $RuntimePath 'data') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $RuntimePath 'backup') -Force | Out-Null

    Invoke-DockerChecked -Arguments @('info') -FailureMessage 'Docker Desktop Linux engine is not available.' -Quiet
    Invoke-DockerChecked -Arguments @('compose', 'version') -FailureMessage 'Docker Compose plugin is not available.' -Quiet
    Write-Host 'Docker Compose mode: docker compose plugin'

    # 기존 DB는 먼저 백업하되, 운영 서비스 비밀번호는 GitHub RuntimeConfig 값을 그대로 유지한다.
    Try-MariaDbBackup -BackupScript $BackupPath -RuntimePath $RuntimePath

    $DockerConfigPath = Initialize-DockerAuthConfig `
        -ProjectRoot $AppPath `
        -User $RegistryUser `
        -Token $RegistryToken

    Write-Host "Pulling private image: $BackendImage"
    Invoke-DockerChecked `
        -Arguments @('--config', $DockerConfigPath, 'pull', $BackendImage) `
        -FailureMessage 'Backend image pull failed.'

    Write-Host "Pulling private image: $AiImage"
    Invoke-DockerChecked `
        -Arguments @('--config', $DockerConfigPath, 'pull', $AiImage) `
        -FailureMessage 'AI image pull failed.'

    Invoke-DockerChecked `
        -Arguments @('compose', '-f', $ComposePath, 'config') `
        -FailureMessage 'Docker Compose configuration validation failed.' `
        -Quiet

    Invoke-DockerBestEffort `
        -Arguments @('compose', '-f', $ComposePath, 'pull', 'mariadb', 'caddy') `
        -WarningMessage 'Public MariaDB/Caddy image refresh failed; existing local images will be used if available.'

    Invoke-DockerChecked `
        -Arguments @('compose', '-f', $ComposePath, 'up', '-d', '--remove-orphans') `
        -FailureMessage 'Docker Compose up failed.'

    # Compose가 새 MariaDB를 띄운 뒤 실제 앱 계정으로 한 번 더 검증한다.
    $mariaDbContainerId = Get-DahumMariaDbContainerId
    if (-not (Test-MariaDbCredential `
            -ContainerId $mariaDbContainerId `
            -Database $env:MARIADB_DATABASE `
            -User $env:MARIADB_USER `
            -Password $env:MARIADB_PASSWORD)) {
        throw 'MariaDB application credential verification failed after Compose startup.'
    }
    Write-Host 'MariaDB application credential verified.'

    $hostPort = [int]$env:DAHUM_HOST_PORT
    Wait-WebHealth -Port $hostPort -TimeoutSeconds 240

    Write-Host 'Python-first Dahum deployment completed.'
}
catch {
    Write-Host ('Deployment failed: ' + $_.Exception.Message)
    Show-DahumDiagnostics -ComposePath $ComposePath
    throw
}
finally {
    if ($DockerConfigPath -and (Test-Path -LiteralPath $DockerConfigPath)) {
        Remove-Item -LiteralPath $DockerConfigPath -Recurse -Force -ErrorAction SilentlyContinue
    }
}
