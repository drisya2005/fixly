from flask import Blueprint, current_app, jsonify, request

from backend.db import query

workers_bp = Blueprint("workers", __name__, url_prefix="/api/workers")


@workers_bp.get("/search")
def search_workers():
    """
    Filters workers by:
    - service_type (required)
    - pincode OR area (at least one recommended)
    - only Available workers

    Also returns:
    - is_new tag ("New")
    - avg_rating
    """
    service_type = (request.args.get("service_type") or "").strip()
    pincode = (request.args.get("pincode") or "").strip()
    area = (request.args.get("area") or "").strip()

    if not service_type:
        return jsonify({"error": "service_type is required"}), 400

    # Basic location filter: prefer pincode if provided, else area.
    # Show both Available and Busy workers (not Offline)
    # Only show approved workers (verification_status = 'approved')
    if pincode:
        sql = """
        SELECT id, name, service_type, area, pincode, status, is_new, avg_rating, complaint_count
        FROM workers
        WHERE is_blocked=0 AND verification_status='approved' AND status IN ('Available', 'Busy') AND service_type=%s AND pincode=%s
        ORDER BY status='Available' DESC, is_new DESC, avg_rating DESC
        """
        params = (service_type, pincode)
    elif area:
        sql = """
        SELECT id, name, service_type, area, pincode, status, is_new, avg_rating, complaint_count
        FROM workers
        WHERE is_blocked=0 AND verification_status='approved' AND status IN ('Available', 'Busy') AND service_type=%s AND area=%s
        ORDER BY status='Available' DESC, is_new DESC, avg_rating DESC
        """
        params = (service_type, area)
    else:
        # If user didn't provide location, still show available and busy workers (not ideal, but simple).
        sql = """
        SELECT id, name, service_type, area, pincode, status, is_new, avg_rating, complaint_count
        FROM workers
        WHERE is_blocked=0 AND verification_status='approved' AND status IN ('Available', 'Busy') AND service_type=%s
        ORDER BY status='Available' DESC, is_new DESC, avg_rating DESC
        """
        params = (service_type,)

    workers = query(current_app, sql, params, fetchall=True) or []
    # Add a human-friendly tag
    for w in workers:
        w["tag"] = "New" if w.get("is_new") == 1 else ""
    return jsonify({"workers": workers})


@workers_bp.get("/all")
def get_all_workers():
    """Returns all approved, non-blocked workers for complaint selection."""
    workers = query(
        current_app,
        """
        SELECT id, name, service_type, area, pincode, status
        FROM workers
        WHERE is_blocked=0 AND verification_status='approved'
        ORDER BY service_type, name
        """,
        fetchall=True,
    ) or []
    return jsonify({"workers": workers})


@workers_bp.post("/status")
def update_worker_status():
    """
    Worker updates their own status (Available/Busy/Offline).
    Body: worker_id, status
    """
    data = request.get_json(force=True)
    worker_id = data.get("worker_id")
    status = (data.get("status") or "").strip()

    if not worker_id or status not in ("Available", "Busy", "Offline"):
        return jsonify({"error": "worker_id and valid status are required"}), 400

    query(
        current_app,
        "UPDATE workers SET status=%s WHERE id=%s",
        (status, worker_id),
        commit=True,
    )
    return jsonify({"message": "Status updated"})


