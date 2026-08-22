from __future__ import annotations

import json
import re
import uuid
from typing import Any

from app.config import settings


class FraudDatabase:
    @property
    def enabled(self) -> bool:
        return bool(settings.mariadb_password)

    def _connect(self, *, autocommit: bool = True):
        import pymysql

        return pymysql.connect(
            host=settings.mariadb_host,
            port=settings.mariadb_port,
            user=settings.mariadb_user,
            password=settings.mariadb_password,
            database=settings.mariadb_database,
            charset="utf8mb4",
            connect_timeout=3,
            read_timeout=10,
            write_timeout=10,
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=autocommit,
        )

    def ensure_schema(self) -> None:
        if not self.enabled:
            return
        try:
            with self._connect() as conn, conn.cursor() as cur:
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS fraud_analysis_request (
                        id CHAR(36) NOT NULL,
                        requester_user_id CHAR(36) NULL,
                        analysis_type ENUM('SMISHING','VOICE_PHISHING','FINANCIAL_FRAUD') NOT NULL,
                        input_mode ENUM('TEXT','AUDIO') NOT NULL,
                        risk_level ENUM('HIGH','MEDIUM','UNKNOWN') NOT NULL,
                        risk_score DECIMAL(5,4) NOT NULL,
                        source_excerpt VARCHAR(500) NULL,
                        indicators_json LONGTEXT NOT NULL,
                        child_message TEXT NOT NULL,
                        parent_message TEXT NOT NULL,
                        recommended_actions LONGTEXT NOT NULL,
                        external_checks_json LONGTEXT NULL,
                        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                        PRIMARY KEY (id),
                        KEY idx_fraud_requester_created (requester_user_id, created_at),
                        KEY idx_fraud_type_risk_created (analysis_type, risk_level, created_at)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                    """
                )
        except Exception as exc:
            print(f"[AI] fraud schema 준비 실패: {exc}")

    def save(
        self,
        requester_user_id: str | None,
        analysis_type: str,
        input_mode: str,
        source_text: str,
        result: dict[str, Any],
    ) -> str | None:
        if not self.enabled:
            return None
        analysis_id = str(uuid.uuid4())
        try:
            with self._connect() as conn, conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO fraud_analysis_request
                    (id,requester_user_id,analysis_type,input_mode,risk_level,risk_score,
                     source_excerpt,indicators_json,child_message,parent_message,
                     recommended_actions,external_checks_json)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    """,
                    (
                        analysis_id,
                        requester_user_id,
                        analysis_type,
                        input_mode,
                        result.get("risk_level", "UNKNOWN"),
                        float(result.get("risk_score", 0.0)),
                        self._redacted_excerpt(source_text),
                        json.dumps(result.get("indicators") or [], ensure_ascii=False),
                        result.get("child_message") or "",
                        result.get("parent_message") or "",
                        json.dumps(result.get("recommended_actions") or [], ensure_ascii=False),
                        json.dumps(result.get("external_checks") or {}, ensure_ascii=False),
                    ),
                )
            return analysis_id
        except Exception as exc:
            print(f"[AI] fraud analysis 저장 실패: {exc}")
            return None

    @staticmethod
    def _redacted_excerpt(text: str) -> str:
        compact = " ".join((text or "").split())[:1000]
        compact = re.sub(r"(?<!\d)\d{6,}(?!\d)", "[NUMBER_REDACTED]", compact)
        compact = re.sub(
            r"([?&](?:token|key|code|auth)=)[^&\s]+",
            r"\1[REDACTED]",
            compact,
            flags=re.IGNORECASE,
        )
        return compact[:500]


fraud_db = FraudDatabase()
