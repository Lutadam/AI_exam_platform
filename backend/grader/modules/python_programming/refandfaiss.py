import os
import json
import faiss
import numpy as np
from typing import List
from langchain.schema import Document
from sentence_transformers import SentenceTransformer
import torch

model = SentenceTransformer("all-MiniLM-L6-v2")

first_param = next(model.parameters(), None)
if first_param is not None and first_param.device.type == 'meta':
    model = model.to_empty(torch.device("cuda" if torch.cuda.is_available() else "cpu"))


index_path_loc = os.path.join("indexes", "python_index", "index.faiss")

def load_reference_chunks(reference_path="data/python_questions.json") -> List[Document]:
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

def build_or_load_faiss_index(docs: List[Document], index_path=index_path_loc):

    texts = [doc.page_content for doc in docs]
    embeddings = model.encode(texts)

    if os.path.exists(index_path):
        print("[INFO] Loading existing FAISS index.")
        index = faiss.read_index(index_path)
    else:
        print("[INFO] Building new FAISS index.")
        dim = embeddings.shape[1]
        index = faiss.IndexFlatL2(dim)
        index.add(np.array(embeddings))
        os.makedirs(os.path.dirname(index_path), exist_ok=True)
        faiss.write_index(index, index_path)

    return index, embeddings, model
