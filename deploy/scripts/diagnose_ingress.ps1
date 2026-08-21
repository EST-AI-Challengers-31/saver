param(
    [int]$HostPort = 9000
)

$ErrorActionPreference = 'Continue'

function Get-ListenerProcessName {
    param([int]$ProcessId)

    if ($ProcessId -le 0) {
        return ''
    }

    try {
        return (Get-Process -Id $ProcessId -ErrorAction Stop).ProcessName
    }
    catch {
        return '<unavailable>'
    }
}

function Show-TcpListeners {
    param([int[]]$Ports)

    Write-Host '--- Host TCP listeners ---'
    $uniquePorts = @($Ports | Select-Object -Unique | Sort-Object)

    try {
        $listeners = @(
            Get-NetTCPConnection -State Listen -ErrorAction Stop |
                Where-Object { $uniquePorts -contains $_.LocalPort } |
                Sort-Object LocalPort, LocalAddress, OwningProcess
        )

        if ($listeners.Count -eq 0) {
            Write-Host ('No listeners found on ports: ' + ($uniquePorts -join ', '))
            return
        }

        foreach ($listener in $listeners) {
            $processName = Get-ListenerProcessName -ProcessId ([int]$listener.OwningProcess)
            Write-Host (
                'port={0} address={1} pid={2} process={3}' -f
                $listener.LocalPort,
                $listener.LocalAddress,
                $listener.OwningProcess,
                $processName
            )
        }
    }
    catch {
        Write-Warning ('Get-NetTCPConnection failed: ' + $_.Exception.Message)
        Write-Host 'Fallback netstat output:'
        & netstat -ano -p tcp |
            Select-String -Pattern ($uniquePorts | ForEach-Object { ':' + $_ + '\s' } | Join-String -Separator '|') |
            ForEach-Object { Write-Host $_.Line }
    }
}

function Show-DockerPublishedPorts {
    Write-Host '--- Docker published ports ---'
    try {
        & docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' 2>&1 |
            ForEach-Object { Write-Host $_ }
    }
    catch {
        Write-Warning ('docker ps failed: ' + $_.Exception.Message)
    }
}

function Test-RootUrl {
    param([string]$Url)

    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 6 -MaximumRedirection 3
        $title = ''
        if ($response.Content -match '<title>(.*?)</title>') {
            $title = $Matches[1]
        }
        Write-Host ('probe={0} status={1} title={2}' -f $Url, $response.StatusCode, $title)
    }
    catch {
        Write-Host ('probe={0} failed={1}' -f $Url, $_.Exception.Message)
    }
}

$ports = @(80, 443, $HostPort) | Select-Object -Unique
Show-TcpListeners -Ports $ports
Show-DockerPublishedPorts

Write-Host '--- Local root-route probes ---'
Test-RootUrl -Url ("http://127.0.0.1:{0}/" -f $HostPort)
Test-RootUrl -Url 'http://127.0.0.1/'
Test-RootUrl -Url 'https://127.0.0.1/'
