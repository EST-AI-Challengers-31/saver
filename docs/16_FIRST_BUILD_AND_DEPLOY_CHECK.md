# 16. 첫 자동배포 / DB 연결 / 화면 확인

이제 첫 검증도 서버 수동 build가 아니라 **GitHub Actions -> GHCR -> 미니PC pull** 흐름으로 수행한다.

## 사전 준비

서버:

```powershell
New-Item -ItemType Directory -Force C:\home\dahum\runtime\data\mariadb
New-Item -ItemType Directory -Force C:\home\dahum\runtime\backup\mariadb
New-Item -ItemType Directory -Force C:\home\dahum\runtime\logs
Copy-Item C:\home\dahum\app\deploy\.env.example C:\home\dahum\runtime\.env
```

`runtime\.env`의 DB 비밀번호는 반드시 변경한다.

GitHub Actions Secrets:

```text
SERVER_HOST
SERVER_USER
SERVER_PASSWORD
SERVER_PORT=22
```

## 첫 자동배포

`main`에 push하거나 GitHub Actions에서 `workflow_dispatch`를 실행한다.

성공하면 서버에서 확인한다.

```powershell
cd C:\home\dahum\app
docker ps
Invoke-RestMethod http://127.0.0.1:9000/api/health
Invoke-RestMethod http://127.0.0.1:9000/api/system/status
```

목표 상태:

```text
backend  = UP
database = UP
ai       = UP
```

## 화면 확인

브라우저에서:

```text
https://yellow.it.kr
```

확인 항목:

- React 화면 표시
- Spring Boot 상태 UP
- MariaDB 상태 UP
- FastAPI 상태 UP
- 합성 데모 데이터 조회 성공
- 미등록 앱은 UNKNOWN이며 안전으로 표시하지 않음

## 첫 배포에서 실패했을 때

1. GitHub Actions에서 image build/push 단계가 실패했는지 먼저 확인
2. 그 단계가 성공했다면 SSH deploy 단계 확인
3. 서버에서 `docker compose ... ps`와 logs 확인
4. 신규 image health check 실패 시 deploy script가 이전 commit SHA image rollback을 시도함

서버에서 `docker compose up --build`로 문제를 숨기지 않는다. 자동배포 경로 자체를 검증하는 것이 목적이다.
