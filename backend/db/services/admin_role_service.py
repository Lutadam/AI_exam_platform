from db.mysql_connect import get_connection

def get_all_roles():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT UserRoleId, UserRole FROM userrole")
    roles = cursor.fetchall()
    conn.close()
    return roles