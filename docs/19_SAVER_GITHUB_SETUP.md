# EST-AI-Challengers-31/saver 자동배포 연결

대상 저장소: `EST-AI-Challengers-31/saver`

## 1. 서버 저장 위치

```text
C:\home\dahum\app
```

이 폴더의 `origin`은 반드시 `EST-AI-Challengers-31/saver` 저장소여야 합니다.
GitHub Actions는 잘못된 저장소를 배포하지 않도록 origin을 검사하고 다르면 즉시 중단합니다.

확인:

```powershell
Set-Location C:\home\dahum\app
git remote -v
```

## 2. GitHub Actions Secrets

Repository > Settings > Secrets and variables > Actions > Secrets:

```text
SERVER_HOST      미니PC 공인 IP
SERVER_USER      home
SERVER_PASSWORD  실제 SSH 비밀번호
SERVER_PORT      22
```

실제 비밀번호, DB 비밀번호, OAuth Secret, AI API Key는 저장소에 커밋하지 않습니다.

## 3. 선택 Repository Variable

Actions > Variables에 아래 값을 선택적으로 등록할 수 있습니다.

```text
SERVER_APP_PATH=C:\home\dahum\app
```

등록하지 않으면 workflow가 위 경로를 기본값으로 사용합니다.

## 4. 서버 runtime env

아래 파일은 GitHub에 올리지 않습니다.

```text
C:\home\dahum\runtime\.env
```

`deploy/.env.example`을 기준으로 서버에서 직접 생성합니다.

## 5. 도메인 / 기존 MOVEAI Caddy

Dahum 컨테이너는 호스트 `9000` 하나만 사용합니다.
기존 MOVEAI Caddy가 80/443을 계속 소유합니다.

MOVEAI Caddyfile에는 최초 한 번 아래 route를 추가하고, 가능하면 MOVEAI 저장소에도 커밋해서 서버 파일이 dirty 상태가 되지 않게 합니다.

```caddy
yellow.it.kr {
    encode zstd gzip
    reverse_proxy host.docker.internal:9000
}
```

`deploy/.env`의 기본값은 `OUTER_CADDY_AUTO_CONFIGURE=false`입니다.
Dahum 자동배포가 MOVEAI의 추적 파일을 매번 수정하지 않도록 하기 위한 안전장치입니다.

## 6. 자동배포 흐름

```text
main push
 -> GitHub Actions
 -> SSH :22
 -> C:\home\dahum\app origin 검증
 -> git pull --ff-only
 -> deploy.ps1
 -> Docker Compose build/up
 -> Spring + React + MariaDB + FastAPI health 검증
 -> 성공
```

실패하면 workflow가 실패하고, 가능한 범위에서 직전 Git commit으로 application rollback을 시도합니다.

## GHCR 자동배포 추가 확인

현재 최종 workflow는 서버에서 source image를 build하지 않는다. GitHub Actions가 다음 package image를 생성한다.

```text
ghcr.io/est-ai-challengers-31/saver-backend:<commit-sha>
ghcr.io/est-ai-challengers-31/saver-ai:<commit-sha>
```

Repository/Organization의 Actions 정책에서 package publish가 허용되어야 한다. Workflow에는 `packages: write` 권한이 선언되어 있으며, package publish와 같은 workflow 실행 중 서버 pull 인증에는 임시 `GITHUB_TOKEN`을 사용한다.

첫 Actions 실행에서 `denied: permission_denied` 또는 package 관련 403이 발생하면 코드 문제가 아니라 Organization/Package 권한을 먼저 확인한다.
