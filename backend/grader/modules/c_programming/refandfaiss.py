# grader/modules/c_programming/refandfaiss.py

import os
import json
import faiss
import numpy as np
from typing import List
from langchain.schema import Document
from sentence_transformers import SentenceTransformer
import torch

# Load model ONCE at module level
device = 'cuda' if torch.cuda.is_available() else 'cpu'
# print(f"[INFO] Loading SentenceTransformer on {device}")
model = SentenceTransformer("all-MiniLM-L6-v2", device=device)

# Force initialization to prevent meta tensor issues
_ = model.encode(["warmup"], convert_to_numpy=True)

index_path_loc = os.path.join("indexes", "cprog_index", "index.faiss")

def load_reference_chunks(reference_path="data/cprog_questions.json") -> List[Document]:
    with open(reference_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    documents = [
        Document(
            page_content=f"Question: {item['Question']}\nAnswer: {item['Model Answer']}",
            metadata={"question_id": item["Question ID"]}
        )
        for item in data if item.get("Model Answer")
    ]
    return documents


def build_or_load_faiss_index(docs: List[Document], index_path="my_index.index"):
    texts = [doc.page_content for doc in docs]
    embeddings = model.encode(texts, show_progress_bar=True, convert_to_numpy=True)

    if os.path.exists(index_path):
        print("[INFO] Loading existing FAISS index.")
        index = faiss.read_index(index_path)
    else:
        print("[INFO] Building new FAISS index.")
        dim = embeddings.shape[1]
        index = faiss.IndexFlatL2(dim)
        index.add(np.array(embeddings))
        faiss.write_index(index, index_path)

    return index, embeddings, model
