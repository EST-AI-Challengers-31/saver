import pandas as pd
from pathlib import Path

# ==================================================
# 0. 프로젝트 경로 설정
# ==================================================

# 현재 파일: HACKTHON/src/build_train_data.py
# 프로젝트 루트: HACKTHON/
BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"

DATA_DIR.mkdir(exist_ok=True)


# ==================================================
# 1. 전처리된 원본 로그 불러오기
# ==================================================

input_path = DATA_DIR / "alyac_cleaned_data.csv"

df = pd.read_csv(input_path)

print("=== 학습 데이터 구축 시작 ===")
print(f"입력 파일: {input_path}")
print(f"원본 데이터: {len(df):,}건")


# ==================================================
# 2. 학습에 필요한 컬럼 선택
# ==================================================

train_df = df[
    [
        "malware_name",
        "malware_package",
        "malware_category"
    ]
].copy()


# ==================================================
# 3. 입력값 결측 제거
# ==================================================

before_missing = len(train_df)

train_df = train_df.dropna(
    subset=[
        "malware_name",
        "malware_package",
        "malware_category"
    ]
)

after_missing = len(train_df)

print("\n=== 결측 처리 ===")
print(f"처리 전: {before_missing:,}건")
print(f"제거: {before_missing - after_missing:,}건")
print(f"처리 후: {after_missing:,}건")


# ==================================================
# 4. danger 라벨 확인 및 제외
# ==================================================

print("\n=== danger 제외 전 클래스 분포 ===")
print(train_df["malware_category"].value_counts())

danger_count = (
    train_df["malware_category"] == "danger"
).sum()

train_df = train_df[
    train_df["malware_category"] != "danger"
].copy()

print(f"\ndanger 제외: {danger_count:,}건")

print("\n=== danger 제외 후 클래스 분포 ===")
print(train_df["malware_category"].value_counts())


# ==================================================
# 5. 모델 입력용 text 컬럼 생성
# ==================================================

train_df["text"] = (
    train_df["malware_name"].astype(str)
    + " "
    + train_df["malware_package"].astype(str)
)

print("\n=== 학습 데이터 샘플 ===")

print(
    train_df[
        [
            "malware_name",
            "malware_package",
            "malware_category",
            "text"
        ]
    ].head()
)


# ==================================================
# 6. 최종 데이터 검증
# ==================================================

print("\n=== 최종 학습 데이터 검증 ===")

print(
    "결측치 개수:"
)

print(
    train_df[
        [
            "malware_name",
            "malware_package",
            "malware_category",
            "text"
        ]
    ].isna().sum()
)

print(
    f"\n클래스 수: "
    f"{train_df['malware_category'].nunique()}개"
)

print(
    f"고유 package 수: "
    f"{train_df['malware_package'].nunique():,}개"
)


# ==================================================
# 7. train_data.csv 저장
# ==================================================

output_path = DATA_DIR / "train_data.csv"

train_df.to_csv(
    output_path,
    index=False,
    encoding="utf-8-sig"
)

print("\n=== 학습 데이터 구축 완료 ===")
print(f"최종 학습 데이터: {len(train_df):,}건")
print(f"클래스 수: {train_df['malware_category'].nunique()}개")
print(f"저장 완료: {output_path}")