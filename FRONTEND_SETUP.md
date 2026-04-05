# Frontend Setup - Step by Step

## 🎯 Quick Setup (3 Steps)

### Step 1: Install Node.js
If you don't have Node.js installed:
- Download from: https://nodejs.org/
- Install the LTS version
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

### Step 2: Install Frontend Dependencies
```bash
cd frontend
npm install
```

This will install:
- React
- React Router
- Vite (build tool)

### Step 3: Start Frontend Server
```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

---

## 🚀 Running Both Frontend and Backend

You need **TWO terminals** running:

### Terminal 1: Backend (Flask)
```bash
python backend/app.py
```
Backend runs on: `http://127.0.0.1:5000`

### Terminal 2: Frontend (React)
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:3000`

---

## ✅ Testing the Application

1. **Open Browser**: Go to `http://localhost:3000`
2. **Login Page**: You'll see a unified login with 3 tabs (User/Worker/Admin)
3. **Test Login**:
   - **User Tab**: Phone `9876543210`, Password `user123`
   - **Worker Tab**: Phone `9876543220`, Password `worker123`
   - **Admin Tab**: Username `admin`, Password `admin123`

---

## 📱 What You Can Do

### As a User:
1. Login with user credentials
2. Search for workers by service type and pincode
3. View available workers with ratings and status
4. See "New" tags on newly joined workers

### As a Worker:
1. Login with worker credentials
2. Update your status (Available/Busy/Offline)
3. See your current status

### As an Admin:
1. Login with admin credentials
2. View all workers in a table
3. Filter workers by service type
4. See worker status, ratings, and complaint counts

---

## 🐛 Common Issues

### Issue: "npm: command not found"
**Solution**: Install Node.js from https://nodejs.org/

### Issue: "Cannot connect to backend"
**Solution**: 
- Make sure Flask server is running (`python backend/app.py`)
- Check that backend is on port 5000
- Check browser console for errors

### Issue: "No workers showing"
**Solution**:
- Make sure you've inserted mock data: `python insert_mock_data.py`
- Check that workers have status "Available"
- Try different pincode/service type

### Issue: "CORS errors in browser console"
**Solution**: 
- Backend already has CORS enabled
- Make sure backend is running
- Check `backend/app.py` has `CORS(app)`

### Issue: "Port 3000 already in use"
**Solution**: 
- Change port in `frontend/vite.config.js`:
  ```js
  server: {
    port: 3001, // Change to any free port
  }
  ```

---

## 📁 File Structure

```
frontend/
├── src/
│   ├── api.js              # Backend API connections
│   ├── App.jsx              # Main app with routing
│   ├── main.jsx             # Entry point
│   ├── index.css            # Styles
│   └── pages/
│       ├── Login.jsx        # Login page
│       ├── UserDashboard.jsx
│       ├── WorkerDashboard.jsx
│       └── AdminDashboard.jsx
├── package.json
└── vite.config.js
```

---

## 🎨 Features

✅ **Unified Login** - One page for all user types
✅ **User Dashboard** - Search and view workers
✅ **Worker Dashboard** - Update status
✅ **Admin Dashboard** - Manage workers
✅ **Responsive Design** - Works on different screen sizes
✅ **Error Handling** - Shows errors clearly
✅ **Loading States** - Shows when data is loading

---

## 🔄 Development Workflow

1. **Start Backend**: `python backend/app.py` (Terminal 1)
2. **Start Frontend**: `cd frontend && npm run dev` (Terminal 2)
3. **Open Browser**: `http://localhost:3000`
4. **Make Changes**: Edit files in `frontend/src/`
5. **See Changes**: Browser auto-refreshes (Hot Module Replacement)

---

## 📝 Next Steps

You can extend the frontend by:
- Adding booking functionality
- Adding complaint submission
- Adding rating system
- Adding more admin features
- Improving UI/UX
- Adding user registration

---

Happy Coding! 🚀

