import pandas as pd
from pathlib import Path

# ==================================================
# 0. 프로젝트 경로 설정
# ==================================================

# 현재 파일: HACKTHON/src/prepare_embedding_data.py
# 프로젝트 루트: HACKTHON/
BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"

DATA_DIR.mkdir(exist_ok=True)


# ==================================================
# 1. 탐지 DB 불러오기
# ==================================================

input_path = DATA_DIR / "malware_db.csv"

df = pd.read_csv(input_path)

print("=== 임베딩 데이터 준비 ===")
print(f"입력 파일: {input_path}")
print(f"전체 탐지 시그니처: {len(df):,}건")


# ==================================================
# 2. 필수 컬럼 확인
# ==================================================

required_columns = [
    "malware_name",
    "malware_package",
    "malware_category"
]

missing_columns = [
    col
    for col in required_columns
    if col not in df.columns
]

if missing_columns:
    raise ValueError(
        f"필수 컬럼이 없습니다: {missing_columns}"
    )

print("\n필수 컬럼 확인 완료!")


# ==================================================
# 3. 임베딩용 검색 텍스트 생성
# ==================================================

df["search_text"] = (
    "malware_name: "
    + df["malware_name"].astype(str)
    + " | malware_package: "
    + df["malware_package"].astype(str)
    + " | malware_category: "
    + df["malware_category"].astype(str)
)


# ==================================================
# 4. 고유 ID 생성
# ==================================================

df.insert(
    0,
    "record_id",
    [
        "malware_" + str(i).zfill(5)
        for i in range(len(df))
    ]
)


# ==================================================
# 5. 필요한 컬럼만 정리
# ==================================================

embedding_df = df[
    [
        "record_id",
        "malware_name",
        "malware_package",
        "malware_category",
        "search_text"
    ]
].copy()


# ==================================================
# 6. 임베딩 데이터 검증
# ==================================================

print("\n=== 임베딩 데이터 샘플 ===")
print(embedding_df.head())

print("\n=== 결측치 확인 ===")
print(embedding_df.isna().sum())

print(
    f"\n고유 record_id 수: "
    f"{embedding_df['record_id'].nunique():,}개"
)

print(
    f"고유 package 수: "
    f"{embedding_df['malware_package'].nunique():,}개"
)


# ==================================================
# 7. CSV 저장
# ==================================================

output_path = DATA_DIR / "malware_embedding_data.csv"

embedding_df.to_csv(
    output_path,
    index=False,
    encoding="utf-8-sig"
)

print("\n=== 임베딩 데이터 생성 완료 ===")
print(f"최종 데이터: {len(embedding_df):,}건")
print(f"저장 완료: {output_path}")