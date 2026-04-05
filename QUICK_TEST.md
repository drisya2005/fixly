# Quick API Testing Guide

## 🚀 Fastest Way: Automated Testing

### Step 1: Make sure Flask server is running
Open a terminal and run:
```bash
python backend/app.py
```
Keep this terminal open!

### Step 2: Install requests library (if not already installed)
```bash
pip install requests
```

### Step 3: Run the automated test script
Open a **NEW terminal** (keep Flask server running) and run:
```bash
python test_api_endpoints.py
```

This will automatically test all endpoints and show you the results! ✅

---

## 📝 Manual Testing with Postman

### Step 1: Download Postman
https://www.postman.com/downloads/

### Step 2: Test Endpoints One by One

#### 1️⃣ Register User
- **Method:** POST
- **URL:** `http://127.0.0.1:5000/api/auth/user/register`
- **Body (JSON):**
```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "password": "password123",
  "pincode": "560001"
}
```

#### 2️⃣ User Login
- **Method:** POST
- **URL:** `http://127.0.0.1:5000/api/auth/user/login`
- **Body (JSON):**
```json
{
  "phone": "9876543210",
  "password": "password123"
}
```

#### 3️⃣ Register Worker
- **Method:** POST
- **URL:** `http://127.0.0.1:5000/api/auth/worker/register`
- **Body (JSON):**
```json
{
  "name": "Rajesh Kumar",
  "phone": "9876543211",
  "password": "worker123",
  "service_type": "Plumber",
  "pincode": "560001"
}
```

#### 4️⃣ Worker Login
- **Method:** POST
- **URL:** `http://127.0.0.1:5000/api/auth/worker/login`
- **Body (JSON):**
```json
{
  "phone": "9876543211",
  "password": "worker123"
}
```

#### 5️⃣ Update Worker Status
- **Method:** POST
- **URL:** `http://127.0.0.1:5000/api/workers/status`
- **Body (JSON):** (Use worker_id from step 4)
```json
{
  "worker_id": 1,
  "status": "Available"
}
```

#### 6️⃣ Search Workers
- **Method:** GET
- **URL:** `http://127.0.0.1:5000/api/workers/search?service_type=Plumber&pincode=560001`

---

## ✅ Expected Results

- **Registration:** `{"message": "User registered"}` (Status: 201)
- **Login:** `{"message": "Login ok", "user_id": 1, "name": "John Doe"}` (Status: 200)
- **Status Update:** `{"message": "Status updated"}` (Status: 200)
- **Search:** `{"workers": [...]}` (Status: 200)

---

For detailed instructions, see **API_TESTING_GUIDE.md**

