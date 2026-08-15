# 08. 데모 및 테스트 체크리스트

## A. 로그인

- [ ] 모바일에서 `https://yellow.it.kr/` 접속됨
- [ ] Kakao 로그인 시작 가능
- [ ] Google 로그인 시작 가능
- [ ] 로그인 성공 후 `/api/me` 200
- [ ] 비로그인 사용자는 보호 API 401
- [ ] 로그아웃 후 보호 API 접근 불가

## B. 가족 연결

- [ ] CHILD 역할로 가족 생성
- [ ] PARENT 초대 링크 생성
- [ ] 초대 token이 DB에 raw로 저장되지 않음
- [ ] 만료 링크 처리
- [ ] 다른 가족 사용자가 임의 familyId로 조회하면 403
- [ ] 초대 수락 후 family member 생성
- [ ] 가족 연결 해제 동작 또는 최소 정책 명시

## C. 분석 입력

- [ ] 스크린샷 업로드
- [ ] 앱 이름 직접 입력
- [ ] OCR 실패 시 직접 입력으로 진행 가능
- [ ] 비이미지 파일 거절
- [ ] 과대 파일 거절
- [ ] 분석 대상 부모/가족 구성원 표시

## D. 판정 3개 고정 케이스

### 1. HIGH
- [ ] exact DB match
- [ ] HIGH 표시
- [ ] 탐지 근거 표시

### 2. MEDIUM
- [ ] similarity threshold 이상
- [ ] MEDIUM/주의 표시
- [ ] 유사도/근거 표시
- [ ] 악성 확정 표현 없음

### 3. UNKNOWN
- [ ] no match
- [ ] `확인되지 않은 앱` 표시
- [ ] `안전`이라는 단어로 오판하지 않음

## E. AI 설명

- [ ] riskLevel은 LLM 호출 전에 정해짐
- [ ] 쉬운 설명 생성
- [ ] 부모 안내문 생성
- [ ] LLM timeout/실패 시 template fallback
- [ ] 모델/프롬프트 변경이 판정 등급을 바꾸지 않음

## F. DB

- [ ] OAuth identity 저장
- [ ] family group/member 저장
- [ ] analysis request target member 저장
- [ ] analysis item/evidence 저장
- [ ] guide 저장
- [ ] MariaDB container 재시작 후 데이터 유지
- [ ] backup script 실행 확인

## G. Docker/배포

- [ ] `docker compose config` 성공
- [ ] MariaDB healthy
- [ ] backend 기동
- [ ] FastAPI 내부 접근
- [ ] frontend 기동
- [ ] Caddy 80/443 기동
- [ ] 3306 외부 미공개
- [ ] 8000 외부 미공개
- [ ] backend 9000은 127.0.0.1에서만 접근

## H. 발표 직전 데모 순서

권장 한 사이클:

```text
모바일 접속
 -> Kakao/Google 로그인
 -> 가족/부모 선택
 -> 스크린샷 또는 앱 입력
 -> 분석
 -> 위험 근거
 -> 쉬운 설명
 -> 부모 안내문
 -> 복사
```

이 흐름이 끝까지 성공하기 전에는 부가 기능을 추가하지 않습니다.
