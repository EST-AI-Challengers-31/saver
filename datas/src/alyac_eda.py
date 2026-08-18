import pandas as pd
from pathlib import Path

import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt

# ==================================================
# 0. 프로젝트 경로 설정
# ==================================================

# 현재 파일: HACKTHON/src/alyac_eda.py
# 프로젝트 루트: HACKTHON/
BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"
RESULTS_DIR = BASE_DIR / "results"

DATA_DIR.mkdir(exist_ok=True)
RESULTS_DIR.mkdir(exist_ok=True)


# ==================================================
# 1. Matplotlib 한글 설정
# ==================================================

plt.rcParams["font.family"] = "Malgun Gothic"
plt.rcParams["axes.unicode_minus"] = False


# ==================================================
# 2. 전처리 완료 데이터 불러오기
# ==================================================

df = pd.read_csv(
    DATA_DIR / "alyac_cleaned_data.csv"
)

print("=== EDA 데이터 확인 ===")
print("전체 데이터:", len(df))
print(df.head())


# ==================================================
# 3. 악성코드 유형별 분포
# ==================================================

category_count = df["malware_category"].value_counts()

category_ratio = (
    df["malware_category"]
    .value_counts(normalize=True)
    .mul(100)
    .round(2)
)

category_result = pd.DataFrame({
    "건수": category_count,
    "비율(%)": category_ratio
})

print("\n=== 악성코드 유형별 분포 ===")
print(category_result)


# ==================================================
# 4. 사용자 행동별 분포
# ==================================================

action_count = df["user_action"].value_counts(
    dropna=False
)

action_ratio = (
    df["user_action"]
    .value_counts(
        dropna=False,
        normalize=True
    )
    .mul(100)
    .round(2)
)

action_result = pd.DataFrame({
    "건수": action_count,
    "비율(%)": action_ratio
})

print("\n=== 사용자 행동별 분포 ===")
print(action_result)


# ==================================================
# 5. malware_category × user_action 교차분석
# ==================================================

cross_table = pd.crosstab(
    df["malware_category"],
    df["user_action"],
    margins=True
)

print("\n=== 악성코드 유형 × 사용자 행동 ===")
print(cross_table)


cross_ratio = pd.crosstab(
    df["malware_category"],
    df["user_action"],
    normalize="index"
).mul(100).round(2)

print("\n=== 악성코드 유형별 사용자 행동 비율(%) ===")
print(cross_ratio)


# ==================================================
# 6. 그래프 1
# 악성코드 유형별 사용자 삭제 비율
# ==================================================

delete_ratio = (
    cross_ratio["delete"]
    .drop(
        labels=["danger"],
        errors="ignore"
    )
    .sort_values(ascending=False)
)

plt.figure(figsize=(10, 6))

bars = plt.bar(
    delete_ratio.index,
    delete_ratio.values
)

plt.title(
    "악성코드 유형별 사용자 삭제 비율",
    fontsize=16,
    fontweight="bold"
)

plt.xlabel("악성코드 유형")
plt.ylabel("삭제 비율 (%)")

plt.ylim(0, 100)

for bar, value in zip(
    bars,
    delete_ratio.values
):
    plt.text(
        bar.get_x() + bar.get_width() / 2,
        value + 1,
        f"{value:.1f}%",
        ha="center",
        fontsize=11
    )

plt.tight_layout()

plt.savefig(
    RESULTS_DIR / "malware_delete_rate.png",
    dpi=300,
    bbox_inches="tight"
)

plt.close()

print(
    "results/malware_delete_rate.png 저장 완료!"
)


# ==================================================
# 7. 그래프 2
# 악성코드 유형별 탐지 비율
# ==================================================

category_plot = (
    df[
        df["malware_category"] != "danger"
    ]["malware_category"]
    .value_counts()
)

category_percent = (
    category_plot
    / category_plot.sum()
    * 100
)

plt.figure(figsize=(10, 6))

bars = plt.bar(
    category_plot.index,
    category_percent.values
)

plt.title(
    "악성코드 유형별 탐지 비율",
    fontsize=16,
    fontweight="bold"
)

plt.xlabel("악성코드 유형")
plt.ylabel("전체 탐지 대비 비율 (%)")

plt.ylim(0, 70)

for bar, value in zip(
    bars,
    category_percent.values
):
    plt.text(
        bar.get_x() + bar.get_width() / 2,
        value + 1,
        f"{value:.1f}%",
        ha="center",
        fontsize=11
    )

plt.tight_layout()

plt.savefig(
    RESULTS_DIR / "malware_category_distribution.png",
    dpi=300,
    bbox_inches="tight"
)

plt.close()

print(
    "results/malware_category_distribution.png 저장 완료!"
)


# ==================================================
# 8. 그래프 3
# 탐지 이후 사용자 행동 분포
# ==================================================

action_plot = (
    df["user_action"]
    .value_counts()
    .sort_values(ascending=False)
)

action_percent = (
    action_plot
    / action_plot.sum()
    * 100
)

plt.figure(figsize=(11, 6))

bars = plt.bar(
    action_plot.index,
    action_percent.values
)

plt.title(
    "악성 앱 탐지 이후 사용자 행동 분포",
    fontsize=16,
    fontweight="bold"
)

plt.xlabel("사용자 행동")
plt.ylabel("전체 행동 대비 비율 (%)")

plt.ylim(0, 50)

for bar, value in zip(
    bars,
    action_percent.values
):
    plt.text(
        bar.get_x() + bar.get_width() / 2,
        value + 0.7,
        f"{value:.1f}%",
        ha="center",
        fontsize=10
    )

plt.xticks(rotation=15)

plt.tight_layout()

plt.savefig(
    RESULTS_DIR / "user_action_distribution.png",
    dpi=300,
    bbox_inches="tight"
)

plt.close()

print(
    "results/user_action_distribution.png 저장 완료!"
)


# ==================================================
# 9. EDA 완료
# ==================================================

print("\n========== EDA 완료 ==========")
print(
    f"입력 데이터: "
    f"{DATA_DIR / 'alyac_cleaned_data.csv'}"
)

print(
    f"그래프 저장 위치: "
    f"{RESULTS_DIR}"
)