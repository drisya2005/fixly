"""
Admin Routes
Handles worker verification, complaint management, and user/worker control.
"""
from flask import Blueprint, current_app, jsonify, request

from backend.db import query

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


# ============================================
# WORKER VERIFICATION
# ============================================

@admin_bp.get("/pending-workers")
def get_pending_workers():
    """Get all workers with pending verification status"""
    try:
        workers = query(
            current_app,
            """
            SELECT id, name, email, phone, service_type, experience, area, pincode, 
                   created_at, avg_rating, complaint_count
            FROM workers
            WHERE verification_status='pending'
            ORDER BY created_at ASC
            """,
            fetchall=True,
        )
        
        return jsonify({"workers": workers or []})
    except Exception as e:
        import traceback
        current_app.logger.error(f"Error fetching pending workers: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": f"Failed to fetch pending workers: {str(e)}", "workers": []}), 500


@admin_bp.post("/approve-worker")
def approve_worker():
    """Approve a worker (change verification_status to 'approved')"""
    data = request.get_json(force=True)
    worker_id = data.get("worker_id")
    
    if not worker_id:
        return jsonify({"error": "worker_id is required"}), 400
    
    # Update verification status
    query(
        current_app,
        "UPDATE workers SET verification_status='approved' WHERE id=%s",
        (worker_id,),
        commit=True,
    )
    
    return jsonify({"message": "Worker approved successfully"}), 200


@admin_bp.post("/reject-worker")
def reject_worker():
    """Reject/Block a worker (change verification_status to 'blocked')"""
    data = request.get_json(force=True)
    worker_id = data.get("worker_id")
    
    if not worker_id:
        return jsonify({"error": "worker_id is required"}), 400
    
    # Update verification status to blocked
    query(
        current_app,
        "UPDATE workers SET verification_status='blocked', is_blocked=1 WHERE id=%s",
        (worker_id,),
        commit=True,
    )
    
    return jsonify({"message": "Worker rejected/blocked successfully"}), 200


# ============================================
# COMPLAINT MANAGEMENT
# ============================================

@admin_bp.get("/complaints")
def get_complaints():
    """Get all complaints (pending and resolved)"""
    try:
        status_filter = request.args.get("status", "").strip()
        
        # Check if table uses 'description' or 'complaint_text'
        # Try with complaint_text first (new schema), fallback to description (old schema)
        if status_filter and status_filter in ("pending", "resolved"):
            # Also handle "Open" status as pending
            if status_filter == "pending":
                # Try new schema first
                try:
                    complaints = query(
                        current_app,
                        """
                        SELECT c.id, c.complaint_text, c.status, c.created_at, c.resolved_at,
                               u.name as user_name, u.phone as user_phone,
                               w.name as worker_name, w.id as worker_id
                        FROM complaints c
                        JOIN users u ON c.user_id = u.id
                        JOIN workers w ON c.worker_id = w.id
                        WHERE c.status IN ('pending', 'Open')
                        ORDER BY c.created_at DESC
                        """,
                        fetchall=True,
                    )
                except:
                    # Fallback to old schema
                    complaints = query(
                        current_app,
                        """
                        SELECT c.id, c.description as complaint_text, c.status, c.created_at, NULL as resolved_at,
                               u.name as user_name, u.phone as user_phone,
                               w.name as worker_name, w.id as worker_id
                        FROM complaints c
                        JOIN users u ON c.user_id = u.id
                        JOIN workers w ON c.worker_id = w.id
                        WHERE c.status IN ('pending', 'Open')
                        ORDER BY c.created_at DESC
                        """,
                        fetchall=True,
                    )
            else:
                # Try new schema first
                try:
                    complaints = query(
                        current_app,
                        """
                        SELECT c.id, c.complaint_text, c.status, c.created_at, c.resolved_at,
                               u.name as user_name, u.phone as user_phone,
                               w.name as worker_name, w.id as worker_id
                        FROM complaints c
                        JOIN users u ON c.user_id = u.id
                        JOIN workers w ON c.worker_id = w.id
                        WHERE c.status=%s
                        ORDER BY c.created_at DESC
                        """,
                        (status_filter,),
                        fetchall=True,
                    )
                except:
                    # Fallback to old schema
                    complaints = query(
                        current_app,
                        """
                        SELECT c.id, c.description as complaint_text, c.status, c.created_at, NULL as resolved_at,
                               u.name as user_name, u.phone as user_phone,
                               w.name as worker_name, w.id as worker_id
                        FROM complaints c
                        JOIN users u ON c.user_id = u.id
                        JOIN workers w ON c.worker_id = w.id
                        WHERE c.status=%s
                        ORDER BY c.created_at DESC
                        """,
                        (status_filter,),
                        fetchall=True,
                    )
        else:
            # Try new schema first
            try:
                complaints = query(
                    current_app,
                    """
                    SELECT c.id, c.complaint_text, c.status, c.created_at, c.resolved_at,
                           u.name as user_name, u.phone as user_phone,
                           w.name as worker_name, w.id as worker_id
                    FROM complaints c
                    JOIN users u ON c.user_id = u.id
                    JOIN workers w ON c.worker_id = w.id
                    ORDER BY c.created_at DESC
                    """,
                    fetchall=True,
                )
            except:
                # Fallback to old schema
                complaints = query(
                    current_app,
                    """
                    SELECT c.id, c.description as complaint_text, c.status, c.created_at, NULL as resolved_at,
                           u.name as user_name, u.phone as user_phone,
                           w.name as worker_name, w.id as worker_id
                    FROM complaints c
                    JOIN users u ON c.user_id = u.id
                    JOIN workers w ON c.worker_id = w.id
                    ORDER BY c.created_at DESC
                    """,
                    fetchall=True,
                )
        
        return jsonify({"complaints": complaints or []})
    except Exception as e:
        import traceback
        error_msg = str(e)
        print(f"Error fetching complaints: {error_msg}")
        print(traceback.format_exc())
        return jsonify({"error": f"Failed to fetch complaints: {error_msg}", "complaints": []}), 500


