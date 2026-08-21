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

    # MariaDB: saver의 기존 일반 서비스 DB를 사용한다.
    mariadb_host: str = os.getenv("MARIADB_HOST", "mariadb")
    mariadb_port: int = env_int("MARIADB_PORT", 3306)
    mariadb_database: str = os.getenv("MARIADB_DATABASE", "dahum")
    mariadb_user: str = os.getenv("MARIADB_USER", "dahum_app")
    mariadb_password: str = env_value("MARIADB_PASSWORD")

    # 현재 Python-first LLM 경로. endpoint가 없으면 템플릿 fallback을 사용한다.
    llm_api_key: str = env_value("LLM_API_KEY")
    llm_api_base_url: str = env_value("LLM_API_BASE_URL")

    # 기존 저장소/Secrets와의 호환을 위해 Alan Client ID도 전달받는다.
    # 현재 위험도 판정 로직의 필수값은 아니며, 설정되지 않아도 배포를 막지 않는다.
    alan_client_id: str = env_value("ALAN_CLIENT_ID")

    # Vector 검색
    vector_provider: str = os.getenv("VECTOR_PROVIDER", "local").strip().lower()
    pinecone_api_key: str = env_value("PINECONE_API_KEY")
    pinecone_index: str = env_value("PINECONE_INDEX", "dahum-malware") or "dahum-malware"
    upstage_api_key: str = env_value("UPSTAGE_API_KEY")
    similarity_threshold: float = env_float("RAG_SIMILARITY_THRESHOLD", 0.80)
    top_k: int = env_int("RAG_TOP_K", 5)

    data_dir: Path = Path(os.getenv("MALWARE_DATA_DIR", "/app/data"))


settings = Settings()
