# Registration Feature Implementation

## ✅ What's Been Implemented

### 1. Frontend - Register.jsx
- ✅ Created registration form with role selection (User/Worker)
- ✅ Common fields: Name, Email, Phone, Password, Location
- ✅ Worker-specific fields: Service Type, Experience, Address
- ✅ Form validation (email format, password length, required fields)
- ✅ Success/error message handling
- ✅ Redirect to login page after successful registration
- ✅ Link to login page for existing users

### 2. Backend - Unified Register Endpoint
- ✅ Added `POST /api/auth/register` endpoint
- ✅ Handles both user and worker registration
- ✅ Validates role (user/worker)
- ✅ Password hashing using werkzeug
- ✅ Email and phone uniqueness checks
- ✅ Returns appropriate success/error messages

### 3. API Integration
- ✅ Added `register()` function in `frontend/src/api.js`
- ✅ Uses the unified `/api/auth/register` endpoint

### 4. Database Schema
- ✅ Added `experience` column to `workers` table
- ✅ Created migration script: `database/add_experience_column.sql`

### 5. Routing Integration
- ✅ Added `/register` route in `App.jsx`
- ✅ Added "Register here" link in `Login.jsx`
- ✅ Added "Login here" link in `Register.jsx`

---

## 📋 Files Created/Modified

### Created:
1. `frontend/src/pages/Register.jsx` - Registration form component
2. `database/add_experience_column.sql` - Migration script
3. `REGISTRATION_FEATURE.md` - This documentation

### Modified:
1. `frontend/src/api.js` - Added `register()` function
2. `backend/routes/auth.py` - Added unified `/register` endpoint
3. `database/schema.sql` - Added `experience` column to workers table
4. `frontend/src/App.jsx` - Added Register route
5. `frontend/src/pages/Login.jsx` - Added link to Register page

---

## 🚀 How to Use

### Step 1: Update Database (if needed)
If your database already exists, run the migration:
```sql
-- Option 1: Run the migration script
mysql -u root -p < database/add_experience_column.sql

-- Option 2: Or manually add the column
USE household_service_db;
ALTER TABLE workers ADD COLUMN experience INT DEFAULT 0;
```

### Step 2: Restart Backend
```bash
python backend/app.py
```

### Step 3: Access Registration Page
1. Go to `http://localhost:3000`
2. Click "Register here" link on login page
3. Or go directly to `http://localhost:3000/register`

---

## 📝 Registration Form Fields

### Common Fields (Both User & Worker):
- **Full Name** (required)
- **Email** (required, validated)
- **Phone Number** (required)
- **Password** (required, min 6 characters)
- **Location (Pincode)** (required)

### Worker-Specific Fields:
- **Service Type** (required, dropdown: Plumber, Electrician, Cleaner, etc.)
- **Experience** (required, in years, number input)
- **Address** (optional, text input)

---

## 🔑 API Endpoint

### POST `/api/auth/register`

**Request Body:**
```json
{
  "role": "user" or "worker",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "location": "560001",
  "address": "123 Main St" (optional),
  "service_type": "Plumber" (required if role is worker),
  "experience": 5 (required if role is worker)
}
```

**Success Response (201):**
```json
{
  "message": "User registered successfully" or "Worker registered successfully"
}
```

**Error Response (400/409):**
```json
{
  "error": "Error message here"
}
```

---

## ✅ Validation Rules

1. **Name**: Required, non-empty
2. **Email**: Required, valid email format
3. **Phone**: Required, minimum 10 characters
4. **Password**: Required, minimum 6 characters
5. **Location**: Required, non-empty
6. **Service Type**: Required for workers
7. **Experience**: Required for workers, must be non-negative integer

---

## 🎨 UI Features

- Clean, modern registration form
- Role selection with radio buttons
- Conditional fields (worker fields only show when "Worker" is selected)
- Real-time validation feedback
- Loading states during submission
- Success message with auto-redirect
- Error messages for failed registrations
- Links to navigate between Login and Register pages

---

## 🔄 User Flow

1. User clicks "Register here" on login page
2. User selects role (User or Worker)
3. User fills in required fields
4. If Worker, additional fields appear
5. User submits form
6. Backend validates and creates account
7. Success message shown
8. Auto-redirect to login page after 2 seconds
9. User can now login with new credentials

---

## 🐛 Troubleshooting

### Issue: "experience column doesn't exist"
**Solution:** Run the migration script:
```bash
mysql -u root -p < database/add_experience_column.sql
```

### Issue: "Email already registered"
**Solution:** Use a different email or phone number

### Issue: Registration fails silently
**Solution:** 
- Check browser console for errors
- Verify backend is running
- Check backend terminal for error messages

### Issue: Form doesn't submit
**Solution:**
- Check all required fields are filled
- Verify email format is correct
- Ensure password is at least 6 characters

---

## 📝 Notes

- The unified `/api/auth/register` endpoint handles both user and worker registration
- Existing separate endpoints (`/api/auth/user/register` and `/api/auth/worker/register`) still work for backward compatibility
- Password is hashed using `werkzeug.security.generate_password_hash`
- Email and phone are checked for uniqueness before insertion
- Workers are created with status "Offline" by default
- New workers are automatically tagged as "New" (is_new=1)

---

## ✨ Next Steps (Optional Enhancements)

- Add email verification
- Add phone number verification (OTP)
- Add profile picture upload
- Add more service types
- Add worker portfolio/portfolio images
- Add terms and conditions checkbox
- Add password strength indicator
- Add password confirmation field

---

Happy Coding! 🚀