@admin_bp.post("/resolve-complaint")
def resolve_complaint():
    """Mark a complaint as resolved"""
    data = request.get_json(force=True)
    complaint_id = data.get("complaint_id")
    
    if not complaint_id:
        return jsonify({"error": "complaint_id is required"}), 400
    
    # Update complaint status
    query(
        current_app,
        "UPDATE complaints SET status='resolved', resolved_at=NOW() WHERE id=%s",
        (complaint_id,),
        commit=True,
    )
    
    return jsonify({"message": "Complaint marked as resolved"}), 200


# ============================================
# USER MANAGEMENT
# ============================================

@admin_bp.get("/users")
def get_all_users():
    """Get all users"""
    users = query(
        current_app,
        """
        SELECT id, name, email, phone, area, pincode, status, created_at
        FROM users
        ORDER BY created_at DESC
        """,
        fetchall=True,
    )
    
    return jsonify({"users": users or []})


@admin_bp.post("/block-user")
def block_user():
    """Block or unblock a user"""
    data = request.get_json(force=True)
    user_id = data.get("user_id")
    action = data.get("action", "block")  # 'block' or 'unblock'
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    new_status = "blocked" if action == "block" else "active"
    
    query(
        current_app,
        "UPDATE users SET status=%s WHERE id=%s",
        (new_status, user_id),
        commit=True,
    )
    
    return jsonify({"message": f"User {action}ed successfully"}), 200


@admin_bp.delete("/delete-user")
def delete_user():
    """Delete a user account"""
    data = request.get_json(force=True)
    user_id = data.get("user_id")
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    # Delete user (cascade will handle related records)
    query(
        current_app,
        "DELETE FROM users WHERE id=%s",
        (user_id,),
        commit=True,
    )
    
    return jsonify({"message": "User deleted successfully"}), 200


# ============================================
# WORKER MANAGEMENT
# ============================================

@admin_bp.get("/workers")
def get_all_workers():
    """Get all workers with verification status"""
    workers = query(
        current_app,
        """
        SELECT id, name, email, phone, service_type, experience, area, pincode,
               status, verification_status, avg_rating, complaint_count, created_at
        FROM workers
        ORDER BY created_at DESC
        """,
        fetchall=True,
    )
    
    return jsonify({"workers": workers or []})


@admin_bp.post("/block-worker")
def block_worker():
    """Block or unblock a worker"""
    data = request.get_json(force=True)
    worker_id = data.get("worker_id")
    action = data.get("action", "block")  # 'block' or 'unblock'
    
    if not worker_id:
        return jsonify({"error": "worker_id is required"}), 400
    
    if action == "block":
        query(
            current_app,
            "UPDATE workers SET verification_status='blocked', is_blocked=1 WHERE id=%s",
            (worker_id,),
            commit=True,
        )
    else:  # unblock
        query(
            current_app,
            "UPDATE workers SET verification_status='approved', is_blocked=0 WHERE id=%s",
            (worker_id,),
            commit=True,
        )
    
    return jsonify({"message": f"Worker {action}ed successfully"}), 200


@admin_bp.delete("/delete-worker")
def delete_worker():
    """Delete a worker account"""
    data = request.get_json(force=True)
    worker_id = data.get("worker_id")
    
    if not worker_id:
        return jsonify({"error": "worker_id is required"}), 400
    
    # Delete worker (cascade will handle related records)
    query(
        current_app,
        "DELETE FROM workers WHERE id=%s",
        (worker_id,),
        commit=True,
    )
    
    return jsonify({"message": "Worker deleted successfully"}), 200

