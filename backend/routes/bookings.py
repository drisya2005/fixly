"""
Booking/Appointment Routes
Handles appointment booking, availability management, and appointment queries.
"""
from flask import Blueprint, current_app, jsonify, request

from backend.db import query

bookings_bp = Blueprint("bookings", __name__, url_prefix="/api")

FIXED_SLOTS = [
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 01:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM",
    "05:00 PM - 06:00 PM",
    "06:00 PM - 07:00 PM",
]


@bookings_bp.get("/workers/<int:worker_id>/slots")
def get_worker_slots(worker_id):
    """
    Get available time slots for a worker on a specific date.
    Query params: date (YYYY-MM-DD)
    Returns available slots (not already booked).
    """
    date = request.args.get("date", "").strip()
    
    if not date:
        return jsonify({"error": "date parameter is required (YYYY-MM-DD)"}), 400
    
    # Get worker's available time slots
    availability = query(
        current_app,
        """
        SELECT id, time_slot, day_of_week
        FROM worker_availability
        WHERE worker_id=%s AND is_active=1
        """,
        (worker_id,),
        fetchall=True,
    )
    
    if not availability:
        return jsonify({"available_slots": [], "message": "No availability set by worker"}), 200
    
    # Get already booked slots for this date
    booked_slots = query(
        current_app,
        """
        SELECT time_slot
        FROM appointments
        WHERE worker_id=%s AND booking_date=%s 
        AND status IN ('Booked', 'Confirmed', 'InProgress')
        """,
        (worker_id, date),
        fetchall=True,
    )
    
    booked_slot_list = [slot["time_slot"] for slot in booked_slots]
    
    # Filter out booked slots
    available_slots = [
        {
            "id": slot["id"],
            "time_slot": slot["time_slot"],
            "day_of_week": slot.get("day_of_week"),
        }
        for slot in availability
        if slot["time_slot"] not in booked_slot_list
    ]
    
    return jsonify({"available_slots": available_slots})


@bookings_bp.post("/book-appointment")
def book_appointment():
    """
    Create a new appointment/booking.
    Required: user_id, worker_id, booking_date, time_slot, service_type
    """
    data = request.get_json(force=True)
    user_id = data.get("user_id")
    worker_id = data.get("worker_id")
    booking_date = (data.get("booking_date") or "").strip()
    time_slot = (data.get("time_slot") or "").strip()
    service_type = (data.get("service_type") or "").strip()
    address = (data.get("address") or "").strip()
    notes = (data.get("notes") or "").strip()
    
    # Validation
    if not all([user_id, worker_id, booking_date, time_slot, service_type]):
        return jsonify({"error": "user_id, worker_id, booking_date, time_slot, and service_type are required"}), 400
    if time_slot not in FIXED_SLOTS:
        return jsonify({"error": "Invalid time slot."}), 400
    
    # Check if slot is still available (prevent double booking)
    existing = query(
        current_app,
        """
        SELECT id FROM appointments
        WHERE worker_id=%s AND booking_date=%s AND time_slot=%s
        AND status IN ('Booked', 'Confirmed', 'InProgress')
        """,
        (worker_id, booking_date, time_slot),
        fetchone=True,
    )
    
    if existing:
        return jsonify({"error": "This time slot is already booked"}), 409
    
    # Verify worker has this slot in availability
    slot_exists = query(
        current_app,
        "SELECT id FROM worker_availability WHERE worker_id=%s AND time_slot=%s AND is_active=1",
        (worker_id, time_slot),
        fetchone=True,
    )
    
    if not slot_exists:
        return jsonify({"error": "Worker doesn't have this time slot available"}), 400
    
    # Get user name for notification
    user_info = query(
        current_app,
        "SELECT name FROM users WHERE id=%s",
        (user_id,),
        fetchone=True,
    )
    user_name = user_info.get("name", "A user") if user_info else "A user"
    
    # Create appointment
    query(
        current_app,
        """
        INSERT INTO appointments (user_id, worker_id, booking_date, time_slot, service_type, address, notes, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, 'Booked')
        """,
        (user_id, worker_id, booking_date, time_slot, service_type, address or None, notes or None),
        commit=True,
    )
    
    # Create notification for worker
    notification_message = f"New booking request from {user_name} for {booking_date} at {time_slot}"
    query(
        current_app,
        """
        INSERT INTO notifications (worker_id, message, is_read)
        VALUES (%s, %s, 0)
        """,
        (worker_id, notification_message),
        commit=True,
    )
    
    return jsonify({"message": "Appointment booked successfully"}), 201


