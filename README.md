# 닿음(Dahum) - 자동 배포 준비본

부모님 스마트폰의 위험 정보를 자녀가 함께 확인하고, 이해하기 쉬운 대응 행동으로 연결하는 모바일 웹 MVP용 저장소다.

이 ZIP은 **실제 서버 자동배포 확인을 우선**한 버전이다. `main` push 시 GitHub Actions가 React+Spring과 FastAPI 이미지를 먼저 빌드해 GHCR에 저장하고, Windows mini PC는 SSH 배포 단계에서 해당 SHA 이미지를 pull하여 실행한다. 미니PC에서는 애플리케이션 Docker 이미지를 빌드하지 않는다.

## 현재 배포 구조

```text
Git push (main)
    -> GitHub Actions
    -> backend image build (React + Spring)
    -> ai image build (FastAPI)
    -> GHCR push with Git commit SHA
    -> SSH :22
    -> C:\home\dahum\app
    -> git pull --ff-only
    -> deploy.ps1
    -> docker compose pull / up
       - mariadb     internal :3306
       - ai          internal :8000
       - backend     internal :8080
       - caddy       host :9000 -> backend:8080
    -> /api/system/status health check
    -> 기존 MOVEAI Caddy :443
    -> https://yellow.it.kr
```

기존 MOVEAI는 host 80/443을 계속 소유한다. 닿음은 MOVEAI container/project와 분리되고, host 9000만 사용한다.

## GitHub Actions 활성화

이미 `.github/workflows/deploy.yml`이 실제 workflow 파일로 들어 있다. GitHub repository에 아래 Secrets만 등록한다.

- `SERVER_HOST`
- `SERVER_USER` (`home`)
- `SERVER_PASSWORD`
- `SERVER_PORT` (`22`)

그 뒤 `main` push가 자동 배포를 시작한다.

## 서버 런타임 설정

실제 비밀값은 Git이 아니라 다음 파일에 둔다.

`C:\home\dahum\runtime\.env`

처음 만드는 경우 `deploy/.env.example`을 복사하여 값만 채운다.

## 임시 배포 확인 화면

배포 후 화면은 `/api/system/status`를 호출해 다음을 보여준다.

- Spring Boot UP/DOWN
- MariaDB UP/DOWN + table count
- FastAPI UP/DOWN

합성 데모 DB에는 `oo cleaner`, `com.demo.cleaner.bad`가 들어 있어 React -> Spring -> MariaDB 흐름을 확인할 수 있다. 일치하지 않는 앱은 `UNKNOWN`이며 안전하다고 표시하지 않는다.

## 문서

- `docs/17_AUTO_DEPLOYMENT.md`: GHCR 자동 배포 전체 과정
- `docs/20_GHCR_DEPLOYMENT_REASON.md`: 왜 이 방식이 현재 미니PC에서 더 안정적인지
- `docs/18_AUTO_DEPLOY_FAILURE_RULES.md`: 해야 할 것/하지 말아야 할 것
- `docs/git_액션.md`: GitHub Secrets와 workflow
- `docs/13_DEPLOYMENT_FINAL.md`: 기존 배포 설계
- `FILE_STRUCTURE.md`: 파일별 역할

## 중요한 운영 원칙

1. host 80/443은 기존 MOVEAI Caddy가 계속 사용한다.
2. 닿음은 host 9000 하나만 공개한다.
3. React는 별도 production port 없이 Spring JAR에 포함한다.
4. FastAPI/MariaDB는 Docker 내부 network에서만 사용한다.
5. 실제 `.env`와 비밀번호/API key는 Git에 commit하지 않는다.
6. 서버에서 직접 source를 수정하지 않는다. 자동 배포는 dirty working tree를 거부한다.
7. 운영 application image는 서버에서 직접 build하지 않고 Actions/GHCR 산출물을 사용한다.
8. DB 변경이 본격화되면 `db/init`이 아니라 Flyway migration을 기준으로 전환한다.

## GitHub 배포 대상

자동배포 대상 저장소는 `EST-AI-Challengers-31/saver`를 기준으로 검수했습니다. 서버의 `C:\home\dahum\app`도 같은 저장소를 origin으로 사용해야 하며, workflow가 이를 확인한 뒤에만 배포합니다. 자세한 설정은 `docs/19_SAVER_GITHUB_SETUP.md`와 `DEPLOYMENT_CHECKLIST.md`를 확인하세요.
