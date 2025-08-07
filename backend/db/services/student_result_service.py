from db.mysql_connect import get_connection

def get_student_results(user_id: int, exam_id: int):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT *
        FROM StudentAnswer sa
        JOIN exam e ON sa.ExamId = e.ExamId
        JOIN question q ON sa.QuestionId = q.QuestionId
        JOIN module m ON e.ModuleId = m.ModuleId
        WHERE sa.UserId = %s AND e.ExamId = %s;
    """, (user_id, exam_id))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    if not rows:
        return {}

    # Initialize totals
    total_mark = 0
    score_obtained = 0

    exam_info = {
        "Title": rows[0]["Title"],
        "Description": rows[0]["Description"],
        "ModuleId": rows[0]["ModuleId"],
        "Questions": [],
        "ModuleName": rows[0]["ModuleName"]
    }

    for row in rows:
        question_mark = row["QuestionMark"] or 0
        question_score = row["Score"] or 0

        total_mark += question_mark
        score_obtained += question_score

        question = {
            "QuestionId": row["QuestionId"],
            "QuestionName": row["QuestionName"],
            "QuestionMark": question_mark,
            "ModelAnswer": row["ModelAnswer"],
            "StdAnswer": row["StdAnswer"],
            "Feedback": row["Feedback"],
            "Score": question_score
        }
        exam_info["Questions"].append(question)

    percentage = (score_obtained / total_mark * 100) if total_mark > 0 else 0

    # Add total and percentage
    exam_info["TotalMark"] = total_mark
    exam_info["Score"] = score_obtained
    exam_info["Percentage"] = round(percentage, 2)

    return exam_info