# 06. API Contract

이 문서는 React/Spring Boot/FastAPI가 각자 다른 필드/enum을 만들지 않도록 하는 기준입니다.

## 1. 공통 규칙

- 외부 공개 API: Spring Boot `/api/*`
- AI 내부 API: FastAPI 내부 Docker network
- JSON: camelCase
- DB: snake_case
- ID: UUID string
- 시간: ISO-8601 response 권장
- `riskLevel`: `HIGH | MEDIUM | UNKNOWN`
- `UNKNOWN`은 정상/안전이 아님

## 2. 인증

### GET /api/me

로그인 상태/가족 정보 조회.

예시:

```json
{
  "id": "user-uuid",
  "displayName": "사용자",
  "profileImageUrl": null,
  "providers": ["KAKAO", "GOOGLE"],
  "families": [
    {
      "familyId": "family-uuid",
      "familyName": "우리 가족",
      "familyMemberId": "member-uuid",
      "role": "CHILD"
    }
  ]
}
```

### POST /api/logout

현재 세션 종료.

## 3. 가족

### POST /api/families

```json
{
  "name": "우리 가족",
  "myRole": "CHILD"
}
```

서버는 현재 로그인 사용자로 owner/member를 생성합니다.

### GET /api/families/{familyId}/members

현재 사용자가 해당 가족의 ACTIVE member일 때만 반환합니다.

### POST /api/families/{familyId}/invitations

```json
{
  "role": "PARENT"
}
```

Response 예시:

```json
{
  "invitationId": "uuid",
  "inviteUrl": "https://yellow.it.kr/invite/RAW_ONE_TIME_TOKEN",
  "expiresAt": "2026-08-15T14:00:00+09:00"
}
```

DB에는 raw token이 아니라 hash만 저장합니다.

### GET /api/invitations/{token}

초대 정보/만료 여부 확인.

### POST /api/invitations/{token}/accept

로그인 사용자 기준으로 가족 연결을 수락합니다.

## 4. 분석

### POST /api/check

#### JSON 직접 입력

```json
{
  "familyId": "family-uuid",
  "targetFamilyMemberId": "member-uuid",
  "appNames": ["OO Cleaner", "Example App"]
}
```

#### multipart 이미지 입력

필드:

- `familyId`
- `targetFamilyMemberId`
- `image`
- 필요 시 사용자가 보정한 `appNames`

#### Response

```json
{
  "requestId": "uuid",
  "status": "COMPLETED",
  "target": {
    "familyMemberId": "member-uuid",
    "displayName": "엄마"
  },
  "results": [
    {
      "resultId": "uuid",
      "inputAppName": "OO Cleaner",
      "normalizedAppName": "oo cleaner",
      "packageName": null,
      "riskLevel": "MEDIUM",
      "displayLabel": "주의",
      "matchType": "VECTOR_SIMILARITY",
      "similarity": 0.91,
      "malwareName": "Example.Trojan.Agent",
      "malwareCategory": "Trojan",
      "evidence": [
        {
          "type": "VECTOR_MATCH",
          "message": "유사한 탐지 데이터가 검색되었습니다."
        }
      ],
      "easyExplanation": "정상 앱처럼 보이지만 정보를 몰래 가져갈 수 있는 유형과 유사합니다.",
      "recommendedActions": [
        "앱 설치 출처를 확인하세요.",
        "문자와 연락처 권한을 확인하세요."
      ]
    }
  ],
  "parentGuide": "확인이 필요한 앱이 있어요..."
}
```

## 5. 분석 기록

### GET /api/families/{familyId}/analyses

가족 구성원이 볼 수 있는 분석 이력을 반환합니다. 단, 실제 공개 범위는 family consent/역할 정책으로 제한합니다.

### GET /api/analyses/{requestId}

해당 request가 현재 사용자가 접근 가능한 family에 속하는지 반드시 확인합니다.

## 6. Spring Boot -> FastAPI

### POST /analyze

Request:

```json
{
  "requestId": "uuid",
  "appNames": ["OO Cleaner"],
  "ocrText": null
}
```

Response:

```json
{
  "requestId": "uuid",
  "items": [
    {
      "inputAppName": "OO Cleaner",
      "normalizedAppName": "oo cleaner",
      "riskLevel": "HIGH",
      "matchType": "EXACT_PACKAGE",
      "similarity": null,
      "matchedRecordId": "uuid",
      "malwareName": "Example.Trojan.Agent",
      "malwareCategory": "Trojan",
      "evidence": [
        {
          "type": "DETECTION_DB_MATCH",
          "message": "탐지 DB와 정확히 일치"
        }
      ],
      "easyExplanation": "...",
      "recommendedActions": ["..."]
    }
  ],
  "parentGuide": "...",
  "generation": {
    "method": "LLM",
    "modelName": "configured-model",
    "promptVersion": "v1"
  }
}
```

## 7. enum 고정

### riskLevel
- `HIGH`
- `MEDIUM`
- `UNKNOWN`

### matchType
- `EXACT_PACKAGE`
- `EXACT_APP_NAME`
- `VECTOR_SIMILARITY`
- `NO_MATCH`

### analysis status
- `RECEIVED`
- `PROCESSING`
- `COMPLETED`
- `FAILED`

### family role
- `CHILD`
- `PARENT`
- `OTHER`

## 8. 공통 오류 응답 권장

```json
{
  "code": "FORBIDDEN_FAMILY_ACCESS",
  "message": "이 가족 정보에 접근할 수 없습니다.",
  "requestId": "uuid"
}
```

운영에서는 내부 stack trace를 사용자에게 보내지 않습니다.
