"""
Main Flask Application
This is the entry point for the Household Service Provider Management System.
Run this file to start the server.
"""
from flask import Flask
from flask_cors import CORS

from backend.config import Config
from backend.db import close_db
from backend.routes.auth import auth_bp
from backend.routes.workers import workers_bp
from backend.routes.bookings import bookings_bp
from backend.routes.admin import admin_bp
from backend.routes.complaints import complaints_bp
from backend.routes.reviews import reviews_bp
from backend.routes.tracking import tracking_bp

app = Flask(__name__)
app.config.from_object(Config)
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024  # 50 MB max upload size

# Enable CORS (allows frontend to call backend APIs)
CORS(app)

# Register blueprints (API routes)
app.register_blueprint(auth_bp)
app.register_blueprint(workers_bp)
app.register_blueprint(bookings_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(complaints_bp)
app.register_blueprint(reviews_bp)
app.register_blueprint(tracking_bp)

# Close database connection after each request
app.teardown_appcontext(close_db)


@app.route("/")
def home():
    """Simple health check endpoint"""
    return {"message": "Household Service Provider API is running!", "status": "ok"}


@app.route("/api/health")
def health():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Server is running"}


if __name__ == "__main__":
    # Run the Flask development server
    # Access at http://127.0.0.1:5000
    print("Starting Flask server...")
    print("API will be available at: http://127.0.0.1:5000")
    app.run(debug=True, host="127.0.0.1", port=5000)

