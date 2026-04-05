"""
Mock Data Insertion Script
Inserts sample data into the database for testing purposes.

This script will insert:
- Multiple users
- Multiple workers (different service types and statuses)
- Admin account
- Sample bookings
- Sample ratings
- Sample complaints

Run this script after setting up your database.
"""

import mysql.connector
from werkzeug.security import generate_password_hash
from backend.config import Config

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.RESET}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.RESET}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.RESET}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.RESET}")


def get_db_connection():
    """Create a direct database connection (not using Flask app context)"""
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
        print_error(f"Error connecting to database: {e}")
        return None


def insert_user(cursor, name, phone, password, pincode, area=None, email=None, address=None):
    """Insert a user into the database"""
    try:
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE phone = %s", (phone,))
        if cursor.fetchone():
            print_warning(f"User with phone {phone} already exists, skipping...")
            return None
        
        password_hash = generate_password_hash(password)
        cursor.execute("""
            INSERT INTO users (name, phone, email, password_hash, address, area, pincode)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (name, phone, email, password_hash, address, area, pincode))
        
        user_id = cursor.lastrowid
        print_success(f"Inserted user: {name} (ID: {user_id})")
        return user_id
    except mysql.connector.Error as e:
        print_error(f"Error inserting user {name}: {e}")
        return None


def insert_worker(cursor, name, phone, password, service_type, pincode, area=None, 
                  email=None, status='Available', is_new=1, avg_rating=0.0, complaint_count=0):
    """Insert a worker into the database"""
    try:
        # Check if worker already exists
        cursor.execute("SELECT id FROM workers WHERE phone = %s", (phone,))
        if cursor.fetchone():
            print_warning(f"Worker with phone {phone} already exists, skipping...")
            return None
        
        password_hash = generate_password_hash(password)
        cursor.execute("""
            INSERT INTO workers (name, phone, email, password_hash, service_type, area, pincode, 
                                status, is_new, avg_rating, complaint_count)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (name, phone, email, password_hash, service_type, area, pincode, 
              status, is_new, avg_rating, complaint_count))
        
        worker_id = cursor.lastrowid
        print_success(f"Inserted worker: {name} - {service_type} (ID: {worker_id})")
        return worker_id
    except mysql.connector.Error as e:
        print_error(f"Error inserting worker {name}: {e}")
        return None


def insert_admin(cursor, username, password):
    """Insert an admin account"""
    try:
        # Check if admin already exists
        cursor.execute("SELECT id FROM admins WHERE username = %s", (username,))
        if cursor.fetchone():
            print_warning(f"Admin '{username}' already exists, skipping...")
            return None
        
        password_hash = generate_password_hash(password)
        cursor.execute("""
            INSERT INTO admins (username, password_hash)
            VALUES (%s, %s)
        """, (username, password_hash))
        
        admin_id = cursor.lastrowid
        print_success(f"Inserted admin: {username} (ID: {admin_id})")
        return admin_id
    except mysql.connector.Error as e:
        print_error(f"Error inserting admin {username}: {e}")
        return None


