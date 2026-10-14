import os
import json
import pickle
import logging
from pathlib import Path
from contextlib import asynccontextmanager

import faiss
import numpy as np
import pandas as pd
import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer, CrossEncoder

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("ncert-retrieval")

ROOT = Path(os.getenv(
    "NCERT_ARTIFACT_ROOT",
    "artifacts/english_only_v1"
)).resolve()
INDEX_ROOT = ROOT / "indexes"

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
RERANKER_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
TOP_K = 5
CANDIDATE_K = 50
RRF_K = 60

state = {}


class RetrieveRequest(BaseModel):
    query: str = Field(min_length=2, max_length=2000)
    top_k: int = Field(default=TOP_K, ge=1, le=5)


def load_artifacts():
    required = [
        ROOT / "english_only_chunks.csv",
        INDEX_ROOT / "chunk_metadata.csv",
        INDEX_ROOT / "retrieval_manifest.json",
        INDEX_ROOT / "bm25" / "bm25_index.pkl",
        INDEX_ROOT / "bm25" / "tokenized_documents.pkl",
        INDEX_ROOT / "embeddings" / "chunk_embeddings.npy",
        INDEX_ROOT / "faiss" / "index.faiss",
    ]
    missing = [str(p) for p in required if not p.is_file()]
    if missing:
        raise FileNotFoundError("Missing artifacts: " + ", ".join(missing))

    manifest = json.loads(
        (INDEX_ROOT / "retrieval_manifest.json").read_text(encoding="utf-8")
    )
    chunks = pd.read_csv(ROOT / "english_only_chunks.csv").fillna("")
    metadata = pd.read_csv(INDEX_ROOT / "chunk_metadata.csv").fillna("")
    embeddings = np.load(
        INDEX_ROOT / "embeddings" / "chunk_embeddings.npy",
        mmap_mode="r"
    )
    dense_index = faiss.read_index(str(INDEX_ROOT / "faiss" / "index.faiss"))

    with open(INDEX_ROOT / "bm25" / "bm25_index.pkl", "rb") as f:
        bm25 = pickle.load(f)
    with open(INDEX_ROOT / "bm25" / "tokenized_documents.pkl", "rb") as f:
        tokenized = pickle.load(f)

    n = len(chunks)
    assert n == manifest["chunk_count"], "Chunk count differs from manifest"
    assert len(metadata) == n, "Metadata row count mismatch"
    assert embeddings.shape == (n, manifest["embedding_dimension"]), \
        "Embedding shape mismatch"
    assert dense_index.ntotal == n, "FAISS vector count mismatch"
    assert len(tokenized) == n, "BM25 document count mismatch"

    if "chunk_id" in chunks and "chunk_id" in metadata:
        assert chunks["chunk_id"].astype(str).tolist() == \
            metadata["chunk_id"].astype(str).tolist(), \
            "Chunk metadata order mismatch"

    # All retrieval representations must refer to the same ordered rows.
    state.update({
        "manifest": manifest,
        "chunks": chunks,
        "metadata": metadata,
        "dense_index": dense_index,
        "bm25": bm25,
        "tokenized": tokenized,
    })

    log.info("Loading embedding model on %s", DEVICE)
    state["encoder"] = SentenceTransformer(EMBEDDING_MODEL, device=DEVICE)

    log.info("Loading cross-encoder reranker on %s", DEVICE)
    state["reranker"] = CrossEncoder(RERANKER_MODEL, device=DEVICE)

    log.info("Retrieval service ready: %s chunks, device=%s", n, DEVICE)


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_artifacts()
    yield
    state.clear()


app = FastAPI(
    title="NCERT Retrieval Service",
    version="1.0.0",
    lifespan=lifespan
)


def metadata_value(row, *keys, default=""):
    for key in keys:
        if key in row.index:
            value = str(row[key]).strip()
            if value and value.lower() != "nan":
                return value
    return default


def retrieve(query: str, top_k: int):
    # Dense retrieval: embeddings are L2-normalized, so inner product
    # is cosine-equivalent. Normalize the query the same way.
    query_vector = state["encoder"].encode(
        [query],
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=False
    ).astype(np.float32)

    dense_scores, dense_ids = state["dense_index"].search(
        query_vector, min(CANDIDATE_K, len(state["chunks"]))
    )

    # BM25 uses the exact tokenizer saved with the original index.
    tokens = query.lower().split()
    bm25_scores = state["bm25"].get_scores(tokens)
    bm25_ids = np.argsort(bm25_scores)[::-1][:CANDIDATE_K]

    # Reciprocal Rank Fusion; combine ranks, not incomparable raw scores.
    rrf_scores = {}
    for rank, idx in enumerate(bm25_ids, start=1):
        rrf_scores[int(idx)] = rrf_scores.get(int(idx), 0.0) + \
            1.0 / (RRF_K + rank)

    for rank, idx in enumerate(dense_ids[0], start=1):
        if idx < 0:
            continue
        idx = int(idx)
        rrf_scores[idx] = rrf_scores.get(idx, 0.0) + \
            1.0 / (RRF_K + rank)

    candidates = sorted(
        rrf_scores,
        key=lambda idx: rrf_scores[idx],
        reverse=True
    )[:CANDIDATE_K]

    chunks = state["chunks"]
    pairs = [
        (query, str(chunks.iloc[idx]["text"]))
        for idx in candidates
    ]

    rerank_scores = state["reranker"].predict(
        pairs,
        show_progress_bar=False
    )
    order = np.argsort(np.asarray(rerank_scores))[::-1][:top_k]

    results = []
    metadata = state["metadata"]

    for final_rank, position in enumerate(order, start=1):
        idx = candidates[int(position)]
        chunk = chunks.iloc[idx]
        meta = metadata.iloc[idx]

        class_name = metadata_value(meta, "class")
        subject = metadata_value(meta, "subject")
        book = metadata_value(meta, "book")
        pages = metadata_value(meta, "pages")
        source_file = metadata_value(meta, "source_file")

        # Include source identity in the title so the existing Node
        # chat service can return useful citations without schema changes.
        title_parts = [
            x for x in [
                class_name,
                subject,
                book,
                f"pages {pages}" if pages else "",
            ] if x
        ]
        title = " | ".join(title_parts) or source_file or "NCERT passage"

        content = str(chunk["text"]).strip()
        if not content:
            continue

        results.append({
            "title": title[:200],
            "content": content[:12000],
            "metadata": {
                "chunk_id": metadata_value(meta, "chunk_id"),
                "class": class_name,
                "subject": subject,
                "book": book,
                "pages": pages,
                "source_file": source_file,
            },
            "scores": {
                "reranker": float(rerank_scores[int(position)]),
                "rrf": float(rrf_scores[idx]),
            },
            "rank": final_rank,
        })

    return results


@app.get("/health")
def health():
    if not state:
        raise HTTPException(status_code=503, detail="Artifacts are not loaded")
    return {
        "status": "ok",
        "chunks": len(state["chunks"]),
        "device": DEVICE,
        "embedding_model": EMBEDDING_MODEL,
        "reranker_model": RERANKER_MODEL,
    }


@app.post("/retrieve")
def retrieve_endpoint(request: RetrieveRequest):
    if not state:
        raise HTTPException(status_code=503, detail="Retriever not ready")
    try:
        documents = retrieve(request.query.strip(), request.top_k)
        return {"query": request.query, "documents": documents}
    except Exception:
        log.exception("Retrieval failed")
        raise HTTPException(status_code=500, detail="Retrieval failed")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
