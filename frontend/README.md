# Frontend Setup Guide

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### Step 3: Make sure Backend is Running
In a separate terminal, start your Flask backend:
```bash
python backend/app.py
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api.js              # API service (connects to backend)
│   ├── App.jsx              # Main app component with routing
│   ├── main.jsx             # React entry point
│   ├── index.css            # Global styles
│   └── pages/
│       ├── Login.jsx        # Unified login (user/worker/admin)
│       ├── UserDashboard.jsx # User dashboard (search workers)
│       ├── WorkerDashboard.jsx # Worker dashboard (update status)
│       └── AdminDashboard.jsx  # Admin dashboard (manage workers)
├── index.html
├── package.json
└── vite.config.js
```

---

## 🎯 Features

### 1. Unified Login Page
- Single login page for User, Worker, and Admin
- Tab-based interface to switch between login types
- Test credentials displayed on page

### 2. User Dashboard
- Search workers by service type and pincode
- View available workers in a card grid
- See worker ratings, status, and "New" tags
- Real-time search functionality

### 3. Worker Dashboard
- Update worker status (Available/Busy/Offline)
- Visual status selector
- Status guide for workers

### 4. Admin Dashboard
- View all workers in a table
- Filter by service type
- See worker status, ratings, complaints
- Refresh button to reload data

---

## 🔑 Test Credentials

The login page displays these, but here they are:

**User:**
- Phone: `9876543210`
- Password: `user123`

**Worker:**
- Phone: `9876543220`
- Password: `worker123`

**Admin:**
- Username: `admin`
- Password: `admin123`

---

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

---

## 🔌 API Connection

The frontend connects to the backend at `http://127.0.0.1:5000/api`

All API calls are centralized in `src/api.js` for easy maintenance.

---

## 🎨 Styling

- Modern, clean UI with gradient background
- Responsive design
- Card-based layout
- Color-coded status badges
- Hover effects and transitions

---

## 📝 Notes

- The app uses React Router for navigation
- User session is stored in localStorage
- All API calls have error handling
- Loading states are shown during API calls

---

## 🐛 Troubleshooting

### Frontend won't start
- Make sure you're in the `frontend` directory
- Run `npm install` first
- Check Node.js version (should be 16+)

### Can't connect to backend
- Make sure Flask server is running on port 5000
- Check `src/api.js` - API_BASE_URL should be `http://127.0.0.1:5000/api`
- Check browser console for CORS errors

### Login not working
- Verify backend is running
- Check test credentials
- Look at browser console for errors
- Make sure you've inserted mock data (`python insert_mock_data.py`)

---

Happy Coding! 🚀

