# Quick Setup - Booking Feature

## 🚀 3-Step Setup

### Step 1: Create Database Tables
```bash
mysql -u root -p < database/booking_schema.sql
```

### Step 2: Restart Backend
```bash
python backend/app.py
```
(Bookings routes are already registered)

### Step 3: Test It!

**As Worker:**
1. Login → Worker Dashboard
2. Scroll to "Manage Your Availability"
3. Add time slots (e.g., "09:00 AM - 10:00 AM")
4. Click "Add Slot"

**As User:**
1. Login → User Dashboard
2. Search for workers
3. Click "Book Appointment" on any worker
4. Select date → Choose time slot → Confirm

---

## ✅ What Works

- ✅ Workers can add/remove time slots
- ✅ Users can book appointments
- ✅ Double booking prevention
- ✅ Date and slot selection
- ✅ Address and notes fields

---

## 📋 Files Created/Modified

**Created:**
- `database/booking_schema.sql`
- `backend/routes/bookings.py`
- `frontend/src/pages/BookAppointment.jsx`
- `BOOKING_FEATURE.md`
- `BOOKING_SETUP.md`

**Modified:**
- `backend/app.py` - Registered bookings blueprint
- `frontend/src/api.js` - Added booking API functions
- `frontend/src/App.jsx` - Added BookAppointment route
- `frontend/src/pages/UserDashboard.jsx` - Added "Book Appointment" button
- `frontend/src/pages/WorkerDashboard.jsx` - Added availability management

---

That's it! The booking system is ready to use! 🎉

