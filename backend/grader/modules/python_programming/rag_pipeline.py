from grader.modules.python_programming.llm import generate_prompt, call_deepseek_llm
from grader.modules.python_programming.refandfaiss import *
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict
import re

# === Master Function ===

def grade_with_deepseek(question_text: str, model_answer: str, student_answer: str) -> Dict:
    if not student_answer.strip():
        return {
            "score": 0.0,
            "feedback": "No answer provided. Please attempt the question to receive feedback.",
            "method": "deepseek-rag"
        }
    else:
        print("[INFO] Loading reference docs...")
        docs = load_reference_chunks()
        index, embeddings, model = build_or_load_faiss_index(docs)

        # Embed student answer
        student_embedding = model.encode([student_answer])
        D, I = index.search(np.array(student_embedding), k=3)
        retrieved = [docs[i] for i in I[0]]

        prompt = generate_prompt(question_text, student_answer, model_answer, retrieved)
        print("[INFO] Calling DeepSeek-Coder...")
        response = call_deepseek_llm(prompt)

        # Parse score + feedback
        match = re.search(r"score[:=]?\s*(\d+(\.\d+)?)", response.lower())
        score = float(match.group(1)) if match else 0.0
        lines = response.strip().split("\n")
        feedback_line = next((l for l in lines if l.lower().startswith("feedback")), "Feedback: No feedback.")
        feedback = feedback_line.split(":", 1)[1].strip()

        return {
            "score": score,
            "feedback": feedback,
            "method": "deepseek-rag"
        }
