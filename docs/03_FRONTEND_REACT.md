# 03. Frontend - React 모바일 구현 기준

## 1. 목표

발표자료의 세로형 스마트폰 UI를 실제 모바일 브라우저에서 자연스럽게 구현합니다. 데스크톱에서도 화면을 과도하게 늘리지 않고 모바일 카드 폭 중심으로 보여줍니다.

권장 레이아웃 기준:

```text
min width 대응: 320px
주 디자인 폭: 360~430px
PC: max-width를 두고 중앙 정렬
```

구체적인 CSS 수치는 디자인 결과에 맞게 확정하며 하드코딩을 여러 컴포넌트에 반복하지 않습니다.

## 2. 화면 흐름

```text
LoginPage
  -> OAuth redirect
  -> HomePage
       -> FamilyPage
       -> AnalysisPage
            -> ResultPage
       -> MyPage

Invite link
  -> Login if needed
  -> InvitePage
  -> accept
  -> FamilyPage/HomePage
```

## 3. 페이지별 책임

### LoginPage

- 카카오로 시작하기
- Google로 시작하기
- 서비스 목적 간단 설명
- 비밀번호 입력 폼 만들지 않음

### HomePage

- 로그인 사용자 표시
- 가족 구성원 카드
- 최근 분석 상태
- 검사 시작 CTA

### FamilyPage

- 가족 목록
- PARENT/CHILD 관계 표시
- 초대 링크 생성
- 연결 해제 진입

### InvitePage

- 초대한 사용자/가족 표시
- 어떤 역할로 연결되는지 표시
- 동의/거절
- 만료된 링크 오류

### AnalysisPage

- 누구의 폰인지 target 선택
- 이미지 업로드
- 앱 이름 직접 입력 fallback
- OCR 추출 결과 수정
- 분석 시작

### ResultPage

- 앱별 riskLevel
- 근거
- 유사도(해당할 때)
- 쉬운 설명
- 지금 해야 할 행동
- parentGuide
- 복사 버튼

## 4. 표시 규칙

### HIGH

- 사용자 라벨: `위험`
- 정확 일치 등 강한 근거를 같이 표시
- 실제 근거보다 강하게 과장하지 않음

### MEDIUM

- 사용자 라벨: `주의`
- `악성 확정` 문구 금지
- similarity와 추가 확인 필요를 표시

### UNKNOWN

- 사용자 라벨: `확인되지 않은 앱`
- `안전`, `정상`, `문제 없음` 금지

## 5. 인증 상태

React는 세션 상태의 source of truth가 아닙니다.

앱 시작 시:

```text
GET /api/me
200 -> 사용자 상태 구성
401 -> LoginPage
```

Spring Boot가 HttpOnly/Secure 쿠키를 사용할 경우 JS에서 세션 값을 읽으려 하지 않습니다.

## 6. API 구성

권장:

```text
src/api/apiClient.ts
src/api/authApi.ts
src/api/familyApi.ts
src/api/analysisApi.ts
```

모든 요청은 하나의 공통 client를 통과해 오류 형식과 credential 설정을 통일합니다.

## 7. 파일 업로드

해야 함:
- `image/*` 사용자 선택 지원
- 서버 오류 표시
- 미리보기 제거 가능
- 업로드 취소/재선택

서버가 최종 MIME/type/size를 검증하므로 브라우저 accept만 신뢰하지 않습니다.

## 8. 프론트 금지사항

- OAuth Client Secret
- MariaDB credential
- Pinecone/LLM/OCR secret
- 위험 판정 알고리즘 중복
- raw HTML LLM 결과 무검증 삽입
- familyId만 바꿔 다른 가족 데이터 호출 가능하게 만드는 IDOR 구조
