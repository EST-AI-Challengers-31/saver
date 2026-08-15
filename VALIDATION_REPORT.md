# Final validation report

검수일: 2026-08-15

## 자동 검수 통과

- `frontend/package.json` JSON 파싱
- `ai/app/main.py` Python 파싱 및 `py_compile`
- GitHub Actions YAML 파싱
- Docker Compose YAML 파싱
- Spring `application.yml` YAML 파싱
- backend build image: `gradle:8.10-jdk21`
- backend runtime image: `eclipse-temurin:21-jre`
- Gradle Java Toolchain: 21
- Java package root: `com.dahum`
- Compose project name: `dahum`
- 닿음 host 공개 포트: `${DAHUM_HOST_PORT}:80` (runtime 기본 9000)
- backend 8080 / FastAPI 8000 / MariaDB 3306 host publish 없음
- mini PC application build 없음 (`docker compose pull + up` 방식)
- GitHub Actions `packages: write` 사용
- GHCR commit SHA image 배포
- SSH 자동배포 workflow 활성
- `.docker-ci/` git ignore 확인
- 실제 secret 하드코딩 없음
- Python cache 제거

## 이 환경에서 실행하지 못한 검수

현재 작업 환경에서는 Docker daemon과 npm registry 의존성 다운로드가 제공되지 않아 다음은 실제 GitHub Actions 첫 실행에서 검증됩니다.

- React `npm install` + Vite production build
- Spring Boot Gradle dependency download + `bootJar`
- Docker image build/push to GHCR
- Windows mini PC GHCR pull
- Windows Docker Desktop named-pipe 접근
- `C:\home\dahum\runtime` bind mount
- 실제 MariaDB init/health
- `yellow.it.kr` TLS/public proxy

Actions는 image build가 실패하면 SSH 배포 단계로 넘어가지 않으므로 서버의 기존 MOVEAI 서비스에는 영향을 주지 않습니다.
