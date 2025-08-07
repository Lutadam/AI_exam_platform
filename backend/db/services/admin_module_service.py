from db.mysql_connect import get_connection

def get_all_modules():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM module")
    modules = cursor.fetchall()
    conn.close()
    return modules

def create_module(module_name: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO module (ModuleName) VALUES (%s)", (module_name,))
    conn.commit()
    conn.close()

def update_module(module_id: int, module_name: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE module SET ModuleName = %s WHERE ModuleId = %s", (module_name, module_id))
    conn.commit()
    conn.close()

def delete_module(module_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM module WHERE ModuleId = %s", (module_id,))
    conn.commit()
    conn.close()
