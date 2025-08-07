# backend/grader/model_router.py
from grader.modules.c_programming.langraph import graph as c_graph
from grader.modules.database.langgraph import graph as db_graph
from grader.modules.python_programming.langgraph import graph as python_graph
from grader.modules.risk_management.langgraph import graph as risk_graph
from grader.modules.oop_java.langgraph import graph as java_graph

SUPPORTED_MODULES = {
    "C Programming Module": c_graph,
    "Database Module": db_graph,
    "Python Programming": python_graph,
    "Risk management": risk_graph,
    "OOP Java Module": java_graph

}

def route_model(module_name: str):
    print("[DEBUG] Routing module:", module_name)
    print("[DEBUG] Available modules:", list(SUPPORTED_MODULES.keys()))

    if module_name not in SUPPORTED_MODULES:
        raise ValueError(f"Unsupported module: {module_name}. Supported modules: {list(SUPPORTED_MODULES.keys())}")
    
    return SUPPORTED_MODULES[module_name]