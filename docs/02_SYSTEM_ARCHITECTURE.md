# 02. 시스템 아키텍처

## 1. 확정 스택

- Frontend: React + TypeScript, 모바일 웹 우선
- Backend: Spring Boot
- Authentication: Spring Security + Kakao/Google OAuth
- AI Server: Python + FastAPI
- Relational DB: MariaDB
- Vector Search: Pinecone 또는 팀이 확정한 벡터 검색 계층
- Reverse Proxy / HTTPS: Caddy
- Runtime: Docker Compose on Windows mini PC
- Deploy: GitHub Actions -> SSH 22 -> PowerShell deploy script
- Public URL: `https://yellow.it.kr/`
- Backend local diagnostic port: `127.0.0.1:9000 -> backend:8080`

## 2. 전체 사용자 흐름

```text
모바일 사용자
   |
   | HTTPS 443
   v
Caddy / yellow.it.kr
   |
   +-- /                         -> React
   +-- /api/*                    -> Spring Boot
   +-- /oauth2/*                 -> Spring Boot
   +-- /login/oauth2/*           -> Spring Boot
   |
   v
Spring Boot
   |
   +-- Kakao/Google OAuth
   +-- MariaDB
   +-- 가족 권한 검사
   +-- 업로드/OCR 연결
   |
   +---- internal HTTP ----> FastAPI
                              |
                              +-- exact match / RAG
                              +-- LLM explanation
                              +-- guide generation
```

## 3. 분석 요청 흐름

```text
1. React
   - 로그인 상태 확인: GET /api/me
   - 분석 대상 가족 구성원 선택
   - screenshot 또는 appNames 입력
   - POST /api/check

2. Spring Boot
   - 세션 인증 확인
   - requester가 family의 ACTIVE member인지 확인
   - targetFamilyMember가 같은 family에 속하는지 확인
   - 업로드 파일 검증
   - analysis_request 생성
   - OCR 또는 AI server 호출 준비

3. FastAPI
   - OCR text/app name 정규화
   - exact match
   - vector similarity search
   - HIGH/MEDIUM/UNKNOWN 결정
   - evidence 생성
   - 판정 이후 LLM 설명 생성
   - parentGuide 생성

4. Spring Boot
   - AI response enum/schema 검증
   - analysis_item/evidence/guide 저장
   - response DTO 조립

5. React
   - 위험도/근거/행동 표시
   - parentGuide 복사
   - 사용자가 카카오톡 등으로 전달
```

## 4. 인증 흐름

```text
React 로그인 버튼
  -> /oauth2/authorization/kakao 또는 google
  -> 외부 로그인/동의
  -> /login/oauth2/code/{provider}
  -> Spring Security
  -> oauth_identity 조회/생성
  -> server-side session
  -> React 홈으로 redirect
```

로그인 토큰/Client Secret을 React가 소유하는 구조를 기본안으로 사용하지 않습니다.

## 5. 가족 흐름

```text
사용자 로그인
  -> 가족 그룹 생성
  -> family_member에 CHILD/PARENT 역할 생성
  -> invite token 생성
  -> raw token은 사용자 링크에만 사용
  -> DB에는 SHA-256 등 token hash만 저장
  -> 상대 사용자가 로그인 후 초대 수락
  -> family_member 생성/활성화
  -> 동의 기록
```

`PARENT`/`CHILD`는 `app_user` 전역 속성이 아닙니다. 한 사용자가 가족 A에서는 CHILD, 가족 B에서는 PARENT일 수 있기 때문입니다.

## 6. 서비스 경계

### React

해야 함:
- 화면/사용자 입력
- 로그인 진입
- 가족 선택/초대 UI
- 결과/안내문 표시

하지 않음:
- 판정
- DB 직접 접근
- OAuth secret 보관
- FastAPI 직접 호출

### Spring Boot

해야 함:
- 공개 API
- OAuth/세션
- 가족 권한
- 업로드 검증
- MariaDB
- AI client
- audit

하지 않음:
- LLM을 이용한 임의 판정
- 비밀값을 프론트로 전달

### FastAPI

해야 함:
- AI/검색 파이프라인
- 판정 규칙과 설명 생성

하지 않음:
- 사용자 로그인
- 가족 권한 결정
- 공개 API gateway 역할

### MariaDB

해야 함:
- 사용자/소셜 identity
- 가족 관계/동의
- 분석 결과/근거
- 탐지 데이터 메타데이터
- 감사/향후 알림 모델

하지 않음:
- 스크린샷 원본 장기 보관을 기본으로 하지 않음
- raw OAuth token/Client Secret 저장 금지

## 7. 외부 공개 포트

```text
22   SSH 배포/운영
80   Caddy HTTP -> HTTPS/인증서 처리
443  Caddy HTTPS 사용자 접속
```

외부 공개 금지 기본값:

```text
3306 MariaDB
8000 FastAPI
8080 backend container
```

9000은 미니PC 본체에서만 확인할 수 있도록 `127.0.0.1:9000`에 바인딩합니다.

## 8. 장애 분리 원칙

- OCR 실패 -> 직접 입력 fallback 가능
- LLM 실패 -> 판정 결과 유지 + template guide 사용
- Pinecone 실패 -> exact match까지 가능한 범위 반환 또는 분석 실패를 명확히 표시
- DB 실패 -> 성공처럼 응답하지 않음
- OAuth 실패 -> 분석 페이지 접근 불가, 재로그인 안내
- 가족 권한 실패 -> 403 및 데이터 미노출
