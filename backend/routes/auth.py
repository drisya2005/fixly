import re
import random
from datetime import datetime, timedelta

from flask import Blueprint, current_app, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from backend.db import query

EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
PHONE_RE = re.compile(r'^\d{10}$')
PINCODE_RE = re.compile(r'^\d{6}$')

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/register")
def register():
    """
    Unified registration endpoint for both users and workers.
    Checks the 'role' field to determine which table to insert into.
    """
    data = request.get_json(force=True)
    role = (data.get("role") or "").strip().lower()
    
    if role not in ("user", "worker"):
        return jsonify({"error": "Invalid role. Must be 'user' or 'worker'"}), 400
    
    # Common fields
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    phone = (data.get("phone") or "").strip()
    password = data.get("password") or ""
    house_name = (data.get("house_name") or "").strip()
    city = (data.get("city") or "").strip()
    district = (data.get("district") or "").strip()
    location = (data.get("location") or "").strip()  # pincode
    
    # Required fields
    if not name or not email or not phone or not password or not house_name or not city or not district or not location:
        return jsonify({"error": "name, email, phone, password, house_name, city, district, and pincode are required"}), 400

    # Name: letters and spaces only, min 2 chars
    if len(name) < 2 or not re.match(r'^[a-zA-Z\s]+$', name):
        return jsonify({"error": "Name must be at least 2 characters and contain only letters and spaces"}), 400

    # Email format
    if not EMAIL_RE.match(email):
        return jsonify({"error": "Invalid email format (e.g. name@example.com)"}), 400

    # Phone: exactly 10 digits
    if not PHONE_RE.match(phone):
        return jsonify({"error": "Phone number must be exactly 10 digits"}), 400

    # House name: min 3, max 100 chars
    if len(house_name) < 3 or len(house_name) > 100:
        return jsonify({"error": "House name must be between 3 and 100 characters"}), 400

    # City: letters and spaces only
    if not re.match(r'^[a-zA-Z\s]+$', city) or len(city) < 2:
        return jsonify({"error": "City must contain only letters and spaces (min 2 characters)"}), 400

    # District: letters and spaces only
    if not re.match(r'^[a-zA-Z\s]+$', district) or len(district) < 2:
        return jsonify({"error": "District must contain only letters and spaces (min 2 characters)"}), 400

    # Pincode: exactly 6 digits
    if not PINCODE_RE.match(location):
        return jsonify({"error": "Pincode must be exactly 6 digits"}), 400

    # Password: min 6 chars
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long"}), 400
    
    if role == "user":
        # Check if user already exists
        existing = query(
            current_app,
            "SELECT id FROM users WHERE phone=%s OR email=%s",
            (phone, email),
            fetchone=True,
        )
        if existing:
            return jsonify({"error": "Phone or email already registered"}), 409
        
        # Hash password and insert user
        pwd_hash = generate_password_hash(password)
        query(
            current_app,
            """
            INSERT INTO users (name, phone, email, password_hash, address, city, district, area, pincode, status)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,'active')
            """,
            (name, phone, email, pwd_hash, house_name, city, district, location, location),
            commit=True,
        )
        return jsonify({"message": "User registered successfully"}), 201
    
    else:  # worker
        # Worker-specific fields
        service_type = (data.get("service_type") or "").strip()

        if not service_type:
            return jsonify({"error": "service_type is required for workers"}), 400
        
        # Check if worker already exists
        existing = query(
            current_app,
            "SELECT id FROM workers WHERE phone=%s OR email=%s",
            (phone, email),
            fetchone=True,
        )
        if existing:
            return jsonify({"error": "Phone or email already registered"}), 409
        
        # Hash password and insert worker
        try:
            pwd_hash = generate_password_hash(password)
            query(
                current_app,
                """
                INSERT INTO workers (name, phone, email, password_hash, service_type, address, city, district, area, pincode, status, verification_status)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'Offline','pending')
                """,
                (name, phone, email, pwd_hash, service_type, house_name, city, district, location, location),
                commit=True,
            )
            return jsonify({"message": "Worker registered successfully. Waiting for admin approval."}), 201
        except Exception as e:
            import traceback
            print(f"Worker registration error: {e}")
            print(traceback.format_exc())
            return jsonify({"error": "Registration failed. Please try again or contact support."}), 500


