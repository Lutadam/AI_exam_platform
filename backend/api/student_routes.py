from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from typing import List, Dict
from db.services import student_service, student_exam_service 
from backtask.bgtask import process_grading
from grader.model_router import route_model
from pydantic import BaseModel
from concurrent.futures import ThreadPoolExecutor
import traceback

router = APIRouter(prefix="/student", tags=["Student"])

executor = ThreadPoolExecutor(max_workers=1)

# 1. Get all exams with progress info (no filtering — frontend handles it)
@router.get("/exams/all")
def get_all_exams(user_id: int):
    try:
        exams = student_service.get_all_exams_with_student_progress(user_id)
        return exams
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. Get all questions for an exam
@router.get("/exams/{exam_id}/questions", response_model=List[Dict])
def get_exam_questions(exam_id: int):
    try:
        print(f"Received request for exam questions with ExamId={exam_id}")
        questions = student_service.get_questions_for_exam(exam_id)
        if not questions:
            raise HTTPException(status_code=404, detail="No questions found for this exam")
        return questions
    except Exception as e:
        print(f"Error fetching questions for ExamId={exam_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 3. Submit an answer for a question
class SubmitAnswerRequest(BaseModel):
    user_id: int
    exam_id: int
    question_id: int
    studentAnswer: str
    is_finalized: bool = False

# @router.post("/submit")
# def submit_answer(data: dict):
#     try:
#         print("Received data:", data)
#         student_service.submit_student_answer(
#             user_id=data["user_id"],
#             exam_id=data["exam_id"],
#             question_id=data["question_id"],
#             answer=data["studentAnswer"],
#             is_finalized=data.get("is_finalized", False),
#             score= 0,
#             feedback= None
#         )

#         if data.get("is_finalized"):
#             question_data = student_service.get_question_with_model_answer(data["question_id"])
#             if not question_data:
#                 raise ValueError(f"No question data found for question_id {data['question_id']}")

#             student_answer = data["studentAnswer"]
#             module_name = student_service.get_module_name_by_exam_id(data["exam_id"])
#             if not module_name:
#                 raise ValueError(f"No module name found for exam_id {data['exam_id']}")

#             graph = route_model(module_name)
#             input_data = {
#                 "question": question_data["QuestionName"],
#                 "student_answer": student_answer,
#                 "model_answer": question_data["ModelAnswer"]
#             }

#             result = graph.invoke(input_data)
#             print("LLM grading result:", result)

#             total_score = (result["score"] / 10) * data["question_mark"]

#             student_service.update_student_answer(
#                 user_id=data["user_id"],
#                 exam_id=data["exam_id"],
#                 question_id=data["question_id"],
#                 answer = data["studentAnswer"],
#                 is_finalized=data["is_finalized"],
#                 score=total_score,
#                 feedback=result["feedback"]
#             )
#             if student_service.is_all_questions_graded(data["user_id"], data["exam_id"]):
#                 student_exam_service.update_exam_status(data["user_id"], data["exam_id"], "completed")
#             else:
#                 student_exam_service.update_exam_status(data["user_id"], data["exam_id"], "pending")

#         return {"message": "Answer submitted"}
#     except Exception as e:
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=str(e))

@router.post("/submit")
def submit_answer(data: dict, background_tasks: BackgroundTasks):
    try:
        print("Received data:", data)

        # Save initial answer (draft or final)
        student_service.submit_student_answer(
            user_id=data["user_id"],
            exam_id=data["exam_id"],
            question_id=data["question_id"],
            answer=data["studentAnswer"],
            is_finalized=data.get("is_finalized", False),
            score=0,
            feedback=None
        )
        
        student_exam_service.update_exam_status(data["user_id"], data["exam_id"], "pending")
        
        # Run grading only in background if finalized
        if data.get("is_finalized"):
            background_tasks.add_task(process_grading, data)
            # executor.submit(process_grading, data)
            print("[Main Thread] Submitted grading task to executor")

        return {"message": "Answer submitted"}  # ✅ Immediate response
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# 4. Get results for a completed exam
@router.get("/results/{exam_id}")
def get_results_for_exam(exam_id: int, user_id: int):
    try:
        results = student_service.get_exam_results(user_id, exam_id)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 5. Check if a student has completed an exam
@router.get("/exams/{exam_id}/completed")
def check_exam_completion(exam_id: int, user_id: int):
    try:
        completed = student_service.is_exam_completed(user_id, exam_id)
        return {"completed": completed}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/exam/{exam_id}/module")
def get_module_name_by_exam_id(exam_id: int):
    try:
        module_name = student_service.get_module_name_by_exam_id(exam_id)
        return {"module_name": module_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


