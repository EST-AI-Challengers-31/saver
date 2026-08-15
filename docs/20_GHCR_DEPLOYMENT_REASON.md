# 왜 서버 빌드 방식에서 GHCR 이미지 배포 방식으로 바꿨는가

## 결론

현재 환경은 AWS가 아니라 **Windows 미니PC + Docker Desktop + GitHub Actions + SSH + 포트 22/9000 + 기존 MOVEAI Caddy**이다.
이 환경에서도 `서버에서 git pull 후 docker compose --build`보다 **GitHub Actions에서 이미지를 빌드하고 GHCR에 저장한 뒤 미니PC는 pull/up만 수행하는 방식**이 더 안정적이다.

AWS의 ECR/S3/CodeDeploy를 그대로 도입한 것이 아니다. Restok에서 검증했던 원칙인 **빌드와 실행 서버 분리, 이미지 레지스트리 사용, 서버는 배포만 담당**을 현재 미니PC 환경에 맞춰 GHCR + SSH로 단순화했다.

## 기존 방식

```text
git push
 -> GitHub Actions
 -> SSH
 -> Windows mini PC
 -> git pull
 -> docker compose up -d --build
 -> React/Gradle/Python 이미지 빌드
 -> 컨테이너 시작
```

문제점:

- 미니PC가 서비스 실행과 Node/Gradle/Python Docker 빌드를 동시에 수행한다.
- 빌드 중 CPU/RAM/Disk I/O가 커져 기존 MOVEAI와 닿음 실행 컨테이너에 영향을 줄 수 있다.
- npm/Maven/PyPI 다운로드 장애가 서버 배포 실패로 직결된다.
- 동일 commit을 재배포해도 서버의 Docker cache 상태에 따라 빌드 시간이 달라질 수 있다.
- 롤백하려면 이전 소스로 되돌린 뒤 다시 이미지를 빌드해야 한다.

## 변경된 방식

```text
git push main
 -> GitHub Actions Ubuntu runner
 -> backend image build (React + Spring)
 -> ai image build (FastAPI)
 -> GHCR push
      saver-backend:<git-sha>
      saver-ai:<git-sha>
 -> SSH :22
 -> Windows mini PC
 -> git pull (compose/scripts만 갱신)
 -> GHCR login
 -> docker compose pull
 -> DB backup
 -> docker compose up -d
 -> /api/system/status health check
 -> 성공
```

미니PC에서는 **애플리케이션 이미지를 빌드하지 않는다.**

## 현재 서버에서 더 안정적인 이유

### 1. 기존 MOVEAI와 리소스 경쟁 감소

MOVEAI가 같은 Windows 미니PC에서 이미 Docker로 실행되고 있다. 닿음 배포 시 Gradle과 Node 빌드를 서버에서 돌리지 않으므로 CPU와 메모리 급증을 줄인다.

### 2. 배포 결과가 commit 단위로 고정됨

Actions가 다음처럼 git SHA 태그 이미지를 생성한다.

```text
ghcr.io/est-ai-challengers-31/saver-backend:<commit-sha>
ghcr.io/est-ai-challengers-31/saver-ai:<commit-sha>
```

서버가 받는 이미지는 이미 만들어진 동일한 결과물이다. `latest`는 편의를 위해 같이 생성하지만 자동배포는 SHA 태그를 사용한다.

### 3. 롤백이 빠름

직전 commit 이미지가 GHCR에 남아 있으면 재빌드 없이 직전 SHA 이미지를 pull해서 되돌릴 수 있다.

### 4. 실패 영역 분리

- React/Spring/FastAPI 빌드 실패 -> GitHub Actions 빌드 단계에서 중단, 운영 서버는 건드리지 않음
- GHCR push 실패 -> 운영 서버는 건드리지 않음
- SSH 실패 -> 기존 컨테이너 유지
- 새 컨테이너 health check 실패 -> 이전 SHA 이미지 롤백 시도

### 5. 배포 시간이 일정해짐

서버에서 build 대신 image pull을 수행하므로 서버 Docker cache나 npm/Gradle 상태의 영향을 훨씬 적게 받는다.

## 그대로 유지하는 부분

배포 방식만 변경했다. 현재 서버 구조는 바꾸지 않는다.

```text
SSH                 22
기존 MOVEAI Caddy   80 / 443
닿음 진입점         9000
Spring 내부         8080
FastAPI 내부        8000
MariaDB 내부        3306
```

`yellow.it.kr`은 기존 MOVEAI Caddy에서 `host.docker.internal:9000`으로 전달한다.
닿음 컨테이너 그룹은 MOVEAI와 분리되어 있다.

## 하지 않는 것

- AWS ECR 추가하지 않음
- AWS S3 추가하지 않음
- AWS CodeDeploy 추가하지 않음
- EC2 사용하지 않음
- 닿음이 80/443을 직접 점유하지 않음
- FastAPI/MariaDB를 외부에 공개하지 않음
- 운영 미니PC에서 application Docker image를 build하지 않음
- `latest`만 믿고 배포하지 않음

## 필요한 GitHub 설정

Repository Actions Secrets:

```text
SERVER_HOST
SERVER_USER
SERVER_PASSWORD
SERVER_PORT=22
```

GHCR push/pull은 workflow가 실행되는 동안 GitHub의 `GITHUB_TOKEN`을 사용한다. 별도의 장기 GHCR 비밀번호를 서버 `.env`에 저장하지 않는다.

선택 Repository Variable:

```text
SERVER_APP_PATH=C:\home\dahum\app
```

설정하지 않으면 위 경로를 기본값으로 사용한다.

## 운영 DB

MariaDB 데이터는 image와 분리되어 다음에 유지된다.

```text
C:\home\dahum\runtime\data\mariadb
```

애플리케이션 image가 바뀌거나 rollback되어도 DB volume 경로를 삭제하지 않는다.
배포 전 MariaDB가 이미 실행 중이면 backup script를 먼저 실행한다.

## 최종 판단

현재 미니PC 환경에서는 **GHCR 이미지 배포 방식이 더 적합하다.**
이유는 AWS를 흉내 내기 위해서가 아니라, 빌드 부하를 GitHub Actions runner로 이동시키고 미니PC를 실행 서버로만 유지하는 것이 기존 MOVEAI와 함께 운영하기에 더 안전하기 때문이다.
