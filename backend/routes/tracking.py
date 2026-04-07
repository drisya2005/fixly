from flask import Blueprint, current_app, jsonify, request

from backend.db import query

tracking_bp = Blueprint("tracking", __name__, url_prefix="/api/tracking")


@tracking_bp.post("/update")
def update_location():
    """
    Worker sends their current GPS coordinates.
    Uses INSERT ... ON DUPLICATE KEY UPDATE so each worker has one live row.
    Body: { worker_id, latitude, longitude }
    """
    data = request.get_json(force=True)
    worker_id = data.get("worker_id")
    latitude = data.get("latitude")
    longitude = data.get("longitude")

    if not worker_id or latitude is None or longitude is None:
        return jsonify({"error": "worker_id, latitude, and longitude are required"}), 400

    query(
        current_app,
        """
        INSERT INTO live_locations (worker_id, latitude, longitude, updated_at)
        VALUES (%s, %s, %s, NOW())
        ON DUPLICATE KEY UPDATE latitude=%s, longitude=%s, updated_at=NOW()
        """,
        (worker_id, latitude, longitude, latitude, longitude),
        commit=True,
    )
    return jsonify({"message": "Location updated"})


@tracking_bp.get("/worker/<int:worker_id>")
def get_worker_location(worker_id):
    """
    Returns the worker's latest GPS coordinates.
    Used by user side to poll every 10 seconds.
    """
    location = query(
        current_app,
        "SELECT latitude, longitude, updated_at FROM live_locations WHERE worker_id=%s",
        (worker_id,),
        fetchone=True,
    )
    if not location:
        return jsonify({"error": "Worker is not sharing location"}), 404

    return jsonify({
        "latitude": float(location["latitude"]),
        "longitude": float(location["longitude"]),
        "updated_at": location["updated_at"].isoformat() if location["updated_at"] else None,
    })


@tracking_bp.delete("/worker/<int:worker_id>")
def stop_tracking(worker_id):
    """
    Worker stops sharing — removes their row from live_locations.
    """
    query(
        current_app,
        "DELETE FROM live_locations WHERE worker_id=%s",
        (worker_id,),
        commit=True,
    )
    return jsonify({"message": "Tracking stopped"})


@tracking_bp.post("/user/update")
def update_user_location():
    """
    User sends their current GPS coordinates.
    Uses INSERT ... ON DUPLICATE KEY UPDATE so each user has one live row.
    Body: { user_id, latitude, longitude }
    """
    data = request.get_json(force=True)
    user_id = data.get("user_id")
    latitude = data.get("latitude")
    longitude = data.get("longitude")

    if not user_id or latitude is None or longitude is None:
        return jsonify({"error": "user_id, latitude, and longitude are required"}), 400

    query(
        current_app,
        """
        INSERT INTO user_locations (user_id, latitude, longitude, updated_at)
        VALUES (%s, %s, %s, NOW())
        ON DUPLICATE KEY UPDATE latitude=%s, longitude=%s, updated_at=NOW()
        """,
        (user_id, latitude, longitude, latitude, longitude),
        commit=True,
    )
    return jsonify({"message": "Location updated"})


@tracking_bp.get("/user/<int:user_id>")
def get_user_location(user_id):
    """
    Returns the user's latest GPS coordinates.
    Used by worker side to poll every 10 seconds.
    """
    location = query(
        current_app,
        "SELECT latitude, longitude, updated_at FROM user_locations WHERE user_id=%s",
        (user_id,),
        fetchone=True,
    )
    if not location:
        return jsonify({"error": "User is not sharing location"}), 404

    return jsonify({
        "latitude": float(location["latitude"]),
        "longitude": float(location["longitude"]),
        "updated_at": location["updated_at"].isoformat() if location["updated_at"] else None,
    })


@tracking_bp.delete("/user/<int:user_id>")
def stop_user_sharing(user_id):
    """
    User stops sharing — removes their row from user_locations.
    """
    query(
        current_app,
        "DELETE FROM user_locations WHERE user_id=%s",
        (user_id,),
        commit=True,
    )
    return jsonify({"message": "Location sharing stopped"})