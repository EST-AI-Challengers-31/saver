# 07. 보안 / 개인정보 / AI 안전

## 1. 기본 원칙

서비스 목적은 가족 보호이지 부모 스마트폰 감시가 아닙니다.

- 최소 수집
- 명시적 가족 연결
- 필요한 순간의 분석
- 이해 가능한 안내
- 연결 해제 가능

## 2. 수집하지 않는 것을 기본값으로 둘 정보

- 주민등록번호
- 주소
- 전화번호(필수 요구가 생기기 전까지)
- IMEI/광고 ID 등 고유 단말 식별자
- 주소록 전체
- SMS 전체 내용
- 부모 스마트폰 전체 앱 목록의 지속 자동 수집

## 3. 소셜 로그인

저장 권장:
- provider
- provider subject
- 최소 프로필 이름
- 필요한 경우 email

저장 금지:
- OAuth Client Secret
- 장기 access token을 일반 DB 평문으로 보관
- 비밀번호

Kakao/Google 이메일이 같아도 자동으로 동일 사용자로 합치지 않습니다.

## 4. 가족 초대

- 초대 token은 충분히 예측 불가능하게 생성
- URL에는 raw token 사용 가능
- DB에는 raw token 대신 hash 저장
- 만료 시간 필수
- 수락 후 재사용 금지
- revoke 가능
- 가족 연결 시 동의 기록

## 5. 가족 권한

IDOR 방지를 위해 다음을 매 요청 확인합니다.

```text
current user
  -> family_member ACTIVE?
  -> 요청 family와 일치?
  -> target member가 같은 family?
  -> 필요한 공유/동의 상태 유효?
```

클라이언트가 보낸 `userId`, `familyId`를 신뢰만 하고 조회하면 안 됩니다.

## 6. 스크린샷

앱 목록 스크린샷에도 알림/이름/개인정보가 섞일 수 있습니다.

권장 처리:

```text
upload temp
 -> type/size validate
 -> OCR/analyze
 -> 필요한 텍스트만 저장
 -> raw image delete
```

장기 저장은 별도 요구/동의/보관 기간 정책이 있을 때만 추가합니다.

## 7. LLM

LLM 역할:
- 전문 용어 쉬운 설명
- 대응 행동 문구
- 부모 안내문 생성

LLM 금지 역할:
- 안전/위험 최종 결정
- DB에 없는 사실 생성
- UNKNOWN을 SAFE로 변경

LLM 실패 시 판정 결과 자체는 유지하고 template fallback을 사용합니다.

## 8. Secret 관리

운영 Secret 위치:

```text
C:\home\dahum\runtime\.env
```

Git 금지:
- DB passwords
- OAuth Client Secrets
- OCR/LLM/Pinecone keys
- SSH private key

이 하네스에도 실제 Secret은 들어 있지 않습니다.

## 9. SSH/배포

- 22 포트 외부 공개 시 공격 표면이 있음
- 가능하면 SSH key only
- Windows 관리자 계정 직접 사용 지양
- 방화벽/VPN/IP 제한 가능하면 적용
- GitHub Actions 로그에 secret echo 금지

## 10. 계정/가족 종료

최소 지원 계획:
- 로그아웃
- 가족 연결 해제
- 초대 취소
- 사용자 탈퇴 상태 처리
- 탈퇴 사용자 개인정보 최소화/보존 정책 확정

MVP에서 물리 DELETE를 성급히 구현하기보다 status 기반 처리 후 보존/삭제 정책을 확정합니다.