@auth_bp.post("/user/register")
def user_register():
    """
    Simple user registration.
    Required: name, phone, password, pincode
    """
    data = request.get_json(force=True)
    name = (data.get("name") or "").strip()
    phone = (data.get("phone") or "").strip()
    password = data.get("password") or ""
    pincode = (data.get("pincode") or "").strip()
    area = (data.get("area") or "").strip()
    address = (data.get("address") or "").strip()
    email = (data.get("email") or "").strip()

    if not name or not phone or not password or not pincode:
        return jsonify({"error": "name, phone, password, pincode are required"}), 400

    existing = query(
        current_app,
        "SELECT id FROM users WHERE phone=%s",
        (phone,),
        fetchone=True,
    )
    if existing:
        return jsonify({"error": "Phone already registered"}), 409

    pwd_hash = generate_password_hash(password)
    query(
        current_app,
        """
        INSERT INTO users (name, phone, email, password_hash, address, area, pincode)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
        """,
        (name, phone, email or None, pwd_hash, address or None, area or None, pincode),
        commit=True,
    )
    return jsonify({"message": "User registered"}), 201


@auth_bp.post("/user/login")
def user_login():
    """
    Returns a simple response with user_id.
    (For BTech-level project we avoid full JWT/auth complexity.)
    """
    data = request.get_json(force=True)
    phone = (data.get("phone") or "").strip()
    password = data.get("password") or ""

    if not phone or not password:
        return jsonify({"error": "Phone and password are required"}), 400
    if not PHONE_RE.match(phone):
        return jsonify({"error": "Phone number must be exactly 10 digits"}), 400

    user = query(
        current_app,
        "SELECT id, password_hash, name, status FROM users WHERE phone=%s",
        (phone,),
        fetchone=True,
    )
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid phone or password"}), 401

    if user.get("status") == "blocked":
        return jsonify({"error": "Your account has been blocked by admin"}), 403

    return jsonify({"message": "Login ok", "user_id": user["id"], "name": user["name"]})


@auth_bp.post("/worker/register")
def worker_register():
    """
    Worker registration.
    New worker is tagged as is_new=1 by default (see schema).
    """
    data = request.get_json(force=True)
    name = (data.get("name") or "").strip()
    phone = (data.get("phone") or "").strip()
    password = data.get("password") or ""
    service_type = (data.get("service_type") or "").strip()
    pincode = (data.get("pincode") or "").strip()
    area = (data.get("area") or "").strip()
    email = (data.get("email") or "").strip()

    if not name or not phone or not password or not service_type or not pincode:
        return jsonify({"error": "name, phone, password, service_type, pincode are required"}), 400

    existing = query(
        current_app,
        "SELECT id FROM workers WHERE phone=%s",
        (phone,),
        fetchone=True,
    )
    if existing:
        return jsonify({"error": "Phone already registered"}), 409

    pwd_hash = generate_password_hash(password)
    query(
        current_app,
        """
        INSERT INTO workers (name, phone, email, password_hash, service_type, area, pincode, status)
        VALUES (%s,%s,%s,%s,%s,%s,%s,'Offline')
        """,
        (name, phone, email or None, pwd_hash, service_type, area or None, pincode),
        commit=True,
    )
    return jsonify({"message": "Worker registered"}), 201


