from grader.modules.oop_java.llm import generate_prompt, call_java_llm
from grader.modules.oop_java.refandfaiss import load_reference_chunks, build_or_load_faiss_index
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict
import re
import time

# === Master Function ===

def grade_with_java_llm(question_text: str, model_answer: str, student_answer: str) -> Dict:
    if not student_answer.strip():
        return {
            "score": 0.0,
            "feedback": "No answer provided. Please attempt the question to receive feedback.",
            "method": "java-rag"
        }
    else:
        print("[INFO] Loading Java OOP reference docs...")
        docs = load_reference_chunks()
        index, embeddings, model = build_or_load_faiss_index(docs)

        # Embed student answer
        student_embedding = model.encode([student_answer])
        D, I = index.search(np.array(student_embedding), k=3)
        retrieved = [docs[i] for i in I[0]]

        prompt = generate_prompt(question_text, student_answer, model_answer, retrieved)
        start = time.time()
        print("[INFO] Calling Java LLM...")
        response = call_java_llm(prompt)
        print(f"[INFO] Loaded FAISS index in {time.time() - start:.2f}s")

        # Parse score + feedback
        match = re.search(r"score[:=]?\s*(\d+(\.\d+)?)", response.lower())
        score = float(match.group(1)) if match else 0.0
        lines = response.strip().split("\n")
        feedback_line = next((l for l in lines if l.lower().startswith("feedback")), "Feedback: No feedback.")
        feedback = feedback_line.split(":", 1)[1].strip()

        return {
            "score": score,
            "feedback": feedback,
            "method": "java-rag"
        }
