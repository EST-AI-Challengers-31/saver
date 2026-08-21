from __future__ import annotations

import json
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

AI_BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
BACKEND_BASE = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:8080"


def read_json(url: str, timeout: int = 10):
    with urlopen(url, timeout=timeout) as response:
        return json.load(response)


def wait_json(url: str, seconds: int = 90):
    deadline = time.time() + seconds
    last_error: Exception | None = None
    while time.time() < deadline:
        try:
            return read_json(url, timeout=5)
        except (HTTPError, URLError, TimeoutError, ConnectionError) as exc:
            last_error = exc
            time.sleep(2)
    raise RuntimeError(f"서비스 준비 시간 초과: {url} / 마지막 오류: {last_error}")


def post_json(url: str, payload: dict) -> dict:
    request = Request(url, data=json.dumps(payload, ensure_ascii=False).encode("utf-8"), headers={"Content-Type": "application/json; charset=utf-8"}, method="POST")
    with urlopen(request, timeout=30) as response:
        return json.load(response)


print("[0] 서비스 준비 대기")
health = wait_json(f"{AI_BASE}/health")
backend_health = wait_json(f"{BACKEND_BASE}/actuator/health")
assert health.get("status") == "UP", health

print("[1] Spring -> Python direct text contract")
for query, risk, match in [
    ("bin.mt.plus", "HIGH", "EXACT"),
    ("bin.mt.plus2", "MEDIUM", "VECTOR"),
    ("io.dahum.unknown.qzxv987654321", "UNKNOWN", "NONE"),
]:
    result = post_json(f"{BACKEND_BASE}/api/analyze/text", {"query": query})
    top = result["results"][0]
    print(query, top["risk_level"], top["match_type"], top.get("similarity_score"))
    assert top["risk_level"] == risk
    assert top["match_type"] == match
    assert top.get("is_verified_safe") is False

print("[2] History through Spring")
history = read_json(f"{BACKEND_BASE}/api/scans?limit=5")
assert isinstance(history, list)
print("[PASS] HIGH / MEDIUM / UNKNOWN + history")
