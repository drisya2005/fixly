"""
Fix Complaints Table Schema
Update complaints table to match expected schema
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
    print("Fixing Complaints Table Schema")
    print("="*60 + "\n")
    
    conn = get_db_connection()
    if not conn:
        print("[ERROR] Failed to connect to database.")
        return
    
    cursor = conn.cursor()
    
    try:
        # Check current structure
        cursor.execute("SHOW COLUMNS FROM complaints")
        columns = {col[0]: col[1] for col in cursor.fetchall()}
        print("Current columns:", list(columns.keys()))
        
        # Add complaint_text if it doesn't exist (rename description if exists)
        if 'description' in columns and 'complaint_text' not in columns:
            print("\n[INFO] Renaming 'description' to 'complaint_text'...")
            cursor.execute("ALTER TABLE complaints CHANGE COLUMN description complaint_text TEXT NOT NULL")
            print("[OK] Column renamed")
        
        # Add resolved_at if it doesn't exist
        if 'resolved_at' not in columns:
            print("\n[INFO] Adding 'resolved_at' column...")
            cursor.execute("ALTER TABLE complaints ADD COLUMN resolved_at TIMESTAMP NULL AFTER status")
            print("[OK] Column added")
        
        # Remove booking_id if it exists (not needed for our schema)
        if 'booking_id' in columns:
            print("\n[INFO] Removing 'booking_id' column (not needed)...")
            try:
                cursor.execute("ALTER TABLE complaints DROP COLUMN booking_id")
                print("[OK] Column removed")
            except:
                print("[WARNING] Could not remove booking_id (may have foreign key)")
        
        conn.commit()
        
        # Verify final structure
        cursor.execute("SHOW COLUMNS FROM complaints")
        final_columns = [col[0] for col in cursor.fetchall()]
        print("\n" + "="*60)
        print("[OK] Complaints table structure updated!")
        print("="*60)
        print("Final columns:", final_columns)
        print("\nExpected columns:")
        print("  - id")
        print("  - user_id")
        print("  - worker_id")
        print("  - complaint_text")
        print("  - status")
        print("  - created_at")
        print("  - resolved_at")
        print()
        
    except mysql.connector.Error as e:
        print(f"[ERROR] Database error: {e}")
        conn.rollback()
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()

