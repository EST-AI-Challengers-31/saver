from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query

from app.config import settings
from app.db import dahum_db
from app.malware_service import malware_service
from app.schemas import AnalyzeRequest, AnalyzeResponse, ScanDetail, ScanSummary, TextAnalyzeRequest
from app.vector_service import vector_search


@asynccontextmanager
async def lifespan(_: FastAPI):
    malware_service.load()
    yield


app = FastAPI(
    title="Dahum AI",
    description="Exact Match HIGH -> Vector MEDIUM -> UNKNOWN",
    version="2.2.0-python-first",
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


# Spring Boot가 호출하는 표준 내부 AI API.
@app.post("/api/v1/analyze/packages", response_model=AnalyzeResponse)
def analyze_packages(request: AnalyzeRequest) -> AnalyzeResponse:
    return _make_response(
        request.packages,
        request.source_type or "PACKAGE",
        request.source_label or f"{len(request.packages)} apps",
    )


# Python만 단독 테스트할 때 사용하는 텍스트 분석 API.
@app.post("/api/v1/analyze/text", response_model=AnalyzeResponse)
def analyze_text(request: TextAnalyzeRequest) -> AnalyzeResponse:
    query = request.query.strip()
    return _make_response([query], "TEXT", query)


# 기존 팀 AI의 /analyze 계약을 보존한다.
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


@app.get("/api/scans", response_model=list[ScanSummary])
def scan_history(limit: int = Query(20, ge=1, le=100)):
    return dahum_db.list_scans(limit)


@app.get("/api/scans/{scan_id}", response_model=ScanDetail)
def scan_detail(scan_id: str):
    scan = dahum_db.get_scan(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="분석 이력을 찾을 수 없습니다.")
    return scan
