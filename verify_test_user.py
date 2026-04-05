"""
Quick script to verify and create test user credentials.
This ensures you have a working user account to test with.
"""
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
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
    print("Verifying Test User Credentials")
    print("="*60 + "\n")
    
    conn = get_db_connection()
    if not conn:
        print("[ERROR] Failed to connect to database. Check your .env file.")
        return
    
    cursor = conn.cursor(dictionary=True)
    
    # Test user credentials
    test_phone = "9876543210"
    test_password = "user123"
    
    try:
        # Check if user exists
        cursor.execute("SELECT id, name, phone, password_hash FROM users WHERE phone = %s", (test_phone,))
        user = cursor.fetchone()
        
        if user:
            print(f"[OK] User found: {user['name']} (ID: {user['id']})")
            
            # Verify password
            if check_password_hash(user['password_hash'], test_password):
                print("[OK] Password is correct!")
                print(f"\nLogin Credentials:")
                print(f"   Phone: {test_phone}")
                print(f"   Password: {test_password}")
            else:
                print("[WARNING] Password doesn't match. Updating password...")
                new_hash = generate_password_hash(test_password)
                cursor.execute("UPDATE users SET password_hash = %s WHERE phone = %s", (new_hash, test_phone))
                conn.commit()
                print("[OK] Password updated successfully!")
        else:
            print("[WARNING] User not found. Creating test user...")
            
            # Create test user
            password_hash = generate_password_hash(test_password)
            cursor.execute("""
                INSERT INTO users (name, phone, email, password_hash, address, area, pincode)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                "Rajesh Kumar",
                test_phone,
                "rajesh@example.com",
                password_hash,
                "123 MG Road, Bangalore",
                "Bangalore",
                "560001"
            ))
            conn.commit()
            user_id = cursor.lastrowid
            print(f"[OK] Test user created successfully! (ID: {user_id})")
            print(f"\nLogin Credentials:")
            print(f"   Phone: {test_phone}")
            print(f"   Password: {test_password}")
        
        # List all users
        print("\n" + "-"*60)
        print("All Users in Database:")
        print("-"*60)
        cursor.execute("SELECT id, name, phone, pincode FROM users ORDER BY id")
        all_users = cursor.fetchall()
        
        if all_users:
            for u in all_users:
                print(f"   ID: {u['id']} | {u['name']} | Phone: {u['phone']} | Pincode: {u['pincode']}")
        else:
            print("   No users found in database.")
        
        print("\n" + "="*60)
        print("[OK] Verification complete!")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()

