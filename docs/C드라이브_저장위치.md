# C드라이브 저장 위치 기준

## 기준 루트

```text
C:\home\dahum
```

이 경로를 `DAHUM_HOME`의 기본값으로 사용합니다.

## 최종 구조

```text
C:\home\dahum\
├─ app\
│  ├─ .github\
│  ├─ frontend\
│  ├─ backend\
│  ├─ ai\
│  ├─ db\
│  ├─ deploy\
│  ├─ docs\
│  ├─ README.md
│  └─ FILE_STRUCTURE.md
│
└─ runtime\
   ├─ .env
   ├─ data\
   │  ├─ mariadb\
   │  └─ caddy\
   ├─ config\
   │  └─ caddy\
   ├─ logs\
   │  ├─ backend\
   │  ├─ ai\
   │  └─ caddy\
   └─ backup\
      └─ mariadb\
```

## app의 역할

`C:\home\dahum\app`

- Git으로 관리
- 코드/SQL migration/배포 설정/문서
- `git pull`로 변경 가능

## runtime의 역할

`C:\home\dahum\runtime`

- Git 금지
- 실제 secret
- MariaDB data
- Caddy certificate/state
- 로그
- DB backup

## 왜 분리하는가

Git 업데이트나 코드 삭제가 DB/secret을 건드리지 않게 하기 위해서입니다.

## 환경변수 기본값

```text
DAHUM_HOME=C:\home\dahum
DAHUM_RUNTIME=C:/home/dahum/runtime
```

Docker Compose volume에서는 `/` 스타일 Windows path를 사용하는 편이 설정이 단순합니다.

## 최초 생성 예

PowerShell에서 필요한 runtime 폴더를 직접 준비한 뒤 `.env.example`을 복사합니다.

실제 `.env`의 비밀번호/API Key는 repository 안의 예제 파일에 복사하지 않습니다.

## 금지

- `C:\home\dahum\app\runtime` 안에 DB data 두기
- MariaDB data를 Git commit
- `.env`를 app 폴더에 실값으로 저장 후 commit
- 배포 script에서 runtime 전체 삭제
