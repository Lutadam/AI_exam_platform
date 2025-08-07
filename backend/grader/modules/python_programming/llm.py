from langchain_ollama import OllamaLLM
from grader.modules.python_programming.refandfaiss import load_reference_chunks, build_or_load_faiss_index
from typing import List
from langchain.schema import Document

# === RAG Prompt + DeepSeek-Coder ===

def generate_prompt(
    question: str,
    student_answer: str,
    model_answer: str,
    retrieved: List[Document]
) -> str:
    context = "\n---\n".join([doc.page_content for doc in retrieved[:3]])

    return f"""You are an expert Python programming examiner.

Use the reference below to help evaluate the answer:
{context}

Evaluate the student's answer to the following question ONLY:

Question: {question}
Model Answer (if available): {model_answer or 'N/A'}

Student's Answer:
\"\"\"{student_answer}\"\"\"

Instructions:
- If the answer is blank or missing, assign a score of 0.
- Evaluate based on code correctness, logic, clarity, syntax, and relevance.
- Provide helpful, specific feedback that guides the student to improve.
- Do NOT introduce unrelated topics.
- Score must be between 0 and 10.

Respond in this exact format:
Score: <number>
Feedback: <your comment>
"""
llm = OllamaLLM(model="deepseek-coder:6.7b", temperature=0.7)

def call_deepseek_llm(prompt: str) -> str:
    
    return llm.invoke(prompt)
