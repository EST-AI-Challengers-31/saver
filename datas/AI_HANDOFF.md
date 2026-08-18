# 닿음 - AI 연동 데이터 인수인계

## 1. 현재 작업 상태

알약 모바일 탐지 로그 10,000건 기준으로 아래 작업까지 완료했습니다.

- 데이터 전처리 및 EDA
- 악성 앱 탐지 DB 구축
- 악성코드 유형 분류 모델 실험
- AI 임베딩용 데이터 생성
- Package Exact Match 위험 판정 구현

AI 연동에 필요한 핵심 데이터는 아래 2개입니다.

### 1.1 `data/malware_db.csv`

기존 탐지 이력이 있는 Package를 Exact Match하기 위한 DB입니다.

- 컬럼
    - `malware_name`
    - `malware_package`
    - `malware_category`

 - 현재 기준
    - 탐지 시그니처: 2,639건
    - 고유 Package: 2,522개

### 1.2 `data/malware_embedding_data.csv`

Vector DB에 넣기 위해 정리한 데이터입니다.

- 컬럼
    - `record_id`
    - `malware_name`
    - `malware_package`
    - `malware_category`
    - `search_text`

- `search_text` 예시

    - malware_name: Android.Riskware.Agent.gXZCND
    - malware_package: bin.mt.plus
    - malware_category: Riskware

AI 파트에서는 `search_text`를 임베딩한 뒤 Vector DB에 저장해서
미등록 앱의 유사도 검색에 사용하면 됩니다.


---

## 2. 위험 판정 기준

위험도는 `HIGH / MEDIUM / UNKNOWN` 3단계로 구분합니다.

### 2.1 HIGH
Package가 `malware_db.csv`와 정확히 일치하는 경우입니다.

예)
`bin.mt.plus` → `HIGH`

기존 탐지 이력이 확인된 앱이므로 별도의 유사도 검색 없이 HIGH로 처리합니다.

### 2.2 MEDIUM
Exact Match는 없지만 Vector DB 검색 결과가 설정한 유사도 임계값 이상인 경우입니다.
기존 악성 앱과 유사한 특징이 있으므로 추가 확인이 필요한 상태로 처리합니다.

※ 유사도 임계값은 AI 파트와 통합 테스트 후 결정합니다.

### 2.3 UNKNOWN
Exact Match가 없고 Vector DB에서도 임계값 이상의 결과가 나오지 않는 경우입니다.
**UNKNOWN은 SAFE가 아닙니다.**

현재 데이터가 제한된 기간의 탐지 로그이기 때문에
DB에 없다는 이유만으로 정상 앱이라고 판단하지 않습니다.


---

## 3. 연동 흐름

전체 흐름은 아래와 같습니다.

**사용자 기기 앱 정보**  
→ Package 추출  
→ `malware_db.csv` Exact Match  
→ 일치하면 `HIGH`  
→ 일치하지 않으면 Vector DB 유사도 검색  
→ 임계값 이상이면 `MEDIUM`  
→ 임계값 미만이면 `UNKNOWN`


---

## 4. Exact Match 구현

구현 파일:
`src/risk_judgement.py`

**현재 테스트 결과**
- `bin.mt.plus` → HIGH / Matched=True
- `com.qihoo.appstore` → HIGH / Matched=True
- `com.example.safeapp` → UNKNOWN / Matched=False

Exact Match 로직은 현재 정상 동작합니다.
또한 동일 Package에서 여러 탐지 결과가 나온 경우 하나의 Category로 강제 통합하지 않았습니다.

예)
`bin.mt.plus`
- Riskware
- Trojan

따라서 Exact Match 결과에서 해당 Package의 여러 `malware_name`과
`malware_category`를 함께 반환합니다.

이 정보는 이후 LLM이 사용자에게 위험 원인을 설명할 때도 활용할 수 있습니다.


---

## 5. ML 분류 실험

악성 앱 유형 분류 가능성을 확인하기 위해
TF-IDF + Logistic Regression 모델을 실험했습니다.

**입력**:
`malware_package`

**출력**:
`malware_category`

