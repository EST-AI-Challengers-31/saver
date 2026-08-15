# 10. Kakao + Google 소셜 로그인 설계

## 목표

모바일 웹에서 사용자가 별도 비밀번호를 만들지 않고 Kakao 또는 Google로 로그인하도록 합니다.

## 구조

```text
React
 -> /oauth2/authorization/kakao | google
 -> Provider login/consent
 -> /login/oauth2/code/{provider}
 -> Spring Security
 -> oauth_identity 조회/생성
 -> app_user 연결
 -> session 생성
 -> React
```

## DB 식별 기준

```text
provider + provider_subject
```

이 조합을 unique로 둡니다.

### 왜 email이 key가 아닌가

- provider마다 email 제공 여부가 다를 수 있음
- 사용자가 email을 바꿀 수 있음
- 같은 email이어도 자동 병합하면 계정 탈취/오병합 위험이 있음

따라서 Kakao/Google 계정 연결은 나중에 **로그인된 사용자가 명시적으로 연결**하는 기능으로 추가합니다.

## Spring Boot 구현 항목

- `SecurityConfig`
- OAuth provider registration
- `OAuthUserService` 또는 provider attribute adapter
- login success handler
- `/api/me`
- `/api/logout`
- unauthorized handler

## 환경변수

```text
KAKAO_CLIENT_ID
KAKAO_CLIENT_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

실제 값은:

```text
C:\home\dahum\runtime\.env
```

에만 둡니다.

## Redirect URL 기준

운영 도메인 기준 application callback은 다음 형태로 맞춥니다.

```text
https://yellow.it.kr/login/oauth2/code/kakao
https://yellow.it.kr/login/oauth2/code/google
```

실제 provider console에 등록하는 값과 Spring 설정 값이 일치해야 합니다.

## Caddy 필수 라우팅

다음 경로는 React가 아니라 backend로 보내야 합니다.

```text
/api/*
/oauth2/*
/login/oauth2/*
/logout
/error
```

## Session 기본안

MVP:

- Spring Security server session
- HttpOnly cookie
- HTTPS Secure cookie

확장:

- Spring Session JDBC 또는 Redis

단일 미니 PC MVP에서 인증 인프라를 과도하게 복잡하게 만들지 않습니다.

## 반드시 테스트

- Kakao 최초 로그인
- Kakao 재로그인
- Google 최초 로그인
- Google 재로그인
- 같은 email의 서로 다른 provider를 자동 병합하지 않음
- 로그인 실패 callback
- 세션 만료
- 로그아웃
- provider에서 email이 없을 때도 사용자 생성 가능
