"""
Complaints Routes
Handles user complaint submission.
"""
from flask import Blueprint, current_app, jsonify, request

from backend.db import query

complaints_bp = Blueprint("complaints", __name__, url_prefix="/api")


@complaints_bp.post("/complaints")
def submit_complaint():
    """Submit a complaint against a worker"""
    data = request.get_json(force=True)
    user_id = data.get("user_id")
    worker_id = data.get("worker_id")
    complaint_text = (data.get("complaint_text") or "").strip()

    if not user_id or not worker_id or not complaint_text:
        return jsonify({"error": "user_id, worker_id, and complaint_text are required"}), 400

    # Validate word count: minimum 5, maximum 150 words
    word_count = len(complaint_text.split())
    if word_count < 5:
        return jsonify({"error": "Complaint must be at least 5 words"}), 400
    if word_count > 150:
        return jsonify({"error": "Complaint must not exceed 150 words"}), 400

    # Verify worker exists
    worker = query(
        current_app,
        "SELECT id FROM workers WHERE id=%s",
        (worker_id,),
        fetchone=True,
    )

    if not worker:
        return jsonify({"error": "Worker not found"}), 404

    # Create complaint - use correct column name and status value
    try:
        query(
            current_app,
            """
            INSERT INTO complaints (user_id, worker_id, complaint_text, status)
            VALUES (%s, %s, %s, 'pending')
            """,
            (user_id, worker_id, complaint_text),
            commit=True,
        )
    except Exception as e:
        current_app.logger.error(f"Failed to insert complaint: {e}")
        return jsonify({"error": "Failed to submit complaint. Please try again."}), 500

    # Update complaint_count in workers table
    try:
        query(
            current_app,
            """
            UPDATE workers
            SET complaint_count = complaint_count + 1
            WHERE id=%s
            """,
            (worker_id,),
            commit=True,
        )
    except Exception as e:
        current_app.logger.error(f"Failed to update complaint count: {e}")

    return jsonify({"message": "Complaint submitted successfully"}), 201

