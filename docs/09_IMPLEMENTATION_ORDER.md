# 09. 실제 구현 순서와 완료 조건

## Phase 0. 계약 고정

먼저 확정:
- API enum
- DB table 이름
- 폴더 구조
- `C:\home\dahum` 저장 위치
- 운영 환경변수 이름

완료 조건: 팀원이 같은 field/enum을 사용함.

## Phase 1. MariaDB + Spring Boot 기초

1. MariaDB container
2. `app_user`, `oauth_identity`
3. Spring Data/JPA 연결
4. `/actuator/health` 또는 팀 health endpoint

완료 조건: Spring이 MariaDB에 읽기/쓰기 가능.

## Phase 2. Kakao/Google 로그인

1. Spring Security
2. Kakao OAuth registration
3. Google OAuth registration
4. success handler
5. oauth_identity upsert
6. `/api/me`
7. logout

완료 조건: 모바일에서 두 provider 중 하나로 로그인 후 `/api/me` 정상.

## Phase 3. 가족

1. family_group
2. family_member
3. invitation
4. invitation accept
5. family authorization
6. 최소 consent

완료 조건: 두 계정이 하나의 가족으로 연결되고 다른 가족 데이터 접근은 차단됨.

## Phase 4. 분석 mock

Spring `/api/check`이 고정 mock 결과를 반환하도록 먼저 구현합니다.

완료 조건: React가 실제 API contract로 ResultPage 완성.

## Phase 5. React 모바일 화면

1. 로그인
2. 홈
3. 가족
4. 분석 입력
5. 결과
6. 안내문 복사

완료 조건: mock만으로 모바일 end-to-end 화면이 동작.

## Phase 6. FastAPI exact match

- normalized name/package
- DB/source 검색
- HIGH/UNKNOWN
- evidence

완료 조건: LLM/Pinecone 없이도 판정 파이프라인 동작.

## Phase 7. RAG

- vector search
- threshold 설정 외부화
- MEDIUM
- matchedRecordId

완료 조건: 유사 사례가 MEDIUM으로 근거와 함께 반환.

## Phase 8. LLM explanation

- easyExplanation
- recommendedActions
- parentGuide
- template fallback

완료 조건: LLM 장애가 위험 판정 자체를 망가뜨리지 않음.

## Phase 9. OCR

- screenshot -> app names
- OCR 결과 수정 UI
- 직접 입력 fallback

완료 조건: OCR이 틀려도 사용자가 demo를 계속 진행 가능.

## Phase 10. Docker/mini PC

1. Dockerfile 구현
2. compose build
3. runtime `.env`
4. Caddy
5. yellow.it.kr
6. DB backup

완료 조건: mini PC 재부팅/컨테이너 재기동 후 서비스 재현 가능.

## Phase 11. GitHub Actions

- SSH 설정
- deploy script
- main push 또는 수동 dispatch
- 배포 후 status/health 확인

완료 조건: GitHub에서 실행 -> mini PC 최신 코드 -> 서비스 정상.

## 마지막에만 하는 것

- 자동 알림
- Kakao 자동 메시지
- 보호 기기 등록
- 통계 대시보드
- 복잡한 역할 체계

핵심 데모 전에 이 기능들에 시간을 쓰지 않습니다.
