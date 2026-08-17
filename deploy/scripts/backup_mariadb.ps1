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
# 백업 폴더 준비
# ============================================================

$backupDir = Join-Path $RuntimePath 'backup\mariadb'

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
# MariaDB 백업
#
# 중요:
# 서버 .env 파일은 사용하지 않는다.
#
# GitHub Actions
#   -> deploy.ps1
#   -> Process Environment
#   -> docker compose
#   -> mariadb container
#
# Compose의 environment 설정으로 이미
# MARIADB_USER / MARIADB_PASSWORD / MARIADB_DATABASE가
# 컨테이너 안에 들어가 있다.
# ============================================================

$dumpCommand = @'
mariadb-dump \
  --single-transaction \
  --routines \
  --triggers \
  -u"$MARIADB_USER" \
  -p"$MARIADB_PASSWORD" \
  "$MARIADB_DATABASE"
'@


$dumpOutput = @(
    & docker compose `
        -f $ComposePath `
        exec `
        -T `
        mariadb `
        sh `
        -lc `
        $dumpCommand
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


Write-Host "MariaDB backup completed: $backupFile"