@bookings_bp.get("/user/appointments")
def get_user_appointments():
    """
    Get all appointments for a logged-in user.
    Query params: user_id
    """
    user_id = request.args.get("user_id")
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    appointments = query(
        current_app,
        """
        SELECT a.id, a.booking_date, a.time_slot, a.service_type, a.address, a.status, a.notes,
               a.created_at, w.name as worker_name, w.phone as worker_phone, w.service_type as worker_service
        FROM appointments a
        JOIN workers w ON a.worker_id = w.id
        WHERE a.user_id=%s
        ORDER BY a.booking_date DESC, a.time_slot DESC
        """,
        (user_id,),
        fetchall=True,
    )
    
    return jsonify({"appointments": appointments or []})


@bookings_bp.post("/worker/availability")
def set_worker_availability():
    """
    Worker sets their available time slots.
    Required: worker_id, time_slot
    Optional: day_of_week
    """
    data = request.get_json(force=True)
    worker_id = data.get("worker_id")
    time_slot = (data.get("time_slot") or "").strip()
    day_of_week = (data.get("day_of_week") or "").strip() or None
    
    if not worker_id or not time_slot:
        return jsonify({"error": "worker_id and time_slot are required"}), 400
    
    # Check if slot already exists for this worker
    if time_slot not in FIXED_SLOTS:
        return jsonify({"error": "Invalid time slot."}), 400
    existing = query(
        current_app,
        "SELECT id FROM worker_availability WHERE worker_id=%s AND time_slot=%s",
        (worker_id, time_slot),
        fetchone=True,
    )
    
    if existing:
        return jsonify({"error": "This time slot already exists"}), 409
    
    # Add availability
    query(
        current_app,
        """
        INSERT INTO worker_availability (worker_id, time_slot, day_of_week, is_active)
        VALUES (%s, %s, %s, 1)
        """,
        (worker_id, time_slot, day_of_week),
        commit=True,
    )
    
    return jsonify({"message": "Availability slot added successfully"}), 201


@bookings_bp.get("/worker/<int:worker_id>/availability")
def get_worker_availability(worker_id):
    """
    Get all availability slots for a worker.
    """
    availability = query(
        current_app,
        """
        SELECT id, time_slot, day_of_week, is_active, created_at
        FROM worker_availability
        WHERE worker_id=%s
        ORDER BY time_slot
        """,
        (worker_id,),
        fetchall=True,
    )
    
    return jsonify({"availability": availability or []})


@bookings_bp.delete("/worker/availability/<int:availability_id>")
def delete_worker_availability(availability_id):
    """
    Worker deletes an availability slot.
    """
    data = request.get_json(force=True)
    worker_id = data.get("worker_id")
    
    if not worker_id:
        return jsonify({"error": "worker_id is required"}), 400
    
    # Verify ownership
    slot = query(
        current_app,
        "SELECT id FROM worker_availability WHERE id=%s AND worker_id=%s",
        (availability_id, worker_id),
        fetchone=True,
    )
    
    if not slot:
        return jsonify({"error": "Availability slot not found or unauthorized"}), 404
    
    # Delete (or deactivate)
    query(
        current_app,
        "UPDATE worker_availability SET is_active=0 WHERE id=%s",
        (availability_id,),
        commit=True,
    )
    
    return jsonify({"message": "Availability slot removed"}), 200


