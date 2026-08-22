from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile

from app.config import settings
from app.db import dahum_db
from app.fraud_db import fraud_db
from app.fraud_service import fraud_analyzer
from app.malware_service import malware_service
from app.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    FraudAnalyzeResponse,
    FraudTextRequest,
    ScanDetail,
    ScanSummary,
    TextAnalyzeRequest,
)
from app.speech_service import SpeechNotConfiguredError, transcribe_audio
from app.vector_service import vector_search


@asynccontextmanager
async def lifespan(_: FastAPI):
    malware_service.load()
    fraud_db.ensure_schema()
    yield


app = FastAPI(
    title="Dahum AI",
    description="Exact Match HIGH -> Vector MEDIUM -> UNKNOWN + fraud signal analysis",
    version="3.0.0-family-security",
    lifespan=lifespan,
)


@app.get("/health")
def health() -> dict:
    return {
        "status": "UP" if malware_service.ready else "STARTING",
        "python_first": True,
        "db_configured": dahum_db.enabled,
        "vector_provider": vector_search.provider_name,
        "threshold": settings.similarity_threshold,
        "top_k": settings.top_k,
    }


@app.get("/api/v1/meta")
def metadata() -> dict:
    return {
        "policy": "EXACT_HIGH__VECTOR_MEDIUM__ELSE_UNKNOWN",
        "unknown_means_safe": False,
        "vector_provider": vector_search.provider_name,
        "pinecone_configured": bool(settings.pinecone_api_key),
        "upstage_configured": bool(settings.upstage_api_key),
        "llm_configured": bool(settings.llm_api_key and settings.llm_api_base_url),
        "clova_speech_configured": bool(
            settings.clova_speech_invoke_url and settings.clova_speech_secret
        ),
        "safe_browsing_configured": bool(settings.safe_browsing_api_key),
    }


def _make_response(queries: list[str], source_type: str, source_label: str | None) -> AnalyzeResponse:
    if not malware_service.ready:
        raise HTTPException(status_code=503, detail="AI 데이터가 아직 준비되지 않았습니다.")
    results = [malware_service.analyze(query) for query in queries]
    scan_id = dahum_db.save_scan(source_type, source_label, [result.model_dump() for result in results])
    return AnalyzeResponse(
        scan_id=scan_id,
        results=results,
        similarity_threshold=settings.similarity_threshold,
        vector_provider=vector_search.provider_name,
    )


@app.post("/api/v1/analyze/packages", response_model=AnalyzeResponse)
def analyze_packages(request: AnalyzeRequest) -> AnalyzeResponse:
    return _make_response(
        request.packages,
        request.source_type or "PACKAGE",
        request.source_label or f"{len(request.packages)} apps",
    )


@app.post("/api/v1/analyze/text", response_model=AnalyzeResponse)
def analyze_text(request: TextAnalyzeRequest) -> AnalyzeResponse:
    query = request.query.strip()
    return _make_response([query], "TEXT", query)


@app.post("/analyze")
def legacy_analyze(request: AnalyzeRequest) -> dict:
    response = _make_response(
        request.packages,
        request.source_type or "LEGACY_PACKAGE",
        request.source_label or f"{len(request.packages)} apps",
    )
    legacy_results: list[dict] = []
    for result in response.results:
        item = result.model_dump()
        item["패키지명"] = item["package_name"]
        legacy_results.append(item)
    return {
        "scan_id": response.scan_id,
        "results": legacy_results,
        "policy": response.policy,
        "similarity_threshold": response.similarity_threshold,
        "vector_provider": response.vector_provider,
    }


@app.post("/api/v1/fraud/analyze", response_model=FraudAnalyzeResponse)
def analyze_fraud_text(request: FraudTextRequest) -> FraudAnalyzeResponse:
    result = fraud_analyzer.analyze(request.analysis_type, request.text)
    analysis_id = fraud_db.save(
        request.requester_user_id,
        request.analysis_type,
        "TEXT",
        request.text,
        result.model_dump(),
    )
    return result.model_copy(update={"analysis_id": analysis_id})


@app.post("/api/v1/fraud/voice/audio", response_model=FraudAnalyzeResponse)
async def analyze_voice_audio(
    media: UploadFile = File(...),
    requester_user_id: str | None = Form(default=None),
) -> FraudAnalyzeResponse:
    limit = max(1, settings.fraud_max_audio_mb) * 1024 * 1024
    content = await media.read(limit + 1)
    if not content:
        raise HTTPException(status_code=400, detail="음성 파일이 비어 있습니다.")
    if len(content) > limit:
        raise HTTPException(
            status_code=413,
            detail=f"음성 파일은 {settings.fraud_max_audio_mb}MB 이하만 업로드할 수 있습니다.",
        )

    try:
        transcript = transcribe_audio(
            media.filename or "voice-audio",
            content,
            media.content_type,
        )
    except SpeechNotConfiguredError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="음성 인식에 실패했습니다.") from exc

    result = fraud_analyzer.analyze("VOICE_PHISHING", transcript)
    analysis_id = fraud_db.save(
        requester_user_id,
        "VOICE_PHISHING",
        "AUDIO",
        transcript,
        result.model_dump(),
    )
    return result.model_copy(update={
        "analysis_id": analysis_id,
        "transcript": transcript,
    })


@app.get("/api/scans", response_model=list[ScanSummary])
def scan_history(limit: int = Query(20, ge=1, le=100)):
    return dahum_db.list_scans(limit)


@app.get("/api/scans/{scan_id}", response_model=ScanDetail)
def scan_detail(scan_id: str):
    scan = dahum_db.get_scan(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="분석 이력을 찾을 수 없습니다.")
    return scan
