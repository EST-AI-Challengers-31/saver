# 18. 자동 배포 - 해야 할 것 / 하지 말아야 할 것

## 해야 할 것

- 서버 저장소는 배포 전 항상 clean 상태를 유지한다.
- 실제 `.env`는 `C:\home\dahum\runtime\.env`에서만 관리한다.
- DB가 실행 중이면 배포 전에 backup을 만든다.
- Docker build/up 이후 반드시 `Spring + MariaDB + FastAPI` health를 확인한다.
- `yellow.it.kr` route는 기존 MOVEAI Caddy의 다른 site block과 분리한다.
- Caddy 수정 전 backup, 수정 후 validate, 이후 reload 순서를 지킨다.
- 운영 DB 스키마 변경이 시작되면 초기화 SQL만 믿지 말고 Flyway migration으로 전환한다.

## 하지 말아야 할 것

- 닿음 컨테이너가 호스트 `80/443`을 점유하지 않는다.
- FastAPI `8000`, MariaDB `3306`, Spring 내부 `8080`을 인터넷에 직접 공개하지 않는다.
- React production 서버를 별도 host port로 띄우지 않는다.
- GitHub Actions YAML에 DB/OAuth/AI 비밀번호를 문자열로 적지 않는다.
- Actions가 `C:\MOVEAI` 전체를 덮어쓰거나 MOVEAI container를 `down`시키지 않는다.
- 서버 working tree에 직접 코드를 수정한 상태로 자동 배포하지 않는다.
- `UNKNOWN` 결과를 `SAFE`로 바꾸지 않는다.
- 첫 MariaDB 초기화 이후 `db/init/*.sql`이 자동 재실행될 것이라고 가정하지 않는다.

## 실패 시 동작

빌드, 컨테이너 기동, 내부 health check 단계에서 실패하면 Actions는 실패 처리한다. 이전 commit 정보가 있으면 앱 코드를 이전 commit으로 되돌린 뒤 Compose를 다시 build/up하여 이전 버전 복구를 시도한다.

외부 Caddy route 설정은 앱이 내부적으로 정상임이 확인된 뒤에만 수행한다. route 변경은 마커 블록에만 적용하고 검증 실패 시 기존 Caddyfile을 복구한다.
