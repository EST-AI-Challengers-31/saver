param(
    [Parameter(Mandatory = $true)][string]$MoveAiRoot,
    [Parameter(Mandatory = $true)][string]$Domain,
    [Parameter(Mandatory = $true)][int]$DahumHostPort
)

$ErrorActionPreference = 'Stop'

$Caddyfile = Join-Path $MoveAiRoot 'Caddyfile'
$MoveAiCompose = Join-Path $MoveAiRoot 'docker-compose.yml'

if (-not (Test-Path $Caddyfile)) {
    throw "MOVEAI Caddyfile not found: $Caddyfile"
}
if (-not (Test-Path $MoveAiCompose)) {
    throw "MOVEAI docker-compose.yml not found: $MoveAiCompose"
}

$beginMarker = '# BEGIN DAHUM ROUTE - managed by Dahum deploy'
$endMarker = '# END DAHUM ROUTE - managed by Dahum deploy'
$escapedBegin = [regex]::Escape($beginMarker)
$escapedEnd = [regex]::Escape($endMarker)
$escapedDomain = [regex]::Escape($Domain)

$managedBlock = @"
$beginMarker
$Domain {
    encode zstd gzip
    reverse_proxy host.docker.internal:$DahumHostPort
}
$endMarker
"@

$content = [System.IO.File]::ReadAllText($Caddyfile)
$originalContent = $content
$changed = $false

if ($content -match "(?s)$escapedBegin.*?$escapedEnd") {
    $content = [regex]::Replace(
        $content,
        "(?s)$escapedBegin.*?$escapedEnd",
        [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $managedBlock }
    )
    $changed = ($content -ne $originalContent)
}
elseif ($content -match "(?m)^\s*$escapedDomain\s*\{") {
    Write-Host "$Domain is already defined outside the Dahum-managed block. Existing route will not be overwritten."
}
else {
    $separator = if ($content.EndsWith("`n")) { "`n" } else { "`r`n`r`n" }
    $content = $content + $separator + $managedBlock + "`r`n"
    $changed = $true
}

$backupFile = $null
if ($changed) {
    $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
    $backupFile = "$Caddyfile.dahum-backup-$timestamp"
    Copy-Item -LiteralPath $Caddyfile -Destination $backupFile -Force
    [System.IO.File]::WriteAllText($Caddyfile, $content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Updated MOVEAI Caddyfile. Backup: $backupFile"
}

try {
    Set-Location -LiteralPath $MoveAiRoot

    # Compose needs C:\MOVEAI\.env in order to resolve {$API_DOMAIN} used by MOVEAI.
    docker compose -f $MoveAiCompose config *> $null
    if ($LASTEXITCODE -ne 0) { throw 'MOVEAI docker compose config failed.' }

    docker compose -f $MoveAiCompose exec -T caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
    if ($LASTEXITCODE -ne 0) { throw 'Caddy validation failed.' }

    docker compose -f $MoveAiCompose exec -T caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
    if ($LASTEXITCODE -ne 0) { throw 'Caddy reload failed.' }

    Write-Host "Public route ready: https://$Domain -> host.docker.internal:$DahumHostPort"
}
catch {
    if ($changed -and $backupFile -and (Test-Path $backupFile)) {
        Write-Warning 'Caddy update failed. Restoring previous MOVEAI Caddyfile.'
        Copy-Item -LiteralPath $backupFile -Destination $Caddyfile -Force
        try {
            Set-Location -LiteralPath $MoveAiRoot
            docker compose -f $MoveAiCompose exec -T caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile *> $null
        }
        catch {
            Write-Warning 'Previous Caddyfile was restored, but automatic reload also failed. Check MOVEAI Caddy manually.'
        }
    }
    throw
}
