from grader.modules.database.langgraph import graph


samples = [
    {
        "question": "Explain 3NF in database normalization.",
        "model_answer": "",
        # "student_answer": "3NF removes transitive dependencies and helps reduce redundancy."
        "student_answer":"3nf is avoid reduncay"
    },
    {
        "question": "What is a foreign key in relational databases?",
        "model_answer": "",
        # "student_answer": "A foreign key links two tables and enforces referential integrity."
        "student_answer":" it link two tables "
    },
]

# === Loop through and grade each ===
for idx, sample in enumerate(samples, 1):
    print(f"\n=== Question {idx} ===")
    print(f"Q: {sample['question']}")
    print(f"A: {sample['student_answer']}")

    # Add the model to input_data
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
