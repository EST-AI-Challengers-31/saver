param(
    [string]$RuntimePath,
    [string]$ProjectName = 'dahum',
    [string]$ServiceName = 'mariadb'
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($RuntimePath)) {
    $DeployDir = Split-Path -Parent $PSScriptRoot
    $AppPath = Split-Path -Parent $DeployDir
    $DahumHome = Split-Path -Parent $AppPath
    $RuntimePath = Join-Path $DahumHome 'runtime'
}

$requiredVariables = @(
    'MARIADB_DATABASE',
    'MARIADB_USER',
    'MARIADB_PASSWORD'
)

$missingVariables = @()
foreach ($name in $requiredVariables) {
    $value = [Environment]::GetEnvironmentVariable($name, 'Process')
    if ([string]::IsNullOrWhiteSpace($value)) {
        $missingVariables += $name
    }
}

if ($missingVariables.Count -gt 0) {
    throw (
        'Required MariaDB backup environment variables are missing: ' +
        ($missingVariables -join ', ')
    )
}

$databaseName = $env:MARIADB_DATABASE
$databaseUser = $env:MARIADB_USER
$databasePassword = $env:MARIADB_PASSWORD

$backupDir = Join-Path $RuntimePath 'backup\mariadb'
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$backupFile = Join-Path $backupDir "dahum_$timestamp.sql"
$errorFile = Join-Path $backupDir "dahum_$timestamp.stderr.log"

# Compose plugin에 의존하지 않고 compose label로 MariaDB 컨테이너를 찾는다.
$previousPreference = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
try {
    $containerIds = @(
        & docker ps `
            --filter "label=com.docker.compose.project=$ProjectName" `
            --filter "label=com.docker.compose.service=$ServiceName" `
            --format '{{.ID}}' `
            2>$null
    )
    $dockerPsExitCode = $LASTEXITCODE
}
finally {
    $ErrorActionPreference = $previousPreference
}

if ($dockerPsExitCode -ne 0) {
    throw 'Could not inspect the running MariaDB container.'
}

$containerId = @(
    $containerIds |
        ForEach-Object { [string]$_ } |
        Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
) | Select-Object -First 1

if ([string]::IsNullOrWhiteSpace($containerId)) {
    throw "Running MariaDB container was not found for project '$ProjectName'."
}

Write-Host "Creating MariaDB backup from container $containerId -> $backupFile"

# 연결 확인
$previousPreference = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
try {
    & docker exec `
        -e "MYSQL_PWD=$databasePassword" `
        $containerId `
        mariadb `
        "-u$databaseUser" `
        $databaseName `
        '-e' `
        'SELECT 1;' `
        1>$null `
        2>$errorFile
    $connectionExitCode = $LASTEXITCODE
}
finally {
    $ErrorActionPreference = $previousPreference
}

if ($connectionExitCode -ne 0) {
    $detail = if (Test-Path -LiteralPath $errorFile) {
        (Get-Content -LiteralPath $errorFile -Raw -ErrorAction SilentlyContinue)
    }
    else {
        ''
    }
    throw ('MariaDB connection test failed before backup. ' + $detail)
}

Write-Host 'MariaDB connection test passed.'

# SQL dump는 stdout만 파일에 저장한다. stderr가 SQL에 섞이지 않게 분리한다.
$previousPreference = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
try {
    & docker exec `
        -e "MYSQL_PWD=$databasePassword" `
        $containerId `
        mariadb-dump `
        '--single-transaction' `
        '--routines' `
        '--triggers' `
        "-u$databaseUser" `
        $databaseName `
        1>$backupFile `
        2>$errorFile
    $dumpExitCode = $LASTEXITCODE
}
finally {
    $ErrorActionPreference = $previousPreference
}

if ($dumpExitCode -ne 0) {
    $detail = if (Test-Path -LiteralPath $errorFile) {
        (Get-Content -LiteralPath $errorFile -Raw -ErrorAction SilentlyContinue)
    }
    else {
        ''
    }
    throw ('MariaDB backup command failed. ' + $detail)
}

if (-not (Test-Path -LiteralPath $backupFile)) {
    throw 'MariaDB backup file was not created.'
}

$backupInfo = Get-Item -LiteralPath $backupFile
if ($backupInfo.Length -eq 0) {
    throw 'MariaDB backup file is empty.'
}

if (Test-Path -LiteralPath $errorFile) {
    Remove-Item -LiteralPath $errorFile -Force -ErrorAction SilentlyContinue
}

Write-Host (
    "MariaDB backup completed: {0} ({1} bytes)" -f
    $backupFile,
    $backupInfo.Length
)
