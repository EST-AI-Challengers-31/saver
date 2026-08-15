$ErrorActionPreference = 'Stop'
$DahumHome = if ($env:DAHUM_HOME) { $env:DAHUM_HOME } else { 'C:\home\dahum' }
$EnvPath = Join-Path $DahumHome 'runtime\.env'
$ComposePath = Join-Path $DahumHome 'app\deploy\docker-compose.yml'

docker compose --env-file $EnvPath -f $ComposePath ps
