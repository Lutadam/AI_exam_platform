# grader/modules/c_programming/langraph.py

from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from typing import TypedDict, Optional

from grader.modules.c_programming.rag_pipeline import grade_with_deepseek

class GraphState(TypedDict):
    question: str
    student_answer: str
    model_answer: str
    score: Optional[float]
    feedback: Optional[str]
    retry_count: int

def grading_tool(state: GraphState) -> GraphState:
    question = state.get('question')
    student_answer = state.get('student_answer')
    model_answer = state.get('model_answer') or ""

    if not question:
        raise ValueError("Missing question or student answer in the state: " + str(state))

    result = grade_with_deepseek(question, model_answer, student_answer)

    return {
        **state,
        "score": result.get("score"),
        "feedback": result.get("feedback")
    }

RETRY_LIMIT = 3
def reflect(state: GraphState) -> str:
    score = state.get("score")
    retry = state.get("retry_count", 0)
    if score is None or (score < 4 and retry < RETRY_LIMIT):
        return "retry"
    return "end"

def refine(state: GraphState) -> GraphState:
    return {
        **state,
        "retry_count": state.get("retry_count", 0) + 1
    }

builder = StateGraph(GraphState)
builder.add_node("grade", grading_tool)
builder.add_node("refine", refine)

builder.set_entry_point("grade")
builder.add_conditional_edges(
    "grade",
    reflect,
    {
        "retry": "refine",
        "end": END
    }
)
builder.add_edge("refine", "grade")

graph = builder.compile()
