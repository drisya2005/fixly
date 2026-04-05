"""
Setup Notifications Table
Creates the notifications table if it doesn't exist.
"""
import mysql.connector
from backend.config import Config

def get_db_connection():
    """Create a direct database connection"""
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
    print("Setting up Notifications Table")
    print("="*60 + "\n")
    
    conn = get_db_connection()
    if not conn:
        print("[ERROR] Failed to connect to database. Check your .env file.")
        return
    
    cursor = conn.cursor()
    
    try:
        # Create notifications table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
              id INT AUTO_INCREMENT PRIMARY KEY,
              worker_id INT NOT NULL,
              message TEXT NOT NULL,
              is_read TINYINT(1) DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
              INDEX idx_worker_unread (worker_id, is_read)
            )
        """)
        
        conn.commit()
        print("[OK] Notifications table created/verified successfully!")
        print("\n" + "="*60)
        print("[OK] Setup complete!")
        print("="*60 + "\n")
        print("Notifications will be automatically created when users book appointments.\n")
        
    except mysql.connector.Error as e:
        print(f"[ERROR] Error: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()

