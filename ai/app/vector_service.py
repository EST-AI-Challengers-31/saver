from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.config import settings


@dataclass(frozen=True)
class VectorMatch:
    malware_name: str
    malware_package: str
    malware_category: str
    score: float


class LocalVectorSearch:
    provider_name = "LOCAL_TFIDF_PACKAGE_AND_SEARCH_TEXT"

    def __init__(self) -> None:
        self._df = pd.DataFrame()
        self._search_vectorizer: TfidfVectorizer | None = None
        self._search_matrix = None
        self._package_vectorizer: TfidfVectorizer | None = None
        self._package_matrix = None

    def load(self, csv_path: Path, fallback_df: pd.DataFrame | None = None) -> None:
        if csv_path.exists():
            df = pd.read_csv(csv_path).fillna("")
        elif fallback_df is not None and not fallback_df.empty:
            df = fallback_df.copy().fillna("")
            df["search_text"] = df.apply(
                lambda row: (
                    f"malware_name: {row.get('malware_name', '')} | "
                    f"malware_package: {row.get('malware_package', '')} | "
                    f"malware_category: {row.get('malware_category', '')}"
                ),
                axis=1,
            )
        else:
            raise FileNotFoundError(f"임베딩 데이터 파일이 없습니다: {csv_path}")

        required = {"malware_name", "malware_package", "malware_category", "search_text"}
        missing = required - set(df.columns)
        if missing:
            raise ValueError(f"malware_embedding_data.csv 필수 컬럼 누락: {sorted(missing)}")

        df = df[
            (df["search_text"].astype(str).str.strip() != "")
            | (df["malware_package"].astype(str).str.strip() != "")
        ].reset_index(drop=True)
        if df.empty:
            raise ValueError("Vector 검색에 사용할 데이터가 없습니다.")

        search_vectorizer = TfidfVectorizer(
            analyzer="char_wb", ngram_range=(2, 5), lowercase=True, min_df=1, norm="l2"
        )
        package_vectorizer = TfidfVectorizer(
            analyzer="char_wb", ngram_range=(2, 5), lowercase=True, min_df=1, norm="l2"
        )
        search_matrix = search_vectorizer.fit_transform(df["search_text"].astype(str).tolist())
        package_matrix = package_vectorizer.fit_transform(df["malware_package"].astype(str).tolist())

        self._df = df
        self._search_vectorizer = search_vectorizer
        self._search_matrix = search_matrix
        self._package_vectorizer = package_vectorizer
        self._package_matrix = package_matrix
        print(f"[AI] Local vector index 준비 완료: {len(df)} records")

    def search(self, query: str, top_k: int | None = None) -> list[VectorMatch]:
        if (
            self._search_vectorizer is None
            or self._search_matrix is None
            or self._package_vectorizer is None
            or self._package_matrix is None
            or self._df.empty
        ):
            return []

        k = max(1, min(top_k or settings.top_k, len(self._df)))
        search_vector = self._search_vectorizer.transform([query.replace(".", " ")])
        package_vector = self._package_vectorizer.transform([query])
        search_scores = cosine_similarity(search_vector, self._search_matrix).ravel()
        package_scores = cosine_similarity(package_vector, self._package_matrix).ravel()
        scores = package_scores.copy()
        for index in range(len(scores)):
            scores[index] = max(float(package_scores[index]), float(search_scores[index]))
        indices = scores.argsort()[::-1][:k]

        return [
            VectorMatch(
                malware_name=str(self._df.iloc[int(index)]["malware_name"]),
                malware_package=str(self._df.iloc[int(index)]["malware_package"]),
                malware_category=str(self._df.iloc[int(index)]["malware_category"]),
                score=max(0.0, min(1.0, float(scores[int(index)]))),
            )
            for index in indices
        ]


class PineconeVectorSearch:
    provider_name = "PINECONE_UPSTAGE"

    def __init__(self) -> None:
        self._store = None

    def load(self, _: Path, fallback_df: pd.DataFrame | None = None) -> None:
        del fallback_df
        if not (settings.pinecone_api_key and settings.pinecone_index and settings.upstage_api_key):
            raise RuntimeError(
                "Pinecone mode는 PINECONE_API_KEY, PINECONE_INDEX, UPSTAGE_API_KEY가 필요합니다."
            )
        import os

        os.environ.setdefault("PINECONE_API_KEY", settings.pinecone_api_key)
        os.environ.setdefault("UPSTAGE_API_KEY", settings.upstage_api_key)
        from langchain_upstage import UpstageEmbeddings
        from langchain_pinecone import PineconeVectorStore

        embeddings = UpstageEmbeddings(model="solar-embedding-1-large")
        self._store = PineconeVectorStore(
            index_name=settings.pinecone_index,
            embedding=embeddings,
        )
        print(f"[AI] Pinecone vector provider 연결: {settings.pinecone_index}")

    def search(self, query: str, top_k: int | None = None) -> list[VectorMatch]:
        if self._store is None:
            return []
        k = max(1, top_k or settings.top_k)
        results = self._store.similarity_search_with_score(query.replace(".", " "), k=k)
        return [
            VectorMatch(
                malware_name=str((doc.metadata or {}).get("malware_name", "")),
                malware_package=str((doc.metadata or {}).get("malware_package", "")),
                malware_category=str((doc.metadata or {}).get("malware_category", "")),
                score=max(0.0, min(1.0, float(score))),
            )
            for doc, score in results
        ]


class VectorRouter:
    def __init__(self) -> None:
        self._provider: LocalVectorSearch | PineconeVectorSearch = LocalVectorSearch()
        self.provider_name = self._provider.provider_name

    def load(self, csv_path: Path, fallback_df: pd.DataFrame | None = None) -> None:
        if settings.vector_provider == "pinecone":
            try:
                provider = PineconeVectorSearch()
                provider.load(csv_path, fallback_df)
                self._provider = provider
                self.provider_name = provider.provider_name
                return
            except Exception as exc:
                print(f"[AI] Pinecone 연결 실패, Local Vector로 fallback: {exc}")

        provider = LocalVectorSearch()
        provider.load(csv_path, fallback_df)
        self._provider = provider
        self.provider_name = provider.provider_name

    def search(self, query: str, top_k: int | None = None) -> list[VectorMatch]:
        return self._provider.search(query, top_k)


vector_search = VectorRouter()
