$ErrorActionPreference = 'Stop'

function Test-DockerReady {
    try {
        docker info *> $null
        return ($LASTEXITCODE -eq 0)
    }
    catch {
        return $false
    }
}

if (Test-DockerReady) {
    Write-Host 'Docker is already ready.'
    exit 0
}

$dockerService = Get-Service -Name 'com.docker.service' -ErrorAction SilentlyContinue
if ($null -ne $dockerService -and $dockerService.Status -ne 'Running') {
    Write-Host 'Starting Docker service...'
    Start-Service -Name 'com.docker.service'
}

$desktopCandidates = @()
if ($env:DOCKER_DESKTOP_EXE) {
    $desktopCandidates += $env:DOCKER_DESKTOP_EXE
}
$desktopCandidates += 'C:\Program Files\Docker\Docker\Docker Desktop.exe'

foreach ($candidate in $desktopCandidates | Select-Object -Unique) {
    if (Test-Path $candidate) {
        Write-Host "Starting Docker Desktop: $candidate"
        Start-Process -FilePath $candidate | Out-Null
        break
    }
}

# Docker Desktop Linux engine named pipe. This is the same style used by the
# already-running MOVEAI deployment and is useful in non-interactive SSH sessions.
$env:DOCKER_HOST = 'npipe:////./pipe/dockerDesktopLinuxEngine'

$deadline = (Get-Date).AddMinutes(3)
while ((Get-Date) -lt $deadline) {
    if (Test-DockerReady) {
        Write-Host 'Docker is ready.'
        exit 0
    }
    Start-Sleep -Seconds 5
}

throw 'Docker did not become ready within 3 minutes. Check Docker Desktop/service and Windows permissions.'
