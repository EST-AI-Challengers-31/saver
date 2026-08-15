# 15. 배포 파일 역할

| 파일 | 역할 | Production 사용 |
|---|---|---|
| `frontend/Dockerfile` | React 단독 build가 정상인지 검증하는 이미지 | 선택 |
| `frontend/.dockerignore` | React Docker build context 정리/secret 제외 | 예 |
| `backend/Dockerfile` | React build + Spring Boot build를 합쳐 단일 JAR/image 생성 | 필수 |
| `backend/.dockerignore` | Gradle 산출물/secret 제외 | 필수 |
| `ai/Dockerfile` | FastAPI image 생성 | 필수 |
| `ai/.dockerignore` | Python cache/test/secret 제외 | 필수 |
| `deploy/docker-compose.yml` | Dahum 4개 런타임 서비스(DB/AI/backend/Caddy) 기동 | 필수 |
| `deploy/caddy/Caddyfile` | Dahum host 9000 요청을 Spring 8080으로 전달 | 필수 |
| `deploy/caddy/moveai-yellow.it.kr.caddy.example` | 기존 MOVEAI public Caddy에 1회 추가할 domain route | 1회 반영 |
| `deploy/.env.example` | 서버 runtime `.env` 작성 기준 | 템플릿 |
| `deploy/scripts/ensure_docker.ps1` | SSH 배포 전 Docker Engine 준비 확인 | 필수 |
| `deploy/scripts/backup_mariadb.ps1` | 재배포 전 MariaDB backup | 권장 |
| `deploy/scripts/deploy.ps1` | git pull -> backup -> compose build/up 실행 | 필수 |
| `.github/workflows/deploy.yml.example` | GitHub Actions SSH 배포 템플릿 | 검증 후 활성화 |
