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
        $patterns = @($uniquePorts | ForEach-Object { ':' + $_ + '\s' })
        $pattern = [string]::Join('|', $patterns)
        & netstat -ano -p tcp |
            Select-String -Pattern $pattern |
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

function Show-SharedEdgeProxy {
    param([int]$DahumPort)

    $edgeContainerId = $null
    try {
        $edgeContainerId = [string](& docker ps --filter 'name=^/moveai-caddy-1$' --format '{{.ID}}' 2>$null | Select-Object -First 1)
    }
    catch {
        $edgeContainerId = $null
    }

    if ([string]::IsNullOrWhiteSpace($edgeContainerId)) {
        Write-Host '--- Shared edge proxy ---'
        Write-Host 'moveai-caddy-1 was not found.'
        return
    }

    Write-Host '--- Shared edge proxy: moveai-caddy-1 ---'
    Write-Host ('container_id=' + $edgeContainerId)

    $inspect = $null
    try {
        $inspect = ((& docker inspect $edgeContainerId 2>$null | Out-String) | ConvertFrom-Json | Select-Object -First 1)
    }
    catch {
        Write-Warning ('docker inspect JSON parsing failed: ' + $_.Exception.Message)
    }

    if ($null -ne $inspect) {
        Write-Host 'Mounts:'
        foreach ($mount in @($inspect.Mounts)) {
            Write-Host (
                'type={0} source={1} destination={2} rw={3}' -f
                $mount.Type,
                $mount.Source,
                $mount.Destination,
                $mount.RW
            )
        }

        Write-Host 'Networks:'
        foreach ($network in @($inspect.NetworkSettings.Networks.PSObject.Properties.Name)) {
            Write-Host $network
        }

        Write-Host 'Relevant environment:'
        $apiDomain = @($inspect.Config.Env | Where-Object { $_ -like 'API_DOMAIN=*' }) | Select-Object -First 1
        if ($apiDomain) {
            Write-Host $apiDomain
        }
        else {
            Write-Host 'API_DOMAIN=<not-set>'
        }
    }

    Write-Host 'Caddyfile:'
    try {
        & docker exec $edgeContainerId cat /etc/caddy/Caddyfile 2>&1 |
            ForEach-Object { Write-Host $_ }
    }
    catch {
        Write-Warning ('Could not read shared Caddyfile: ' + $_.Exception.Message)
    }

    $targetUrl = "http://host.docker.internal:$DahumPort/"
    Write-Host ('Shared-edge reachability probe: ' + $targetUrl)
    try {
        $content = (& docker exec $edgeContainerId wget -q -T 5 -O - $targetUrl 2>$null | Out-String)
        $exitCode = $LASTEXITCODE
        if ($exitCode -eq 0 -and $content.Contains('<div id="root"></div>')) {
            Write-Host 'shared_edge_to_dahum=reachable root_marker=true'
        }
        elseif ($exitCode -eq 0) {
            Write-Host 'shared_edge_to_dahum=reachable root_marker=false'
        }
        else {
            Write-Host ('shared_edge_to_dahum=failed exit=' + $exitCode)
        }
    }
    catch {
        Write-Host ('shared_edge_to_dahum=failed error=' + $_.Exception.Message)
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
Show-SharedEdgeProxy -DahumPort $HostPort

Write-Host '--- Local root-route probes ---'
Test-RootUrl -Url ("http://127.0.0.1:{0}/" -f $HostPort)
Test-RootUrl -Url 'http://127.0.0.1/'
Test-RootUrl -Url 'https://127.0.0.1/'
