import os
import json
import time
import uuid

import requests
from dotenv import load_dotenv


# .env 불러오기
load_dotenv()

OCR_URL = os.getenv("CLOVA_OCR_URL")
OCR_SECRET = os.getenv("CLOVA_OCR_SECRET")

# 테스트할 이미지
IMAGE_PATH = "test.png"


# 환경변수 확인
if not OCR_URL:
    raise ValueError("CLOVA_OCR_URL이 설정되지 않았습니다.")

if not OCR_SECRET:
    raise ValueError("CLOVA_OCR_SECRET이 설정되지 않았습니다.")


# CLOVA OCR 요청 정보
message = {
    "version": "V2",
    "requestId": str(uuid.uuid4()),
    "timestamp": int(time.time() * 1000),
    "lang": "ko",
    "images": [
        {
            "format": "png",
            "name": "test"
        }
    ]
}

headers = {
    "X-OCR-SECRET": OCR_SECRET
}


# 이미지 전송
with open(IMAGE_PATH, "rb") as image_file:

    files = {
        "file": image_file
    }

    data = {
        "message": json.dumps(message)
    }

    response = requests.post(
        OCR_URL,
        headers=headers,
        files=files,
        data=data
    )


# 응답 확인
print("HTTP Status:", response.status_code)

if response.status_code != 200:
    print("OCR 요청 실패")
    print(response.text)
    exit()


result = response.json()


# OCR 결과 출력
print("\n=== OCR 인식 결과 ===")

for image in result.get("images", []):
    for field in image.get("fields", []):
        text = field.get("inferText")

        if text:
            print(text)