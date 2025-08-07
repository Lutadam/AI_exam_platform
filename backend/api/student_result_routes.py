from fastapi import APIRouter
from db.services import student_result_service

router = APIRouter()

@router.get("/student/results/{user_id}/{exam_id}")
def get_student_exams(user_id: int, exam_id: int):
    exams = student_result_service.get_student_results(user_id, exam_id)
    return exams
