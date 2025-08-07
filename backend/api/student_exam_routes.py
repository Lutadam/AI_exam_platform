# routes/student/student_exam_routes.py

from fastapi import APIRouter, HTTPException
from db.services import student_exam_service

router = APIRouter()

@router.post("/student/exam/start")
def start_exam(user_id: int, exam_id: int):
    student_exam_service.create_or_activate_student_exam(user_id, exam_id)
    return {"message": "Exam started"}

@router.post("/student/exam/submit")
def submit_exam(user_id: int, exam_id: int):
    student_exam_service.update_exam_status(user_id, exam_id, "pending")
    return {"message": "Exam submitted and now pending"}

@router.get("/student/exams/{user_id}")
def get_student_exams(user_id: int):
    exams = student_exam_service.get_student_exams(user_id)
    return exams
