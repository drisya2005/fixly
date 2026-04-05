"""
Helper script to create .env file interactively.
Run this if you need help setting up your .env file.
"""
import os

print("=" * 50)
print("Creating .env file for your project")
print("=" * 50)
print()

# Get MySQL details from user
mysql_host = input("MySQL Host [127.0.0.1]: ").strip() or "127.0.0.1"
mysql_user = input("MySQL User [root]: ").strip() or "root"
mysql_password = input("MySQL Password: ").strip()
mysql_database = input("MySQL Database [household_service_db]: ").strip() or "household_service_db"
mysql_port = input("MySQL Port [3306]: ").strip() or "3306"

secret_key = input("Secret Key (press Enter for default): ").strip() or "dev-secret-key-change-me-in-production"
complaint_limit = input("Complaint Limit [3]: ").strip() or "3"

# Create .env content
env_content = f"""# MySQL Database Configuration
MYSQL_HOST={mysql_host}
MYSQL_USER={mysql_user}
MYSQL_PASSWORD={mysql_password}
MYSQL_DATABASE={mysql_database}
MYSQL_PORT={mysql_port}

# Flask Secret Key
SECRET_KEY={secret_key}

# Complaint Limit
COMPLAINT_LIMIT={complaint_limit}
"""

# Write to .env file
env_path = ".env"
try:
    with open(env_path, "w") as f:
        f.write(env_content)
    print()
    print(f"✅ Successfully created {env_path} file!")
    print()
    print("Next steps:")
    print("1. Make sure MySQL is running")
    print("2. Run: python backend/app.py")
except Exception as e:
    print(f"❌ Error creating .env file: {e}")

