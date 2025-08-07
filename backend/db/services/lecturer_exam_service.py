from db.mysql_connect import get_connection
from typing import List, Dict, Any

def get_all_exams():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT e.ExamId, e.Title, e.Description, e.Duration, e.Status, e.CreatedAt, m.ModuleName, COUNT(q.QuestionId) AS QuestionCount
        FROM exam e
        JOIN module m ON e.ModuleId = m.ModuleId
        LEFT JOIN question q ON e.ExamId = q.ExamId
        GROUP BY e.ExamId
    """)
    exams = cursor.fetchall()
    conn.close()
    return exams

def get_total_students():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM user WHERE UserRoleId = 3")
    count = cursor.fetchone()[0]
    conn.close()
    return count

def add_question(exam_id: int, data: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
    # Make sure all keys exist in data and types match your DB columns
    cursor.execute("""
        INSERT INTO question (QuestionName, QuestionMark, ModelAnswer, ModuleId, ExamId)
        VALUES (%s, %s, %s, %s, %s)
    """, (
        data.get("question"),
        data.get("points"),
        data.get("modelAnswer", ""),
        data.get("moduleId"),
        exam_id
    ))
    conn.commit()
    conn.close()
    return {"message": "Question added successfully"}

def delete_exam_with_auth(exam_id: int, username: str, password: str):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # Authenticate lecturer
    cursor.execute("""
        SELECT * FROM user WHERE Username = %s AND Password = %s AND UserRoleId = 2
    """, (username, password))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return None
    
    cursor.execute("DELETE FROM studentexam WHERE ExamId = %s", (exam_id,))
    cursor.execute("DELETE FROM question WHERE ExamId = %s", (exam_id,))

    # Delete all questions related to this exam first
    cursor.execute("DELETE FROM question WHERE ExamId = %s", (exam_id,))

    # Now delete the exam
    cursor.execute("DELETE FROM exam WHERE ExamId = %s", (exam_id,))

    conn.commit()
    conn.close()
    return {"message": "Exam deleted"}


def get_questions_with_module_by_exam_id(exam_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT q.QuestionId, q.QuestionName, q.QuestionMark, q.ModelAnswer, m.ModuleName
        FROM question q
        JOIN module m ON q.ModuleId = m.ModuleId
        WHERE q.ExamId = %s
    """, (exam_id,))
    questions = cursor.fetchall()
    conn.close()
    return questions

def create_exam(exam_data: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO exam (ModuleId, Title, Description, Duration, Status)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (
            exam_data["moduleId"],
            exam_data["title"],
            exam_data["description"],
            exam_data["duration"],
            exam_data["status"],
        )
        
    )
    exam_id = cursor.lastrowid

    cursor.execute("SELECT UserId from user WHERE UserRoleId=3")
    students = cursor.fetchall()

    for (student_id,) in students:
        cursor.execute(
            """
            INSERT INTO studentexam (UserId, ExamId, Status, StartedAt, SubmittedAt)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (student_id, exam_id, exam_data["status"], None, None)
        )
    conn.commit()
    conn.close()
    return exam_id

def add_questions_to_exam(exam_id: int, questions: List[Dict[str, Any]]):
    conn = get_connection()
    cursor = conn.cursor()

    for q in questions:
        # q is a dict here (from Pydantic model converted to dict on FastAPI side)
        # Make sure the keys are exactly as expected
        cursor.execute("""
            INSERT INTO question (QuestionName, QuestionMark, ModelAnswer, ExamId, ModuleId)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            q.get("questionName"),
            q.get("questionMark"),
            q.get("modelAnswer", ""),
            exam_id,
            q.get("moduleId")  # IMPORTANT: moduleId must be present in question payload or fixed logic needed
        ))

    conn.commit()
    conn.close()

def get_modules():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT ModuleId, ModuleName FROM module")
    modules = cursor.fetchall()
    conn.close()
    return modules

def get_exam_by_id(exam_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM exam WHERE ExamId = %s", (exam_id,))
    exam = cursor.fetchone()

    cursor.execute("""
        SELECT QuestionId, QuestionName, QuestionMark, ModelAnswer
        FROM question
        WHERE ExamId = %s
    """, (exam_id,))
    questions = cursor.fetchall()

    conn.close()
    return {"exam": exam, "questions": questions}

def update_exam(exam_id: int, title: str, description: str, duration: int, status: str):
    conn = get_connection()
    cursor = conn.cursor()
    query = """
    UPDATE exam
    SET Title = %s,
        Description = %s,
        Duration = %s,
        Status = %s
    WHERE ExamId = %s
    """
    cursor.execute(query, (title, description, duration, status, exam_id))

    update_studentexam_status_query = """
    UPDATE studentexam
    SET Status = %s
    WHERE ExamId = %s
    """
    cursor.execute(update_studentexam_status_query, (status, exam_id))
    
    conn.commit()
    conn.close()

def update_exam_questions(exam_id: int, questions: List[Dict[str, Any]]):
    conn = get_connection()
    cursor = conn.cursor()

    # Delete old questions first
    cursor.execute("DELETE FROM question WHERE ExamId = %s", (exam_id,))

    # Insert new questions
    for q in questions:
        cursor.execute("""
            INSERT INTO question (QuestionName, QuestionMark, ModelAnswer, ModuleId, ExamId)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            q.get("questionName"),
            q.get("questionMark"),
            q.get("modelAnswer", ""),
            q.get("moduleId"),
            exam_id
        ))

    conn.commit()
    conn.close()

def delete_question(question_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM question WHERE QuestionId = %s", (question_id,))
    conn.commit()
    conn.close()

def get_exam_results(exam_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT 
            u.Username AS studentName,
            u.UserId,
            se.Status,
            se.StartedAt,
            se.SubmittedAt,
            TIMESTAMPDIFF(MINUTE, se.StartedAt, se.SubmittedAt) AS timeSpent,
            COALESCE(SUM(sa.Score), 0) AS totalScore,
            ROUND(
                COALESCE(SUM(sa.Score), 0) / NULLIF(SUM(q.QuestionMark), 0) * 100,
                2
            ) AS percentage
        FROM studentexam se
        JOIN `user` u ON se.UserId = u.UserId
        LEFT JOIN studentanswer sa ON se.ExamId = sa.ExamId AND se.UserId = sa.UserId
        LEFT JOIN question q ON q.ExamId = se.ExamId
        WHERE se.ExamId = %s
        GROUP BY se.UserId, se.StartedAt, se.SubmittedAt, u.Username, u.UserId, se.Status
    """, (exam_id,))

    results = cursor.fetchall()
    conn.close()
    return results

