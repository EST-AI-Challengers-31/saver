# 05. AI Server - FastAPI 상세 기준

## 1. AI 서버 역할

FastAPI는 로그인/가족 서버가 아니라 분석 전용 내부 서버입니다.

```text
Spring Boot -> FastAPI -> detection/RAG/LLM
```

외부 사용자에게 FastAPI를 직접 공개하지 않습니다.

## 2. 처리 단계

```text
입력 app names / OCR text
 -> normalize
 -> exact package/name search
 -> vector similarity
 -> HIGH/MEDIUM/UNKNOWN
 -> evidence 확정
 -> LLM easy explanation
 -> parent guide
```

## 3. 판정과 생성의 분리

### 판정 단계

사용 가능:
- 정확 일치
- 제공 탐지 DB
- 팀이 검증한 similarity threshold
- 명시적 rule

### 생성 단계

LLM 사용:
- 전문 용어 쉬운 말
- 위험 이유 설명
- 지금 해야 할 행동 문구
- 부모용 안내문

LLM이 riskLevel을 새로 결정하거나 수정하면 안 됩니다.

## 4. UNKNOWN

다음은 UNKNOWN입니다.

- exact 없음
- similarity 기준 미달
- 근거 부족
- DB 미등록

UNKNOWN response는 설명 생성 단계에서도 `안전`으로 변환하지 못하게 합니다.

## 5. RAG 설정

다음은 환경/설정으로 분리:

- similarity threshold
- topK
- embedding model
- index name

이 하네스에서 임의 숫자를 최종 threshold로 정하지 않습니다. 실제 데이터/데모 샘플로 검증 후 팀이 확정합니다.

## 6. LLM 실패

LLM failure는 판정 failure와 구분합니다.

```text
판정 성공 + LLM 실패
 -> risk/evidence 유지
 -> template easy explanation/guide
```

전체 분석을 500으로 끝내기 전에 fallback을 고려합니다.

## 7. 응답 검증용 필수 필드

item:
- inputAppName
- normalizedAppName
- riskLevel
- matchType
- matchedRecordId when matched
- evidence

생성 필드:
- easyExplanation
- recommendedActions
- parentGuide
- generation method/model/prompt version

## 8. 로그 금지

- external API keys
- raw OAuth token
- 전체 screenshot binary
- 필요 이상 OCR 개인정보

AI log에도 requestId를 전달해 Spring log와 연결합니다.
