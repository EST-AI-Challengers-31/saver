from __future__ import annotations

import json
from typing import Any

import requests

from app.config import settings

TEMPLATES = {
    "HIGH": {
        "child": "기존 위험 탐지 데이터에 같은 패키지 또는 진단명이 기록되어 있어요. 현재 설치본의 상태를 추가 확인할 때까지 앱 실행과 개인정보 입력을 멈추고 부모님과 함께 확인해 주세요.",
        "parent": "부모님, 기존 위험 탐지 데이터에 같은 패키지 또는 진단명이 기록된 앱이 확인됐어요. 현재 설치본의 상태를 추가 확인할 때까지 앱 실행과 비밀번호·계좌정보 입력을 멈춰 주세요.",
    },
    "MEDIUM": {
        "child": "등록된 악성 앱과 유사한 특징이 확인됐어요. 아직 악성 앱으로 확정된 것은 아니므로 사용을 잠시 멈추고 출처를 확인해 주세요.",
        "parent": "부모님, 알려진 위험 앱과 비슷한 특징이 있는 앱이 있어요. 확정 판정은 아니므로 확인이 끝날 때까지 사용과 개인정보 입력을 잠시 멈춰 주세요.",
    },
    "UNKNOWN": {
        "child": "현재 데이터만으로는 이 앱을 위험하거나 안전하다고 확정하기 어려워요. 출처를 확인하기 전에는 민감한 정보를 입력하지 않는 것이 좋아요.",
        "parent": "부모님, 지금 가진 정보만으로는 이 앱이 위험한지 안전한지 확정하기 어려워요. 설치한 기억이 없거나 출처가 낯설다면 자녀와 함께 확인해 주세요.",
    },
}


def action_steps(risk_level: str) -> list[str]:
    if risk_level == "HIGH":
        return [
            "앱을 실행하지 않습니다.",
            "비밀번호·인증번호·계좌정보를 입력하지 않습니다.",
            "설정 → 앱에서 해당 앱 정보를 확인합니다.",
            "이미 민감정보를 입력했다면 비밀번호 변경과 금융기관 확인을 검토합니다.",
        ]
    if risk_level == "MEDIUM":
        return [
            "확인이 끝날 때까지 앱 사용을 잠시 멈춥니다.",
            "공식 스토어 설치 여부와 개발자 정보를 확인합니다.",
            "문자·연락처·접근성 등 과도한 권한 요청 여부를 확인합니다.",
            "가족과 함께 확인한 뒤 유지 또는 삭제를 결정합니다.",
        ]
    return [
        "UNKNOWN은 안전 판정이 아니라 근거 부족 상태입니다.",
        "앱의 출처와 설치 경위를 확인합니다.",
        "확인 전에는 중요한 개인정보 입력을 피합니다.",
        "의심이 계속되면 공식 고객센터나 보안 도구로 추가 확인합니다.",
    ]


def _prompt(risk_level: str, evidence: list[dict[str, Any]]) -> str:
    compact = [
        {
            "name": item.get("malware_name"),
            "category": item.get("malware_category"),
            "score": round(float(item.get("score", 0.0)), 3),
        }
        for item in evidence[:3]
    ]
    return (
        "가족 보안 서비스 닿음의 쉬운 안내문을 작성하세요. "
        "HIGH는 기존 위험 탐지 데이터와 Exact Match된 고위험 경고이며, "
        "Package ID만으로 현재 설치 바이너리 자체가 100% 악성이라고 단정하지 마세요. "
        "MEDIUM은 유사 사례, UNKNOWN은 SAFE가 아닌 근거 부족입니다. "
        "공포를 과장하지 말고 행동을 명확히 안내하세요. JSON만 반환하세요.\n"
        f"risk_level={risk_level}\n"
        f"evidence={json.dumps(compact, ensure_ascii=False)}\n"
        '{"child_message":"...","parent_message":"..."}'
    )


def generate_explanation(risk_level: str, evidence: list[dict[str, Any]]) -> dict[str, str]:
    fallback = TEMPLATES.get(risk_level, TEMPLATES["UNKNOWN"])
    if not (settings.llm_api_key and settings.llm_api_base_url):
        return {
            "child_message": fallback["child"],
            "parent_message": fallback["parent"],
            "generation_method": "TEMPLATE",
        }

    try:
        response = requests.post(
            settings.llm_api_base_url,
            headers={
                "Authorization": f"Bearer {settings.llm_api_key}",
                "Content-Type": "application/json",
            },
            json={"prompt": _prompt(risk_level, evidence)},
            timeout=20,
        )
        response.raise_for_status()
        payload = response.json()
        raw = payload.get("answer") or payload.get("content") or payload.get("text") or payload
        if isinstance(raw, str):
            raw = raw.strip().removeprefix("```json").removesuffix("```").strip()
            parsed = json.loads(raw)
        elif isinstance(raw, dict):
            parsed = raw
        else:
            parsed = {}
        child = str(parsed.get("child_message", "")).strip()
        parent = str(parsed.get("parent_message", "")).strip()
        if child and parent:
            return {
                "child_message": child,
                "parent_message": parent,
                "generation_method": "LLM",
            }
    except Exception as exc:
        print(f"[AI] LLM 호출 실패, 템플릿 fallback 사용: {exc}")

    return {
        "child_message": fallback["child"],
        "parent_message": fallback["parent"],
        "generation_method": "TEMPLATE",
    }
