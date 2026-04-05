# Booking History & Notifications Feature

## ✅ What's Been Implemented

### 1. User Booking History
- ✅ `UserHistory.jsx` - Complete booking history page
- ✅ View all past and current bookings
- ✅ Cancel upcoming bookings
- ✅ View booking details
- ✅ Status badges with colors
- ✅ Navigation from User Dashboard

### 2. Worker Appointment History
- ✅ `WorkerHistory.jsx` - Complete appointment management page
- ✅ View all appointments
- ✅ Accept/Reject/Complete appointments
- ✅ View user contact details
- ✅ Status management
- ✅ Navigation from Worker Dashboard

### 3. Notification System
- ✅ `notifications` table in database
- ✅ Automatic notification creation when user books
- ✅ Notification icon with unread count badge
- ✅ Notification dropdown in Worker Dashboard
- ✅ Mark as read functionality
- ✅ Mark all as read

### 4. Backend Routes
- ✅ `GET /api/user/bookings` - Get user's bookings
- ✅ `GET /api/worker/<id>/appointments` - Get worker's appointments
- ✅ `POST /api/booking/cancel` - Cancel booking
- ✅ `POST /api/booking/update-status` - Update booking status
- ✅ `GET /api/worker/<id>/notifications` - Get notifications
- ✅ `POST /api/notifications/read` - Mark notification as read
- ✅ `POST /api/notifications/read-all` - Mark all as read

### 5. API Functions
- ✅ All booking and notification functions in `api.js`

---

## 🚀 Setup Instructions

### Step 1: Create Notifications Table
```bash
mysql -u root -p < database/notifications_schema.sql
```

Or run:
```bash
mysql -u root -p < database/update_booking_schema.sql
```

### Step 2: Restart Backend
```bash
python backend/app.py
```

### Step 3: Test the Features

**As a User:**
1. Login → User Dashboard
2. Click "View Booking History"
3. See all your bookings
4. Cancel upcoming bookings if needed

**As a Worker:**
1. Login → Worker Dashboard
2. See notification icon with badge (if new bookings exist)
3. Click "Notifications" to see unread notifications
4. Click "View Appointments" to manage appointments
5. Accept/Reject/Complete appointments

---

## 📋 Features

### User Booking History:
- ✅ Table view of all bookings
- ✅ Status badges (Booked, Confirmed, Completed, Cancelled)
- ✅ View details for each booking
- ✅ Cancel upcoming bookings
- ✅ Worker contact information
- ✅ Booking date and time display

### Worker Appointment History:
- ✅ Table view of all appointments
- ✅ User contact details (clickable phone)
- ✅ Accept button (for Booked status)
- ✅ Reject button (for Booked/Confirmed status)
- ✅ Complete button (for Confirmed/InProgress status)
- ✅ View appointment details

### Notifications:
- ✅ Real-time notification badge (unread count)
- ✅ Dropdown notification panel
- ✅ Mark individual notifications as read
- ✅ Mark all as read
- ✅ Auto-refresh every 30 seconds
- ✅ Notification created automatically on booking

---

## 🎯 User Flow

### Booking Flow with Notifications:
1. User books appointment → Booking created
2. **Notification automatically created** for worker
3. Worker sees notification badge in dashboard
4. Worker clicks notification → Sees booking details
5. Worker can accept/reject from notifications or appointment history

### User Booking History Flow:
1. User clicks "View Booking History"
2. Sees all bookings (past and current)
3. Can view details of each booking
4. Can cancel upcoming bookings
5. Status updates reflect immediately

### Worker Appointment Management Flow:
1. Worker clicks "View Appointments"
2. Sees all appointments assigned to them
3. Can accept pending appointments
4. Can mark appointments as completed
5. Can reject appointments if needed

---

## 📊 Database Schema

### notifications table:
```sql
- id (primary key)
- worker_id (foreign key)
- message (notification text)
- is_read (0 = unread, 1 = read)
- created_at (timestamp)
```

### appointments table (existing):
- All fields already exist
- Status can be: Booked, Confirmed, InProgress, Completed, Cancelled

---

## 🔄 Status Flow

### Booking Statuses:
- **Booked** → User just booked (default)
- **Confirmed** → Worker accepted
- **InProgress** → Worker started service
- **Completed** → Service finished
- **Cancelled** → User or worker cancelled

### Status Transitions:
- User can cancel: Booked, Confirmed, InProgress
- Worker can accept: Booked → Confirmed
- Worker can reject: Booked/Confirmed → Cancelled
- Worker can complete: Confirmed/InProgress → Completed

---

## 🎨 UI Features

### User History:
- Clean table layout
- Color-coded status badges
- Expandable details view
- Cancel button (only for cancellable bookings)
- Empty state message

### Worker History:
- Table with all appointments
- Clickable phone numbers
- Action buttons (Accept/Reject/Complete)
- Details view
- Status management

### Notifications:
- Badge with unread count
- Dropdown panel
- Click to mark as read
- Mark all as read button
- Auto-refresh

---

## 📝 API Endpoints

### User Bookings:
```
GET /api/user/bookings?user_id=1
Response: { "bookings": [...] }
```

### Cancel Booking:
```
POST /api/booking/cancel
Body: { "booking_id": 1, "user_id": 1 }
```

### Worker Appointments:
```
GET /api/worker/1/appointments
Response: { "appointments": [...] }
```

### Update Status:
```
POST /api/booking/update-status
Body: { "booking_id": 1, "worker_id": 1, "status": "Confirmed" }
```

### Get Notifications:
```
GET /api/worker/1/notifications?unread_only=true
Response: { "notifications": [...] }
```

### Mark as Read:
```
POST /api/notifications/read
Body: { "notification_id": 1, "worker_id": 1 }
```

---

## 🐛 Troubleshooting

### Notifications not showing?
- Check if notifications table exists
- Run: `mysql -u root -p < database/notifications_schema.sql`
- Make sure a booking was made (notifications created on booking)

### Can't cancel booking?
- Check booking status (Completed/Cancelled can't be cancelled)
- Check booking date (past bookings can't be cancelled)
- Verify user_id matches booking owner

### Can't accept/reject appointment?
- Check if you're logged in as the correct worker
- Verify appointment status (only Booked can be accepted)
- Check backend logs for errors

---

## ✨ Next Steps (Optional Enhancements)

- Email notifications
- SMS notifications
- Push notifications
- Appointment reminders
- Reschedule functionality
- Rating after completion
- Payment integration
- Calendar view

---

**The booking history and notification system is fully operational!** 🎉

Users can track their bookings and workers can manage appointments with notifications!

