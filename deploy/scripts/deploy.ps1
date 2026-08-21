param(
    [switch]$SkipGitUpdate,
    [string]$BackendImage = '',
    [string]$AiImage = '',
    [string]$RegistryUser = '',
    [string]$RegistryToken = '',
    [string]$RollbackCommit = '',
    [string]$RuntimeConfigBase64 = ''
)
$ErrorActionPreference = 'Stop'
# 기존 호출 경로는 유지하고 실제 배포 로직은 Python-first 스크립트 하나로 통일한다.
$scriptPath = Join-Path $PSScriptRoot 'deploy_python_first.ps1'
if (-not (Test-Path -LiteralPath $scriptPath)) { throw "Python-first deployment script not found: $scriptPath" }
& $scriptPath -BackendImage $BackendImage -AiImage $AiImage -RegistryUser $RegistryUser -RegistryToken $RegistryToken -RuntimeConfigBase64 $RuntimeConfigBase64
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
