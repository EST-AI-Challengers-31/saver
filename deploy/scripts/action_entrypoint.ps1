$ErrorActionPreference = 'Stop'

# Optional manual entrypoint. The GitHub Actions workflow itself performs the initial git pull
# so that the VERY FIRST automatic deployment also works even if this file was not yet present
# in the old server checkout.
$DeployDir = Split-Path -Parent $PSScriptRoot
$AppPath = Split-Path -Parent $DeployDir
$DeployScript = Join-Path $AppPath 'deploy\scripts\deploy.ps1'

if (-not (Test-Path (Join-Path $AppPath '.git'))) {
    throw "Git repository not found: $AppPath"
}

Set-Location -LiteralPath $AppPath
$dirty = @(git status --porcelain)
if ($LASTEXITCODE -ne 0) { throw 'git status failed.' }
if ($dirty.Count -gt 0) {
    throw 'Server repository has uncommitted changes. Refusing automatic deployment.'
}

$PreviousCommit = (git rev-parse HEAD).Trim()
git fetch --prune origin main
if ($LASTEXITCODE -ne 0) { throw 'git fetch failed.' }
git checkout main
if ($LASTEXITCODE -ne 0) { throw 'git checkout main failed.' }
git pull --ff-only origin main
if ($LASTEXITCODE -ne 0) { throw 'git pull failed.' }

& $DeployScript -SkipGitUpdate -RollbackCommit $PreviousCommit