@auth_bp.post("/worker/login")
def worker_login():
    data = request.get_json(force=True)
    phone = (data.get("phone") or "").strip()
    password = data.get("password") or ""

    if not phone or not password:
        return jsonify({"error": "Phone and password are required"}), 400
    if not PHONE_RE.match(phone):
        return jsonify({"error": "Phone number must be exactly 10 digits"}), 400

    worker = query(
        current_app,
        "SELECT id, password_hash, name, is_blocked, verification_status FROM workers WHERE phone=%s",
        (phone,),
        fetchone=True,
    )
    if not worker or not check_password_hash(worker["password_hash"], password):
        return jsonify({"error": "Invalid phone or password"}), 401

    if worker["is_blocked"] == 1 or worker.get("verification_status") == "blocked":
        return jsonify({"error": "Worker is blocked by admin"}), 403

    if worker.get("verification_status") == "pending":
        return jsonify({"error": "Your account is pending admin approval. Please wait for verification."}), 403

    return jsonify({"message": "Login ok", "worker_id": worker["id"], "name": worker["name"]})


@auth_bp.post("/admin/login")
def admin_login():
    """
    Admin login (username + password).
    For simplicity, return admin_id.
    """
    data = request.get_json(force=True)
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    admin = query(
        current_app,
        "SELECT id, password_hash FROM admins WHERE username=%s",
        (username,),
        fetchone=True,
    )
    if not admin or not check_password_hash(admin["password_hash"], password):
        return jsonify({"error": "Invalid username or password"}), 401

    return jsonify({"message": "Login ok", "admin_id": admin["id"]})


@auth_bp.post("/user/reset-password")
def user_reset_password():
    data = request.get_json(force=True)
    phone = (data.get("phone") or "").strip()
    new_password = data.get("new_password") or ""

    if not phone or not new_password:
        return jsonify({"error": "phone and new_password are required"}), 400
    if not PHONE_RE.match(phone):
        return jsonify({"error": "Phone number must be exactly 10 digits"}), 400
    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    user = query(
        current_app,
        "SELECT id FROM users WHERE phone=%s",
        (phone,),
        fetchone=True,
    )
    if not user:
        return jsonify({"error": "No account found with this phone number"}), 404

    pwd_hash = generate_password_hash(new_password)
    query(
        current_app,
        "UPDATE users SET password_hash=%s WHERE phone=%s",
        (pwd_hash, phone),
        commit=True,
    )
    return jsonify({"message": "Password reset successful"}), 200


@auth_bp.post("/worker/reset-password")
def worker_reset_password():
    data = request.get_json(force=True)
    phone = (data.get("phone") or "").strip()
    new_password = data.get("new_password") or ""

    if not phone or not new_password:
        return jsonify({"error": "phone and new_password are required"}), 400
    if not PHONE_RE.match(phone):
        return jsonify({"error": "Phone number must be exactly 10 digits"}), 400
    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    worker = query(
        current_app,
        "SELECT id FROM workers WHERE phone=%s",
        (phone,),
        fetchone=True,
    )
    if not worker:
        return jsonify({"error": "No worker account found with this phone number"}), 404

    pwd_hash = generate_password_hash(new_password)
    query(
        current_app,
        "UPDATE workers SET password_hash=%s WHERE phone=%s",
        (pwd_hash, phone),
        commit=True,
    )
    return jsonify({"message": "Password reset successful"}), 200


@auth_bp.post("/admin/reset-password")
def admin_reset_password():
    data = request.get_json(force=True)
    username = (data.get("username") or "").strip()
    new_password = data.get("new_password") or ""

    if not username or not new_password:
        return jsonify({"error": "username and new_password are required"}), 400
    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    admin = query(
        current_app,
        "SELECT id FROM admins WHERE username=%s",
        (username,),
        fetchone=True,
    )
    if not admin:
        return jsonify({"error": "No admin account found with this username"}), 404

    pwd_hash = generate_password_hash(new_password)
    query(
        current_app,
        "UPDATE admins SET password_hash=%s WHERE username=%s",
        (pwd_hash, username),
        commit=True,
    )
    return jsonify({"message": "Password reset successful"}), 200


