param(
    [string]$EnvPath,
    [string]$ComposePath,
    [string]$RuntimePath
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($EnvPath) -or [string]::IsNullOrWhiteSpace($ComposePath) -or [string]::IsNullOrWhiteSpace($RuntimePath)) {
    $DeployDir = Split-Path -Parent $PSScriptRoot
    $AppPath = Split-Path -Parent $DeployDir
    $DahumHome = Split-Path -Parent $AppPath
    if ([string]::IsNullOrWhiteSpace($RuntimePath)) { $RuntimePath = Join-Path $DahumHome 'runtime' }
    if ([string]::IsNullOrWhiteSpace($EnvPath)) { $EnvPath = Join-Path $RuntimePath '.env' }
    if ([string]::IsNullOrWhiteSpace($ComposePath)) { $ComposePath = Join-Path $DeployDir 'docker-compose.yml' }
}

$backupDir = Join-Path $RuntimePath 'backup\mariadb'
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$backupFile = Join-Path $backupDir "dahum_$timestamp.sql"

Write-Host "Creating MariaDB backup: $backupFile"

# Single quotes are intentional: $MARIADB_* is expanded by sh INSIDE the container,
# not by PowerShell or GitHub Actions.
$dumpCommand = 'mariadb-dump --single-transaction --routines --triggers -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE"'
$dumpOutput = @(& docker compose --env-file $EnvPath -f $ComposePath exec -T mariadb sh -lc $dumpCommand)
if ($LASTEXITCODE -ne 0) {
    throw 'MariaDB backup command failed.'
}

[System.IO.File]::WriteAllLines($backupFile, $dumpOutput, [System.Text.UTF8Encoding]::new($false))
if (-not (Test-Path $backupFile) -or (Get-Item $backupFile).Length -eq 0) {
    throw 'MariaDB backup file is empty.'
}

Write-Host "MariaDB backup completed: $backupFile"
