# ai

FastAPI AI 서버입니다.

## 현재 구현
- `GET /health`: Docker/Spring 상태 확인
- `POST /analyze`: 패키지명 목록의 Pinecone 유사도 검색 및 안내 메시지 생성

FastAPI는 Docker 내부 `ai:8000`에서만 접근하며 외부 포트로 공개하지 않습니다.
분석에는 `PINECONE_API_KEY`, `UPSTAGE_API_KEY`, `ALAN_CLIENT_ID`가 필요합니다.
