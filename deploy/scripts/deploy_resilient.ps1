param(
    [string]$BackendImage = '',
    [string]$AiImage = '',
    [string]$RegistryUser = '',
    [string]$RegistryToken = '',
    [string]$RuntimeConfigBase64 = ''
)

$ErrorActionPreference = 'Stop'

function Import-PreDeployRuntimeConfig {
    param([Parameter(Mandatory = $true)][string]$EncodedConfig)

    if ([string]::IsNullOrWhiteSpace($EncodedConfig)) {
        throw 'Runtime configuration was not supplied by GitHub Actions.'
    }

    $json = [System.Text.Encoding]::UTF8.GetString(
        [System.Convert]::FromBase64String($EncodedConfig)
    )
    $config = $json | ConvertFrom-Json

    foreach ($property in $config.PSObject.Properties) {
        [Environment]::SetEnvironmentVariable(
            [string]$property.Name,
            [string]$property.Value,
            'Process'
        )
    }
}

function Invoke-NativeChecked {
    param(
        [Parameter(Mandatory = $true)][scriptblock]$Command,
        [Parameter(Mandatory = $true)][string]$FailureMessage
    )

    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw ("$FailureMessage (exit code: $LASTEXITCODE)")
    }
}

$DeployDir = Split-Path -Parent $PSScriptRoot
$AppPath = Split-Path -Parent $DeployDir
$DahumHome = Split-Path -Parent $AppPath
$RuntimePath = Join-Path $DahumHome 'runtime'
$ComposePath = Join-Path $DeployDir 'docker-compose.yml'
$BackupScript = Join-Path $PSScriptRoot 'backup_mariadb.ps1'
$CoreScript = Join-Path $PSScriptRoot 'deploy_resilient_core.ps1'
$CleanRebuildMarker = Join-Path $AppPath '.rebuild-shared-edge-once'
$MoveAiPath = 'C:\MOVEAI'
$MoveAiDeployScript = Join-Path $MoveAiPath 'scripts\deploy-remote.ps1'

if (-not (Test-Path -LiteralPath $CoreScript)) {
    throw "Core deployment script not found: $CoreScript"
}

$cleanRebuildRequested = Test-Path -LiteralPath $CleanRebuildMarker

if ($cleanRebuildRequested) {
    Write-Host 'One-time clean production rebuild requested.'
    Write-Host 'Named Docker volumes will be preserved; -v, volume rm, and prune are not used.'

    Import-PreDeployRuntimeConfig -EncodedConfig $RuntimeConfigBase64
    $env:DOCKER_HOST = 'npipe:////./pipe/dockerDesktopLinuxEngine'
    $env:BACKEND_IMAGE = $BackendImage
    $env:AI_IMAGE = $AiImage

    New-Item -ItemType Directory -Path $RuntimePath -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $RuntimePath 'backup') -Force | Out-Null

    if (Test-Path -LiteralPath $BackupScript) {
        try {
            & $BackupScript -RuntimePath $RuntimePath
            Write-Host 'Pre-rebuild MariaDB backup completed.'
        }
        catch {
            Write-Warning ('Pre-rebuild MariaDB backup failed; no database volume will be deleted: ' + $_.Exception.Message)
        }
    }

    if (-not (Test-Path -LiteralPath $MoveAiDeployScript)) {
        throw "Shared-edge deployment script not found: $MoveAiDeployScript"
    }

    Push-Location -LiteralPath $MoveAiPath
    try {
        Write-Host 'Refreshing MoveAI main before shared-edge clean rebuild...'
        Invoke-NativeChecked -FailureMessage 'MoveAI git fetch failed.' -Command {
            git fetch --prune origin main
        }
        Invoke-NativeChecked -FailureMessage 'MoveAI git reset failed.' -Command {
            git reset --hard origin/main
        }
        Invoke-NativeChecked -FailureMessage 'MoveAI git checkout failed.' -Command {
            git checkout -B main origin/main
        }
        Invoke-NativeChecked -FailureMessage 'MoveAI final git reset failed.' -Command {
            git reset --hard origin/main
        }

        Write-Host 'Clean rebuilding shared MoveAI edge stack (volumes preserved)...'
        & $MoveAiDeployScript
        if ($LASTEXITCODE -ne 0) {
            throw "MoveAI shared-edge deployment failed (exit code: $LASTEXITCODE)"
        }
    }
    finally {
        Pop-Location
    }

    Write-Host 'Stopping Dahum stack for a clean container/network recreation (volumes preserved)...'
    Invoke-NativeChecked -FailureMessage 'Dahum docker compose down failed.' -Command {
        docker compose -f $ComposePath down --remove-orphans
    }
}

try {
    & $CoreScript `
        -BackendImage $BackendImage `
        -AiImage $AiImage `
        -RegistryUser $RegistryUser `
        -RegistryToken $RegistryToken `
        -RuntimeConfigBase64 $RuntimeConfigBase64

    if ($cleanRebuildRequested -and (Test-Path -LiteralPath $CleanRebuildMarker)) {
        Remove-Item -LiteralPath $CleanRebuildMarker -Force
        Write-Host 'One-time clean rebuild marker consumed successfully.'
    }
}
catch {
    Write-Warning ('Deployment wrapper failed: ' + $_.Exception.Message)

    if ($cleanRebuildRequested) {
        Write-Host 'Attempting best-effort Dahum recovery with preserved named volumes...'
        try {
            docker compose -f $ComposePath up -d --remove-orphans
        }
        catch {
            Write-Warning ('Best-effort Dahum recovery could not be completed: ' + $_.Exception.Message)
        }
    }

    throw
}