**분류 대상**
- Riskware
- Trojan
- Adware
- Monitor
- Spyware
- Misc

동일 Package가 Train/Test 양쪽에 포함되는 문제를 막기 위해
최종 평가는 Package 기준 Group Split으로 진행했습니다.

**결과**
- Accuracy: 0.8683
- Macro F1: 0.5041

데이터의 클래스 불균형이 크기 때문에 Accuracy뿐 아니라
Macro F1과 클래스별 Precision/Recall/F1을 함께 확인했습니다.

이 모델은 HIGH/MEDIUM/UNKNOWN을 직접 결정하는 모델은 아닙니다.

실제 위험 판정은 `Exact Match + Vector Similarity`를 사용하고,
분류 모델은 미등록 Package에 대한 악성코드 유형 분류 가능성을
검증하기 위한 실험으로 사용합니다.

최종 Group Split 모델:
`models/malware_classifier.joblib`


---

## 6. AI 파트 연동 작업

AI 파트에서는 아래 순서로 연결하면 됩니다.

1. `data/malware_embedding_data.csv` 로드
2. `search_text` 임베딩
3. Pinecone 등 Vector DB 저장
4. Exact Match되지 않은 앱 검색
5. Similarity Score 반환
6. 임계값 이상 → MEDIUM
7. 검색된 악성코드 정보를 LLM에 전달
8. 사용자용 위험 설명 생성


---

## 7. Backend 반환 형식

형식은 통합 과정에서 조정하면 되고, 현재 권장 형태는 아래와 같습니다.

### 7.1 HIGH

{
    "risk_level": "HIGH",
    "matched": true,
    "package": "bin.mt.plus",
    "categories": ["Riskware", "Trojan"]
}

### 7.2 MEDIUM

{
    "risk_level": "MEDIUM",
    "matched": false,
    "similarity_score": 0.87,
    "matched_malware": "Android.Riskware.Agent",
    "malware_category": "Riskware",
    "reason": "기존 Riskware 탐지 사례와 높은 유사도를 보입니다."
}

### 7.3 UNKNOWN

{
    "risk_level": "UNKNOWN",
    "matched": false,
    "similarity_score": 0.31
}


---

## 8. 통합할 때 같이 정할 부분

- Vector Similarity 임계값
- MEDIUM 판정 기준
- Vector DB 검색 Top-K
- AI API 요청/응답 JSON 형식
- 복수 Category 반환 방식
- LLM 위험 설명 Prompt
- UNKNOWN 사용자 안내 문구


---

## 9. 파일 위치

### data/
- `alyac_detection_data.xlsx` : 원본
- `alyac_cleaned_data.csv` : 전처리 데이터
- `malware_db.csv` : Exact Match 탐지 DB
- `malware_embedding_data.csv` : Vector DB 입력 데이터
- `train_data.csv` : ML 학습 데이터

### models/
- `malware_classifier.joblib` : Group Split 기준 분류 모델

### results/
- `classification_report.csv`
- `model_metrics.csv`
- `model_predictions.csv`
- `confusion_matrix.png`
- `malware_category_distribution.png`
- `malware_delete_rate.png`
- `user_action_distribution.png`

### src/
- `alyac_data_preprocessing.py`
- `alyac_eda.py`
- `build_malware_db.py`
- `build_train_data.py`
- `prepare_embedding_data.py`
- `risk_judgement.py`
- `train_malware_classifier.py`
- `train_malware_classifier_package.py`
- `train_malware_classifier_group.py`


---

## 10. 정리

위험 판정 기준은 아래와 같습니다.

**HIGH**
→ 기존 탐지 DB에서 정확히 확인된 Package

**MEDIUM**
→ DB에는 없지만 기존 악성 앱과 높은 유사도를 보이는 Package

**UNKNOWN**
→ 현재 데이터만으로 판단할 근거가 부족한 Package

`UNKNOWN = SAFE`로 처리하지 않습니다.

현재 데이터 파트에서는 Exact Match와 임베딩용 데이터 준비까지 완료된 상태이며,
AI 파트에서 Vector DB 및 LLM을 연결한 뒤 유사도 임계값과 API 형식만 함께 맞추면 됩니다.