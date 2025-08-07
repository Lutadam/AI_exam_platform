# services/student/student_exam_service.py

from db.mysql_connect import get_connection

def create_or_activate_student_exam(user_id: int, exam_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO StudentExam (UserId, ExamId, Status, StartedAt)
        VALUES (%s, %s, 'active', NOW())
        ON DUPLICATE KEY UPDATE Status='active', StartedAt=NOW()
    """, (user_id, exam_id))
    conn.commit()
    cursor.close()
    conn.close()

def update_exam_status(user_id: int, exam_id: int, new_status: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE StudentExam SET Status=%s, SubmittedAt=NOW()
        WHERE UserId=%s AND ExamId=%s
    """, (new_status, user_id, exam_id))
    conn.commit()
    cursor.close()
    conn.close()

def get_student_exams(user_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT 
    e.ExamId,
    e.Title,
    m.ModuleName,
    se.Status,
    e.Duration,
    COALESCE(sq.TotalQuestions, 0) AS TotalQuestions,
    COALESCE(sa.Score, 0) AS Score,
    COALESCE(sq.TotalMark, 0) AS TotalMark,
    ROUND(
        COALESCE(sa.Score, 0) / NULLIF(sq.TotalMark, 0) * 100, 
        2
    ) AS Percentage,
    CASE 
        WHEN se.Status = 'completed' THEN 1
        ELSE 0
    END AS Attempts
FROM studentexam se
JOIN exam e ON se.ExamId = e.ExamId
JOIN module m ON e.ModuleId = m.ModuleId

LEFT JOIN (
    SELECT ExamId, SUM(QuestionMark) AS TotalMark, COUNT(*) AS TotalQuestions
    FROM question
    GROUP BY ExamId
) sq ON sq.ExamId = e.ExamId

LEFT JOIN (
    SELECT ExamId, UserId, SUM(Score) AS Score
    FROM studentanswer
    WHERE IsFinalized = 1
    GROUP BY ExamId, UserId
) sa ON sa.ExamId = e.ExamId AND sa.UserId = se.UserId

WHERE se.UserId =%s
  AND se.Status IN ('active', 'upcoming', 'pending', 'completed');""", (user_id,))
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    return result



