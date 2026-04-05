"""
Test script to verify database connection.
Run this to check if your .env file and MySQL connection are working.
"""
import sys

try:
    from backend.config import Config
    from backend.db import get_db
    from flask import Flask
    
    print("=" * 50)
    print("Testing Database Connection")
    print("=" * 50)
    print()
    
    # Show configuration
    print("Configuration loaded:")
    print(f"  Host: {Config.MYSQL_HOST}")
    print(f"  User: {Config.MYSQL_USER}")
    print(f"  Database: {Config.MYSQL_DATABASE}")
    print(f"  Port: {Config.MYSQL_PORT}")
    print()
    
    # Try to connect
    print("Attempting to connect to MySQL...")
    app = Flask(__name__)
    app.config.from_object(Config)
    
    try:
        with app.app_context():
            db = get_db(app)
            cursor = db.cursor()
            cursor.execute("SELECT DATABASE()")
            result = cursor.fetchone()
            cursor.close()
            
            print("✅ SUCCESS! Database connection working!")
            print(f"   Connected to database: {result[0]}")
            print()
            print("You can now run: python backend/app.py")
            
    except Exception as e:
        print("❌ FAILED to connect to database!")
        print(f"   Error: {str(e)}")
        print()
        print("Troubleshooting:")
        print("1. Check if MySQL server is running")
        print("2. Verify your MySQL password in .env file")
        print("3. Make sure the database 'household_service_db' exists")
        print("4. Run: python database/schema.sql in MySQL")
        sys.exit(1)
        
except ImportError as e:
    print("❌ Error importing modules!")
    print(f"   {str(e)}")
    print()
    print("Make sure you:")
    print("1. Are in the project root folder")
    print("2. Have installed dependencies: pip install -r backend/requirements.txt")
    sys.exit(1)

