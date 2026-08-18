import pandas as pd
from pathlib import Path

# ==================================================
# 0. 프로젝트 경로 설정
# ==================================================

# 현재 파일: HACKTHON/src/risk_judgement.py
# 프로젝트 루트: HACKTHON/
BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"

DATA_DIR.mkdir(exist_ok=True)


# ==================================================
# 1. 탐지 DB 불러오기
# ==================================================

input_path = DATA_DIR / "malware_db.csv"

malware_db = pd.read_csv(input_path)

print("=== 닿음 탐지 DB 테스트 ===")
print(f"입력 파일: {input_path}")
print(f"탐지 시그니처: {len(malware_db):,}건")
print(
    f"고유 Package: "
    f"{malware_db['malware_package'].nunique():,}개"
)


# ==================================================
# 2. Exact Match 함수
# ==================================================

def check_exact_match(package_name):

    # 입력값 정리
    package_name = str(package_name).strip()

    matched = malware_db[
        malware_db["malware_package"] == package_name
    ]

    # DB에 정확히 일치하는 Package가 존재하는 경우
    if not matched.empty:

        categories = (
            matched["malware_category"]
            .dropna()
            .unique()
            .tolist()
        )

        malware_names = (
            matched["malware_name"]
            .dropna()
            .unique()
            .tolist()
        )

        return {
            "risk_level": "HIGH",
            "matched": True,
            "package": package_name,
            "categories": categories,
            "malware_names": malware_names,
            "signature_count": len(matched)
        }

    # DB에 없는 경우
    # UNKNOWN은 안전이 아니라 "현재 DB에서 확인되지 않음"을 의미
    return {
        "risk_level": "UNKNOWN",
        "matched": False,
        "package": package_name,
        "categories": [],
        "malware_names": [],
        "signature_count": 0
    }


# ==================================================
# 3. 테스트 케이스
# ==================================================

test_packages = [

    # DB에 존재하는 Package
    "bin.mt.plus",

    # 복수 진단 이력이 존재하는 Package
    "com.qihoo.appstore",

    # DB에 존재하지 않는 테스트 Package
    "com.example.safeapp"
]


# ==================================================
# 4. Exact Match 테스트 실행
# ==================================================

print("\n=== Exact Match 테스트 ===")

for package in test_packages:

    result = check_exact_match(package)

    print("\n--------------------------------")
    print(f"Package: {result['package']}")
    print(f"Risk Level: {result['risk_level']}")
    print(f"Matched: {result['matched']}")
    print(f"Category: {result['categories']}")
    print(
        f"탐지 시그니처 수: "
        f"{result['signature_count']}"
    )

    if result["matched"]:
        print("Malware Name:")

        for malware_name in result["malware_names"]:
            print(f" - {malware_name}")


# ==================================================
# 5. 테스트 완료
# ==================================================

print("\n========== Exact Match 테스트 완료 ==========")