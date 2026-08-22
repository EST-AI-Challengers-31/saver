from __future__ import annotations

import json

import requests

from app.config import settings


class SpeechNotConfiguredError(RuntimeError):
    pass


def transcribe_audio(filename: str, content: bytes, content_type: str | None) -> str:
    if not settings.clova_speech_invoke_url or not settings.clova_speech_secret:
        raise SpeechNotConfiguredError(
            "CLOVA_SPEECH_INVOKE_URL과 CLOVA_SPEECH_SECRET 설정이 필요합니다."
        )

    endpoint = settings.clova_speech_invoke_url.rstrip("/") + "/recognizer/upload"
    params = {
        "language": "ko-KR",
        "completion": "sync",
        "callback": "",
        "fullText": True,
        "wordAlignment": False,
    }
    files = {
        "media": (filename or "voice-audio", content, content_type or "application/octet-stream"),
        "params": (None, json.dumps(params, ensure_ascii=False).encode("utf-8"), "application/json"),
    }
    response = requests.post(
        endpoint,
        headers={
            "Accept": "application/json;UTF-8",
            "X-CLOVASPEECH-API-KEY": settings.clova_speech_secret,
        },
        files=files,
        timeout=(5, 120),
    )
    response.raise_for_status()
    payload = response.json()

    text = str(payload.get("text") or "").strip()
    if not text:
        segments = payload.get("segments") or []
        text = " ".join(
            str(segment.get("text") or "").strip()
            for segment in segments
            if isinstance(segment, dict)
        ).strip()
    if not text:
        raise RuntimeError("음성에서 분석 가능한 텍스트를 추출하지 못했습니다.")
    return text
