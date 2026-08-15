# 04. Backend - Spring Boot 상세 기준

## 1. Spring Boot의 위치

Spring Boot는 닿음의 공개 API gateway이자 도메인 서버입니다.

```text
React -> Spring Boot -> MariaDB
                    -> FastAPI
                    -> OAuth Provider
```

## 2. 권장 패키지

```text
...dahum/
├─ auth/
│  ├─ config/
│  ├─ oauth/
│  ├─ controller/
│  └─ service/
├─ user/
├─ family/
├─ analysis/
├─ malware/
├─ ai/
├─ guide/
├─ audit/
└─ common/
```

## 3. 인증

### 소셜 identity 기준

사용자 검색 key:

```text
(provider, providerSubject)
```

예:

```text
(KAKAO, kakao-subject)
(GOOGLE, google-subject)
```

이메일은 display/contact metadata로만 보고 자동 계정 병합 key로 사용하지 않습니다.

### 세션

권장 기본안:

- Spring Security session
- HttpOnly cookie
- Secure cookie on production HTTPS
- SameSite 정책은 실제 OAuth redirect 흐름을 테스트한 뒤 확정
- 다중 인스턴스로 확장할 경우 Spring Session JDBC/Redis 검토

MVP 단일 미니PC에서는 지나친 인증 인프라를 추가하지 않습니다.

## 4. 가족 권한

모든 family/analysis 조회는 URL의 familyId만 믿으면 안 됩니다.

서비스 계층에서 최소한 확인:

```text
currentUser
  -> family_member 존재?
  -> member_status == ACTIVE?
  -> 요청 대상 targetFamilyMember도 같은 family?
  -> 필요한 consent가 유효한가?
```

## 5. 분석 API

Spring 책임:

1. 세션 확인
2. family/target authorization
3. 파일 검증
4. request row 생성
5. AI 호출
6. response validation
7. DB transaction 저장
8. 사용자 response 반환

AI가 결과를 반환해도 Spring에서 허용 enum 이외의 값이면 저장하지 않습니다.

## 6. 파일 검증

- 최대 크기 설정 외부화
- 이미지 MIME 검사
- 확장자만 믿지 않음
- 임시 랜덤 파일명
- 실행 경로와 분리
- 분석 후 삭제

## 7. AI Client

- `AI_BASE_URL` 환경변수
- connect timeout
- read timeout
- retry 횟수 제한
- requestId 전달
- timeout을 사용자에게 명확한 오류로 매핑

## 8. DB Transaction

분석 저장은 최소한 다음 묶음의 일관성을 고려합니다.

```text
analysis_request status
analysis_item
analysis_evidence
parent_guide
```

부분 저장 후 성공으로 응답하지 않도록 transaction 경계를 잡습니다.

## 9. 오류 코드

권장 예:

- `AUTH_REQUIRED`
- `FORBIDDEN_FAMILY_ACCESS`
- `INVITATION_INVALID`
- `INVITATION_EXPIRED`
- `INVALID_INPUT`
- `UNSUPPORTED_FILE_TYPE`
- `FILE_TOO_LARGE`
- `OCR_FAILED`
- `AI_TIMEOUT`
- `AI_INVALID_RESPONSE`
- `DB_ERROR`
- `INTERNAL_ERROR`

## 10. 로그

남겨도 되는 것:
- requestId
- user UUID
- family UUID
- status/error code
- latency

기본적으로 남기지 않는 것:
- OAuth access token
- Client Secret
- DB password
- raw screenshot
- 전체 OCR text
- 초대 raw token
