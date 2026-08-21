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
    finally {
        $ErrorActionPreference = $previousPreference
    }

    if ($exitCode -ne 0) {
        throw ("$FailureMessage (exit code: $exitCode)")
    }
}

function Test-DockerComposePlugin {
    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        & docker compose version *> $null
        return ($LASTEXITCODE -eq 0)
    }
    catch {
        return $false
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }
}

function Resolve-ComposeMode {
    if (Test-DockerComposePlugin) {
        Write-Host 'Docker Compose mode: docker compose plugin'
        return 'plugin'
    }

    $legacy = Get-Command 'docker-compose.exe' -ErrorAction SilentlyContinue
    if (-not $legacy) {
        $legacy = Get-Command 'docker-compose' -ErrorAction SilentlyContinue
    }

    if ($legacy) {
        Write-Host ('Docker Compose mode: legacy executable -> ' + $legacy.Source)
        return 'legacy'
    }

    throw 'Docker Compose is not available in the Windows SSH session.'
}

function Invoke-ComposeChecked {
    param(
        [Parameter(Mandatory = $true)][string]$Mode,
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [Parameter(Mandatory = $true)][string]$FailureMessage,
        [switch]$Quiet
    )

    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        if ($Mode -eq 'plugin') {
            if ($Quiet) {
                & docker compose @Arguments *> $null
            }
            else {
                & docker compose @Arguments
            }
        }
        else {
            if ($Quiet) {
                & docker-compose @Arguments *> $null
            }
            else {
                & docker-compose @Arguments
            }
        }
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }

    if ($exitCode -ne 0) {
        throw ("$FailureMessage (exit code: $exitCode)")
    }
}

function Get-ComposeRunningServices {
    param(
        [Parameter(Mandatory = $true)][string]$Mode,
        [Parameter(Mandatory = $true)][string]$ComposePath
    )

    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        if ($Mode -eq 'plugin') {
            $output = @(& docker compose -f $ComposePath ps --status running --services 2>$null)
        }
        else {
            $output = @(
                & docker ps `
                    --filter 'label=com.docker.compose.project=dahum' `
                    --format '{{.Label "com.docker.compose.service"}}' `
                    2>$null
            )
        }
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }

    if ($exitCode -ne 0) {
        throw 'Could not inspect running Dahum services.'
    }

    return @($output | ForEach-Object { [string]$_ } | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
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

function Get-ContainerEnvValue {
    param(
        [Parameter(Mandatory = $true)][string]$ContainerId,
        [Parameter(Mandatory = $true)][string]$Name
    )

    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $lines = @(
            & docker inspect `
                --format '{{range .Config.Env}}{{println .}}{{end}}' `
                $ContainerId `
                2>$null
        )
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }

    if ($exitCode -ne 0) {
        return $null
    }

    $prefix = "$Name="
    foreach ($line in $lines) {
        $text = [string]$line
        if ($text.StartsWith($prefix, [System.StringComparison]::Ordinal)) {
            return $text.Substring($prefix.Length)
        }
    }

    return $null
}

