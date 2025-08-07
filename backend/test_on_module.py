from grader.model_router import route_model

# module_name = "Python programming "
# graph = route_model(module_name)

# input_data = {
#     "question": "What is a list in Python?",
#     "student_answer": "A list is used to store multiple items in one variable.",
#     "model_answer": "In Python, a list is a built-in data type that is used to store multiple items. Lists are mutable.",
#     # "retry_count": 0
# }

# module_name = "Database Module"
# graph = route_model(module_name)

# input_data = {
#     "question": "What is a foreign key in a database?",
#     "student_answer": "A foreign key is a field in a table that is a primary key in another table.",
#     "model_answer": "A foreign key is a field (or collection of fields) in one table that uniquely identifies a row of another table or the same table. The foreign key establishes a link between the data in the two tables.",
# }

module_name = "OOP Java Module"
graph = route_model(module_name)

input_data = {
    "question": "What is inheritance in Java?",
    "student_answer": "Inheritance is when a class acquires the properties and behaviors of another class.",
    "model_answer": "Inheritance in Java is a mechanism where one class inherits the fields and methods of another class using the 'extends' keyword, promoting code reuse.",
    # "retry_count": 0  # Optional, starts at 0 by default
}



result = graph.invoke(input_data)
print(f"\nScore: {result['score']}")
print(f"Feedback: {result['feedback']}")
print(f"Method: {result.get('method', 'LangGraph')}")
print(f"Retry Count: {result.get('retry_count', 0)}")
print("----------------------------")

