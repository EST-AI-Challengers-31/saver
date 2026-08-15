# 12. MariaDB 최종 확장 방향

## 목적

DB는 해커톤 MVP만 겨우 저장하는 구조가 아니라, **로그인 -> 가족 연결 -> 분석 -> 행동 -> 향후 알림**까지 확장할 수 있게 설계합니다.

단, 테이블이 있다고 해서 모든 기능을 MVP에서 구현해야 하는 것은 아닙니다.

## 1. MVP 핵심 테이블

```text
app_user
  |
  +-- oauth_identity
  |
  +-- family_member -- family_group
                         |
                         +-- family_invitation
                         +-- family_consent

analysis_request
  |
  +-- analysis_item
       |
       +-- analysis_evidence
  |
  +-- parent_guide

malware_record
```

MVP가 동작하려면 위 영역을 우선합니다.

## 2. 확장 대비 테이블

### protected_device

향후 부모가 여러 기기를 보유하거나 실제 앱/SDK와 연결할 때 사용.

MVP에서는 사용하지 않아도 됩니다.

저장하면 안 되는 것:
- IMEI
- 전화번호
- 주소록
- 불필요한 하드웨어 식별값

### malware_dataset

제공 데이터가 어느 기간/버전의 것인지 추적.

필요 이유:
- 7일치 표본과 이후 데이터 구분
- 분석 재현성
- vector index 재구축 추적

### response_action

탐지 이후 실제 행동으로 이어졌는지 기록.

예:
- 안내문 확인
- 안내문 복사
- 삭제 확인
- 가족에게 문의

서비스의 핵심인 `탐지 이후 행동`을 나중에 측정할 수 있습니다.

### notification_preference / notification_event

PPT의 향후 실시간 알림 방향을 수용하기 위한 DB 자리입니다.

주의:
- 이 테이블이 있다고 Kakao 자동 메시지가 구현되는 것은 아님
- provider API/사용자 동의/정책 검토가 별도 필요

## 3. 왜 oauth_identity를 분리하는가

잘못된 구조:

```text
app_user
  provider
  provider_subject
```

이 구조는 한 사용자가 Kakao와 Google을 모두 연결할 때 확장성이 떨어집니다.

권장:

```text
app_user 1 --- N oauth_identity
```

현재는 provider별 unique를 두어 같은 사용자가 provider당 한 identity를 연결하도록 제한합니다.

## 4. 왜 role을 app_user에 넣지 않는가

잘못된 구조:

```text
app_user.role = PARENT
```

권장:

```text
family_member.member_role
```

역할은 관계 안에서 발생하기 때문입니다.

## 5. 왜 target_family_member_id가 필요한가

`requester_user_id`만 있으면 '누가 검사했는지'는 알지만 '누구 폰인지'는 모릅니다.

그래서:

```text
requester_user_id
family_group_id
target_family_member_id
```

세 값을 분리합니다.

## 6. 초기화와 migration을 구분

### 새 서버/빈 DB

Docker MariaDB가 최초 생성될 때:

```text
db/init/01_schema.sql
db/init/02_seed_demo.sql
```

이 실행됩니다.

### 이미 운영 중인 DB

`db/init` 파일을 수정해도 기존 `/var/lib/mysql`에는 자동 반영되지 않습니다.

따라서:

```text
db/migration/Vxxx__*.sql
```

로 변경을 관리합니다.

현재 migration 파일은 **확장 방향/reference**입니다. 실제 Spring Boot에서 Flyway를 도입하면 `db/migration`을 Flyway source로 일원화하는 것을 권장합니다.

## 7. 운영에서 하지 말아야 할 DB 작업

- 운영 DB 삭제 후 init SQL 재실행
- schema.sql을 매 배포마다 강제 실행
- production 데이터 위에 demo seed 반복 삽입
- user/family record를 임의로 cascade 삭제
- OAuth raw token/secret 저장
- invite raw token 저장
- UNKNOWN을 DB query 결과 0건으로 SAFE 변환

## 8. 인덱스 기준

인덱스를 모든 컬럼에 무작정 추가하지 않습니다.

현재 우선 인덱스:
- social provider subject lookup
- user -> family lookup
- family -> active members
- invitation token/status/expiry
- malware package/name lookup
- analysis family/requester/target history
- audit created/type

실제 쿼리/데이터 양을 확인한 후 추가합니다.
