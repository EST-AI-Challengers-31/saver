# 전체 파일 구조와 각 파일의 역할

아래 구조의 `#` 설명은 **그 파일/폴더가 무엇을 책임지는지**를 의미합니다.

```text
dahum_harness_final/
│
├─ README.md                              # 프로젝트 전체 원칙, 읽는 순서, MVP 범위
├─ FILE_STRUCTURE.md                      # 현재 파일 트리와 각 파일 역할 설명
│
├─ .github/
│  └─ workflows/
│     └─ deploy.yml.example               # GitHub Actions 배포 예제, 검토 후 deploy.yml로 활성화
│
├─ frontend/                              # React + TypeScript 모바일 웹이 들어갈 영역
│  └─ README.md                           # 모바일 화면/폴더/프론트 책임과 금지사항
│
├─ backend/                               # Spring Boot 메인 API/인증/가족/DB 서버 영역
│  └─ README.md                           # 백엔드 모듈 책임과 구현 순서
│
├─ ai/                                    # Python + FastAPI AI 전용 서버 영역
│  └─ README.md                           # OCR/RAG/설명 생성의 경계와 금지사항
│
├─ db/                                    # MariaDB 초기화/확장/쿼리 기준
│  ├─ README.md                           # DB 적용 방법과 MVP/확장 테이블 구분
│  ├─ schema.sql                          # 신규 설치 최종 스키마의 수동 실행용 복사본
│  ├─ seed_demo.sql                       # 데모용 가상 악성앱 데이터 복사본
│  ├─ queries.sql                         # Spring Repository 구현 참고 SQL
│  ├─ init/
│  │  ├─ 01_schema.sql                    # 새 MariaDB 데이터 디렉터리 최초 생성용 최종 스키마
│  │  └─ 02_seed_demo.sql                 # 새 DB 최초 생성 때 넣는 SYNTHETIC demo 데이터
│  └─ migration/
│     ├─ V002__oauth_identity.sql          # 기존 DB에 Kakao/Google 계정 식별 구조 추가
│     ├─ V003__family_invitation_and_consent.sql # 가족 초대/동의/상태 확장
│     ├─ V004__analysis_target_and_device.sql    # 분석 대상 가족 구성원/향후 기기 확장
│     ├─ V005__malware_dataset_versioning.sql    # 탐지 데이터셋 버전 추적
│     ├─ V006__response_action.sql         # 안내 후 실제 행동 기록 확장
│     ├─ V007__notification_expansion.sql  # 향후 알림 채널 데이터 구조
│     ├─ V008__audit_expansion.sql         # 감사 로그 추적 필드 확장
│     ├─ V009__cleanup_legacy_auth.sql     # 구 인증 컬럼 제거용 선택적 안전 절차
│     └─ V010__tighten_family_owner.sql    # 기존 데이터 backfill 후 FK/NOT NULL 강화용
│
├─ deploy/                                # 미니 PC 운영/컨테이너/HTTPS 설정
│  ├─ .env.example                        # 운영 환경변수 키 목록. 실제 값 작성 금지
│  ├─ docker-compose.yml                  # React/Spring/FastAPI/MariaDB/Caddy 컨테이너 조합
│  ├─ caddy/
│  │  └─ Caddyfile                        # yellow.it.kr HTTPS 및 API/OAuth reverse proxy
│  └─ scripts/
│     ├─ ensure_docker.ps1                # Docker가 꺼져 있으면 서비스/Desktop 기동 시도
│     ├─ deploy.ps1                       # git pull -> Docker 확인 -> compose 배포
│     ├─ backup_mariadb.ps1               # MariaDB SQL 백업 파일 생성
│     └─ status.ps1                       # 현재 compose 서비스 상태 확인
│
└─ docs/                                  # 팀원 공통 구현 기준 문서
   ├─ 00_SOURCE_SUMMARY.md                 # 기획서/PPT 요구를 구현 언어로 요약
   ├─ 01_MVP_PRIORITY.md                   # 해커톤에서 먼저 끝낼 기능 우선순위
   ├─ 02_SYSTEM_ARCHITECTURE.md            # 전체 서비스/네트워크/요청 흐름
   ├─ 03_FRONTEND_REACT.md                 # 모바일 React 상세 구현 기준
   ├─ 04_BACKEND_SPRINGBOOT.md             # Spring Security/API/DB/AI client 상세 기준
   ├─ 05_AI_FASTAPI.md                     # AI 판정/설명 경계와 응답 규칙
   ├─ 06_API_CONTRACT.md                    # Front-Spring-AI 간 고정 JSON 계약
   ├─ 07_SECURITY_PRIVACY.md                # 인증/가족/스크린샷/키 관리 보안 규칙
   ├─ 08_DEMO_AND_TEST_CHECKLIST.md         # 발표 전 통합 테스트 체크리스트
   ├─ 09_IMPLEMENTATION_ORDER.md            # 실제 구현 순서와 완료 조건
   ├─ 10_AUTH_SOCIAL_LOGIN.md               # Kakao + Google 로그인 및 세션 구조
   ├─ 11_FAMILY_DOMAIN.md                    # 가족 초대/동의/권한/분석 대상 설계
   ├─ 12_DATABASE_FINAL_DIRECTION.md         # DB 현재 MVP와 최종 확장 방향
   ├─ 해야할것_하지말아야할것.md            # 작업별 DO / DON'T 기준
   ├─ 왜_이렇게_설계했는지.md               # 이 구조를 선택한 이유와 대안 제외 이유
   ├─ git_액션.md                           # GitHub Secrets와 SSH 배포 Action 작성 기준
   ├─ C드라이브_저장위치.md                 # C:\home\dahum 운영 폴더 기준
   ├─ MariaDB_연동.md                       # MariaDB 연결/초기화/migration/백업 기준
   ├─ 도커_구조.md                          # Docker 네트워크와 외부 공개 포트 기준
   ├─ 배포과정.md                           # 개발 PC -> Git -> 미니PC -> Docker -> HTTPS 과정
   └─ 운영_주의사항.md                      # 실제 운영 중 사고 예방 기준
```

