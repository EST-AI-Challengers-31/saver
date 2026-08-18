import pandas as pd
from pathlib import Path

# ==================================================
# 0. 프로젝트 경로 설정
# ==================================================

# 현재 파일: HACKTHON/src/alyac_data_preprocessing.py
# 프로젝트 루트: HACKTHON/
BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"
RESULTS_DIR = BASE_DIR / "results"
MODELS_DIR = BASE_DIR / "models"

# 폴더가 없을 경우 자동 생성
DATA_DIR.mkdir(exist_ok=True)
RESULTS_DIR.mkdir(exist_ok=True)
MODELS_DIR.mkdir(exist_ok=True)


# ==================================================
# 1. 원본 데이터 불러오기
# ==================================================

df = pd.read_excel(
    DATA_DIR / "alyac_detection_data.xlsx",
    engine="openpyxl"
)


# ==================================================
# 2. 원본 구조 확인
# ==================================================

print("=== 원본 데이터 구조 ===")
print("원본 데이터 크기:", df.shape)
print("전체 행 수:", len(df))
print("전체 컬럼 수:", len(df.columns))

print("\n=== 전체 컬럼 목록 ===")
print(df.columns.tolist())


# ==================================================
# 3. 필요한 컬럼만 추출
# ==================================================

target_columns = [
    "malware_name",
    "malware_package",
    "malware_category",
    "user_action"
]

df_work = df[target_columns].copy()

print("\n=== 핵심 컬럼 데이터 크기 ===")
print(df_work.shape)

print("\n=== 앞 5개 데이터 ===")
print(df_work.head())


# ==================================================
# 4. 결측치 확인
# ==================================================

print("\n=== 컬럼별 결측치 개수 ===")
print(df_work.isnull().sum())

print("\n=== 컬럼별 결측치 비율(%) ===")
print((df_work.isnull().mean() * 100).round(2))


# ==================================================
# 5. 중복 데이터 확인
# ==================================================

print("\n=== 완전히 동일한 행 개수 ===")
print(df_work.duplicated().sum())

print("\n=== 패키지명 중복 개수 ===")
print(df_work["malware_package"].duplicated().sum())


# ==================================================
# 6. 악성코드 카테고리 종류 확인
# ==================================================

print("\n=== malware_category 종류 및 개수 ===")
print(df_work["malware_category"].value_counts())


# ==================================================
# 7. 사용자 행동 종류 확인
# ==================================================

print("\n=== user_action 종류 및 개수 ===")
print(df_work["user_action"].value_counts(dropna=False))


# ==================================================
# 8. 패키지 결측 데이터 확인
# ==================================================

print("\n=== malware_package가 없는 데이터 샘플 ===")

print(
    df_work[df_work["malware_package"].isna()]
    .head(10)
)


# ==================================================
# 9. 문자열 데이터 정제
# ==================================================

text_columns = [
    "malware_name",
    "malware_package",
    "malware_category",
    "user_action"
]

for col in text_columns:
    df_work[col] = df_work[col].astype("string").str.strip()


# 빈 문자열 → 결측치로 통일
df_work[text_columns] = df_work[text_columns].replace(
    r"^\s*$",
    pd.NA,
    regex=True
)


print("\n=== 문자열 정제 후 결측치 ===")
print(df_work.isna().sum())


print("\n=== 정제 후 malware_category 고유값 ===")
print(
    sorted(
        df_work["malware_category"]
        .dropna()
        .unique()
    )
)


print("\n=== 정제 후 user_action 고유값 ===")
print(
    sorted(
        df_work["user_action"]
        .dropna()
        .unique()
    )
)


# ==================================================
# danger 데이터 확인
# ==================================================

print("\n=== danger 카테고리 8건 확인 ===")

print(
    df_work[
        df_work["malware_category"] == "danger"
    ][
        [
            "malware_name",
            "malware_package",
            "malware_category",
            "user_action"
        ]
    ]
)


# ==================================================
# 10. 전처리 결과 요약
# ==================================================

print("\n========== 전처리 결과 요약 ==========")

print(f"원본 데이터: {len(df):,}건")
print(f"핵심 컬럼 데이터: {len(df_work):,}건")

print(
    f"malware_package 결측: "
    f"{df_work['malware_package'].isna().sum():,}건"
)

print(
    f"user_action 결측: "
    f"{df_work['user_action'].isna().sum():,}건"
)

print(
    f"완전 동일 행: "
    f"{df_work.duplicated().sum():,}건"
)

print(
    f"danger 라벨: "
    f"{(df_work['malware_category'] == 'danger').sum():,}건"
)


# ==================================================
# 11. 기본 정제 데이터 저장
# ==================================================

output_path = DATA_DIR / "alyac_cleaned_data.csv"

df_work.to_csv(
    output_path,
    index=False,
    encoding="utf-8-sig"
)

print(f"\n저장 완료: {output_path}")