param(
    [int]$HostPort = 9000,
    [string]$PublicBaseUrl = 'https://yellow.it.kr'
)

$ErrorActionPreference = 'Stop'

Write-Host "Checking local Dahum gateway on port $HostPort..."
$localHealth = Invoke-RestMethod -Uri "http://127.0.0.1:$HostPort/api/health" -TimeoutSec 10
$systemStatus = Invoke-RestMethod -Uri "http://127.0.0.1:$HostPort/api/system/status" -TimeoutSec 10

$localHealth | ConvertTo-Json -Depth 5
$systemStatus | ConvertTo-Json -Depth 5

if ($systemStatus.backend -ne 'UP' -or $systemStatus.database -ne 'UP' -or $systemStatus.ai -ne 'UP') {
    throw 'At least one Dahum service is DOWN.'
}

Write-Host "Checking public URL: $PublicBaseUrl"
try {
    $public = Invoke-RestMethod -Uri "$PublicBaseUrl/api/health" -TimeoutSec 15
    $public | ConvertTo-Json -Depth 5
    Write-Host 'Public domain check passed.'
}
catch {
    Write-Warning "Local deployment is healthy, but public URL check failed: $($_.Exception.Message)"
    Write-Warning 'Check Gabia A record, router/firewall, and the existing MOVEAI Caddy route.'
}
