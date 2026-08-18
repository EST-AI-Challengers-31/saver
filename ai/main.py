# 닿음 AI/RAG 파트 - Vector DB 파이프라인

# 1. malware_embedding_data.csv 를 읽어서 search_text 를 임베딩 후 Pinecone 에 적재 (build_index)
# 2. 미등록 package 에 대해 유사도 검색 -> risk_level 판정 (check_app)


import os
import pandas as pd
from pinecone import Pinecone, ServerlessSpec
from langchain_upstage import UpstageEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_core.documents import Document
from dotenv import load_dotenv

from llm import generate_explanation

load_dotenv()

# ---------------------------------------------------------
# 설정값 
# ---------------------------------------------------------
INDEX_NAME = "dahum-malware"
EMBEDDING_DIM = 4096  # solar-embedding-1-large 기준
SIMILARITY_THRESHOLD = 0.8  # 이 이상이면 MEDIUM, 미만이면 UNKNOWN
TOP_K = 3

embeddings = UpstageEmbeddings(model="solar-embedding-1-large")


def get_vectorstore() -> PineconeVectorStore:
    # LangChain PineconeVectorStore 래퍼 반환 (인덱스 없으면 생성)
    pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
    if INDEX_NAME not in [i.name for i in pc.list_indexes()]:
        pc.create_index(
            name=INDEX_NAME,
            dimension=EMBEDDING_DIM,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
    return PineconeVectorStore(index_name=INDEX_NAME, embedding=embeddings)


# ---------------------------------------------------------
# 1. 인덱스 구축
# ---------------------------------------------------------
def build_index(csv_path: str, batch_size: int = 100):
    # malware_embedding_data.csv -> Pinecone 적재 (LangChain Document 경유)
    df = pd.read_csv(csv_path)
    vectorstore = get_vectorstore()

    for start in range(0, len(df), batch_size):
        batch = df.iloc[start : start + batch_size]

        documents = [
            Document(
                page_content=row["search_text"],
                metadata={
                    "malware_name": row["malware_name"],
                    "malware_package": row["malware_package"],
                    "malware_category": row["malware_category"],
                },
            )
            for _, row in batch.iterrows()
        ]
        ids = [str(rid) for rid in batch["record_id"].tolist()]

        vectorstore.add_documents(documents=documents, ids=ids)
        print(f"[{start + len(batch)}/{len(df)}] 적재 완료")

    print("인덱스 구축 완료")


# ---------------------------------------------------------
# 2. 미등록 package 유사도 검색 + 판정
# ---------------------------------------------------------
def check_app(package_name: str) -> dict:
    
    # 백엔드가 Exact Match 실패 시 호출.
    # 입력: package_name (OCR로 추출된 패키지명)
    # 출력: risk_level, similarity_score, matched_examples, ai_explanation
    
    vectorstore = get_vectorstore()

    # package를 자연어처럼 토큰화 (com.fake.bank -> com fake bank)
    query_text = package_name.replace(".", " ")
    results = vectorstore.similarity_search_with_score(query_text, k=TOP_K)

    if not results:
        risk_level = "UNKNOWN"
        top_score = 0.0
        matched_examples = []
    else:
        # LangChain Pinecone 결과는 (Document, score) 튜플
        top_score = results[0][1]
        matched_examples = [
            {
                "malware_name": doc.metadata["malware_name"],
                "malware_category": doc.metadata["malware_category"],
                "score": score,
            }
            for doc, score in results
        ]
        risk_level = "MEDIUM" if top_score >= SIMILARITY_THRESHOLD else "UNKNOWN"

    explanation = generate_explanation(risk_level, matched_examples)

    return {
        "risk_level": risk_level,
        "similarity_score": top_score,
        "matched_examples": matched_examples,
        "is_verified_safe": False,  # UNKNOWN이어도 절대 '안전'을 의미하지 않음
        "ai_explanation": explanation,
    }

 
def check_apps(package_names: list) -> list:
    return [check_app(pkg) for pkg in package_names]


# ---------------------------------------------------------
# 3. LLM 설명 생성 
# ---------------------------------------------------------

if __name__ == "__main__":
    # build_index("../datas/data/malware_embedding_data.csv")
    
    print(check_apps(["com.fake.bank.secure", "카카오톡"]))
