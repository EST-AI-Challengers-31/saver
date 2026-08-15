# 11. 부모-자녀 가족 도메인 설계

## 핵심 원칙

`부모`와 `자녀`는 사용자 계정의 영구 역할이 아닙니다.

```text
app_user
  -> family_member
       -> member_role
```

한 사용자는 부모에게는 CHILD이고 자신의 자녀와의 가족에서는 PARENT일 수 있습니다.

## 테이블 역할

### family_group

가족 단위 컨테이너.

### family_member

사용자와 가족의 연결.

주요 값:
- CHILD
- PARENT
- OTHER

### family_invitation

초대 링크와 상태.

상태:
- PENDING
- ACCEPTED
- EXPIRED
- REVOKED

### family_consent

가족 연결/분석 공유/향후 알림에 대한 동의 추적.

## 권장 최초 사용자 흐름

```text
로그인
 -> 가족 없음
 -> '부모님을 보호할게요' 선택
 -> family_group 생성
 -> 현재 사용자 CHILD member 생성
 -> 부모 초대 링크 생성
```

부모 측:

```text
초대 링크 클릭
 -> 로그인
 -> 초대 정보 확인
 -> 연결 동의
 -> PARENT member 생성
 -> consent 기록
```

## 초대 token

해야 함:

```text
secure random raw token
 -> URL에 일회성 사용
 -> hash(raw token)
 -> DB 저장
```

하지 않음:
- 짧은 순번 token
- DB raw token 저장
- 만료 없는 링크
- 수락 후 재사용

## 분석 권한

분석 전에 확인:

```text
requester is ACTIVE member of family
AND target member belongs to same family
AND target member is ACTIVE
AND required consent is valid
```

## 분석 대상

`analysis_request.target_family_member_id`를 사용합니다.

이 값이 필요한 이유:
- 엄마/아빠 중 누구의 검사인지 구분
- 분석 기록 화면에서 대상 표시
- 가족별 접근 제어
- 향후 보호 기기 연결

## 연결 해제

MVP 최소안:
- family_member.member_status = LEFT/REMOVED
- 기존 분석 이력 보존 정책은 별도로 명시

운영 확장:
- 탈퇴/해제 시 접근권한 즉시 차단
- 개인정보/분석 기록 보존기간 정책 적용
