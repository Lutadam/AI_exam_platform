from langchain_ollama import OllamaLLM
from grader.modules.oop_java.refandfaiss import *
from typing import List
from langchain.schema import Document

# === RAG Prompt + CodeLLaMA / DeepSeek-Coder for Java OOP ===

def generate_prompt(
    question: str,
    student_answer: str,
    model_answer: str,
    retrieved: List[Document]
) -> str:
    context = "\n---\n".join([doc.page_content for doc in retrieved[:3]])

    return f"""You are an expert **Java Object-Oriented Programming (OOP)** examiner.

Use the following reference material to help evaluate the student answer:
{context}

Evaluate the student's answer to the question below:

Question: {question}
Model Answer (if available): {model_answer or 'N/A'}

Student's Answer:
\"\"\"{student_answer}\"\"\"

Instructions:
- If the answer is blank or missing, assign a score of 0.
- Evaluate based on OOP understanding, correctness, Java syntax, clarity, use of principles (like inheritance, encapsulation, etc.), and relevance.
- Provide constructive and specific feedback to help the student learn and improve.
- Avoid introducing unrelated concepts or over-correcting.
- Score must be between 0 and 10.

Respond in this exact format:
Score: <number>
Feedback: <your comment>
"""

# Load this once when the module is imported
java_llm = OllamaLLM(model="codellama:13b", temperature=0.7)

def call_java_llm(prompt: str) -> str:
    return java_llm.invoke(prompt)
