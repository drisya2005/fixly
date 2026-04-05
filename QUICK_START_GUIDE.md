# 🚀 Quick Start Guide - Run Your App

Follow these simple steps to get your Household Service Provider app running.

---

## ✅ Prerequisites

1. **Python 3.8+** installed
2. **Node.js** installed (download from https://nodejs.org/)
3. **MySQL** installed and running

---

## Step 1: Database Setup

### 1.1 Create Database
Open MySQL Command Line or MySQL Workbench and run:
```bash
mysql -u root -p < database/schema.sql
```
(Enter your MySQL password when prompted)

### 1.2 Insert Mock Data
```bash
python insert_mock_data.py
```

### 1.3 Fix User Passwords (Important!)
```bash
python fix_all_user_passwords.py
```

---

## Step 2: Backend Setup

### 2.1 Create .env File
Create a file named `.env` in the project root with:
```env
MYSQL_HOST=127.0.0.1
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password_here
MYSQL_DATABASE=household_service_db
MYSQL_PORT=3306
SECRET_KEY=dev-secret-key
COMPLAINT_LIMIT=3
```

**Replace `your_mysql_password_here` with your actual MySQL password!**

### 2.2 Install Python Dependencies
```bash
pip install -r backend/requirements.txt
```

### 2.3 Start Backend Server
```bash
python backend/app.py
```

✅ Backend is running on: `http://127.0.0.1:5000`

**Keep this terminal open!**

---

## Step 3: Frontend Setup

### 3.1 Open a NEW Terminal
(Keep the backend terminal running)

### 3.2 Navigate to Frontend Folder
```bash
cd frontend
```

### 3.3 Install Dependencies
```bash
npm install
```
(Only needed the first time)

### 3.4 Start Frontend Server
```bash
npm run dev
```

✅ Frontend is running on: `http://localhost:3000`

---

## Step 4: Open the App

1. Open your browser
2. Go to: `http://localhost:3000`
3. You should see the login page!

---

## 🔑 Test Credentials

### User Login
- **Phone:** `9876543210`
- **Password:** `user123`

### Worker Login
- **Phone:** `9876543220`
- **Password:** `worker123`

### Admin Login
- **Username:** `admin`
- **Password:** `admin123`

---

## 📋 Quick Checklist

- [ ] Database created (`database/schema.sql`)
- [ ] Mock data inserted (`insert_mock_data.py`)
- [ ] User passwords fixed (`fix_all_user_passwords.py`)
- [ ] `.env` file created with correct MySQL password
- [ ] Python dependencies installed
- [ ] Backend running (`python backend/app.py`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend running (`npm run dev`)
- [ ] Browser opened to `http://localhost:3000`

---

## 🐛 Troubleshooting

### Backend won't start?
- Check `.env` file has correct MySQL password
- Make sure MySQL is running
- Verify database exists

### Frontend won't start?
- Make sure you're in `frontend` folder
- Run `npm install` first
- Check Node.js is installed: `node --version`

### Can't login?
- Run `python fix_all_user_passwords.py` again
- Make sure mock data is inserted
- Check backend is running

### No workers showing?
- Make sure mock data is inserted
- Check workers have status "Available" or "Busy"
- Try different service types and pincodes

---

## 🎯 What to Do Next

1. **Login as User** → Search for workers
2. **Login as Worker** → Update your status
3. **Login as Admin** → View all workers

---

## 📝 Running the App Daily

Once everything is set up, you only need:

1. **Start Backend:**
   ```bash
   python backend/app.py
   ```

2. **Start Frontend (in new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open browser:** `http://localhost:3000`

That's it! 🎉

---

**Need help?** Check the detailed guides:
- `SETUP_GUIDE.md` - Detailed backend setup
- `FRONTEND_SETUP.md` - Detailed frontend setup

