$ErrorActionPreference = 'Stop'
# 운영 설정은 GitHub Actions가 프로세스 환경변수로 전달하므로 runtime .env를 읽지 않는다.
docker ps --filter 'label=com.docker.compose.project=dahum' --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
