from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

_PLACEHOLDERS = {
    "",
    "CHANGE_ME",
    "NOT_CONFIGURED_YET",
    "LLMAPIKEY",
    "SPRINGDATASOURCEPASSWORD",
    "MARIADBROOTPASSWORD",
}


def env_value(name: str, default: str = "") -> str:
    value = os.getenv(name, default).strip()
    return "" if value in _PLACEHOLDERS else value


def env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


def env_float(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


@dataclass(frozen=True)
class Settings:
    api_host: str = os.getenv("AI_HOST", "0.0.0.0")
    api_port: int = env_int("AI_PORT", 8000)

    mariadb_host: str = os.getenv("MARIADB_HOST", "mariadb")
    mariadb_port: int = env_int("MARIADB_PORT", 3306)
    mariadb_database: str = os.getenv("MARIADB_DATABASE", "dahum")
    mariadb_user: str = os.getenv("MARIADB_USER", "dahum_app")
    mariadb_password: str = env_value("MARIADB_PASSWORD")

    llm_api_key: str = env_value("LLM_API_KEY")
    llm_api_base_url: str = env_value("LLM_API_BASE_URL")
    alan_client_id: str = env_value("ALAN_CLIENT_ID")

    vector_provider: str = os.getenv("VECTOR_PROVIDER", "local").strip().lower()
    pinecone_api_key: str = env_value("PINECONE_API_KEY")
    pinecone_index: str = env_value("PINECONE_INDEX", "dahum-malware") or "dahum-malware"
    upstage_api_key: str = env_value("UPSTAGE_API_KEY")
    similarity_threshold: float = env_float("RAG_SIMILARITY_THRESHOLD", 0.80)
    top_k: int = env_int("RAG_TOP_K", 5)

    clova_speech_invoke_url: str = env_value("CLOVA_SPEECH_INVOKE_URL")
    clova_speech_secret: str = env_value("CLOVA_SPEECH_SECRET")
    safe_browsing_api_key: str = env_value("GOOGLE_SAFE_BROWSING_API_KEY")
    safe_browsing_url: str = env_value(
        "SAFE_BROWSING_URL",
        "https://safebrowsing.googleapis.com/v4/threatMatches:find",
    ) or "https://safebrowsing.googleapis.com/v4/threatMatches:find"
    fraud_high_threshold: float = env_float("FRAUD_HIGH_THRESHOLD", 0.65)
    fraud_medium_threshold: float = env_float("FRAUD_MEDIUM_THRESHOLD", 0.30)
    fraud_max_audio_mb: int = env_int("FRAUD_MAX_AUDIO_MB", 25)

    data_dir: Path = Path(os.getenv("MALWARE_DATA_DIR", "/app/data"))


settings = Settings()
