from db.services import student_service, student_exam_service
from grader.model_router import route_model

import threading


def process_grading(data: dict):
        print(f"[Grading Thread] Started in thread: {threading.current_thread().name}")
    
        question_data = student_service.get_question_with_model_answer(data["question_id"])
        if not question_data:
            raise ValueError(f"No question data found for question_id {data['question_id']}")

        student_answer = data["studentAnswer"]
        module_name = student_service.get_module_name_by_exam_id(data["exam_id"])
        if not module_name:
            raise ValueError(f"No module name found for exam_id {data['exam_id']}")

        graph = route_model(module_name)
        input_data = {
            "question": question_data["QuestionName"],
            "student_answer": student_answer,
            "model_answer": question_data["ModelAnswer"]
        }

        result = graph.invoke(input_data)
        print("LLM grading result:", result)

        total_score = (result["score"] / 10) * data["question_mark"]

        student_service.update_student_answer(
            user_id=data["user_id"],
            exam_id=data["exam_id"],
            question_id=data["question_id"],
            answer=data["studentAnswer"],
            is_finalized=data["is_finalized"],
            score=total_score,
            feedback=result["feedback"]
        )

        # Check if all questions are graded
        if student_service.is_all_questions_graded(data["user_id"], data["exam_id"]):
            student_exam_service.update_exam_status(data["user_id"], data["exam_id"], "completed")
        else:
            student_exam_service.update_exam_status(data["user_id"], data["exam_id"], "pending")
        
        print(f"[Grading Thread] Finished for question_id {data['question_id']}")

        print(f"Active threads: {[t.name for t in threading.enumerate()]}")

    # except Exception as e:
    #     print("Error in background grading:", str(e))
