# 최종 검수 결과 - GHCR 이미지 자동배포

검수 기준: `EST-AI-Challengers-31/saver`에 올린 뒤 `main` push로 **GitHub Actions build -> GHCR -> SSH -> Windows 미니PC pull/up**가 이어지는 구조인지 확인.

## 통과한 구조 검수

- 활성 workflow: `.github/workflows/deploy.yml`
- GitHub Actions에서 backend image(React + Spring) 빌드
- GitHub Actions에서 FastAPI image 빌드
- 각 이미지를 `latest`와 Git commit SHA 태그로 GHCR push
- 실제 자동배포는 `latest`가 아니라 SHA 태그 image 사용
- workflow `permissions: contents: read, packages: write`
- 서버 저장소 origin을 현재 GitHub repository와 비교 후 배포
- 기본 서버 경로 `C:\home\dahum\app`
- SSH 포트 Secret 사용, 현재 운영값 22
- Dahum host port 9000
- React는 별도 production port 없이 Spring image에 포함
- MariaDB 3306 및 FastAPI 8000 host publish 없음
- Dahum Caddy만 host 9000 사용
- 기존 MOVEAI 80/443 유지
- `yellow.it.kr -> host.docker.internal:9000`은 기존 MOVEAI Caddy에 최초 1회 설정
- runtime secret은 `C:\home\dahum\runtime\.env`
- 서버는 application image를 build하지 않고 `docker compose pull` 사용
- DB가 실행 중이면 배포 전 MariaDB backup
- Spring / MariaDB / FastAPI health check 후 성공 처리
- 신규 image health 실패 시 직전 commit SHA image rollback 시도
- dangling image만 prune하고 rollback 태그 image는 강제 삭제하지 않음
- Java package `com.dahum`과 배포 도메인 분리

## 중요한 첫 배포 예외

GHCR 방식으로 **첫 성공 배포를 하기 전**에는 직전 commit에 대응하는 GHCR image가 없을 수 있다. 따라서 첫 GHCR 배포가 실패하면 자동 rollback image가 존재하지 않을 수 있다. 한 번 성공한 뒤부터는 직전 SHA image rollback이 정상적인 기본 경로가 된다.

## 이 검수 환경에서 직접 실행하지 못한 것

- 실제 GitHub Organization의 package publish 정책 확인
- 실제 GHCR push
- 실제 Windows 미니PC의 GHCR pull
- 실제 Docker image 전체 빌드
- 실제 `yellow.it.kr` public health 확인

위 항목은 첫 GitHub Actions 실행에서 확인된다. build/push/deploy/health 중 어느 단계든 실패하면 workflow는 성공 처리되지 않도록 구성했다.

## 배포 전에 필요한 1회 작업

1. `C:\home\dahum\app` origin 확인
2. `C:\home\dahum\runtime\.env` 생성
3. 기존 MOVEAI Caddy에 `yellow.it.kr -> host.docker.internal:9000` 추가
4. GitHub Actions Secrets 4개 등록
5. GitHub Actions의 Packages 쓰기 허용 확인
6. `main` push 또는 workflow 수동 실행

## 2026-08-15 Java 21 / GHCR 재검수

- Java 21 Docker build/runtime 이미지로 통일
- Gradle Java Toolchain 21로 통일
- `com.dahum` package 유지, 배포 도메인과 소스 package 분리
- React는 Spring Boot 이미지 안에 포함되어 별도 host frontend port 없음
- backend/ai는 GHCR commit SHA image 사용
- mini PC는 pull/up만 수행
- Dahum Compose project name은 `dahum`
- host publish는 Dahum Caddy의 `9000:80`만 사용
- MariaDB/FastAPI/Spring 내부 포트는 host 미공개
- MOVEAI host 80/443과 충돌하지 않음
- 실제 secret 미포함
- Python bytecode/cache 제거
