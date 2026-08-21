param(
    [string]$RuntimePath,
    [string]$ProjectName = 'dahum',
    [string]$ServiceName = 'mariadb'
)

$ErrorActionPreference = 'Stop'

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

$backupDir = Join-Path $RuntimePath 'backup\mariadb'
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$backupFile = Join-Path $backupDir "dahum_$timestamp.sql"
$errorFile = Join-Path $backupDir "dahum_$timestamp.stderr.log"

# Compose plugin에 의존하지 않고 compose label로 현재 MariaDB 컨테이너를 찾는다.
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

# MariaDB 초기화 환경변수는 기존 volume에 대해 다시 적용되지 않는다.
# 따라서 GitHub Actions의 최신 비밀번호보다 현재 실행 중인 DB가 생성될 때의
# 컨테이너 환경변수가 실제 DB 계정과 일치할 수 있다. 둘 다 검증하고 동작하는 쪽을 쓴다.
$containerDatabase = Get-ContainerEnvValue -ContainerId $containerId -Name 'MARIADB_DATABASE'
$containerUser = Get-ContainerEnvValue -ContainerId $containerId -Name 'MARIADB_USER'
$containerPassword = Get-ContainerEnvValue -ContainerId $containerId -Name 'MARIADB_PASSWORD'

$runtimeDatabase = $env:MARIADB_DATABASE
$runtimeUser = $env:MARIADB_USER
$runtimePassword = $env:MARIADB_PASSWORD

$databaseName = $null
$databaseUser = $null
$databasePassword = $null
$credentialSource = $null

if (Test-MariaDbCredential `
        -ContainerId $containerId `
        -Database $containerDatabase `
        -User $containerUser `
        -Password $containerPassword) {
    $databaseName = $containerDatabase
    $databaseUser = $containerUser
    $databasePassword = $containerPassword
    $credentialSource = 'existing-container'
}
elif (Test-MariaDbCredential `
        -ContainerId $containerId `
        -Database $runtimeDatabase `
        -User $runtimeUser `
        -Password $runtimePassword) {
    $databaseName = $runtimeDatabase
    $databaseUser = $runtimeUser
    $databasePassword = $runtimePassword
    $credentialSource = 'runtime-config'
}
else {
    throw 'MariaDB backup authentication failed with both the existing container credential and the GitHub runtime credential. No data was changed.'
}

Write-Host "MariaDB backup credential source: $credentialSource"

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
