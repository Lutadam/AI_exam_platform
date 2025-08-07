from db.mysql_connect import get_connection

def verify_user_credentials(username: str, password: str) -> bool:
    conn = get_connection()
    if not conn:
        return False

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT * FROM user WHERE Username = %s AND Password = %s",
            (username, password),
        )
        user = cursor.fetchone()
        return user is not None
    finally:
        cursor.close()
        conn.close()
