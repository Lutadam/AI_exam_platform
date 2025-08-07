from db.mysql_connect import get_connection

def get_all_users():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT u.UserId, u.Username, u.UserRoleId, r.UserRole
        FROM user u
        JOIN userrole r ON u.UserRoleId = r.UserRoleId
    """)
    users = cursor.fetchall()
    conn.close()
    return users

def create_user(username: str, password: str, role_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO user (Username, Password, UserRoleId) VALUES (%s, %s, %s)", (username, password, role_id))
    conn.commit()
    conn.close()

def update_user(user_id: int, username: str, password: str, role_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE user 
        SET Username = %s, Password = %s, UserRoleId = %s 
        WHERE UserId = %s
    """, (username, password, role_id, user_id))
    conn.commit()
    conn.close()

def delete_user(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM user WHERE UserId = %s", (user_id,))
    conn.commit()
    conn.close()
