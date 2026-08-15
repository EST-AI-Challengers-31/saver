# 13. 최종 배포 구조 - 현재 미니 PC 기준

## 확정된 조건

- Windows mini PC / 계정: `home`
- Dahum checkout: `C:\home\dahum\app`
- Runtime: `C:\home\dahum\runtime`
- SSH: host `22`
- Dahum host service port: `9000`
- MOVEAI가 host `80/443`을 이미 사용
- MOVEAI API domain: `121-166-129-218.sslip.io`
- Dahum domain: `yellow.it.kr`
- React는 Spring Boot JAR의 static resource로 포함한다.
- 따라서 Dahum 런타임에는 별도 frontend container/host port가 없다.

## 요청 흐름

```text
Browser
  -> https://yellow.it.kr        (443)
  -> existing MOVEAI Caddy       (TLS/domain routing)
  -> host.docker.internal:9000
  -> Dahum Caddy container :80
  -> backend:8080
       |- React static files
       |- /api/** Spring REST
       |- /oauth2/** Spring Security
       |- /login/oauth2/** OAuth callback
       -> ai:8000       (Docker internal only)
       -> mariadb:3306  (Docker internal only)
```

## 포트 충돌 방지

| Port | Owner | 공개 여부 |
|---|---|---|
| 22 | Windows OpenSSH | GitHub Actions용 |
| 80/443 | 기존 MOVEAI Caddy | 기존 점유 유지 |
| 9000 | Dahum Caddy | Dahum host 진입 포트 |
| 8080 | Dahum Spring | Docker network only |
| 8000 | Dahum FastAPI | Docker internal only |
| 3306 | Dahum MariaDB | Docker internal only |

Dahum compose는 80/443을 절대 publish하지 않는다.

## Caddy가 2개인 이유

- 기존 MOVEAI Caddy: 서버 전체의 public TLS/domain gateway. `yellow.it.kr` 인증서와 HTTPS를 담당한다.
- Dahum Caddy: Dahum 컨테이너 그룹의 단일 host port `9000` 진입점. TLS를 담당하지 않는다.

이렇게 하면 MOVEAI와 Dahum의 compose lifecycle을 분리하면서도 public 80/443 충돌을 피할 수 있다.

## 기존 MOVEAI Caddy에 1회 추가

`deploy/caddy/moveai-yellow.it.kr.caddy.example` 내용을 기존 MOVEAI `Caddyfile`에 추가한다.

```caddy
yellow.it.kr {
    encode zstd gzip
    reverse_proxy host.docker.internal:9000
}
```

이 설정은 Dahum GitHub Action이 매 배포마다 수정하지 않는다. 기존 MOVEAI Caddy 설정으로 관리한다.

## React build 원칙

Production에서는 `frontend/Dockerfile` 컨테이너를 따로 실행하지 않는다. `backend/Dockerfile`의 Node build stage가 React `dist/`를 만들고 Spring `src/main/resources/static/`으로 복사한 뒤 JAR을 만든다.

따라서 브라우저 기준 origin은 하나다.

```text
https://yellow.it.kr/       -> React
https://yellow.it.kr/api/*  -> same Spring application
```

React API 호출은 절대 IP/9000을 하드코딩하지 않고 `/api/...` 상대 경로를 사용한다.

## 반드시 해야 할 것

1. Gabia A record `yellow.it.kr -> 121.166.129.218` 확인
2. 기존 MOVEAI Caddy에 yellow.it.kr site block 추가
3. Caddy reload 후 HTTPS 확인
4. `C:\home\dahum\runtime\.env` 생성
5. Git clone을 `C:\home\dahum\app`에 준비
6. Docker Desktop이 `home` SSH 세션에서 접근 가능한지 확인
7. GitHub Secrets의 SSH 값 등록
8. Kakao/Google OAuth redirect URI를 `https://yellow.it.kr/login/oauth2/code/...`로 등록
9. Spring `server.forward-headers-strategy=framework` 유지
10. frontend build output이 Vite `dist/`인지 확인

## 하지 말아야 할 것

- Dahum에서 host 80/443 publish
- FastAPI 8000 외부 publish
- MariaDB 3306 외부 publish
- React를 9001 같은 별도 production port로 추가
- React 코드에 `121.166.129.218:9000` 하드코딩
- Dahum Action이 MOVEAI Caddyfile을 자동 덮어쓰기
- 실제 `.env`, OAuth secret, DB password commit
- 일반 배포에서 `docker compose down -v`
