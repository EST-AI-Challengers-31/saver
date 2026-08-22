from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import AliasChoices, BaseModel, Field, field_validator

RiskLevel = Literal["HIGH", "MEDIUM", "UNKNOWN"]
MatchType = Literal["EXACT", "VECTOR", "NONE"]
ExactField = Literal["PACKAGE", "MALWARE_NAME"]
ExplanationMethod = Literal["LLM", "TEMPLATE"]
FraudAnalysisType = Literal["SMISHING", "VOICE_PHISHING", "FINANCIAL_FRAUD"]


class AnalyzeRequest(BaseModel):
    packages: list[str] = Field(
        default_factory=list,
        validation_alias=AliasChoices("packages", "package_names", "패키지명"),
    )
    source_type: str = "PACKAGE"
    source_label: str | None = None

    @field_validator("packages")
    @classmethod
    def normalize_packages(cls, values: list[str]) -> list[str]:
        unique: list[str] = []
        seen: set[str] = set()
        for value in values:
            query = (value or "").strip()
            if not query:
                continue
            key = query.casefold()
            if key not in seen:
                seen.add(key)
                unique.append(query)
        if not unique:
            raise ValueError("분석할 앱 정보가 1개 이상 필요합니다.")
        return unique[:100]


class TextAnalyzeRequest(BaseModel):
    query: str = Field(min_length=1, max_length=300)


class MatchedExample(BaseModel):
    malware_name: str
    malware_package: str
    malware_category: str
    score: float


class AppResult(BaseModel):
    package_name: str
    display_query: str | None = None
    risk_level: RiskLevel
    match_type: MatchType
    exact_field: ExactField | None = None
    matched: bool
    similarity_score: float | None = None
    malware_names: list[str] = Field(default_factory=list)
    malware_categories: list[str] = Field(default_factory=list)
    matched_examples: list[MatchedExample] = Field(default_factory=list)
    evidence_summary: str
    child_message: str
    parent_message: str
    recommended_actions: list[str] = Field(default_factory=list)
    explanation_method: ExplanationMethod = "TEMPLATE"
    is_verified_safe: bool = False


class AnalyzeResponse(BaseModel):
    scan_id: str | None = None
    results: list[AppResult]
    policy: str = "EXACT_HIGH__VECTOR_MEDIUM__ELSE_UNKNOWN"
    similarity_threshold: float
    vector_provider: str


class ScanSummary(BaseModel):
    id: str
    source_type: str
    source_label: str | None = None
    highest_risk_level: RiskLevel
    result_count: int
    created_at: datetime | str


class ScanDetail(BaseModel):
    id: str
    source_type: str
    source_label: str | None = None
    highest_risk_level: RiskLevel
    created_at: datetime | str
    results: list[AppResult] = Field(default_factory=list)


class FraudTextRequest(BaseModel):
    analysis_type: FraudAnalysisType
    text: str = Field(min_length=1, max_length=20_000)
    requester_user_id: str | None = Field(default=None, max_length=36)


class FraudIndicator(BaseModel):
    code: str
    category: str
    evidence: str
    weight: float


class FraudAnalyzeResponse(BaseModel):
    analysis_id: str | None = None
    analysis_type: FraudAnalysisType
    risk_level: RiskLevel
    risk_score: float
    indicators: list[FraudIndicator] = Field(default_factory=list)
    urls: list[str] = Field(default_factory=list)
    transcript: str | None = None
    child_message: str
    parent_message: str
    recommended_actions: list[str] = Field(default_factory=list)
    external_checks: dict[str, Any] = Field(default_factory=dict)
