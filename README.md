# Fixly - Online Household Service Provider Management System

**Tech Stack**
- Frontend: React + HTML/CSS
- Backend: Python (Flask)
- Database: MySQL

## 🚀 Quick Start

**👉 NEW USERS: Start here!** See [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) for a simple step-by-step guide to run the app.

## Folder Structure
```
my project/
  backend/
    app.py
    config.py
    db.py
    requirements.txt
    routes/
      __init__.py
      auth.py
      workers.py
  database/
    schema.sql
  frontend/
    src/
      api.js              # API service
      App.jsx              # Main app with routing
      main.jsx             # Entry point
      index.css            # Global styles
      pages/
        Login.jsx          # Unified login (user/worker/admin)
        UserDashboard.jsx  # User dashboard
        WorkerDashboard.jsx # Worker dashboard
        AdminDashboard.jsx  # Admin dashboard
    package.json
    vite.config.js
    index.html
```

## Setup (Backend)

**📖 For detailed step-by-step instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)**

**⚡ Quick Start:**
1. Create `.env` file (run `python create_env.py` or see `.env.example`)
2. Create database: `mysql -u root -p < database/schema.sql`
3. Install dependencies: `pip install -r backend/requirements.txt`
4. Test connection: `python test_db_connection.py`
5. Start server: `python backend/app.py`

Backend runs on `http://127.0.0.1:5000`

## Setup (Frontend)

**📖 For detailed step-by-step instructions, see [FRONTEND_SETUP.md](FRONTEND_SETUP.md)**

**⚡ Quick Start:**
1. Install Node.js (if not installed): https://nodejs.org/
2. `cd frontend`
3. `npm install`
4. `npm run dev`

Frontend runs on `http://localhost:3000`

**Note:** Make sure backend is running before using the frontend!

## Features

### Frontend Features:
- ✅ Unified login page (User/Worker/Admin)
- ✅ User dashboard with worker search
- ✅ Worker dashboard with status management
- ✅ Admin dashboard for worker management
- ✅ Real-time API integration
- ✅ Responsive design

### Backend Features:
- ✅ User/Worker/Admin authentication
- ✅ Worker search with location filtering
- ✅ Worker status management
- ✅ New worker prioritization
- ✅ Rating system support
- ✅ Complaint tracking


