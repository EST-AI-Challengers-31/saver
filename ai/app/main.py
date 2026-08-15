from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Dahum AI", version="0.1.0")


class AnalyzeRequest(BaseModel):
    app_name: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "UP", "service": "dahum-ai"}


@app.post("/analyze")
def analyze(request: AnalyzeRequest) -> dict[str, str]:
    return {
        "app_name": request.app_name,
        "status": "PLACEHOLDER",
        "message": "현재 배포 확인 단계입니다. 실제 OCR/RAG/LLM 판정은 다음 구현 단계에서 연결합니다.",
    }
