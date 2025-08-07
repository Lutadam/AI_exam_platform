from db.mysql_connect import get_connection
from mysql.connector import Error

# 1. Get all exams with student attempts and scores (no status filter)
def get_all_exams_with_student_progress(user_id: int):
    conn = get_connection()
    exams = []
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            query = """
                SELECT 
                    e.ExamId,
                    e.Title,
                    e.Description,
                    e.Duration,
                    e.Status AS ExamStatus,
                    m.ModuleName,
                    COALESCE(sa.Attempts, 0) AS Attempts,
                    COALESCE(sa.Score, NULL) AS Score,
                    (SELECT COUNT(*) FROM question q WHERE q.ExamId = e.ExamId) AS TotalQuestions,
                    se.Status AS StudentExamStatus  -- This is the student's per-exam status
                FROM exam e
                JOIN module m ON e.ModuleId = m.ModuleId
                LEFT JOIN (
                    SELECT ExamId, COUNT(*) AS Attempts, MAX(Score) AS Score
                    FROM studentanswer
                    WHERE UserId = %s AND IsFinalized = 1
                    GROUP BY ExamId
                ) sa ON sa.ExamId = e.ExamId
                LEFT JOIN StudentExam se ON se.ExamId = e.ExamId AND se.UserId = %s
            """
            cursor.execute(query, (user_id, user_id))
            exams = cursor.fetchall()
        finally:
            cursor.close()
            conn.close()
    return exams

# 2. Get all questions for a specific exam
def get_questions_for_exam(exam_id: int):
    conn = get_connection()
    questions = []
    print(f"Fetching questions for ExamId={exam_id}")
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            query = "SELECT * FROM question WHERE ExamId = %s"
            cursor.execute(query, (exam_id,))
            questions = cursor.fetchall()
            print(f"Fetched questions count: {len(questions)}")
        finally:
            cursor.close()
            conn.close()
    return questions

# 3. Submit student's answer
def submit_student_answer(user_id: int, exam_id: int, question_id: int, answer: str, is_finalized: bool, score: float, feedback:str):
    conn = get_connection()
    if conn:
        try:
            cursor = conn.cursor()
            query = """
                INSERT INTO studentanswer (UserId, ExamId, QuestionId, StdAnswer, IsFinalized, Score, feedback)
                VALUES (%s, %s, %s, %s, %s,%s,%s)
            """
            cursor.execute(query, (user_id, exam_id, question_id, answer, is_finalized, score, feedback))
            conn.commit()
        finally:
            cursor.close()
            conn.close()

def update_student_answer(user_id: int, exam_id: int, question_id: int, answer: str, is_finalized: bool, score: float, feedback:str):
    conn = get_connection()
    if conn:
        try:
            cursor = conn.cursor()
            query = """
                UPDATE studentanswer 
                SET StdAnswer = %s, IsFinalized = %s, Score = %s, feedback = %s
                WHERE UserId = %s AND ExamId = %s AND QuestionId = %s
            """
            cursor.execute(query, (answer, is_finalized, score, feedback, user_id, exam_id, question_id))
            conn.commit()
        finally:
            cursor.close()
            conn.close()

# 4. Get results for a completed exam
def get_exam_results(user_id: int, exam_id: int):
    conn = get_connection()
    results = []
    if conn:
        try:
            cursor = conn.cursor(dictionary=True)
            query = """
                SELECT q.QuestionName, sa.StdAnswer, sa.Score, sa.Feedback
                FROM studentanswer sa
                JOIN question q ON sa.QuestionId = q.QuestionId
                WHERE sa.UserId = %s AND sa.ExamId = %s AND sa.IsFinalized = 1
            """
            cursor.execute(query, (user_id, exam_id))
            results = cursor.fetchall()
        finally:
            cursor.close()
            conn.close()
    return results

# 5. Check if student has already completed the exam
def is_exam_completed(user_id: int, exam_id: int):
    conn = get_connection()
    completed = False
    if conn:
        try:
            cursor = conn.cursor()
            query = """
                SELECT COUNT(*) FROM studentanswer 
                WHERE UserId = %s AND ExamId = %s AND IsFinalized = 1
            """
            cursor.execute(query, (user_id, exam_id))
            (count,) = cursor.fetchone()
            completed = count > 0
        finally:
            cursor.close()
            conn.close()
    return completed

def get_module_name_by_exam_id(exam_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT m.ModuleName
        FROM Exam e
        JOIN Module m ON e.ModuleId = m.ModuleId
        WHERE e.ExamId = %s
    """
    cursor.execute(query, (exam_id,))
    result = cursor.fetchone()
    cursor.close()
    if not result:
        raise ValueError("Module not found for given exam ID")
    return result["ModuleName"]

def get_question_with_model_answer(question_id: int) -> dict | None:
    conn = get_connection()
    query = """
    SELECT QuestionName, ModelAnswer 
    FROM Question 
    WHERE QuestionId = %s
    """
    cursor = conn.cursor(dictionary=True)
    cursor.execute(query, (question_id,))
    result = cursor.fetchone()
    cursor.close()
    return result

def is_all_questions_graded(user_id: int, exam_id: int) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Count total questions for the exam
        cursor.execute("SELECT COUNT(*) FROM question WHERE ExamId = %s", (exam_id,))
        (total_questions,) = cursor.fetchone()

        # Count finalized answers by the student for that exam
        cursor.execute("""
            SELECT COUNT(*) FROM studentanswer 
            WHERE UserId = %s AND ExamId = %s AND IsFinalized = 1
        """, (user_id, exam_id))
        (finalized_count,) = cursor.fetchone()

        return total_questions == finalized_count
    finally:
        cursor.close()
        conn.close()