from grader.modules.risk_management.langgraph import graph

# === Sample Risk Management Questions and Student Answers ===
samples = [
    {
        "question": "Define 'risk appetite' in risk management.",
        "model_answer": "",
        "student_answer": "Risk appetite means how much risk the company is willing to take to reach its goal."
    },
    {
        "question": "What is the difference between inherent risk and residual risk?",
        "model_answer": "",
        "student_answer": "Inherent risk is original risk, residual risk is what's left after controls."
    },
    {
        "question": "List three common risk response strategies.",
        "model_answer": "",
        "student_answer": "Avoid risk, transfer risk, accept risk."
    }
]

# === Loop through and grade each ===
for idx, sample in enumerate(samples, 1):
    print(f"\n=== Question {idx} ===")
    print(f"Q: {sample['question']}")
    print(f"A: {sample['student_answer']}")

    input_data = {
        "question": sample["question"],
        "student_answer": sample["student_answer"],
        "model_answer": sample.get("model_answer", ""),
        "retry_count": 0,
        "score": None,
        "feedback": None,
    }

    result = graph.invoke(input_data)

    print(f"\nScore: {result['score']}")
    print(f"Feedback: {result['feedback']}")
    print(f"Method: {result.get('method', 'LangGraph')}")
    print(f"Retry Count: {result.get('retry_count', 0)}")
    print("----------------------------")
