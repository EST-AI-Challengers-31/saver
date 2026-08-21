# Dahum Python-first 통합

## 1단계 - 코드 검수

- React의 위험도 `uncertain` 고정 로직 제거
- 이미지 미리보기 URL만 전달하던 흐름을 실제 `File` multipart 전달로 수정
- 고정 로딩 타이머 제거
- Spring `RestTemplate`/`RestClient` 불일치 제거
- 잘못 위치한 `dto/AnalyzeController.java` 제거
- Alan/Google/운영 `.env` 잔존 의존성 제거

## 2단계 - Python 단일 판정 기준점

```text
입력
 -> Package/Malware name Exact Match -> HIGH
 -> Exact 없음 -> Vector Search
      -> similarity >= threshold -> MEDIUM
      -> 그 외 -> UNKNOWN
```

`UNKNOWN`은 `SAFE`가 아닙니다. Spring은 OCR과 프록시/저장 경계 역할을 하고 위험도를 다시 계산하지 않습니다.

## 3단계 - 화면/저장/배포 연결

- 기존 Figma/Pretendard 디자인 유지
- Result/Detail/ParentGuide가 Python 응답의 실제 근거와 메시지를 사용
- 분석 이력 + 분석 상세 화면 추가
- MariaDB 기존 `analysis_request`, `analysis_item`, `analysis_evidence`, `parent_guide` 재사용
- AI 이미지에 `malware_db.csv`, `malware_embedding_data.csv` 포함
- GitHub Actions RuntimeConfig 방식 유지

## 로컬 실행

```powershell
Copy-Item .env.local.example .env.local
docker compose -f docker-compose.local.yml --env-file .env.local up -d --build
python .\tools\smoke_test.py
```

외부 API 없이 직접 패키지 입력 + Local Vector로 기본 데모가 가능합니다. 이미지 OCR은 `CLOVA_OCR_URL`, `CLOVA_OCR_SECRET`이 필요합니다.
