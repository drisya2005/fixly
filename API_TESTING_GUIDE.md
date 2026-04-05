# API Testing Guide - Step by Step

This guide will help you test all available endpoints in your Household Service Provider Management System.

## 📋 Available Endpoints

### Authentication Endpoints
1. `POST /api/auth/user/register` - Register a new user
2. `POST /api/auth/user/login` - User login
3. `POST /api/auth/worker/register` - Register a new worker
4. `POST /api/auth/worker/login` - Worker login
5. `POST /api/auth/admin/login` - Admin login

### Worker Endpoints
6. `GET /api/workers/search` - Search available workers
7. `POST /api/workers/status` - Update worker status

---

## 🚀 Method 1: Using Python Test Script (Easiest)

I've created an automated test script. Just run:

```bash
python test_api_endpoints.py
```

This will test all endpoints automatically and show you the results.

---

## 🧪 Method 2: Using Postman (Recommended for Manual Testing)

### Step 1: Install Postman
Download from: https://www.postman.com/downloads/

### Step 2: Create a New Collection
1. Open Postman
2. Click "New" → "Collection"
3. Name it "Household Service API"

### Step 3: Test Each Endpoint

#### Test 1: Register a User
1. Click "Add Request"
2. Name: "Register User"
3. Method: **POST**
4. URL: `http://127.0.0.1:5000/api/auth/user/register`
5. Go to **Body** tab → Select **raw** → Select **JSON**
6. Paste this JSON:
```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "password": "password123",
  "pincode": "560001",
  "area": "Bangalore",
  "email": "john@example.com",
  "address": "123 Main Street"
}
```
7. Click **Send**
8. **Expected Response:** `{"message": "User registered"}` with status 201

#### Test 2: User Login
1. Add new request: "User Login"
2. Method: **POST**
3. URL: `http://127.0.0.1:5000/api/auth/user/login`
4. Body (JSON):
```json
{
  "phone": "9876543210",
  "password": "password123"
}
```
5. Click **Send**
6. **Expected Response:** `{"message": "Login ok", "user_id": 1, "name": "John Doe"}`

#### Test 3: Register a Worker
1. Add new request: "Register Worker"
2. Method: **POST**
3. URL: `http://127.0.0.1:5000/api/auth/worker/register`
4. Body (JSON):
```json
{
  "name": "Rajesh Kumar",
  "phone": "9876543211",
  "password": "worker123",
  "service_type": "Plumber",
  "pincode": "560001",
  "area": "Bangalore",
  "email": "rajesh@example.com"
}
```
5. Click **Send**
6. **Expected Response:** `{"message": "Worker registered"}` with status 201

#### Test 4: Worker Login
1. Add new request: "Worker Login"
2. Method: **POST**
3. URL: `http://127.0.0.1:5000/api/auth/worker/login`
4. Body (JSON):
```json
{
  "phone": "9876543211",
  "password": "worker123"
}
```
5. Click **Send**
6. **Expected Response:** `{"message": "Login ok", "worker_id": 1, "name": "Rajesh Kumar"}`

#### Test 5: Update Worker Status
1. Add new request: "Update Worker Status"
2. Method: **POST**
3. URL: `http://127.0.0.1:5000/api/workers/status`
4. Body (JSON):
```json
{
  "worker_id": 1,
  "status": "Available"
}
```
5. Click **Send**
6. **Expected Response:** `{"message": "Status updated"}`

**Note:** Status can be: `"Available"`, `"Busy"`, or `"Offline"`

#### Test 6: Search Workers
1. Add new request: "Search Workers"
2. Method: **GET**
3. URL: `http://127.0.0.1:5000/api/workers/search?service_type=Plumber&pincode=560001`
4. Click **Send**
5. **Expected Response:** List of available workers

**Try different queries:**
- `?service_type=Plumber&pincode=560001` (by pincode)
- `?service_type=Electrician&area=Bangalore` (by area)
- `?service_type=Cleaner` (all available cleaners)

#### Test 7: Admin Login (Optional - requires admin account)
First, create an admin account in MySQL:
```sql
USE household_service_db;
-- Generate password hash first (use Python script below)
INSERT INTO admins (username, password_hash) 
VALUES ('admin', 'pbkdf2:sha256:600000$...');
```

Or use Python to generate hash:
```python
from werkzeug.security import generate_password_hash
print(generate_password_hash("admin123"))
```

