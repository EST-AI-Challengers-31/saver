# GitHub Actions 배포

## 목적

`main` push 시 GitHub Actions가 application image를 빌드해 GHCR에 올리고, Windows 미니PC는 이미지를 pull해서 실행만 한다.

## 필요한 Secrets

```text
SERVER_HOST      미니PC 공인 IP
SERVER_USER      home
SERVER_PASSWORD  Windows SSH 비밀번호
SERVER_PORT      22
```

애플리케이션 DB/OAuth/AI Secret은 GitHub에 복제하지 않고 다음 서버 파일에 둔다.

```text
C:\home\dahum\runtime\.env
```

## 선택 Variable

```text
SERVER_APP_PATH=C:\home\dahum\app
```

없으면 workflow가 위 경로를 기본값으로 사용한다.

## GHCR

workflow에는 다음 permission이 있다.

```yaml
permissions:
  contents: read
  packages: write
```

Actions build 단계는 `GITHUB_TOKEN`으로 GHCR에 push한다. SSH 배포 단계에서도 같은 실행의 임시 token을 전달하여 `docker login ghcr.io` 후 해당 SHA image를 pull하고, 배포가 끝나면 logout한다.

별도의 장기 `GHCR_TOKEN`을 서버에 저장하는 방식은 기본 설계에 사용하지 않는다.

## 실제 변경 순서

```text
git push main
 -> build backend image
 -> build ai image
 -> GHCR push
 -> SSH server
 -> verify git origin
 -> git pull
 -> deploy.ps1
 -> docker compose pull/up
 -> health check
```
