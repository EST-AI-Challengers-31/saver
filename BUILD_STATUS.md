# BUILD / DEPLOY STATUS

## 현재 포함된 실행 코드

- React + TypeScript 임시 모바일 화면
- Spring Boot REST API + React static serving
- MariaDB 연결 상태 확인
- 합성 데모 malware exact-match DB 조회
- FastAPI health + placeholder analyze
- Dahum Caddy :9000 단일 gateway
- 기존 MOVEAI Caddy의 `yellow.it.kr -> host.docker.internal:9000` 연동 구조
- GitHub Actions -> GHCR image build/push -> Windows mini PC 자동 배포
- Windows Docker Desktop SSH 세션 대응
- 배포 전 MariaDB backup
- 배포 후 health gate
- 배포 실패 시 이전 Git commit SHA image rollback 시도

## 자동 배포 기준

`main push -> Actions image build -> GHCR -> SSH 22 -> C:\home\dahum\app -> git pull -> docker compose pull/up -> health -> yellow.it.kr`

미니PC에서는 React/Gradle/FastAPI application image를 다시 build하지 않는다.

## 아직 실제 서비스 기능으로 구현하지 않은 부분

- Kakao/Google OAuth 실제 연동
- CLOVA OCR 실제 호출
- RAG/Pinecone 검색
- LLM 쉬운 설명 생성
- 부모/자녀 초대 및 동의 UI/API

현재 ZIP은 **화면 + Spring + MariaDB + FastAPI + Docker + domain route + GHCR 자동배포** 기반 검증을 목표로 한다.
