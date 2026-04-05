# Mock Data Guide

## 📦 What is Mock Data?

Mock data is sample/fake data that you insert into your database for testing purposes. This helps you:
- Test your API endpoints without manually creating data
- See how your application works with real-world-like data
- Demonstrate your project with populated data

## 🚀 How to Insert Mock Data

### Step 1: Make sure your database is set up
- Database should be created (run `database/schema.sql`)
- `.env` file should be configured correctly

### Step 2: Run the script
```bash
python insert_mock_data.py
```

That's it! The script will automatically insert all the mock data.

---

## 📊 What Data Will Be Inserted?

### Users (5 users)
All users have password: `user123`

| Name | Phone | Pincode | Area |
|------|-------|---------|------|
| Rajesh Kumar | 9876543210 | 560001 | Bangalore |
| Priya Sharma | 9876543211 | 560002 | Bangalore |
| Amit Patel | 9876543212 | 560001 | Bangalore |
| Sneha Reddy | 9876543213 | 560003 | Bangalore |
| Vikram Singh | 9876543214 | 560001 | Bangalore |

### Workers (11 workers)
All workers have password: `worker123`

#### Plumbers (3)
- **Ramesh Plumber** - Available, Rating: 4.5, Not New
- **Suresh Water Works** - Available, Rating: 0.0, **New Worker** ⭐
- **Kumar Plumbing** - Busy, Rating: 4.2, 1 Complaint

#### Electricians (3)
- **Electrician Mahesh** - Available, Rating: 4.8, Not New
- **Power Solutions** - Available, Rating: 0.0, **New Worker** ⭐
- **Spark Services** - Offline, Rating: 3.5, 2 Complaints

#### Cleaners (3)
- **Clean Home Services** - Available, Rating: 4.7, Not New
- **Shine Bright** - Available, Rating: 0.0, **New Worker** ⭐
- **Spotless Clean** - Busy, Rating: 4.0, 1 Complaint

#### Carpenter (1)
- **Carpenter Raj** - Available, Rating: 4.6, Not New

#### Painter (1)
- **Color Masters** - Available, Rating: 0.0, **New Worker** ⭐

### Admin (1)
- **Username:** `admin`
- **Password:** `admin123`

### Sample Bookings (4)
- Completed booking (User 1 → Plumber)
- In Progress booking (User 2 → Electrician, Emergency)
- Accepted booking (User 3 → Cleaner)
- Requested booking (User 1 → Carpenter)

### Sample Ratings (1)
- 5-star rating for completed booking

### Sample Complaints (2)
- Open complaints for testing admin features

---

## 🔑 Default Passwords

- **Users:** `user123`
- **Workers:** `worker123`
- **Admin:** `admin123`

---

## ✅ Testing After Inserting Mock Data

### 1. Test User Login
```json
POST /api/auth/user/login
{
  "phone": "9876543210",
  "password": "user123"
}
```

### 2. Test Worker Login
```json
POST /api/auth/worker/login
{
  "phone": "9876543220",
  "password": "worker123"
}
```

### 3. Test Search Workers
```
GET /api/workers/search?service_type=Plumber&pincode=560001
```

You should see:
- Ramesh Plumber (Available, Rating 4.5)
- Suresh Water Works (Available, New Worker)

**Note:** Kumar Plumbing won't appear because status is "Busy"

### 4. Test Admin Login
```json
POST /api/auth/admin/login
{
  "username": "admin",
  "password": "admin123"
}
```

---

## 🔄 Running the Script Multiple Times

The script is **safe to run multiple times**. It will:
- ✅ Skip users/workers that already exist (by phone number)
- ✅ Skip admin if it already exists
- ✅ Insert new bookings, ratings, and complaints each time

If you want to start fresh:
1. Drop and recreate your database
2. Run `database/schema.sql` again
3. Run `insert_mock_data.py`

---

## 🎯 Use Cases for Testing

### Test "New Worker" Feature
- Search for workers - you'll see "New" tag on new workers
- They appear first in search results (prioritized)

### Test Worker Status
- Search for Plumbers in pincode 560001
- You'll see Available workers
- Change a worker's status to "Busy" and search again - they won't appear

### Test Ratings
- Workers have different ratings (0.0 to 4.8)
- Search results are sorted by rating (highest first)

### Test Complaints
- Some workers have complaint counts
- You can test admin features to block workers with too many complaints

### Test Emergency Booking
- One booking is marked as emergency
- You can test priority assignment logic

### Test Location Filtering
- Workers are in different pincodes (560001, 560002, 560003)
- Test search by pincode or area

---

## 🐛 Troubleshooting

### Error: "Phone already registered"
- This is normal if you run the script multiple times
- The script will skip existing records

### Error: "Cannot connect to database"
- Check your `.env` file
- Make sure MySQL is running
- Verify database name is correct

### No workers showing in search
- Make sure worker status is "Available" (not "Busy" or "Offline")
- Check that pincode/service_type matches

---

## 📝 Customizing Mock Data

You can edit `insert_mock_data.py` to:
- Add more users/workers
- Change service types
- Modify ratings and complaint counts
- Add different locations

Just follow the same format in the `users_data` and `workers_data` lists!

---

Happy Testing! 🚀

