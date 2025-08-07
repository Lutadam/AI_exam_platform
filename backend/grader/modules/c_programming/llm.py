# grader/modules/c_programming/llm.py

from langchain_ollama import OllamaLLM
from grader.modules.c_programming.refandfaiss import load_reference_chunks, build_or_load_faiss_index
from typing import List
from langchain.schema import Document
import torch

def generate_prompt(
    question: str,
    student_answer: str,
    model_answer: str,
    retrieved: List[Document]
) -> str:
    context = "\n---\n".join([doc.page_content for doc in retrieved[:3]])

    return f"""You are an expert C programming examiner.

Use the reference below to help evaluate the answer:
{context}

Evaluate the student's answer to the following C programming question ONLY:

Question: {question}
Model Answer (if available): {model_answer or 'N/A'}

Student's Answer:
\"\"\"{student_answer}\"\"\"

Instructions:
- If the answer is blank or missing, assign a score of 0.
- Evaluate based on clarity, correctness of syntax/logic, and completeness.
- Give helpful, specific feedback to help the student improve.
- Score must be from 0 to 10.

Respond in this format only:
Score: <number>
Feedback: <your comment>
"""

device = torch.device("cuda:1" if torch.cuda.is_available() else "cpu")
# print(f"[INFO] Using device: {device}")
# print("[DEBUG] CUDA available:", torch.cuda.is_available())
# print("[DEBUG] Device count:", torch.cuda.device_count())
llm = OllamaLLM(model="deepseek-coder:6.7b", temperature=0.8, device="cuda:1")

def call_deepseek_llm(prompt: str) -> str:
    
    return llm.invoke(prompt)