function Test-MariaDbCredential {
    param(
        [Parameter(Mandatory = $true)][string]$ContainerId,
        [Parameter(Mandatory = $true)][string]$Database,
        [Parameter(Mandatory = $true)][string]$User,
        [Parameter(Mandatory = $true)][string]$Password
    )

    if (
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
            '-e' `
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

function Adopt-ExistingMariaDbCredential {
    $containerId = Get-DahumMariaDbContainerId
    if ([string]::IsNullOrWhiteSpace($containerId)) {
        Write-Host 'No existing MariaDB container found; GitHub runtime credentials will initialize the DB.'
        return
    }

    $existingDatabase = Get-ContainerEnvValue -ContainerId $containerId -Name 'MARIADB_DATABASE'
    $existingUser = Get-ContainerEnvValue -ContainerId $containerId -Name 'MARIADB_USER'
    $existingPassword = Get-ContainerEnvValue -ContainerId $containerId -Name 'MARIADB_PASSWORD'
    $existingRootPassword = Get-ContainerEnvValue -ContainerId $containerId -Name 'MARIADB_ROOT_PASSWORD'

    if (-not (Test-MariaDbCredential `
            -ContainerId $containerId `
            -Database $existingDatabase `
            -User $existingUser `
            -Password $existingPassword)) {
        Write-Host 'Existing MariaDB container credentials are not valid; keeping GitHub runtime credentials.'
        return
    }

    # MariaDB entrypoint 비밀번호는 기존 volume이 있을 때 자동 갱신되지 않는다.
    # 기존 DB가 실제로 사용하는 검증된 자격증명을 이번 배포 프로세스에 채택해
    # Backend/AI와 DB의 비밀번호 불일치를 방지한다. 값 자체는 로그에 출력하지 않는다.
    $env:MARIADB_DATABASE = $existingDatabase
    $env:MARIADB_USER = $existingUser
    $env:MARIADB_PASSWORD = $existingPassword
    $env:SPRING_DATASOURCE_URL = "jdbc:mariadb://mariadb:3306/$existingDatabase"
    $env:SPRING_DATASOURCE_USERNAME = $existingUser
    $env:SPRING_DATASOURCE_PASSWORD = $existingPassword

    if (-not [string]::IsNullOrWhiteSpace($existingRootPassword)) {
        $env:MARIADB_ROOT_PASSWORD = $existingRootPassword
    }

    Write-Host 'Existing MariaDB credentials verified and adopted for this deployment.'
}

function Initialize-DockerAuthConfig {
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

    return $dockerConfig
}

function Pull-PrivateImage {
    param(
        [Parameter(Mandatory = $true)][string]$DockerConfigPath,
        [Parameter(Mandatory = $true)][string]$Image
    )

    Write-Host ("Pulling private image: $Image")
    Invoke-DockerChecked `
        -Arguments @('--config', $DockerConfigPath, 'pull', $Image) `
        -FailureMessage ("Could not pull private image: $Image")
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

function Show-DahumDiagnostics {
    param(
        [string]$ComposeMode,
        [string]$ComposePath
    )

    Write-Host '--- Dahum deployment diagnostics ---'
    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        & docker version 2>&1 | Select-Object -First 40 | ForEach-Object { Write-Host $_ }
        if ($ComposeMode -eq 'plugin') {
            & docker compose version 2>&1 | ForEach-Object { Write-Host $_ }
            & docker compose -f $ComposePath ps 2>&1 | ForEach-Object { Write-Host $_ }
        }
        elseif ($ComposeMode -eq 'legacy') {
            & docker-compose version 2>&1 | ForEach-Object { Write-Host $_ }
            & docker-compose -f $ComposePath ps 2>&1 | ForEach-Object { Write-Host $_ }
        }
        & docker ps -a --filter 'label=com.docker.compose.project=dahum' 2>&1 | ForEach-Object { Write-Host $_ }
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
$ComposeMode = $null

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

    Invoke-DockerChecked `
        -Arguments @('info') `
        -FailureMessage 'Docker Desktop Linux engine is not available.' `
        -Quiet

    $ComposeMode = Resolve-ComposeMode

    # 기존 MariaDB volume은 새 Actions Secret으로 비밀번호가 자동 변경되지 않는다.
    # 현재 DB에 실제로 로그인되는 기존 자격증명을 먼저 채택해 서비스 연결을 복구한다.
    Adopt-ExistingMariaDbCredential

    $DockerConfigPath = Initialize-DockerAuthConfig `
        -ProjectRoot $AppPath `
        -User $RegistryUser `
        -Token $RegistryToken

    Pull-PrivateImage -DockerConfigPath $DockerConfigPath -Image $BackendImage
    Pull-PrivateImage -DockerConfigPath $DockerConfigPath -Image $AiImage

    Invoke-ComposeChecked `
        -Mode $ComposeMode `
        -Arguments @('-f', $ComposePath, 'config') `
        -FailureMessage 'Docker Compose configuration validation failed.' `
        -Quiet

    $running = Get-ComposeRunningServices -Mode $ComposeMode -ComposePath $ComposePath

    if (($running -contains 'mariadb') -and (Test-Path -LiteralPath $BackupPath)) {
        Write-Host 'Backing up MariaDB before deployment...'
        & $BackupPath -RuntimePath $RuntimePath
        if ($LASTEXITCODE -ne 0) {
            throw 'MariaDB backup failed.'
        }
    }
    else {
        Write-Host 'MariaDB backup skipped because the service is not running yet.'
    }

    Invoke-ComposeChecked `
        -Mode $ComposeMode `
        -Arguments @('-f', $ComposePath, 'pull', 'mariadb', 'caddy') `
        -FailureMessage 'Could not pull public MariaDB/Caddy images.'

    Invoke-ComposeChecked `
        -Mode $ComposeMode `
        -Arguments @('-f', $ComposePath, 'up', '-d', '--remove-orphans') `
        -FailureMessage 'Docker Compose up failed.'

    $hostPort = [int]$env:DAHUM_HOST_PORT
    Wait-WebHealth -Port $hostPort -TimeoutSeconds 150

    Write-Host 'Python-first Dahum deployment completed.'
}
catch {
    Write-Host ('Deployment failed: ' + $_.Exception.Message)
    Show-DahumDiagnostics -ComposeMode $ComposeMode -ComposePath $ComposePath
    throw
}
finally {
    if ($DockerConfigPath -and (Test-Path -LiteralPath $DockerConfigPath)) {
        Remove-Item -LiteralPath $DockerConfigPath -Recurse -Force -ErrorAction SilentlyContinue
    }
}