@auth_bp.post("/send-otp")
def send_otp():
    """
    Generate and send OTP for password reset (User/Worker only).
    Demo mode: OTP is returned in response for display on screen.
    """
    data = request.get_json(force=True)
    phone = (data.get("phone") or "").strip()
    role = (data.get("role") or "").strip()

    if not phone or not role:
        return jsonify({"error": "phone and role are required"}), 400

    if not PHONE_RE.match(phone):
        return jsonify({"error": "Phone number must be exactly 10 digits"}), 400

    if role not in ("user", "worker"):
        return jsonify({"error": "role must be 'user' or 'worker'"}), 400

    # Verify phone exists in the respective table
    table_name = "users" if role == "user" else "workers"
    user = query(
        current_app,
        f"SELECT id FROM {table_name} WHERE phone=%s",
        (phone,),
        fetchone=True,
    )

    if not user:
        return jsonify({"error": f"No {role} account found with this phone number"}), 404

    # Generate 6-digit OTP
    otp_code = str(random.randint(100000, 999999))

    try:
        # Delete any existing OTP for this phone+role (cleanup)
        query(
            current_app,
            "DELETE FROM password_otp WHERE phone=%s AND role=%s",
            (phone, role),
            commit=True,
        )

        # Insert new OTP with 5-minute expiry
        expires_at = datetime.utcnow() + timedelta(minutes=5)
        query(
            current_app,
            "INSERT INTO password_otp (phone, role, otp_code, expires_at) VALUES (%s, %s, %s, %s)",
            (phone, role, otp_code, expires_at),
            commit=True,
        )

        current_app.logger.info(f"OTP generated for {role} {phone}: {otp_code}")
    except Exception as e:
        current_app.logger.error(f"Error saving OTP: {e}")
        return jsonify({"error": f"Failed to generate OTP: {str(e)}"}), 500

    # Demo mode: return OTP in response so it can be displayed on screen
    return jsonify({
        "message": "OTP generated successfully",
        "otp": otp_code  # Demo: show OTP on screen
    }), 200


@auth_bp.post("/verify-otp")
def verify_otp():
    """
    Verify OTP for password reset.
    Checks if OTP exists, matches phone+role, and hasn't expired.
    """
    data = request.get_json(force=True)
    phone = (data.get("phone") or "").strip()
    role = (data.get("role") or "").strip()
    otp = (data.get("otp") or "").strip()

    if not phone or not role or not otp:
        return jsonify({"error": "phone, role, and otp are required"}), 400

    if not PHONE_RE.match(phone):
        return jsonify({"error": "Phone number must be exactly 10 digits"}), 400

    if role not in ("user", "worker"):
        return jsonify({"error": "role must be 'user' or 'worker'"}), 400

    # Verify OTP: check if it exists, matches phone+role, and hasn't expired
    otp_record = query(
        current_app,
        "SELECT id FROM password_otp WHERE phone=%s AND role=%s AND otp_code=%s",
        (phone, role, otp),
        fetchone=True,
    )

    if not otp_record:
        return jsonify({"error": "Invalid OTP"}), 400

    # Check expiry separately
    expiry_check = query(
        current_app,
        "SELECT expires_at FROM password_otp WHERE phone=%s AND role=%s AND otp_code=%s",
        (phone, role, otp),
        fetchone=True,
    )

    if expiry_check:
        from datetime import datetime
        expires_at = expiry_check['expires_at']
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)

        if datetime.utcnow() > expires_at:
            return jsonify({"error": "OTP has expired. Please request a new one."}), 400

    # Delete the OTP after verification (one-time use)
    query(
        current_app,
        "DELETE FROM password_otp WHERE id=%s",
        (otp_record["id"],),
        commit=True,
    )

    return jsonify({"message": "OTP verified successfully"}), 200
