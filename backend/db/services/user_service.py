from fastapi import HTTPException
from db.mysql_connect import get_connection

def authenticate_user(username: str, password: str):
    conn = get_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
        SELECT u.UserId, u.Username, u.UserRoleId, r.userRole
        FROM user u
        JOIN userrole r ON u.UserRoleId = r.UserRoleId
        WHERE u.Username = %s AND u.Password = %s
                       """, (username, password))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        return user

    finally:
        cursor.close()
        conn.close()
