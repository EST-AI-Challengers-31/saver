# Java 21 및 자동배포 최종 검수 기록

## 이번 버전에서 확정한 사항

- Java 17 흔적을 제거하고 **Java 21**로 통일했습니다.
- Gradle은 Java Toolchain 21을 사용합니다.
- backend Docker build image는 `gradle:8.10-jdk21`입니다.
- runtime image는 `eclipse-temurin:21-jre`입니다.
- Spring Boot/React를 하나의 backend 이미지로 빌드합니다.
- FastAPI는 별도 GHCR 이미지입니다.
- 미니PC에서는 application image를 build하지 않고 `pull + up`만 수행합니다.
- GHCR 이미지는 commit SHA 태그를 배포 기준으로 사용합니다.
- `latest`는 편의 태그이며 실제 Actions 배포는 SHA 태그를 전달합니다.
- MOVEAI와 Compose project/network/container namespace를 분리합니다.
- 호스트 공개 포트는 닿음 기준 `9000` 하나입니다.
- DB `3306`, FastAPI `8000`, Spring `8080`은 host에 publish하지 않습니다.
- AI 서비스가 향후 OCR/LLM/Pinecone으로 outbound 통신할 수 있도록 Docker 내부 네트워크의 `internal: true` 제한을 제거했습니다. 포트 publish는 하지 않으므로 외부 inbound 노출은 없습니다.
- `C:\home\dahum\runtime`은 Git과 분리합니다.
- 배포 전 기존 MariaDB가 실행 중이면 backup을 수행합니다.
- 배포 후 Spring → MariaDB / FastAPI 상태를 확인하고 모두 `UP`일 때만 성공합니다.
- 실패하면 직전 commit SHA 이미지 rollback을 시도합니다.

## 의도적으로 하지 않은 것

- 미니PC에서 `docker compose build` 하지 않음
- AWS ECR/S3/CodeDeploy 사용하지 않음
- DB/FastAPI host port 공개하지 않음
- MOVEAI 80/443 포트 재사용/재점유하지 않음
- 닿음 Actions가 기본적으로 MOVEAI Caddyfile을 자동 변경하지 않음
- 코드/문서에 실제 비밀번호/API key 저장하지 않음

## 실제 환경에서만 확인 가능한 항목

다음은 정적 검수만으로 확정할 수 없으며 첫 GitHub Actions 실행에서 확인합니다.

1. 조직 저장소의 GHCR package 생성 권한
2. GitHub Actions의 `GITHUB_TOKEN` package push/pull 허용 여부
3. Windows SSH 계정 `home`에서 Docker Desktop named pipe 접근 가능 여부
4. `C:\home\dahum\runtime` bind mount가 Docker Desktop에서 정상 마운트되는지
5. 공개 DNS/Caddy/TLS 경로
6. 서버 실제 메모리/디스크 여유

이 항목이 실패하더라도 애플리케이션 설계 문제가 아니라 배포 환경 권한/설정 문제일 수 있으므로 Actions 로그와 서버 `docker ps`, `docker compose logs`를 기준으로 분리해서 확인합니다.
