"""
Check if workers table has experience column
"""
import mysql.connector
from backend.config import Config

def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=Config.MYSQL_HOST,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            database=Config.MYSQL_DATABASE,
            port=Config.MYSQL_PORT
        )
        return conn
    except mysql.connector.Error as e:
        print(f"[ERROR] Error connecting to database: {e}")
        return None

def main():
    print("\n" + "="*60)
    print("Checking Workers Table Structure")
    print("="*60 + "\n")
    
    conn = get_db_connection()
    if not conn:
        print("[ERROR] Failed to connect to database.")
        return
    
    cursor = conn.cursor()
    
    try:
        # Check table structure
        cursor.execute("DESCRIBE workers")
        columns = cursor.fetchall()
        
        print("Workers table columns:")
        print("-" * 60)
        has_experience = False
        for col in columns:
            print(f"  - {col[0]} ({col[1]})")
            if col[0] == 'experience':
                has_experience = True
        
        print()
        if not has_experience:
            print("[WARNING] 'experience' column not found!")
            print("[INFO] Adding experience column...")
            try:
                cursor.execute("ALTER TABLE workers ADD COLUMN experience INT DEFAULT 0 AFTER is_blocked")
                conn.commit()
                print("[OK] Experience column added successfully!")
            except mysql.connector.Error as e:
                print(f"[ERROR] Failed to add column: {e}")
        else:
            print("[OK] Experience column exists!")
        
        print("\n" + "="*60)
        print("[OK] Workers table is ready!")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"[ERROR] Error: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()

