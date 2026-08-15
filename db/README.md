# MariaDB 설계/적용 안내

## 1. DB 제품

관계형 DB는 **MariaDB**로 확정합니다.

- Docker image 기본 예: `mariadb:11.4`
- charset: `utf8mb4`
- id: application-generated UUID -> `CHAR(36)`
- DB 외부 포트 공개 안 함

## 2. 파일 역할

```text
db/
├─ init/
│  ├─ 01_schema.sql       # 완전히 새 DB의 최초 생성 최종 상태
│  └─ 02_seed_demo.sql    # synthetic demo rows
├─ migration/
│  └─ Vxxx__*.sql         # 기존 DB를 단계적으로 확장하기 위한 변경안
├─ schema.sql             # 01_schema.sql의 수동 실행용 복사본
├─ seed_demo.sql          # 02_seed_demo.sql의 수동 실행용 복사본
└─ queries.sql            # Repository/query 구현 참고
```

## 3. 핵심 테이블

### 로그인
- `app_user`: 닿음 내부 사용자
- `oauth_identity`: Kakao/Google 로그인 identity

### 가족
- `family_group`: 가족 단위
- `family_member`: 가족 속 사용자 역할
- `family_invitation`: 초대/만료/수락
- `family_consent`: 가족 연결/공유 동의

### 탐지 데이터
- `malware_dataset`: source/version 추적
- `malware_record`: 실제 탐지 DB record + vector id

### 분석
- `analysis_request`: 누가/어느 가족/누구를 검사했는지
- `analysis_item`: 앱별 HIGH/MEDIUM/UNKNOWN
- `analysis_evidence`: 판정 근거
- `parent_guide`: 부모에게 보낼 쉬운 안내
- `response_action`: 안내 이후 실제 행동 확장

### 최종 확장용
- `protected_device`: 향후 기기 단위 관리
- `notification_preference`: 향후 알림 동의/설정
- `notification_event`: 향후 알림 delivery 기록
- `audit_event`: 최소 감사/추적 로그

## 4. MVP에서 실제로 우선 사용할 테이블

```text
app_user
oauth_identity
family_group
family_member
family_invitation
family_consent
malware_record
analysis_request
analysis_item
analysis_evidence
parent_guide
audit_event
```

나머지 테이블은 스키마에 존재해도 UI/API를 억지로 구현하지 않습니다.

## 5. Fresh install

MariaDB data directory가 비어 있을 때만 `db/init`을 사용합니다.

```text
C:\home\dahum\runtime\data\mariadb
```

에 기존 데이터가 있으면 init SQL 수정 내용이 자동으로 적용되지 않습니다.

## 6. Existing DB

운영 중 DB 변경은 migration으로 처리합니다.

현재 `db/migration` 파일은 이전 하네스 스키마에서 최종 방향으로 확장할 때의 순서를 보여줍니다.

중요:
- ALTER 전 backup
- nullable backfill 먼저
- 그 다음 NOT NULL/FK 강화
- cleanup migration은 자동 실행하지 않음

## 7. Pinecone과 MariaDB 경계

Pinecone:
- embedding
- vector similarity search

MariaDB:
- source record
- dataset/version
- vector id 연결
- 최종 판정/근거/분석 이력

Pinecone metadata의 record id와 MariaDB `malware_record.id`를 연결해 추적 가능하게 합니다.

## 8. 보안

DB에 넣지 않음:
- OAuth Client Secret
- raw access token 기본 보관
- raw family invitation token
- API keys
- 서버 password
- screenshot binary 장기 저장

운영 secret은 `C:\home\dahum\runtime\.env`에 둡니다.
