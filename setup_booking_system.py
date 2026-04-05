"""
Complete Booking System Setup
This script will:
1. Create booking tables if they don't exist
2. Populate worker availability slots for all existing workers
"""
import mysql.connector
from backend.config import Config

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def print_success(message):
    print(f"{Colors.GREEN}[OK] {message}{Colors.RESET}")

def print_error(message):
    print(f"{Colors.RED}[ERROR] {message}{Colors.RESET}")

def print_info(message):
    print(f"{Colors.BLUE}[INFO] {message}{Colors.RESET}")

def print_warning(message):
    print(f"{Colors.YELLOW}[WARNING] {message}{Colors.RESET}")


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
        print_error(f"Error connecting to database: {e}")
        return None


def create_tables(cursor):
    """Create booking tables if they don't exist"""
    print_info("Checking and creating booking tables...")
    
    try:
        # Create worker_availability table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS worker_availability (
              id INT AUTO_INCREMENT PRIMARY KEY,
              worker_id INT NOT NULL,
              time_slot VARCHAR(50) NOT NULL,
              day_of_week VARCHAR(20),
              is_active TINYINT(1) DEFAULT 1,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
              INDEX idx_worker_active (worker_id, is_active)
            )
        """)
        print_success("worker_availability table ready")
        
        # Create appointments table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS appointments (
              id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL,
              worker_id INT NOT NULL,
              booking_date DATE NOT NULL,
              time_slot VARCHAR(50) NOT NULL,
              service_type VARCHAR(50) NOT NULL,
              address VARCHAR(255),
              status ENUM('Booked', 'Confirmed', 'InProgress', 'Completed', 'Cancelled') DEFAULT 'Booked',
              notes TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
              FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
              INDEX idx_user_appointments (user_id, booking_date),
              INDEX idx_worker_appointments (worker_id, booking_date),
              INDEX idx_date_slot (booking_date, time_slot, worker_id)
            )
        """)
        print_success("appointments table ready")
        
        # Try to add unique constraint (may fail if already exists, that's ok)
        try:
            cursor.execute("""
                ALTER TABLE appointments
                ADD UNIQUE KEY unique_booking (worker_id, booking_date, time_slot, status)
            """)
            print_success("Unique constraint added (prevents double booking)")
        except mysql.connector.Error:
            # Constraint might already exist, that's fine
            pass
        
        return True
    except mysql.connector.Error as e:
        print_error(f"Error creating tables: {e}")
        return False


def add_availability_slots(cursor, worker_id, worker_name):
    """Add default availability slots for a worker"""
    
    # Common time slots that workers typically offer
    time_slots = [
        '09:00 AM - 10:00 AM',
        '10:00 AM - 11:00 AM',
        '11:00 AM - 12:00 PM',
        '12:00 PM - 01:00 PM',
        '02:00 PM - 03:00 PM',
        '03:00 PM - 04:00 PM',
        '04:00 PM - 05:00 PM',
        '05:00 PM - 06:00 PM',
        '06:00 PM - 07:00 PM',
    ]
    
    added_count = 0
    skipped_count = 0
    
    for time_slot in time_slots:
        try:
            # Check if slot already exists
            cursor.execute(
                "SELECT id FROM worker_availability WHERE worker_id=%s AND time_slot=%s",
                (worker_id, time_slot)
            )
            if cursor.fetchone():
                skipped_count += 1
                continue
            
            # Add the slot
            cursor.execute(
                """
                INSERT INTO worker_availability (worker_id, time_slot, is_active)
                VALUES (%s, %s, 1)
                """,
                (worker_id, time_slot)
            )
            added_count += 1
        except mysql.connector.Error as e:
            print_warning(f"Error adding slot {time_slot} for {worker_name}: {e}")
    
    return added_count, skipped_count


def main():
    print("\n" + "="*60)
    print("Complete Booking System Setup")
    print("="*60 + "\n")
    
    conn = get_db_connection()
    if not conn:
        print_error("Failed to connect to database. Check your .env file.")
        return
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Step 1: Create tables
        print_info("Step 1: Setting up database tables...")
        if not create_tables(cursor):
            print_error("Failed to create tables. Exiting.")
            return
        
        conn.commit()
        print()
        
        # Step 2: Get all workers
        print_info("Step 2: Finding workers...")
        cursor.execute("SELECT id, name, service_type FROM workers WHERE is_blocked=0")
        workers = cursor.fetchall()
        
        if not workers:
            print_warning("No workers found in database.")
            print_info("Please run insert_mock_data.py first to create workers.")
            return
        
        print_success(f"Found {len(workers)} workers")
        print()
        
        # Step 3: Add availability slots
        print_info("Step 3: Adding availability slots for all workers...")
        print("-" * 60)
        
        total_added = 0
        total_skipped = 0
        
        for worker in workers:
            print(f"\nProcessing: {worker['name']} ({worker['service_type']})")
            added, skipped = add_availability_slots(cursor, worker['id'], worker['name'])
            total_added += added
            total_skipped += skipped
            
            if added > 0:
                print_success(f"  Added {added} time slots")
            if skipped > 0:
                print_warning(f"  Skipped {skipped} slots (already exist)")
        
        conn.commit()
        
        # Summary
        print("\n" + "="*60)
        print("Setup Complete!")
        print("="*60)
        print(f"Workers processed: {len(workers)}")
        print_success(f"Time slots added: {total_added}")
        if total_skipped > 0:
            print_warning(f"Slots skipped (already exist): {total_skipped}")
        
        # Show sample
        print("\n" + "-"*60)
        print("Sample Availability (first worker):")
        print("-"*60)
        if workers:
            cursor.execute(
                """
                SELECT time_slot
                FROM worker_availability
                WHERE worker_id=%s AND is_active=1
                ORDER BY time_slot
                LIMIT 5
                """,
                (workers[0]['id'],)
            )
            sample_slots = cursor.fetchall()
            for slot in sample_slots:
                print(f"  - {slot['time_slot']}")
            if len(sample_slots) >= 5:
                print(f"  ... and {9 - len(sample_slots)} more slots")
        
        print("\n" + "="*60)
        print_success("Booking system is ready!")
        print("="*60)
        print("\n✅ Users can now book appointments with workers")
        print("✅ Workers have 9 time slots available per day")
        print("✅ Bookings can be made from today onwards\n")
        
    except Exception as e:
        conn.rollback()
        print_error(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n[WARNING] Operation cancelled by user")
    except Exception as e:
        print_error(f"\nUnexpected error: {str(e)}")

