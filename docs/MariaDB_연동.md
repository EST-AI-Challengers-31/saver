# MariaDB 연동 기준

## 1. DB 확정

관계형 DB는 MariaDB를 사용합니다.

Docker service name:

```text
mariadb
```

Spring 내부 접속 URL:

```text
jdbc:mariadb://mariadb:3306/dahum
```

3306을 인터넷에 공개하지 않습니다.

## 2. 데이터 저장 위치

```text
C:\home\dahum\runtime\data\mariadb
```

컨테이너를 rebuild해도 이 디렉터리가 남아 있어야 합니다.

## 3. 신규 DB 최초 초기화

MariaDB data directory가 비어 있을 때 Docker image가:

```text
db/init/01_schema.sql
db/init/02_seed_demo.sql
```

을 실행합니다.

중요:

`docker-entrypoint-initdb.d`는 **기존 DB migration 시스템이 아닙니다.**

## 4. 기존 DB 변경

운영 데이터가 생긴 뒤에는:

```text
db/migration/Vxxx__*.sql
```

을 기준으로 변경합니다.

현재 파일은 확장 방향과 수동 적용 순서를 표현합니다. 실제 Spring 프로젝트에서 Flyway를 붙이면 migration 위치를 하나로 통합합니다.

## 5. DB 변경 전 순서

```text
1. backup_mariadb.ps1
2. migration SQL 검토
3. staging/local MariaDB 테스트
4. 운영 적용
5. schema/row count 확인
6. 서비스 health 확인
```

## 6. Demo seed

`02_seed_demo.sql`은 synthetic data만 포함합니다.

실제 EST 제공 데이터를 SQL 예제와 섞어서 Git에 공개하지 않습니다.

실제 탐지 데이터 import 파이프라인을 만들 때:
- source/version 기록
- 원본 row 수
- 결측 제거 후 usable row 수
- vector id와 SQL id 연결

을 추적합니다.

## 7. 판정 DB 조회 규칙

강한 순서:

```text
package exact
 -> normalized app exact
 -> vector similarity
 -> UNKNOWN
```

정확한 risk 정책은 팀이 검증 데이터로 확정하며 임계값을 코드 여러 곳에 하드코딩하지 않습니다.

## 8. 백업

스크립트:

```text
deploy/scripts/backup_mariadb.ps1
```

저장 위치:

```text
C:\home\dahum\runtime\backup\mariadb
```

## 9. 복원

복원은 자동 배포에 넣지 않습니다.

사유:
- 잘못된 backup을 자동 restore하면 더 큰 장애 발생
- 복원은 운영자가 파일/시점을 확인한 뒤 수동 절차로 수행해야 함

## 10. 금지

- 일반 배포에서 DB volume 삭제
- `down -v`
- 운영 DB를 seed로 덮어쓰기
- migration 전에 backup 생략
- DB credential을 Git에 기록
