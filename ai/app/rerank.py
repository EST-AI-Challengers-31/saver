import os
import json
import requests
from pinecone import Pinecone, ServerlessSpec
from langchain_pinecone import PineconeVectorStore
from langchain_upstage import UpstageEmbeddings

from dotenv import load_dotenv

load_dotenv()

ALAN_API_URL = "https://kdt-api-function.azurewebsites.net/api/v1/question"
ALAN_CLIENT_ID = os.environ["ALAN_CLIENT_ID"]

embeddings = UpstageEmbeddings(model="solar-embedding-1-large")
pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
index = pc.Index("dahum-malware")


def search_candidates(query_package: str, top_k: int = 5) -> list[dict]:
    print("\n candidates 함수 시작")
    query_vector = embeddings.embed_query(query_package)
    results = index.query(vector=query_vector, top_k=top_k, include_metadata=True)

    return [
        {
            "package": m["metadata"]["malware_package"],
            "malware_name": m["metadata"]["malware_name"],
            "category": m["metadata"]["malware_category"],
            "similarity": m["score"],
        }
        for m in results["matches"]
    ]


def rerank_with_llm(query: str, candidates: list[str], top_n: int = 3):
    print("\n rerank 함수 시작")
    candidates_text = "\n".join(
        f"{i + 1}. {c['package']} ({c['category']})" for i, c in enumerate(candidates)
    )

    prompt = f"""
    당신은 안드로이드 악성 패키지를 분석하는 보안 전문가입니다.

    판단 대상 패키지명 : {query}

    후보 목록 (패키지명 + 악성 분류):
    {candidates_text}

    각 후보에 대해 다음을 고려해 관련성을 판단하세요:
    1. 패키지명의 단어/구조가 실제로 유사한 의미를 갖는가
    2. 악성 분류(category)가 판단 대상과 같은 위협 성향을 가질 가능성이 있는가
    3. 단순히 흔한 단어(free, gift, tool 등)만 겹치는 경우는 관련성을 낮게 평가

    위 기준으로 실제로 관련성이 높은 순서대로 상위 {top_n}개를 선택하고,
    각 항목에 대한 판단 이유(reason)를 한 문장으로 함께 제시하세요.

    반드시 아래 JSON 형식으로만 답변하세요. 다른 설명은 추가하지 마세요.
    형식 : [{{"index":1, "score":0.9, "reason":"..."}}, ...]
    """

    response = requests.get(
        ALAN_API_URL,
        params={"content": prompt, "client_id": ALAN_CLIENT_ID},
        timeout=120,
    )

    if response.status_code != 200:
        raise RuntimeError(f"API 호출 실패: {response.status_code} - {response.text}")

    data = response.json()
    llm_text = data["answer"].strip()

    if llm_text.startswith("```"):
        llm_text = llm_text.strip("`").replace("json", "", 1).strip()

    results = json.loads(llm_text)
    
    # 방어 코드: 각 항목이 올바른 형식(dict + index/score 키)인지 검증
    valid_results = []
    for r in results:
        if isinstance(r, dict) and "index" in r and "score" in r:
            valid_results.append(r)
        else:
            print(f"⚠️ 예상치 못한 형식의 응답 항목 무시: {r}")

    if not valid_results:
        print(f"⚠️ rerank 응답 파싱 실패, 원본 후보 순서로 폴백: {llm_text}")
        return candidates[:top_n]

    reranked = []
    for r in valid_results:
        if not (1 <= r["index"] <= len(candidates)):
            continue
        item = dict(candidates[r["index"] - 1])
        item["rerank_score"] = r["score"]
        item["reason"] = r.get("reason", "")
        reranked.append(item)

    return reranked if reranked else candidates[:top_n]

    