Then test:
1. Add new request: "Admin Login"
2. Method: **POST**
3. URL: `http://127.0.0.1:5000/api/auth/admin/login`
4. Body (JSON):
```json
{
  "username": "admin",
  "password": "admin123"
}
```

---

## 💻 Method 3: Using curl (Command Line)

### Windows PowerShell Commands

#### 1. Register User
```powershell
curl -X POST http://127.0.0.1:5000/api/auth/user/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"John Doe\",\"phone\":\"9876543210\",\"password\":\"password123\",\"pincode\":\"560001\"}'
```

#### 2. User Login
```powershell
curl -X POST http://127.0.0.1:5000/api/auth/user/login `
  -H "Content-Type: application/json" `
  -d '{\"phone\":\"9876543210\",\"password\":\"password123\"}'
```

#### 3. Register Worker
```powershell
curl -X POST http://127.0.0.1:5000/api/auth/worker/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Rajesh Kumar\",\"phone\":\"9876543211\",\"password\":\"worker123\",\"service_type\":\"Plumber\",\"pincode\":\"560001\"}'
```

#### 4. Worker Login
```powershell
curl -X POST http://127.0.0.1:5000/api/auth/worker/login `
  -H "Content-Type: application/json" `
  -d '{\"phone\":\"9876543211\",\"password\":\"worker123\"}'
```

#### 5. Update Worker Status
```powershell
curl -X POST http://127.0.0.1:5000/api/workers/status `
  -H "Content-Type: application/json" `
  -d '{\"worker_id\":1,\"status\":\"Available\"}'
```

#### 6. Search Workers
```powershell
curl "http://127.0.0.1:5000/api/workers/search?service_type=Plumber&pincode=560001"
```

---

## 📝 Method 4: Using Browser (GET requests only)

You can test GET endpoints directly in your browser:

1. Open browser
2. Go to: `http://127.0.0.1:5000/api/workers/search?service_type=Plumber&pincode=560001`
3. You should see JSON response

---

## ✅ Testing Checklist

Use this checklist to ensure all endpoints work:

- [ ] User Registration - Creates new user account
- [ ] User Login - Returns user_id and name
- [ ] Worker Registration - Creates new worker account
- [ ] Worker Login - Returns worker_id and name
- [ ] Update Worker Status - Changes status to Available/Busy/Offline
- [ ] Search Workers - Shows available workers by service type and location
- [ ] Admin Login - (Optional) Returns admin_id

---

## 🐛 Common Errors & Solutions

### Error: "Phone already registered"
- **Solution:** Use a different phone number for testing

### Error: "Invalid phone or password"
- **Solution:** Make sure you registered first, or check password spelling

### Error: "service_type is required"
- **Solution:** Add `?service_type=Plumber` to the search URL

### Error: "Worker currently engaged" (when searching)
- **Solution:** Make sure worker status is "Available" (not "Busy" or "Offline")

### No workers found in search
- **Solution:** 
  1. Register a worker first
  2. Update worker status to "Available"
  3. Make sure pincode/service_type matches

---

## 🎯 Testing Workflow Example

Here's a complete testing workflow:

1. **Register a User**
   - Phone: 9876543210
   - Password: password123

2. **Login as User**
   - Verify you get user_id

3. **Register a Worker (Plumber)**
   - Phone: 9876543211
   - Service: Plumber
   - Pincode: 560001

4. **Login as Worker**
   - Verify you get worker_id

5. **Update Worker Status to "Available"**
   - Use the worker_id from step 4

6. **Search for Plumbers**
   - Should see the worker you registered

7. **Update Worker Status to "Busy"**
   - Search again - worker should NOT appear (only Available workers show)

8. **Update Worker Status back to "Available"**
   - Search again - worker should appear

---

## 📊 Expected Response Formats

### Success Responses:
```json
// Registration
{"message": "User registered"}

// Login
{"message": "Login ok", "user_id": 1, "name": "John Doe"}

// Status Update
{"message": "Status updated"}

// Search
{"workers": [{"id": 1, "name": "Rajesh", "service_type": "Plumber", ...}]}
```

### Error Responses:
```json
// Missing fields
{"error": "name, phone, password, pincode are required"}

// Already exists
{"error": "Phone already registered"}

// Invalid credentials
{"error": "Invalid phone or password"}
```

---

Happy Testing! 🚀

