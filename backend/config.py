import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """
    Beginner-friendly config.
    Edit these values to match your MySQL setup.
    """

    MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
    MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "household_service_db")
    MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))

    # Simple secret key (use env var in real projects)
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-me")

    # Complaint threshold (admin can block after this)
    COMPLAINT_LIMIT = int(os.getenv("COMPLAINT_LIMIT", "3"))


