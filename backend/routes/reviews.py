"""
Reviews / Ratings Routes
Handles submitting and fetching reviews with optional photo/video uploads.
"""
import json
import os
import uuid

from flask import Blueprint, current_app, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename

from backend.db import query

reviews_bp = Blueprint("reviews", __name__, url_prefix="/api")

IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
VIDEO_EXTENSIONS = {"mp4"}
ALLOWED_EXTENSIONS = IMAGE_EXTENSIONS | VIDEO_EXTENSIONS
MAX_IMAGES = 2
MAX_VIDEOS = 1
MAX_VIDEO_BYTES = 5 * 1024 * 1024  # 5 MB


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def get_upload_folder(app):
    folder = os.path.join(app.root_path, "..", "uploads", "reviews")
    os.makedirs(folder, exist_ok=True)
    return os.path.abspath(folder)


@reviews_bp.post("/review")
def submit_review():
    """
    Submit a review for a completed booking.
    Accepts multipart/form-data:
      - user_id (required)
      - worker_id (required)
      - booking_id (required)
      - stars (1-5, required)
      - comment (optional text)
      - files[] (optional, up to 5 images/videos)
    """
    user_id = request.form.get("user_id")
    worker_id = request.form.get("worker_id")
    booking_id = request.form.get("booking_id")
    stars = request.form.get("stars")
    comment = (request.form.get("comment") or "").strip()

    # Validate required fields
    if not user_id or not worker_id or not booking_id or not stars or not comment:
        return jsonify({"error": "user_id, worker_id, booking_id, stars, and comment are required"}), 400

    try:
        stars = int(stars)
        if stars < 1 or stars > 5:
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({"error": "stars must be a number between 1 and 5"}), 400

    # Check booking exists and belongs to this user and is Completed
    booking = query(
        current_app,
        "SELECT id, status, worker_id FROM appointments WHERE id=%s AND user_id=%s",
        (booking_id, user_id),
        fetchone=True,
    )
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    if booking["status"] != "Completed":
        return jsonify({"error": "You can only review completed bookings"}), 400

    # Check if already reviewed
    existing = query(
        current_app,
        "SELECT id FROM ratings WHERE booking_id=%s AND user_id=%s",
        (booking_id, user_id),
        fetchone=True,
    )
    if existing:
        return jsonify({"error": "You have already reviewed this booking"}), 409

    # Handle file uploads
    upload_folder = get_upload_folder(current_app)
    saved_files = []
    files = request.files.getlist("files[]")

    image_count = 0
    video_count = 0
    for file in files:
        if not file or not file.filename:
            continue
        ext = file.filename.rsplit(".", 1)[1].lower() if "." in file.filename else ""
        if ext in IMAGE_EXTENSIONS:
            image_count += 1
        elif ext in VIDEO_EXTENSIONS:
            video_count += 1
        else:
            return jsonify({"error": f"File type not allowed: {file.filename}. Use JPG, PNG, or MP4."}), 400

    if image_count > MAX_IMAGES:
        return jsonify({"error": f"You can upload at most {MAX_IMAGES} images."}), 400
    if video_count > MAX_VIDEOS:
        return jsonify({"error": f"You can upload at most {MAX_VIDEOS} video."}), 400

    for file in files:
        if not file or not file.filename:
            continue
        ext = file.filename.rsplit(".", 1)[1].lower()
        if ext in VIDEO_EXTENSIONS:
            file.seek(0, 2)  # seek to end
            size = file.tell()
            file.seek(0)     # rewind
            if size > MAX_VIDEO_BYTES:
                return jsonify({"error": "Video must be under 5 MB."}), 400
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        file.save(os.path.join(upload_folder, unique_name))
        saved_files.append(unique_name)

    media_paths_json = json.dumps(saved_files) if saved_files else None

    # Insert rating
    query(
        current_app,
        """
        INSERT INTO ratings (user_id, worker_id, booking_id, stars, comment, media_paths)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (user_id, worker_id, booking_id, stars, comment or None, media_paths_json),
        commit=True,
    )

    # Update worker's avg_rating and rating_count
    query(
        current_app,
        """
        UPDATE workers
        SET rating_count = rating_count + 1,
            avg_rating = (
                SELECT AVG(stars) FROM ratings WHERE worker_id=%s
            )
        WHERE id=%s
        """,
        (worker_id, worker_id),
        commit=True,
    )

    return jsonify({"message": "Review submitted successfully"}), 201


@reviews_bp.get("/worker/<int:worker_id>/reviews")
def get_worker_reviews(worker_id):
    """
    Get all reviews for a worker (newest first).
    """
    reviews = query(
        current_app,
        """
        SELECT r.id, r.stars, r.comment, r.media_paths, r.created_at,
               u.name as user_name
        FROM ratings r
        JOIN users u ON r.user_id = u.id
        WHERE r.worker_id=%s
        ORDER BY r.created_at DESC
        """,
        (worker_id,),
        fetchall=True,
    )

    for r in reviews:
        r["media_paths"] = json.loads(r["media_paths"]) if r["media_paths"] else []

    return jsonify({"reviews": reviews or []})


@reviews_bp.get("/review/check")
def check_reviewed():
    """
    Check if a user has already reviewed a booking.
    Query params: booking_id, user_id
    """
    booking_id = request.args.get("booking_id")
    user_id = request.args.get("user_id")

    if not booking_id or not user_id:
        return jsonify({"error": "booking_id and user_id are required"}), 400

    existing = query(
        current_app,
        "SELECT id, stars, comment FROM ratings WHERE booking_id=%s AND user_id=%s",
        (booking_id, user_id),
        fetchone=True,
    )
    return jsonify({"reviewed": bool(existing), "review": existing})


@reviews_bp.get("/uploads/reviews/<filename>")
def serve_review_file(filename):
    """Serve uploaded review photos/videos."""
    upload_folder = get_upload_folder(current_app)
    return send_from_directory(upload_folder, filename)