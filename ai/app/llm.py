import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

ALAN_API_URL = "https://kdt-api-function.azurewebsites.net/api/v1/question"
ALAN_CLIENT_ID = os.environ["ALAN_CLIENT_ID"]

# risk_level(HIGH/MEDIUM/UNKNOWN) -> 사용자에게 보여줄 3단계 라벨
RISK_LABEL_MAP = {
    "HIGH": "위험",
    "MEDIUM": "확인필요",
    "UNKNOWN": "판단보류",
}

# 참고용 예시 (few-shot). 실제 톤/형식을 LLM에게 정확히 맞춰주기 위한 기준 문구.
REFERENCE_EXAMPLES = {
    "위험": {
        "child": "위험이 확인된 앱이에요 : 현재 확인된 보안 정보와 일치하는 위험 앱입니다. 지금은 앱을 열지 말고, 개인정보를 입력하지 않는 것을 권고합니다.",
        "parent": "부모님, 위험한 앱이 확인됐어요.\n지금은 이 앱을 열지 마시고, 비밀번호나 계좌정보 같은 개인정보도 입력하지 마세요.\n앱은 그대로 두고 자녀와 함께 확인한 뒤 삭제하는 것이 좋을 것 같아요.",
    },
    "확인필요": {
        "child": "주의가 필요한 앱이에요 : 알려진 위험 앱과 유사한 정보가 확인됐지만, 현재 정보만으로 위험을 확정하기는 어렵습니다. 확인이 끝날 때까지 사용을 잠시 멈추고, 가족과 함께 설치 경위와 앱 정보를 확인해 주세요.",
        "parent": "부모님, 주의해서 확인해야 할 앱이 있어요.\n아직 위험한 앱이라고 확정된 것은 아니니 너무 걱정하지 않으셔도 돼요.\n다만 확인이 끝날 때까지는 앱을 사용하거나 개인정보를 입력하지 마시고, 자녀와 함께 확인해 주세요.",
    },
    "판단보류": {
        "child": "추가 확인이 필요한 앱이에요 : 현재 닿음이 보유한 탐지 정보만으로는 이 앱을 위험하거나 안전하다고 확정하기 어렵습니다. 확인이 끝날 때까지 앱을 실행하거나 개인정보를 입력하지 마세요. 최근 직접 설치한 앱인지 가족과 함께 확인한 뒤, 출처가 기억나지 않거나 의심스럽다면 삭제 여부를 검토해 주세요.",
        "parent": "부모님, 지금 정보만으로는 위험한 앱인지 안전한 앱인지 판단하기 어려워요.\n당장 삭제하실 필요는 없어요. 다만 설치한 기억이 없거나 낯선 앱이라면 사용을 잠시 멈추고 자녀와 함께 확인해 주세요.",
    },
}


def _build_prompt(label: str, matched_examples: list) -> str:
    if matched_examples:
        info_lines = "\n".join(
            f"- {m['malware_name']} ({m['malware_category']}), 유사도 {m['score']:.2f}"
            for m in matched_examples[:3]
        )
        matched_info = f"참고로 아래와 같은 유사 위협 정보가 발견되었습니다:\n{info_lines}"
    else:
        matched_info = "참고할 유사 위협 정보가 없습니다."

    ref = REFERENCE_EXAMPLES[label]

    return f"""당신은 고령층 부모와 그 자녀가 함께 쓰는 스마트폰 보안 서비스 '닿음'의 안내 메시지 작성자입니다.
지금 판정된 위험 단계는 "{label}"입니다.

{matched_info}

아래 두 가지 메시지를 작성하세요.

1. child_message: 자녀(보호자)가 볼 메시지. 간결하고 명확한 설명체.
   참고 예시(반드시 이 톤과 형식을 따르되, 위 위협 정보가 있으면 자연스럽게 반영):
   "{ref['child']}"

2. parent_message: 부모님이 직접 볼 메시지. "부모님,"으로 시작하는 다정하고 쉬운 구어체.
   불안을 조장하지 말고, 무엇을 하면 되는지 행동 지침을 명확히 안내.
   참고 예시:
   "{ref['parent']}"

반드시 아래 JSON 형식으로만 답변하세요. 다른 설명이나 마크다운 없이 JSON만 출력하세요.
{{"child_message": "...", "parent_message": "..."}}
"""


def generate_explanation(risk_level: str, matched_examples: list) -> dict:
    
    label = RISK_LABEL_MAP.get(risk_level, "판단보류")
    prompt = _build_prompt(label, matched_examples)

    response = requests.get(
        ALAN_API_URL,
        params={"content": prompt, "client_id": ALAN_CLIENT_ID},
        timeout=120,
    )
    response.raise_for_status()
    data = response.json()
    
    raw_text = data["answer"] 

    try:
        parsed = json.loads(raw_text)
        return {
            "child_message": parsed["child_message"],
            "parent_message": parsed["parent_message"],
        }
    except (json.JSONDecodeError, KeyError):
        # LLM이 JSON 형식을 안 지켰을 때의 폴백: 참고 예시 텍스트 그대로 반환
        ref = REFERENCE_EXAMPLES[label]
        return {"child_message": ref["child"], "parent_message": ref["parent"]}