"""
Setup Admin Features
Creates/updates database schema for admin features:
- Worker verification_status
- User status
- Complaints table
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
    print("Setting up Admin Features Database Schema")
    print("="*60 + "\n")
    
    conn = get_db_connection()
    if not conn:
        print("[ERROR] Failed to connect to database.")
        return
    
    cursor = conn.cursor()
    
    try:
        # Check and add verification_status to workers
        print("[INFO] Checking workers table...")
        cursor.execute("SHOW COLUMNS FROM workers LIKE 'verification_status'")
        if not cursor.fetchone():
            print("[INFO] Adding verification_status column to workers...")
            cursor.execute("""
                ALTER TABLE workers 
                ADD COLUMN verification_status ENUM('pending', 'approved', 'blocked') DEFAULT 'pending' AFTER is_blocked
            """)
            # Update existing workers to approved
            cursor.execute("UPDATE workers SET verification_status = 'approved' WHERE verification_status = 'pending'")
            print("[OK] verification_status column added and existing workers set to 'approved'")
        else:
            print("[OK] verification_status column already exists")
        
        # Check and add status to users
        print("\n[INFO] Checking users table...")
        cursor.execute("SHOW COLUMNS FROM users LIKE 'status'")
        if not cursor.fetchone():
            print("[INFO] Adding status column to users...")
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN status ENUM('active', 'blocked') DEFAULT 'active' AFTER pincode
            """)
            cursor.execute("UPDATE users SET status = 'active' WHERE status IS NULL")
            print("[OK] status column added and existing users set to 'active'")
        else:
            print("[OK] status column already exists")
        
        # Check and create complaints table
        print("\n[INFO] Checking complaints table...")
        cursor.execute("SHOW TABLES LIKE 'complaints'")
        if not cursor.fetchone():
            print("[INFO] Creating complaints table...")
            cursor.execute("""
                CREATE TABLE complaints (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  user_id INT NOT NULL,
                  worker_id INT NOT NULL,
                  complaint_text TEXT NOT NULL,
                  status ENUM('pending', 'resolved') DEFAULT 'pending',
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  resolved_at TIMESTAMP NULL,
                  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                  FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
                  INDEX idx_worker_complaints (worker_id, status),
                  INDEX idx_user_complaints (user_id)
                )
            """)
            print("[OK] complaints table created")
        else:
            print("[OK] complaints table already exists")
        
        conn.commit()
        
        print("\n" + "="*60)
        print("[OK] Admin features setup complete!")
        print("="*60 + "\n")
        print("[OK] Worker verification_status: pending/approved/blocked")
        print("[OK] User status: active/blocked")
        print("[OK] Complaints table: ready")
        print("\nNew workers will be set to 'pending' status.")
        print("Only 'approved' workers will be visible to users.\n")
        
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

