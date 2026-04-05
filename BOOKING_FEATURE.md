# Booking/Appointment System - Implementation Guide

## ✅ What's Been Implemented

### 1. Database Tables
- ✅ `worker_availability` - Stores available time slots for workers
- ✅ `appointments` - Stores user bookings/appointments
- ✅ Unique constraint to prevent double booking

### 2. Backend Routes (`backend/routes/bookings.py`)
- ✅ `GET /api/workers/<worker_id>/slots` - Get available slots for a date
- ✅ `POST /api/book-appointment` - Create new appointment
- ✅ `GET /api/user/appointments` - Get user's appointments
- ✅ `POST /api/worker/availability` - Worker adds availability slot
- ✅ `GET /api/worker/<worker_id>/availability` - Get worker's availability
- ✅ `DELETE /api/worker/availability/<id>` - Remove availability slot
- ✅ `GET /api/worker/<worker_id>/appointments` - Get worker's appointments

### 3. Frontend Pages
- ✅ `BookAppointment.jsx` - Booking page with date and slot selection
- ✅ Updated `UserDashboard.jsx` - Added "Book Appointment" button
- ✅ Updated `WorkerDashboard.jsx` - Added availability management

### 4. API Integration
- ✅ Added all booking functions in `frontend/src/api.js`
- ✅ Integrated with existing API structure

---

## 🚀 Setup Instructions

### Step 1: Create Database Tables
Run the booking schema:
```bash
mysql -u root -p < database/booking_schema.sql
```

Or manually:
```sql
USE household_service_db;

-- Create worker_availability table
CREATE TABLE IF NOT EXISTS worker_availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  worker_id INT NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  day_of_week VARCHAR(20),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  worker_id INT NOT NULL,
  booking_date DATE NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  service_type VARCHAR(50) NOT NULL,
  address VARCHAR(255),
  status ENUM('Booked', 'Confirmed', 'InProgress', 'Completed', 'Cancelled') DEFAULT 'Booked',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
  UNIQUE KEY unique_booking (worker_id, booking_date, time_slot, status)
);
```

### Step 2: Restart Backend
```bash
python backend/app.py
```

The bookings blueprint is already registered in `app.py`.

### Step 3: Test the Feature

#### As a Worker:
1. Login as worker
2. Go to Worker Dashboard
3. Scroll to "Manage Your Availability"
4. Add time slots (e.g., "09:00 AM - 10:00 AM")
5. Your slots are now available for booking

#### As a User:
1. Login as user
2. Search for workers
3. Click "Book Appointment" on any worker card
4. Select a date
5. Choose an available time slot
6. Add address/notes (optional)
7. Confirm booking

---

## 📋 How It Works

### Worker Availability Flow:
1. Worker logs in → Worker Dashboard
2. Worker adds time slots (e.g., "09:00 AM - 10:00 AM")
3. Slots are stored in `worker_availability` table
4. These slots become available for users to book

### Booking Flow:
1. User searches for workers → User Dashboard
2. User clicks "Book Appointment" → BookAppointment page
3. User selects date → System fetches available slots for that date
4. User selects time slot → Confirms booking
5. Booking saved in `appointments` table
6. That slot is now marked as booked (won't appear for other users)

### Double Booking Prevention:
- Database unique constraint prevents same worker/date/slot from being booked twice
- Backend checks before creating appointment
- Already booked slots don't appear in available slots list

---

## 🎯 Features

### ✅ Available Time Slots
- Workers can add multiple time slots
- Pre-defined common slots (09:00 AM - 10:00 AM, etc.)
- Custom time slot input
- Remove slots functionality

### ✅ Booking System
- Date selection (minimum: today)
- Real-time available slots display
- Slot selection interface
- Address and notes fields
- Success/error handling

### ✅ Double Booking Prevention
- Database-level unique constraint
- Backend validation
- Frontend filtering of booked slots

---

## 📝 API Endpoints

### Get Available Slots
```
GET /api/workers/<worker_id>/slots?date=2024-01-15
Response: { "available_slots": [...] }
```

### Book Appointment
```
POST /api/book-appointment
Body: {
  "user_id": 1,
  "worker_id": 2,
  "booking_date": "2024-01-15",
  "time_slot": "09:00 AM - 10:00 AM",
  "service_type": "Plumber",
  "address": "123 Main St",
  "notes": "Please bring tools"
}
```

### Add Worker Availability
```
POST /api/worker/availability
Body: {
  "worker_id": 2,
  "time_slot": "09:00 AM - 10:00 AM"
}
```

### Get User Appointments
```
GET /api/user/appointments?user_id=1
Response: { "appointments": [...] }
```

---

## 🐛 Troubleshooting

### Issue: "No available slots" even after worker added slots
**Solution:**
- Check if worker added slots in Worker Dashboard
- Verify slots are active (is_active=1)
- Check if date is in the past (minimum is today)

### Issue: "This time slot is already booked"
**Solution:**
- This is correct behavior - prevents double booking
- Select a different time slot or date

### Issue: Tables don't exist
**Solution:**
- Run `database/booking_schema.sql`
- Or manually create tables using SQL above

### Issue: Booking fails silently
**Solution:**
- Check browser console for errors
- Verify backend is running
- Check backend terminal for error messages
- Ensure user is logged in (user_id exists)

---

## 🎨 UI Features

- Clean booking interface
- Date picker with minimum date validation
- Visual slot selection (buttons)
- Loading states during API calls
- Success/error messages
- Back navigation to dashboard
- Worker information display

---

## ✨ Next Steps (Optional Enhancements)

You can extend this feature with:
- ⭐ Booking confirmation emails
- ⭐ Cancel appointment functionality
- ⭐ Worker accept/reject booking requests
- ⭐ Appointment reminders
- ⭐ Reschedule appointment
- ⭐ View appointment history
- ⭐ Rating after completed appointment
- ⭐ Calendar view for workers

---

## 📊 Database Schema

### worker_availability
- `id` - Primary key
- `worker_id` - Foreign key to workers
- `time_slot` - Time slot string (e.g., "09:00 AM - 10:00 AM")
- `day_of_week` - Optional day filter
- `is_active` - Active/inactive flag
- `created_at` - Timestamp

### appointments
- `id` - Primary key
- `user_id` - Foreign key to users
- `worker_id` - Foreign key to workers
- `booking_date` - Date of appointment
- `time_slot` - Time slot string
- `service_type` - Type of service
- `address` - Service address
- `status` - Booking status
- `notes` - Additional notes
- `created_at` - Timestamp
- `updated_at` - Auto-updated timestamp

---

Happy Booking! 🎉

