# Quick Start Guide

## 🚀 Fast Setup (5 Steps)

### Step 1: Create .env File
Run this helper script:
```bash
python create_env.py
```
OR manually create `.env` file in root folder with:
```env
MYSQL_HOST=127.0.0.1
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=household_service_db
MYSQL_PORT=3306
SECRET_KEY=dev-secret-key-change-me
COMPLAINT_LIMIT=3
```

### Step 2: Create Database
```bash
mysql -u root -p < database/schema.sql
```
(Enter your MySQL password when prompted)

### Step 3: Install Python Packages
```bash
pip install -r backend/requirements.txt
```

### Step 4: Test Connection
```bash
python test_db_connection.py
```

### Step 5: Start Server
```bash
python backend/app.py
```

Visit: http://127.0.0.1:5000

---

## 📝 Detailed Instructions

See `SETUP_GUIDE.md` for complete step-by-step instructions.

