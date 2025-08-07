from langchain_ollama import OllamaLLM
from grader.modules.risk_management.refandfaiss import load_reference_chunks, build_or_load_faiss_index
from typing import List
from langchain.schema import Document

# === RAG Prompt + llama LLM ===

def generate_prompt(
    question: str,
    student_answer: str,
    model_answer: str,
    retrieved: List[Document]
) -> str:
    context = "\n---\n".join([doc.page_content for doc in retrieved[:3]])

    return f"""You are an expert Risk Management examiner.

Use the reference below to help evaluate the answer:
{context}

Evaluate the student's answer to the following question ONLY:

Question: {question}
Model Answer (if available): {model_answer or 'N/A'}

Student's Answer:
\"\"\"{student_answer}\"\"\"

Instructions:
- If the answer is blank or missing, assign a score of 0.
- Evaluate the response based on clarity, completeness, and correctness.
- Give helpful, specific feedback to help the student improve.
- Do NOT refer to unrelated topics unless explicitly relevant.
- Score must be from 0 to 10.

Respond in this exact format:
Score: <number>
Feedback: <your comment>
"""
llm = OllamaLLM(model="llama3:8b", temperature=0.8)
def call_llama_llm(prompt: str) -> str:
    
    return llm.invoke(prompt)
