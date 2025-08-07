# test_grader.py

from grader.modules.c_programming.langraph import graph

samples = [
    {
        "question": "What is a pointer in C?",
        "model_answer": "A pointer is a variable that stores the memory address of another variable.",
        "student_answer": "It's a variable that holds the address of another variable."
    },
    {
        "question": "Explain the difference between stack and heap memory.",
        "model_answer": "Stack is used for static memory allocation, heap for dynamic allocation.",
        "student_answer": "Stack memory is for function calls and local variables, heap is for dynamic memory allocation."
    },
    {
    "question": "Write a C program to find the factorial of a given number using recursion.",
    "model_answer": "#include <stdio.h>\n\n// Function to calculate factorial recursively\nint factorial(int n) {\n    if (n == 0) {\n        return 1;  // Base case\n    } else {\n        return n * factorial(n - 1);  // Recursive call\n    }\n}\n\nint main() {\n    int num;\n    printf(\"Enter a positive integer: \");\n    scanf(\"%d\", &num);\n\n    if (num < 0) {\n        printf(\"Factorial is not defined for negative numbers.\\n\");\n    } else {\n        printf(\"Factorial of %d is %d\\n\", num, factorial(num));\n    }\n\n    return 0;\n}",
    "student_answer": "#include <stdio.h>\n\nint fact(int n) {\n    if (n == 1) {\n        return 1;\n    } else {\n        return n * fact(n - 1);\n    }\n}\n\nint main() {\n    int n;\n    scanf(\"%d\", &n);\n    printf(\"%d\\n\", fact(n));\n    return 0;\n}"
   }
]

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
        "feedback": None
    }

    result = graph.invoke(input_data)

    print(f"Score: {result.get('score')}")
    print(f"Feedback: {result.get('feedback')}")
    print(f"Method: {result.get('method', 'LangGraph')}")
    print(f"Retry Count: {result.get('retry_count', 0)}")
    print("----------------------------")
