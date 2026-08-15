# backend

Spring Boot 3 / Java 21 메인 서버입니다.

## 현재 구현
- `GET /api/health`
- `GET /api/system/status`: MariaDB + FastAPI 연결 상태 확인
- `POST /api/demo/check`: `malware_record` 정확일치 조회
- React 빌드 결과를 Spring static으로 제공

## 아직 구현하지 않음
- OAuth2 Kakao/Google
- 가족 도메인 API
- OCR 업로드
- 실제 AI 분석 orchestration

배포 확인이 끝난 뒤 위 기능을 순서대로 추가합니다.

## Java package namespace

백엔드 Java package는 `com.dahum`을 사용한다. `yellow.it.kr`은 배포 도메인이므로 Java package/file path와 연결하지 않는다.
도메인은 `deploy/.env`의 `PUBLIC_DOMAIN` / `PUBLIC_BASE_URL`, 외부 Caddy 라우팅, OAuth redirect URI처럼 배포 계층에서만 사용한다.
