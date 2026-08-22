param(
    [string]$ComposePath,
    [string]$RuntimePath
)

$ErrorActionPreference = 'Stop'


# ============================================================
# 기본 경로 계산
# ============================================================

if (
    [string]::IsNullOrWhiteSpace($ComposePath) -or
    [string]::IsNullOrWhiteSpace($RuntimePath)
) {
    $DeployDir = Split-Path -Parent $PSScriptRoot
    $AppPath = Split-Path -Parent $DeployDir
    $DahumHome = Split-Path -Parent $AppPath

    if ([string]::IsNullOrWhiteSpace($RuntimePath)) {
        $RuntimePath = Join-Path $DahumHome 'runtime'
    }

    if ([string]::IsNullOrWhiteSpace($ComposePath)) {
        $ComposePath = Join-Path $DeployDir 'docker-compose.yml'
    }
}


# ============================================================
# 필수 파일 확인
# ============================================================

if (-not (Test-Path -LiteralPath $ComposePath)) {
    throw "Compose file not found: $ComposePath"
}


# ============================================================
# 필수 DB 환경변수 확인
#
# GitHub Actions
# -> deploy.ps1
# -> 현재 PowerShell 프로세스로 전달된 값을 사용한다.
# ============================================================

$requiredVariables = @(
    'MARIADB_DATABASE',
    'MARIADB_USER',
    'MARIADB_PASSWORD'
)

$missingVariables = @()

foreach ($name in $requiredVariables) {

    $value = [Environment]::GetEnvironmentVariable(
        $name,
        'Process'
    )

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


# ============================================================
# 환경변수 읽기
# ============================================================

$databaseName = $env:MARIADB_DATABASE
$databaseUser = $env:MARIADB_USER
$databasePassword = $env:MARIADB_PASSWORD


# ============================================================
# 백업 디렉터리 준비
# ============================================================

$backupDir = Join-Path `
    $RuntimePath `
    'backup\mariadb'

New-Item `
    -ItemType Directory `
    -Path $backupDir `
    -Force |
    Out-Null


$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'

$backupFile = Join-Path `
    $backupDir `
    "dahum_$timestamp.sql"


Write-Host "Creating MariaDB backup: $backupFile"


# ============================================================
# MariaDB 연결 확인
#
# Windows -> Docker -> shell 문자열 파싱을 피하기 위해
# sh -lc를 사용하지 않는다.
#
# MYSQL_PWD는 MariaDB client가 인식하는 비밀번호
# 환경변수다.
# ============================================================

& docker compose `
    -f $ComposePath `
    exec `
    -T `
    -e "MYSQL_PWD=$databasePassword" `
    mariadb `
    mariadb `
    "-u$databaseUser" `
    $databaseName `
    '-e' `
    'SELECT 1;'


if ($LASTEXITCODE -ne 0) {
    throw 'MariaDB connection test failed before backup.'
}


Write-Host 'MariaDB connection test passed.'


# ============================================================
# MariaDB dump
# ============================================================

$dumpOutput = @(
    & docker compose `
        -f $ComposePath `
        exec `
        -T `
        -e "MYSQL_PWD=$databasePassword" `
        mariadb `
        mariadb-dump `
        '--single-transaction' `
        '--routines' `
        '--triggers' `
        "-u$databaseUser" `
        $databaseName
)


if ($LASTEXITCODE -ne 0) {
    throw 'MariaDB backup command failed.'
}


# ============================================================
# 백업 파일 저장
# ============================================================

[System.IO.File]::WriteAllLines(
    $backupFile,
    $dumpOutput,
    [System.Text.UTF8Encoding]::new($false)
)


# ============================================================
# 백업 파일 검증
# ============================================================

if (-not (Test-Path -LiteralPath $backupFile)) {
    throw 'MariaDB backup file was not created.'
}


$backupInfo = Get-Item -LiteralPath $backupFile


if ($backupInfo.Length -eq 0) {
    throw 'MariaDB backup file is empty.'
}


Write-Host (
    "MariaDB backup completed: {0} ({1} bytes)" -f
    $backupFile,
    $backupInfo.Length
)
