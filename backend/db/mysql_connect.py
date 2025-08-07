# backend/db/mysql_connect.py

import mysql.connector
from mysql.connector import Error

def get_connection():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="Lut@1511",
            database="exam_platform"
    )
        return conn
    except Error as e:
        print(f"[DB ERROR] {e}")
        return None