## 실제 코드가 들어오면 생길 위치

하네스는 역할만 먼저 고정합니다. 실제 코드를 넣을 때는 다음처럼 확장합니다.

```text
frontend/src/...        # React 실제 코드
backend/src/main/...    # Spring Boot 실제 코드
ai/app/...              # FastAPI 실제 코드
```

하네스 문서와 실제 코드를 섞지 말고, 실제 구현이 문서의 계약을 따르도록 합니다.

## 현재 추가된 실행 코드

```text
frontend/
├─ package.json                 # React/Vite 의존성 및 build/dev 명령
├─ vite.config.ts               # 개발 시 /api -> Spring 8080 proxy
├─ index.html                   # React 진입 HTML
└─ src/
   ├─ main.tsx                  # React root bootstrap
   ├─ App.tsx                   # 배포/DB 연결 확인용 모바일 화면
   └─ styles.css                # 모바일 우선 임시 UI 스타일

backend/
├─ build.gradle                 # Spring Boot 3 + JDBC + Actuator + MariaDB
├─ settings.gradle              # Gradle 프로젝트 이름
└─ src/main/
   ├─ java/com/dahum/
   │  ├─ DahumApplication.java  # Spring Boot main
   │  ├─ config/                # 내부 HTTP client 설정
   │  ├─ controller/            # /api/health, /api/system/status, /api/demo/check, SPA route
   │  ├─ dto/                   # 데모 요청/응답 계약
   │  └─ service/               # DB/FastAPI 상태 및 데모 exact-match 조회
   └─ resources/
      └─ application.yml        # DB, AI URL, forwarded headers 환경변수 설정

ai/
├─ requirements.txt             # FastAPI/Uvicorn 의존성
└─ app/
   └─ main.py                   # /health + placeholder /analyze

deploy/
├─ docker-compose.yml           # MariaDB + FastAPI + Spring + Dahum Caddy
└─ caddy/
   ├─ Caddyfile                 # host 9000 -> backend 8080
   └─ moveai-yellow.it.kr.caddy.example # 기존 MOVEAI Caddy에 1회 추가할 domain route
```

---

# 자동 배포 추가 파일 (최종 반영)

```text
.github/workflows/deploy.yml
  -> main push를 감지하고 SSH 22로 미니PC에 접속해 Git pull 후 최신 deploy.ps1을 실행한다.

deploy/scripts/action_entrypoint.ps1
  -> 사람이 서버에서 수동으로 동일 배포 흐름을 실행할 때 쓸 수 있는 보조 entrypoint다.

deploy/scripts/deploy.ps1
  -> Docker 확인, DB backup, Compose build/up, health gate, rollback, public route 연결을 총괄한다.

deploy/scripts/ensure_docker.ps1
  -> Windows SSH 비대화형 세션에서 Docker Desktop/engine 준비 여부를 확인한다.

deploy/scripts/backup_mariadb.ps1
  -> 배포 전 MariaDB SQL dump를 C:\home\dahum\runtime\backup\mariadb에 생성한다.

deploy/scripts/ensure_public_route.ps1
  -> 기존 C:\MOVEAI\Caddyfile에 yellow.it.kr route를 idempotent하게 추가/검증/reload한다.
  -> Caddyfile 변경 전 backup을 만들며 validation 실패 시 원복한다.

deploy/scripts/verify_deployment.ps1
  -> 로컬 9000과 public URL의 상태를 사람이 필요할 때 다시 확인하는 도구다.

docs/17_AUTO_DEPLOYMENT.md
  -> GitHub Actions부터 domain route까지 최종 자동 배포 흐름을 설명한다.

docs/18_AUTO_DEPLOY_FAILURE_RULES.md
  -> 배포 시 해야 하는 것, 하지 말아야 하는 것, 실패/rollback 정책을 설명한다.
```

### GHCR 배포 추가 문서

- `docs/20_GHCR_DEPLOYMENT_REASON.md` - 현재 Windows 미니PC 환경에서 서버 직접 build보다 GHCR image pull 배포가 더 안정적인 이유와 롤백 전략.
