"""
Populate Worker Availability Script
Adds available time slots for all existing workers in the database.
This allows users to book appointments with workers.
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
    print("Populating Worker Availability Slots")
    print("="*60 + "\n")
    
    conn = get_db_connection()
    if not conn:
        print_error("Failed to connect to database. Check your .env file.")
        return
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if worker_availability table exists
        cursor.execute("SHOW TABLES LIKE 'worker_availability'")
        if not cursor.fetchone():
            print_error("worker_availability table does not exist!")
            print_info("Please run: mysql -u root -p < database/booking_schema.sql")
            return
        
        # Get all workers
        cursor.execute("SELECT id, name, service_type FROM workers WHERE is_blocked=0")
        workers = cursor.fetchall()
        
        if not workers:
            print_warning("No workers found in database.")
            print_info("Please run insert_mock_data.py first to create workers.")
            return
        
        print_info(f"Found {len(workers)} workers. Adding availability slots...")
        print("-" * 60)
        
        total_added = 0
        total_skipped = 0
        
        for worker in workers:
            print(f"\nProcessing: {worker['name']} ({worker['service_type']})")
            added, skipped = add_availability_slots(cursor, worker['id'], worker['name'])
            total_added += added
            total_skipped += skipped
            
            if added > 0:
                print_success(f"Added {added} time slots")
            if skipped > 0:
                print_warning(f"Skipped {skipped} slots (already exist)")
        
        conn.commit()
        
        print("\n" + "="*60)
        print("Summary")
        print("="*60)
        print(f"Total workers processed: {len(workers)}")
        print_success(f"Total slots added: {total_added}")
        if total_skipped > 0:
            print_warning(f"Total slots skipped (already exist): {total_skipped}")
        
        # Show sample availability
        print("\n" + "-"*60)
        print("Sample Availability (first worker):")
        print("-"*60)
        if workers:
            cursor.execute(
                """
                SELECT time_slot, is_active
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
        
        print("\n" + "="*60)
        print_success("Worker availability populated successfully!")
        print("="*60)
        print("\nUsers can now book appointments with these workers!")
        print("Time slots are available for booking from today onwards.\n")
        
    except Exception as e:
        conn.rollback()
        print_error(f"Error: {e}")
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