def insert_booking(cursor, user_id, worker_id, service_type, is_emergency=0, 
                   address=None, area=None, pincode=None, status='Requested'):
    """Insert a booking"""
    try:
        cursor.execute("""
            INSERT INTO bookings (user_id, worker_id, service_type, is_emergency, 
                                 address, area, pincode, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (user_id, worker_id, service_type, is_emergency, address, area, pincode, status))
        
        booking_id = cursor.lastrowid
        print_success(f"Inserted booking: User {user_id} -> Worker {worker_id} (ID: {booking_id})")
        return booking_id
    except mysql.connector.Error as e:
        print_error(f"Error inserting booking: {e}")
        return None


def insert_rating(cursor, user_id, worker_id, booking_id, stars, comment=None):
    """Insert a rating"""
    try:
        cursor.execute("""
            INSERT INTO ratings (user_id, worker_id, booking_id, stars, comment)
            VALUES (%s, %s, %s, %s, %s)
        """, (user_id, worker_id, booking_id, stars, comment))
        
        # Update worker's average rating
        cursor.execute("""
            UPDATE workers 
            SET rating_count = rating_count + 1,
                avg_rating = (
                    SELECT AVG(stars) 
                    FROM ratings 
                    WHERE worker_id = %s
                )
            WHERE id = %s
        """, (worker_id, worker_id))
        
        print_success(f"Inserted rating: {stars} stars for worker {worker_id}")
        return True
    except mysql.connector.Error as e:
        print_error(f"Error inserting rating: {e}")
        return False


def insert_complaint(cursor, user_id, worker_id, booking_id, description, status='Open'):
    """Insert a complaint"""
    try:
        cursor.execute("""
            INSERT INTO complaints (user_id, worker_id, booking_id, description, status)
            VALUES (%s, %s, %s, %s, %s)
        """, (user_id, worker_id, booking_id, description, status))
        
        # Update worker's complaint count
        cursor.execute("""
            UPDATE workers 
            SET complaint_count = complaint_count + 1
            WHERE id = %s
        """, (worker_id,))
        
        complaint_id = cursor.lastrowid
        print_success(f"Inserted complaint: {description[:50]}... (ID: {complaint_id})")
        return complaint_id
    except mysql.connector.Error as e:
        print_error(f"Error inserting complaint: {e}")
        return None


def main():
    print("\n" + "="*60)
    print("📦 Inserting Mock Data into Database")
    print("="*60 + "\n")
    
    # Connect to database
    conn = get_db_connection()
    if not conn:
        print_error("Failed to connect to database. Please check your .env file and MySQL connection.")
        return
    
    cursor = conn.cursor()
    
    try:
        # ============================================
        # INSERT USERS
        # ============================================
        print_info("Inserting Users...")
        print("-" * 60)
        
        users_data = [
            {"name": "Rajesh Kumar", "phone": "9876543210", "password": "user123", 
             "pincode": "560001", "area": "Bangalore", "email": "rajesh@example.com", 
             "address": "123 MG Road, Bangalore"},
            {"name": "Priya Sharma", "phone": "9876543211", "password": "user123", 
             "pincode": "560002", "area": "Bangalore", "email": "priya@example.com", 
             "address": "456 Brigade Road, Bangalore"},
            {"name": "Amit Patel", "phone": "9876543212", "password": "user123", 
             "pincode": "560001", "area": "Bangalore", "email": "amit@example.com", 
             "address": "789 Indira Nagar, Bangalore"},
            {"name": "Sneha Reddy", "phone": "9876543213", "password": "user123", 
             "pincode": "560003", "area": "Bangalore", "email": "sneha@example.com", 
             "address": "321 Koramangala, Bangalore"},
            {"name": "Vikram Singh", "phone": "9876543214", "password": "user123", 
             "pincode": "560001", "area": "Bangalore", "email": "vikram@example.com", 
             "address": "654 Whitefield, Bangalore"},
        ]
        
        user_ids = []
        for user in users_data:
            user_id = insert_user(cursor, **user)
            if user_id:
                user_ids.append(user_id)
        
        print()
        
        # ============================================
        # INSERT WORKERS
        # ============================================
        print_info("Inserting Workers...")
        print("-" * 60)
        
        workers_data = [
            # Plumbers
            {"name": "Ramesh Plumber", "phone": "9876543220", "password": "worker123", 
             "service_type": "Plumber", "pincode": "560001", "area": "Bangalore", 
             "email": "ramesh@example.com", "status": "Available", "is_new": 0, 
             "avg_rating": 4.5, "complaint_count": 0},
            {"name": "Suresh Water Works", "phone": "9876543221", "password": "worker123", 
             "service_type": "Plumber", "pincode": "560001", "area": "Bangalore", 
             "email": "suresh@example.com", "status": "Available", "is_new": 1, 
             "avg_rating": 0.0, "complaint_count": 0},
            {"name": "Kumar Plumbing", "phone": "9876543222", "password": "worker123", 
             "service_type": "Plumber", "pincode": "560002", "area": "Bangalore", 
             "email": "kumar@example.com", "status": "Busy", "is_new": 0, 
             "avg_rating": 4.2, "complaint_count": 1},
            
            # Electricians
            {"name": "Electrician Mahesh", "phone": "9876543230", "password": "worker123", 
             "service_type": "Electrician", "pincode": "560001", "area": "Bangalore", 
             "email": "mahesh@example.com", "status": "Available", "is_new": 0, 
             "avg_rating": 4.8, "complaint_count": 0},
            {"name": "Power Solutions", "phone": "9876543231", "password": "worker123", 
             "service_type": "Electrician", "pincode": "560002", "area": "Bangalore", 
             "email": "power@example.com", "status": "Available", "is_new": 1, 
             "avg_rating": 0.0, "complaint_count": 0},
            {"name": "Spark Services", "phone": "9876543232", "password": "worker123", 
             "service_type": "Electrician", "pincode": "560003", "area": "Bangalore", 
             "email": "spark@example.com", "status": "Offline", "is_new": 0, 
             "avg_rating": 3.5, "complaint_count": 2},
            
            # Cleaners
            {"name": "Clean Home Services", "phone": "9876543240", "password": "worker123", 
             "service_type": "Cleaner", "pincode": "560001", "area": "Bangalore", 
             "email": "clean@example.com", "status": "Available", "is_new": 0, 
             "avg_rating": 4.7, "complaint_count": 0},
            {"name": "Shine Bright", "phone": "9876543241", "password": "worker123", 
             "service_type": "Cleaner", "pincode": "560002", "area": "Bangalore", 
             "email": "shine@example.com", "status": "Available", "is_new": 1, 
             "avg_rating": 0.0, "complaint_count": 0},
            {"name": "Spotless Clean", "phone": "9876543242", "password": "worker123", 
             "service_type": "Cleaner", "pincode": "560001", "area": "Bangalore", 
             "email": "spotless@example.com", "status": "Busy", "is_new": 0, 
             "avg_rating": 4.0, "complaint_count": 1},
            
            # Carpenter
            {"name": "Carpenter Raj", "phone": "9876543250", "password": "worker123", 
             "service_type": "Carpenter", "pincode": "560001", "area": "Bangalore", 
             "email": "carpenter@example.com", "status": "Available", "is_new": 0, 
             "avg_rating": 4.6, "complaint_count": 0},
            
            # Painter
            {"name": "Color Masters", "phone": "9876543260", "password": "worker123", 
             "service_type": "Painter", "pincode": "560002", "area": "Bangalore", 
             "email": "color@example.com", "status": "Available", "is_new": 1, 
             "avg_rating": 0.0, "complaint_count": 0},
        ]
        
        worker_ids = []
        for worker in workers_data:
            worker_id = insert_worker(cursor, **worker)
            if worker_id:
                worker_ids.append(worker_id)
        
        print()
        
        # ============================================
        # INSERT ADMIN
        # ============================================
        print_info("Inserting Admin...")
        print("-" * 60)
        
        admin_id = insert_admin(cursor, "admin", "admin123")
        print()
        
        # ============================================
        # INSERT BOOKINGS (if we have users and workers)
        # ============================================
        if user_ids and worker_ids:
            print_info("Inserting Sample Bookings...")
            print("-" * 60)
            
            bookings_data = [
                {"user_id": user_ids[0], "worker_id": worker_ids[0], "service_type": "Plumber", 
                 "is_emergency": 0, "address": "123 MG Road", "area": "Bangalore", 
                 "pincode": "560001", "status": "Completed"},
                {"user_id": user_ids[1], "worker_id": worker_ids[3], "service_type": "Electrician", 
                 "is_emergency": 1, "address": "456 Brigade Road", "area": "Bangalore", 
                 "pincode": "560002", "status": "InProgress"},
                {"user_id": user_ids[2], "worker_id": worker_ids[6], "service_type": "Cleaner", 
                 "is_emergency": 0, "address": "789 Indira Nagar", "area": "Bangalore", 
                 "pincode": "560001", "status": "Accepted"},
                {"user_id": user_ids[0], "worker_id": worker_ids[9], "service_type": "Carpenter", 
                 "is_emergency": 0, "address": "123 MG Road", "area": "Bangalore", 
                 "pincode": "560001", "status": "Requested"},
            ]
            
            booking_ids = []
            for booking in bookings_data:
                booking_id = insert_booking(cursor, **booking)
                if booking_id:
                    booking_ids.append(booking_id)
            
            print()
            
            # ============================================
            # INSERT RATINGS (for completed bookings)
            # ============================================
            if booking_ids:
                print_info("Inserting Sample Ratings...")
                print("-" * 60)
                
                ratings_data = [
                    {"user_id": user_ids[0], "worker_id": worker_ids[0], "booking_id": booking_ids[0], 
                     "stars": 5, "comment": "Excellent service, very professional!"},
                ]
                
                for rating in ratings_data:
                    insert_rating(cursor, **rating)
                
                print()
                
                # ============================================
                # INSERT COMPLAINTS
                # ============================================
                print_info("Inserting Sample Complaints...")
                print("-" * 60)
                
                complaints_data = [
                    {"user_id": user_ids[1], "worker_id": worker_ids[5], "booking_id": None, 
                     "description": "Worker arrived late and did not complete the work properly", 
                     "status": "Open"},
                    {"user_id": user_ids[2], "worker_id": worker_ids[2], "booking_id": None, 
                     "description": "Poor quality of work, had to call another worker", 
                     "status": "Open"},
                ]
                
                for complaint in complaints_data:
                    insert_complaint(cursor, **complaint)
                
                print()
        
        # Commit all changes
        conn.commit()
        print_success("All mock data inserted successfully!")
        print()
        print("="*60)
        print("📊 Summary")
        print("="*60)
        print(f"Users inserted: {len(user_ids)}")
        print(f"Workers inserted: {len(worker_ids)}")
        print(f"Admin inserted: {'Yes' if admin_id else 'No'}")
        if user_ids and worker_ids:
            print(f"Bookings inserted: {len(booking_ids) if 'booking_ids' in locals() else 0}")
        print()
        print_info("You can now test the API endpoints with this data!")
        print_info("Default passwords: 'user123' for users, 'worker123' for workers, 'admin123' for admin")
        print("="*60 + "\n")
        
    except Exception as e:
        conn.rollback()
        print_error(f"Error occurred: {e}")
        print_warning("All changes have been rolled back.")
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Operation cancelled by user")
    except Exception as e:
        print_error(f"\nUnexpected error: {str(e)}")

