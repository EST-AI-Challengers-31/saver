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
# 이 값들은 GitHub Actions
# -> deploy.ps1
# -> 현재 PowerShell 프로세스로 전달되어 있어야 한다.
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
# 백업 디렉터리
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
# sh -lc를 사용하지 않는다.
#
# Windows PowerShell -> Docker -> Linux shell 과정에서
# 따옴표가 깨지는 문제를 피하기 위해 mariadb client를
# 컨테이너 안에서 직접 실행한다.
# ============================================================

& docker compose `
    -f $ComposePath `
    exec `
    -T `
    -e "MARIADB_PWD=$databasePassword" `
    mariadb `
    mariadb `
    "-u$databaseUser" `
    $databaseName `
    '-e' `
    'SELECT 1'

if ($LASTEXITCODE -ne 0) {
    throw 'MariaDB connection test failed before backup.'
}


Write-Host 'MariaDB connection test passed.'


# ============================================================
# MariaDB dump
#
# 비밀번호를 -p 옵션 문자열로 넣지 않고
# 컨테이너 프로세스의 MARIADB_PWD 환경변수로 전달한다.
#
# dump 결과는 임시 파일로 직접 저장하지 않고,
# PowerShell stdout을 받아 UTF-8 SQL 파일로 저장한다.
# ============================================================

$dumpOutput = @(
    & docker compose `
        -f $ComposePath `
        exec `
        -T `
        -e "MARIADB_PWD=$databasePassword" `
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
