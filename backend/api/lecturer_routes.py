from fastapi import APIRouter, Request, HTTPException, Body
from fastapi.responses import JSONResponse
from db.services import lecturer_exam_service
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

# ========================== MODELS ==========================

class ExamCreate(BaseModel):
    title: str
    description: str
    duration: int
    status: str
    moduleId: int

class QuestionCreate(BaseModel):
    questionName: str
    questionMark: int
    modelAnswer: Optional[str] = None
    moduleId: int  # Added moduleId here to match DB insert expectations

# ========================== ROUTES ==========================

# Get all exams and student count
@router.get("/lecturer/exams")
def get_exams():
    exams = lecturer_exam_service.get_all_exams()
    student_count = lecturer_exam_service.get_total_students()
    return {"exams": exams, "totalStudents": student_count}

# Create a new exam
@router.post("/lecturer/exams")
def create_exam_route(exam: ExamCreate):
    exam_data = exam.dict()
    exam_id = lecturer_exam_service.create_exam(exam_data)
    return {"examId": exam_id}

# Add questions to exam (bulk)
@router.post("/lecturer/exams/{exam_id}/questions")
def add_questions_route(exam_id: int, questions: List[QuestionCreate]):
    questions_data = [q.dict() for q in questions]
    lecturer_exam_service.add_questions_to_exam(exam_id, questions_data)
    return {"message": "Questions added successfully"}

# Add single question
@router.post("/lecturer/exams/{exam_id}/questions/add-one")
async def add_single_question(exam_id: int, request: Request):
    data = await request.json()
    # Validate keys for required fields
    if not all(k in data for k in ("questionName", "questionMark", "moduleId")):
        raise HTTPException(status_code=400, detail="Missing question fields")
    result = lecturer_exam_service.add_question(exam_id, data)
    return result

# Get questions with module info
@router.get("/lecturer/exams/{exam_id}/questions")
def get_questions_with_module_by_exam_id(exam_id: int):
    questions = lecturer_exam_service.get_questions_with_module_by_exam_id(exam_id)
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this exam.")
    return {"questions": questions}

# Get exam by ID (with questions)
@router.get("/lecturer/exams/{exam_id}")
def get_exam_details(exam_id: int):
    exam_data = lecturer_exam_service.get_exam_by_id(exam_id)
    if not exam_data["exam"]:
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam_data

# Update exam metadata
@router.put("/lecturer/exams/{exam_id}")
def update_exam(exam_id: int, payload: dict = Body(...)):
    title = payload.get("title")
    description = payload.get("description")
    duration = payload.get("duration")
    status = payload.get("status")

    if not all([title, description, duration, status]):
        raise HTTPException(status_code=400, detail="Missing fields")

    lecturer_exam_service.update_exam(exam_id, title, description, duration, status)
    return {"message": "Exam updated"}

# Update questions (replace all)
@router.put("/lecturer/exams/{exam_id}/questions")
def update_questions(exam_id: int, payload: List[dict] = Body(...)):
    # Optional: validate that each dict has required keys
    for q in payload:
        if not all(k in q for k in ("questionName", "questionMark", "moduleId")):
            raise HTTPException(status_code=400, detail="Missing question fields")
    lecturer_exam_service.update_exam_questions(exam_id, payload)
    return {"message": "Questions updated"}

# Delete a specific question
@router.delete("/lecturer/questions/{question_id}")
def delete_question(question_id: int):
    lecturer_exam_service.delete_question(question_id)
    return {"message": "Question deleted"}

# Delete exam with re-authentication
@router.post("/lecturer/exams/{exam_id}/delete")
async def delete_exam(exam_id: int, request: Request):
    data = await request.json()
    username = data.get("username")
    password = data.get("password")
    
    if not username or not password:
        raise HTTPException(status_code=400, detail="Missing credentials")

    result = lecturer_exam_service.delete_exam_with_auth(exam_id, username, password)
    
    if not result:
        return JSONResponse(status_code=401, content={"error": "Invalid lecturer credentials"})
    
    return {"message": "Exam deleted successfully"}

# Get module list
@router.get("/modules")
def get_modules_route():
    modules = lecturer_exam_service.get_modules()
    return {"modules": modules}

@router.get("/lecturer/exams/{exam_id}/results")
def get_exam_results_route(exam_id: int):
    results = lecturer_exam_service.get_exam_results(exam_id)
    
    if not results:
        raise HTTPException(status_code=404, detail="No results found for this exam.")
    
    return {"results": results} 

 