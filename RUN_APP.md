# How to Run the App - Simple Guide

## 🎯 One-Time Setup (Do this first)

### 1. Database Setup
```bash
# Create database
mysql -u root -p < database/schema.sql

# Insert test data
python insert_mock_data.py

# Fix passwords
python fix_all_user_passwords.py
```

### 2. Create .env File
Create `.env` in project root:
```env
MYSQL_HOST=127.0.0.1
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=household_service_db
MYSQL_PORT=3306
SECRET_KEY=dev-secret-key
COMPLAINT_LIMIT=3
```

### 3. Install Dependencies
```bash
# Backend
pip install -r backend/requirements.txt

# Frontend
cd frontend
npm install
cd ..
```

---

## 🚀 Running the App (Every Time)

### Terminal 1: Backend
```bash
python backend/app.py
```
✅ Backend: http://127.0.0.1:5000

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
✅ Frontend: http://localhost:3000

### Open Browser
Go to: **http://localhost:3000**

---

## 🔑 Login Credentials

**User:** `9876543210` / `user123`  
**Worker:** `9876543220` / `worker123`  
**Admin:** `admin` / `admin123`

---

That's it! 🎉

