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

    # Windows PowerShell 5.1은 native stderr를 ErrorRecord로 바꿀 수 있으므로
    # 실행 중에만 Continue로 낮추고 exit code를 직접 검사한다.
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
            # legacy docker-compose는 --status 옵션을 지원하지 않을 수 있으므로
            # 실제 실행 중인 컨테이너는 Docker label로 확인한다.
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

    # 중요: DOCKER_CONFIG 환경변수를 전역으로 바꾸지 않는다.
    # Docker Desktop의 compose CLI plugin 탐색이 깨질 수 있기 때문이다.
    return $dockerConfig
}

function Pull-PrivateImage {
    param(
        [Parameter(Mandatory = $true)][string]$DockerConfigPath,
        [Parameter(Mandatory = $true)][string]$Image
    )

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

    # Windows SSH 비대화형 세션에서 Docker Desktop Linux Engine을 직접 사용한다.
    $env:DOCKER_HOST = 'npipe:////./pipe/dockerDesktopLinuxEngine'

    New-Item -ItemType Directory -Path $RuntimePath -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $RuntimePath 'data') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $RuntimePath 'backup') -Force | Out-Null

    Invoke-DockerChecked `
        -Arguments @('info') `
        -FailureMessage 'Docker Desktop Linux engine is not available.' `
        -Quiet

    # Compose 탐지는 기본 Docker 설정에서 먼저 수행한다.
    $ComposeMode = Resolve-ComposeMode

    # GHCR 인증은 private image pull에만 별도 config를 사용한다.
    # compose 실행에는 기본 Docker 설정을 유지해 CLI plugin 검색을 보존한다.
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

    # Public images만 기본 Docker/Compose 설정으로 갱신한다.
    Invoke-ComposeChecked `
        -Mode $ComposeMode `
        -Arguments @('-f', $ComposePath, 'pull', 'mariadb', 'caddy') `
        -FailureMessage 'Could not pull public MariaDB/Caddy images.'

    # Backend/AI는 위에서 정확한 SHA tag를 이미 pull했다.
    Invoke-ComposeChecked `
        -Mode $ComposeMode `
        -Arguments @('-f', $ComposePath, 'up', '-d', '--remove-orphans', '--pull', 'never') `
        -FailureMessage 'Docker Compose up failed.'

    $hostPort = [int]$env:DAHUM_HOST_PORT
    Wait-WebHealth -Port $hostPort -TimeoutSeconds 150

    Write-Host 'Python-first Dahum deployment completed.'
}
finally {
    if ($DockerConfigPath -and (Test-Path -LiteralPath $DockerConfigPath)) {
        Remove-Item -LiteralPath $DockerConfigPath -Recurse -Force -ErrorAction SilentlyContinue
    }
}
