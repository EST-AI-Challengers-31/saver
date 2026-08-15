# 닿음 자동배포 - GHCR 이미지 방식

## 자동배포 순서

```text
main push
  -> GitHub Actions
  -> backend Docker image build (React + Spring)
  -> FastAPI Docker image build
  -> GHCR push with commit SHA
  -> SSH :22
  -> C:\home\dahum\app
  -> git pull --ff-only
  -> deploy.ps1
  -> Docker Desktop 확인
  -> GHCR login (workflow GITHUB_TOKEN)
  -> MariaDB backup when already running
  -> docker compose pull
  -> docker compose up -d
  -> http://127.0.0.1:9000/api/system/status
  -> backend/database/ai == UP
  -> 성공
```

## 서버에서 하지 않는 것

서버는 아래를 수행하지 않는다.

```text
npm build
Gradle Docker image build
FastAPI Docker image build
```

이 작업은 GitHub Actions runner에서 끝낸다.

## 이미지

자동배포는 `latest`가 아니라 정확한 Git commit SHA 태그를 사용한다.

```text
ghcr.io/<owner>/<repo>-backend:<sha>
ghcr.io/<owner>/<repo>-ai:<sha>
```

현재 saver 저장소라면 소문자 registry 경로는 다음 형태다.

```text
ghcr.io/est-ai-challengers-31/saver-backend:<sha>
ghcr.io/est-ai-challengers-31/saver-ai:<sha>
```

## 서버 경로

```text
C:\home\dahum\app       Git repository + compose/scripts
C:\home\dahum\runtime   .env + MariaDB data + backup/logs
```

## Caddy

기존 MOVEAI Caddy의 80/443은 유지한다. 닿음은 별도 container group에서 9000만 사용한다.

```text
yellow.it.kr -> existing MOVEAI Caddy :443 -> host.docker.internal:9000 -> Dahum Caddy -> Spring :8080
```

## 성공 판정

Actions는 다음 조건이 모두 맞아야 성공한다.

```text
backend = UP
database = UP
ai = UP
```

신규 버전 health check가 실패하면 직전 commit SHA 이미지로 rollback을 시도한다.
