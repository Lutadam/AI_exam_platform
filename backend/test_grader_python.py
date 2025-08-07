from grader.modules.python_programming.langgraph import graph

# Sample questions with model answers and student answers (theory and code)
samples = [
    {
        "question": "What is a Python list and how is it used?",
        "model_answer": "A list is a collection data type that is ordered and mutable. Lists are used to store multiple items in a single variable.",
        "student_answer": "Python list is a data structure that holds items. You can change the list after creation."
    },
    {
        "question": "Write a Python function to calculate the factorial of a number using recursion.",
        "model_answer": """def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)""",
        "student_answer": """def fact(num):
    if num == 0:
        return 1
    else:
        return num * fact(num-1)"""
    },
]

for idx, sample in enumerate(samples, 1):
    print(f"\n=== Question {idx} ===")
    print(f"Q: {sample['question']}")
    print(f"Student Answer:\n{sample['student_answer']}")

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
