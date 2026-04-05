"""
Fix all user passwords to ensure they work with the test credentials.
This ensures all users from mock data have the correct password hash.
"""
import mysql.connector
from werkzeug.security import generate_password_hash
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
    print("Fixing All User Passwords")
    print("="*60 + "\n")
    
    conn = get_db_connection()
    if not conn:
        print("[ERROR] Failed to connect to database. Check your .env file.")
        return
    
    cursor = conn.cursor(dictionary=True)
    test_password = "user123"
    
    try:
        # Get all users
        cursor.execute("SELECT id, name, phone FROM users")
        all_users = cursor.fetchall()
        
        if not all_users:
            print("[WARNING] No users found in database.")
            return
        
        print(f"Found {len(all_users)} users. Updating passwords...")
        print("-" * 60)
        
        # Update password for all users
        password_hash = generate_password_hash(test_password)
        updated_count = 0
        
        for user in all_users:
            cursor.execute(
                "UPDATE users SET password_hash = %s WHERE id = %s",
                (password_hash, user['id'])
            )
            print(f"[OK] Updated password for: {user['name']} (Phone: {user['phone']})")
            updated_count += 1
        
        conn.commit()
        
        print("-" * 60)
        print(f"[OK] Successfully updated {updated_count} user passwords!")
        print(f"\nAll users now have password: {test_password}")
        print("\nTest Credentials:")
        for user in all_users:
            print(f"   Phone: {user['phone']} | Password: {test_password}")
        
        print("\n" + "="*60)
        print("[OK] All passwords fixed!")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()

