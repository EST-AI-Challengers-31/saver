from __future__ import annotations

import json
import uuid
from datetime import datetime
from threading import Lock
from typing import Any, Iterable

from app.config import settings

TEAM_SOURCE_NAME = "TEAM_MALWARE_CSV"
TEAM_SOURCE_VERSION = "python-first-20260821"


class DahumDatabase:
    def __init__(self) -> None:
        self._memory_scans: list[dict[str, Any]] = []
        self._lock = Lock()
        self._memory_id = 0

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

    def seed_catalog_if_needed(self, rows: Iterable[dict[str, Any]]) -> bool:
        if not self.enabled:
            return False

        data = [
            {
                "malware_name": str(row.get("malware_name", "")).strip(),
                "malware_package": str(row.get("malware_package", "")).strip(),
                "malware_category": str(row.get("malware_category", "")).strip(),
            }
            for row in rows
            if str(row.get("malware_package", "")).strip()
            or str(row.get("malware_name", "")).strip()
        ]
        if not data:
            return False

        try:
            with self._connect(autocommit=False) as conn, conn.cursor() as cur:
                cur.execute(
                    "SELECT id FROM malware_dataset WHERE source_name=%s AND source_version=%s LIMIT 1",
                    (TEAM_SOURCE_NAME, TEAM_SOURCE_VERSION),
                )
                if cur.fetchone():
                    conn.rollback()
                    return True

                dataset_id = str(uuid.uuid4())
                cur.execute(
                    """INSERT INTO malware_dataset
                       (id,source_name,source_version,imported_row_count,usable_row_count,dataset_status)
                       VALUES (%s,%s,%s,%s,%s,'ACTIVE')""",
                    (dataset_id, TEAM_SOURCE_NAME, TEAM_SOURCE_VERSION, len(data), len(data)),
                )

                values = [
                    (
                        str(uuid.uuid4()),
                        dataset_id,
                        row["malware_name"] or None,
                        row["malware_package"] or None,
                        row["malware_category"] or None,
                        (row["malware_name"] or row["malware_package"]).casefold() or None,
                        TEAM_SOURCE_NAME,
                        TEAM_SOURCE_VERSION,
                        1,
                    )
                    for row in data
                ]
                cur.executemany(
                    """INSERT INTO malware_record
                       (id,dataset_id,malware_name,malware_package,malware_category,
                        normalized_app_name,source_name,source_version,is_active)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                    values,
                )
                conn.commit()

            print(f"[AI] MariaDB malware_record 적재 완료: {len(values)} rows")
            return True
        except Exception as exc:
            print(f"[AI] MariaDB malware_record 적재 건너뜀: {exc}")
            return False

    def find_exact(self, query: str) -> list[dict[str, str]] | None:
        if not self.enabled:
            return None

        try:
            with self._connect() as conn, conn.cursor() as cur:
                cur.execute(
                    """SELECT id,malware_name,malware_package,malware_category
                       FROM malware_record
                       WHERE is_active=1 AND source_name=%s
                         AND (LOWER(COALESCE(malware_package,''))=LOWER(%s)
                              OR LOWER(COALESCE(malware_name,''))=LOWER(%s))
                       ORDER BY created_at ASC""",
                    (TEAM_SOURCE_NAME, query, query),
                )
                return list(cur.fetchall())
        except Exception as exc:
            print(f"[AI] MariaDB exact 조회 실패, CSV fallback 사용: {exc}")
            return None

    def save_scan(
        self,
        source_type: str,
        source_label: str | None,
        results: list[dict[str, Any]],
    ) -> str:
        if self.enabled:
            try:
                return self._save_mariadb(source_type, results)
            except Exception as exc:
                print(f"[AI] MariaDB 분석 이력 저장 실패, memory fallback 사용: {exc}")

        with self._lock:
            self._memory_id += 1
            scan_id = f"memory-{self._memory_id}"
            self._memory_scans.insert(
                0,
                {
                    "id": scan_id,
                    "source_type": source_type,
                    "source_label": source_label,
                    "highest_risk_level": self._highest_risk(results),
                    "result_count": len(results),
                    "created_at": datetime.now().isoformat(),
                    "results": results,
                },
            )
            self._memory_scans = self._memory_scans[:100]
            return scan_id

    def _save_mariadb(self, source_type: str, results: list[dict[str, Any]]) -> str:
        request_id = str(uuid.uuid4())
        input_mode = "IMAGE" if source_type == "IMAGE_OCR" else "DIRECT_TEXT"

        with self._connect(autocommit=False) as conn, conn.cursor() as cur:
            cur.execute(
                """INSERT INTO analysis_request
                   (id,input_mode,source_channel,status,image_stored,created_at,completed_at)
                   VALUES (%s,%s,'API','COMPLETED',0,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6))""",
                (request_id, input_mode),
            )

            for item in results:
                item_id = str(uuid.uuid4())
                names = item.get("malware_names") or []
                categories = item.get("malware_categories") or []
                actions = item.get("recommended_actions") or []

                cur.execute(
                    """INSERT INTO analysis_item
                       (id,analysis_request_id,input_app_name,normalized_app_name,package_name,
                        risk_level,match_type,similarity_score,malware_name,malware_category,
                        easy_explanation,recommended_actions)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                    (
                        item_id,
                        request_id,
                        item.get("display_query") or item.get("package_name") or "unknown",
                        str(
                            item.get("display_query")
                            or item.get("package_name")
                            or "unknown"
                        ).casefold(),
                        item.get("package_name"),
                        item.get("risk_level", "UNKNOWN"),
                        self._db_match_type(item),
                        item.get("similarity_score"),
                        names[0] if names else None,
                        categories[0] if categories else None,
                        item.get("child_message"),
                        json.dumps(actions, ensure_ascii=False),
                    ),
                )

                cur.execute(
                    """INSERT INTO analysis_evidence
                       (id,analysis_item_id,evidence_type,evidence_message,source_reference)
                       VALUES (%s,%s,%s,%s,%s)""",
                    (
                        str(uuid.uuid4()),
                        item_id,
                        item.get("match_type", "NONE"),
                        item.get("evidence_summary") or "판정 근거 없음",
                        TEAM_SOURCE_NAME,
                    ),
                )

            primary = max(
                results,
                key=lambda x: {
                    "UNKNOWN": 0,
                    "MEDIUM": 1,
                    "HIGH": 2,
                }.get(str(x.get("risk_level")), 0),
                default=None,
            )
            if primary and primary.get("parent_message"):
                cur.execute(
                    """INSERT INTO parent_guide
                       (id,analysis_request_id,guide_text,generation_method,prompt_version)
                       VALUES (%s,%s,%s,%s,%s)""",
                    (
                        str(uuid.uuid4()),
                        request_id,
                        primary["parent_message"],
                        primary.get("explanation_method", "TEMPLATE"),
                        "python-first-v1",
                    ),
                )

            conn.commit()

        return request_id

    @staticmethod
    def _db_match_type(item: dict[str, Any]) -> str:
        if item.get("match_type") == "EXACT":
            return (
                "EXACT_PACKAGE"
                if item.get("exact_field") == "PACKAGE"
                else "EXACT_APP_NAME"
            )
        if item.get("match_type") == "VECTOR":
            return "VECTOR_SIMILARITY"
        return "NO_MATCH"

    def list_scans(self, limit: int = 20) -> list[dict[str, Any]]:
        limit = max(1, min(limit, 100))
        if self.enabled:
            try:
                with self._connect() as conn, conn.cursor() as cur:
                    cur.execute(
                        """SELECT ar.id,
                                  ar.input_mode AS source_type,
                                  COALESCE(MIN(ai.input_app_name),'앱 분석') AS source_label,
                                  CASE MAX(CASE ai.risk_level WHEN 'HIGH' THEN 3 WHEN 'MEDIUM' THEN 2 ELSE 1 END)
                                    WHEN 3 THEN 'HIGH'
                                    WHEN 2 THEN 'MEDIUM'
                                    ELSE 'UNKNOWN'
                                  END AS highest_risk_level,
                                  COUNT(ai.id) AS result_count,
                                  ar.created_at
                           FROM analysis_request ar
                           LEFT JOIN analysis_item ai ON ai.analysis_request_id=ar.id
                           GROUP BY ar.id,ar.input_mode,ar.created_at
                           ORDER BY ar.created_at DESC
                           LIMIT %s""",
                        (limit,),
                    )
                    return list(cur.fetchall())
            except Exception as exc:
                print(f"[AI] MariaDB history 조회 실패, memory fallback 사용: {exc}")

        return [
            {key: value for key, value in row.items() if key != "results"}
            for row in self._memory_scans[:limit]
        ]

    def get_scan(self, scan_id: str) -> dict[str, Any] | None:
        if self.enabled and not scan_id.startswith("memory-"):
            try:
                with self._connect() as conn, conn.cursor() as cur:
                    cur.execute(
                        """SELECT id,input_mode AS source_type,created_at
                           FROM analysis_request
                           WHERE id=%s""",
                        (scan_id,),
                    )
                    scan = cur.fetchone()
                    if not scan:
                        return None

                    # evidence는 현재 item당 1건만 저장한다.
                    # GROUP BY 없이 서브쿼리로 1건을 선택해 ONLY_FULL_GROUP_BY 환경에서도 안전하게 조회한다.
                    cur.execute(
                        """SELECT ai.id,
                                  ai.input_app_name,
                                  ai.package_name,
                                  ai.risk_level,
                                  ai.match_type,
                                  ai.similarity_score,
                                  ai.malware_name,
                                  ai.malware_category,
                                  ai.easy_explanation,
                                  ai.recommended_actions,
                                  (
                                    SELECT ae.evidence_message
                                    FROM analysis_evidence ae
                                    WHERE ae.analysis_item_id=ai.id
                                    ORDER BY ae.created_at ASC
                                    LIMIT 1
                                  ) AS evidence_message
                           FROM analysis_item ai
                           WHERE ai.analysis_request_id=%s
                           ORDER BY ai.created_at ASC""",
                        (scan_id,),
                    )
                    rows = list(cur.fetchall())

                    cur.execute(
                        """SELECT guide_text
                           FROM parent_guide
                           WHERE analysis_request_id=%s
                           ORDER BY created_at DESC
                           LIMIT 1""",
                        (scan_id,),
                    )
                    guide = cur.fetchone()
                    parent = str((guide or {}).get("guide_text") or "")
                    results = [self._stored_result(row, parent) for row in rows]
                    scan["source_label"] = (
                        rows[0]["input_app_name"] if rows else "앱 분석"
                    )
                    scan["highest_risk_level"] = self._highest_risk(results)
                    scan["results"] = results
                    return scan
            except Exception as exc:
                print(f"[AI] MariaDB history 상세 조회 실패: {exc}")

        return next(
            (row for row in self._memory_scans if row["id"] == scan_id),
            None,
        )

    @staticmethod
    def _stored_result(row: dict[str, Any], parent: str) -> dict[str, Any]:
        match = {
            "EXACT_PACKAGE": ("EXACT", "PACKAGE"),
            "EXACT_APP_NAME": ("EXACT", "MALWARE_NAME"),
            "VECTOR_SIMILARITY": ("VECTOR", None),
            "NO_MATCH": ("NONE", None),
        }.get(str(row.get("match_type")), ("NONE", None))

        try:
            actions = json.loads(row.get("recommended_actions") or "[]")
        except json.JSONDecodeError:
            actions = []

        return {
            "package_name": row.get("package_name")
            or row.get("input_app_name")
            or "unknown",
            "display_query": row.get("input_app_name"),
            "risk_level": row.get("risk_level") or "UNKNOWN",
            "match_type": match[0],
            "exact_field": match[1],
            "matched": row.get("risk_level") in {"HIGH", "MEDIUM"},
            "similarity_score": float(row.get("similarity_score") or 0.0),
            "malware_names": (
                [row["malware_name"]] if row.get("malware_name") else []
            ),
            "malware_categories": (
                [row["malware_category"]] if row.get("malware_category") else []
            ),
            "matched_examples": [],
            "evidence_summary": str(
                row.get("evidence_message") or "저장된 판정 결과입니다."
            ),
            "child_message": str(row.get("easy_explanation") or ""),
            "parent_message": parent,
            "recommended_actions": actions,
            "explanation_method": "TEMPLATE",
            "is_verified_safe": False,
        }

    @staticmethod
    def _highest_risk(results: list[dict[str, Any]]) -> str:
        rank = {"UNKNOWN": 0, "MEDIUM": 1, "HIGH": 2}
        return max(
            (str(item.get("risk_level", "UNKNOWN")) for item in results),
            key=lambda value: rank.get(value, 0),
            default="UNKNOWN",
        )


dahum_db = DahumDatabase()