@bookings_bp.get("/worker/<int:worker_id>/appointments")
def get_worker_appointments(worker_id):
    """
    Get all appointments for a worker.
    """
    appointments = query(
        current_app,
        """
        SELECT a.id, a.booking_date, a.time_slot, a.service_type, a.address, a.status, a.notes,
               a.created_at, u.name as user_name, u.phone as user_phone
        FROM appointments a
        JOIN users u ON a.user_id = u.id
        WHERE a.worker_id=%s
        ORDER BY a.booking_date DESC, a.time_slot DESC
        """,
        (worker_id,),
        fetchall=True,
    )
    
    return jsonify({"appointments": appointments or []})


@bookings_bp.get("/user/bookings")
def get_user_bookings():
    """
    Get all bookings for a logged-in user.
    Query params: user_id
    """
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    bookings = query(
        current_app,
        """
        SELECT a.id, a.booking_date, a.time_slot, a.service_type, a.address, a.status, a.notes,
               a.created_at, a.worker_id,
               w.name as worker_name, w.phone as worker_phone, w.service_type as worker_service,
               (SELECT COUNT(*) FROM ratings r WHERE r.booking_id=a.id AND r.user_id=a.user_id) as has_review
        FROM appointments a
        JOIN workers w ON a.worker_id = w.id
        WHERE a.user_id=%s
        ORDER BY a.booking_date DESC, a.time_slot DESC
        """,
        (user_id,),
        fetchall=True,
    )

    return jsonify({"bookings": bookings or []})


@bookings_bp.post("/booking/cancel")
def cancel_booking():
    """
    User cancels a booking.
    Required: booking_id, user_id
    """
    data = request.get_json(force=True)
    booking_id = data.get("booking_id")
    user_id = data.get("user_id")
    
    if not booking_id or not user_id:
        return jsonify({"error": "booking_id and user_id are required"}), 400
    
    # Verify booking belongs to user
    booking = query(
        current_app,
        "SELECT id, status, booking_date FROM appointments WHERE id=%s AND user_id=%s",
        (booking_id, user_id),
        fetchone=True,
    )
    
    if not booking:
        return jsonify({"error": "Booking not found or unauthorized"}), 404
    
    # Check if booking can be cancelled
    if booking["status"] in ("Completed", "Cancelled"):
        return jsonify({"error": f"Cannot cancel booking with status: {booking['status']}"}), 400
    
    # Update status to Cancelled
    query(
        current_app,
        "UPDATE appointments SET status='Cancelled' WHERE id=%s",
        (booking_id,),
        commit=True,
    )
    
    return jsonify({"message": "Booking cancelled successfully"}), 200


