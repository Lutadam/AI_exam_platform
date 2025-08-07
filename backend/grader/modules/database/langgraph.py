#langraph.py
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from typing import TypedDict, Optional

from grader.modules.database.rag_pipeline import grade_with_mistral, generate_prompt  # your existing functions

# Define state class
class GraphState(TypedDict):
    question: str
    student_answer: str
    model_answer: str  # Added model_answer to the state
    score: Optional[float]
    feedback: Optional[str]
    retry_count: int

# ToolNode using your rag_pipeline logic
def grading_tool(state: GraphState) -> GraphState:
    question = state.get('question')
    student_answer = state.get('student_answer')
    model_answer = state.get('model_answer') or ""  # allow blank string if not provided

    if not question:
        raise ValueError("Missing question or student answer in the state: " + str(state))

    # Let grade_with_llama handle the logic, even if model_answer is blank
    result = grade_with_mistral(question, model_answer, student_answer)

    return {
        **state,
        "score": result.get("score"),
        "feedback": result.get("feedback")
    }

# Reflect function: decide if retry is needed based on score
RETRY_LIMIT = 3
def reflect(state: GraphState) -> str:
    score = state.get("score")
    retry = state.get("retry_count", 0)
    if score is None or (score < 4 and retry < RETRY_LIMIT):
        return "retry"
    return "end"

# Refine function: improve prompt or handling
def refine(state: GraphState) -> GraphState:
    return {
        **state,
        "retry_count": state.get("retry_count", 0) + 1
    }

# Build LangGraph
builder = StateGraph(GraphState)
builder.add_node("grade", grading_tool)
builder.add_node("refine", refine)

# Add edges
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

# Compile the graph
graph = builder.compile()