@bookings_bp.post("/booking/update-status")
def update_booking_status():
    """
    Worker updates booking status (Accept/Reject/Complete).
    Required: booking_id, worker_id, status
    """
    data = request.get_json(force=True)
    booking_id = data.get("booking_id")
    worker_id = data.get("worker_id")
    new_status = (data.get("status") or "").strip()
    
    if not booking_id or not worker_id or not new_status:
        return jsonify({"error": "booking_id, worker_id, and status are required"}), 400
    
    # Valid statuses for worker actions
    valid_statuses = ["Confirmed", "InProgress", "Completed", "Cancelled"]
    if new_status not in valid_statuses:
        return jsonify({"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}), 400
    
    # Verify booking belongs to worker
    booking = query(
        current_app,
        "SELECT id, status FROM appointments WHERE id=%s AND worker_id=%s",
        (booking_id, worker_id),
        fetchone=True,
    )
    
    if not booking:
        return jsonify({"error": "Appointment not found or unauthorized"}), 404
    
    # Update status
    query(
        current_app,
        "UPDATE appointments SET status=%s WHERE id=%s",
        (new_status, booking_id),
        commit=True,
    )
    
    return jsonify({"message": f"Booking status updated to {new_status}"}), 200


@bookings_bp.get("/worker/<int:worker_id>/notifications")
def get_worker_notifications(worker_id):
    """
    Get all notifications for a worker.
    Query params: unread_only (optional, true/false)
    """
    unread_only = request.args.get("unread_only", "false").lower() == "true"
    
    if unread_only:
        notifications = query(
            current_app,
            """
            SELECT id, message, is_read, created_at
            FROM notifications
            WHERE worker_id=%s AND is_read=0
            ORDER BY created_at DESC
            """,
            (worker_id,),
            fetchall=True,
        )
    else:
        notifications = query(
            current_app,
            """
            SELECT id, message, is_read, created_at
            FROM notifications
            WHERE worker_id=%s
            ORDER BY created_at DESC
            LIMIT 50
            """,
            (worker_id,),
            fetchall=True,
        )
    
    return jsonify({"notifications": notifications or []})


@bookings_bp.post("/notifications/read")
def mark_notification_read():
    """
    Mark a notification as read.
    Required: notification_id, worker_id
    """
    data = request.get_json(force=True)
    notification_id = data.get("notification_id")
    worker_id = data.get("worker_id")
    
    if not notification_id or not worker_id:
        return jsonify({"error": "notification_id and worker_id are required"}), 400
    
    # Verify notification belongs to worker
    notification = query(
        current_app,
        "SELECT id FROM notifications WHERE id=%s AND worker_id=%s",
        (notification_id, worker_id),
        fetchone=True,
    )
    
    if not notification:
        return jsonify({"error": "Notification not found or unauthorized"}), 404
    
    # Mark as read
    query(
        current_app,
        "UPDATE notifications SET is_read=1 WHERE id=%s",
        (notification_id,),
        commit=True,
    )
    
    return jsonify({"message": "Notification marked as read"}), 200


@bookings_bp.post("/notifications/read-all")
def mark_all_notifications_read():
    """
    Mark all notifications as read for a worker.
    Required: worker_id
    """
    data = request.get_json(force=True)
    worker_id = data.get("worker_id")
    
    if not worker_id:
        return jsonify({"error": "worker_id is required"}), 400
    
    # Mark all as read
    query(
        current_app,
        "UPDATE notifications SET is_read=1 WHERE worker_id=%s AND is_read=0",
        (worker_id,),
        commit=True,
    )
    
    return jsonify({"message": "All notifications marked as read"}), 200


@bookings_bp.post("/emergency")
def emergency_request():
    """
    Emergency request from a user using GPS location.
    Finds all Available workers within a 10km radius using GPS coordinates,
    sends each of them an EMERGENCY notification,
    and returns the list of those workers.
    Required: user_id, user_name, latitude, longitude
    Optional: service_type (if blank, alerts all service types)
    """
    data = request.get_json(force=True)
    user_id = data.get("user_id")
    user_name = (data.get("user_name") or "A user").strip()
    user_lat = data.get("latitude")
    user_lon = data.get("longitude")
    service_type = (data.get("service_type") or "").strip()

    if not user_id or user_lat is None or user_lon is None:
        return jsonify({"error": "user_id, latitude, and longitude are required"}), 400

    try:
        user_lat = float(user_lat)
        user_lon = float(user_lon)
    except (ValueError, TypeError):
        return jsonify({"error": "latitude and longitude must be valid numbers"}), 400

    # Get live location data for workers (from live_locations table if available)
    # Otherwise get all available workers
    if service_type:
        workers = query(
            current_app,
            """
            SELECT w.id, w.name, w.phone, w.service_type, w.area, w.pincode, w.avg_rating
            FROM workers w
            WHERE w.service_type=%s
              AND w.status='Available' AND w.verification_status='approved'
              AND (w.is_blocked=0 OR w.is_blocked IS NULL)
            ORDER BY w.avg_rating DESC
            """,
            (service_type,),
            fetchall=True,
        )
    else:
        workers = query(
            current_app,
            """
            SELECT w.id, w.name, w.phone, w.service_type, w.area, w.pincode, w.avg_rating
            FROM workers w
            WHERE w.status='Available' AND w.verification_status='approved'
              AND (w.is_blocked=0 OR w.is_blocked IS NULL)
            ORDER BY w.avg_rating DESC
            """,
            fetchall=True,
        )

    if not workers:
        return jsonify({"workers": [], "message": "No available workers found"}), 200

    # Filter workers by distance (5km radius) using Haversine formula
    from math import radians, cos, sin, asin, sqrt

    def haversine(lon1, lat1, lon2, lat2):
        """Calculate distance between two points in km"""
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        km = 6371 * c
        return km

    # Filter workers by distance from user location - ONLY nearby workers
    EMERGENCY_RADIUS_KM = 10  # 10km radius for emergency (strict filter)
    nearby_workers = []

    def haversine(lon1, lat1, lon2, lat2):
        """Calculate distance between two points in km"""
        from math import radians, cos, sin, asin, sqrt
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        km = 6371 * c
        return km

    # Get workers with ACTIVE location tracking (within 10km) - ONLY NEARBY
    nearby_workers = query(
        current_app,
        """
        SELECT w.id, w.name, w.phone, w.service_type, w.area, w.pincode, w.avg_rating,
               l.latitude, l.longitude
        FROM workers w
        JOIN live_locations l ON w.id = l.worker_id
        WHERE w.status='Available' AND w.verification_status='approved'
          AND (w.is_blocked=0 OR w.is_blocked IS NULL)
        ORDER BY w.avg_rating DESC
        """,
        fetchall=True,
    ) or []

    # Filter by service type if specified
    if service_type:
        nearby_workers = [w for w in nearby_workers if w['service_type'] == service_type]

    current_app.logger.info(f"Emergency: User at ({user_lat}, {user_lon}), Found {len(nearby_workers)} workers with active tracking")

    # Calculate distance and keep ONLY workers within radius
    filtered_workers = []
    for worker in nearby_workers:
        try:
            distance = haversine(
                user_lon, user_lat,
                float(worker["longitude"]), float(worker["latitude"])
            )
            # STRICT: Only include workers within 10km radius
            if distance <= EMERGENCY_RADIUS_KM:
                worker["distance_km"] = round(distance, 2)
                filtered_workers.append(worker)
                current_app.logger.info(f"  ✓ {worker['name']}: {distance:.2f}km nearby")
            else:
                current_app.logger.info(f"  ✗ {worker['name']}: {distance:.2f}km (too far)")
        except Exception as e:
            current_app.logger.error(f"Error calculating distance for worker {worker['id']}: {e}")

    if not filtered_workers:
        return jsonify({
            "workers": [],
            "message": f"No available workers with active location tracking found within {EMERGENCY_RADIUS_KM}km. Ask workers to enable 'Share Location' feature!"
        }), 200

    # Sort by distance (closest first)
    filtered_workers.sort(key=lambda w: w.get("distance_km", float('inf')))
    nearby_workers = filtered_workers

    # Send EMERGENCY notification to each available worker
    service_label = f" ({service_type})" if service_type else ""
    location_info = f"({user_lat:.4f}, {user_lon:.4f})"
    message = (
        f"EMERGENCY ALERT{service_label}: {user_name} needs urgent help {location_info}. "
        f"Please respond immediately!"
    )
    for worker in nearby_workers:
        query(
            current_app,
            "INSERT INTO notifications (worker_id, message, is_read) VALUES (%s, %s, 0)",
            (worker["id"], message),
            commit=True,
        )

    return jsonify({
        "workers": nearby_workers,
        "message": f"Emergency alert sent to {len(nearby_workers)} worker(s) nearby",
    }), 200

