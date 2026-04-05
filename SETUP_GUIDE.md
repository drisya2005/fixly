# Step-by-Step Setup Guide

Follow these steps to get your project up and running.

## Prerequisites

1. **Python 3.8+** installed
2. **MySQL Server** installed and running
3. **MySQL Workbench** or any MySQL client (optional, for database management)

---

## Step 1: Install MySQL (if not already installed)

### Windows:
1. Download MySQL from: https://dev.mysql.com/downloads/installer/
2. Run the installer
3. Remember the **root password** you set during installation
4. Make sure MySQL service is running (check in Services)

### Verify MySQL is running:
- Open Command Prompt or PowerShell
- Run: `mysql --version`
- If you see a version number, MySQL is installed

---

## Step 2: Create the Database

1. Open MySQL Command Line Client or MySQL Workbench
2. Login with your root password
3. Run the SQL schema file:

```bash
# Option 1: Using MySQL Command Line
mysql -u root -p < database/schema.sql

# Option 2: Using MySQL Workbench
# - Open MySQL Workbench
# - Connect to your server
# - File > Open SQL Script > Select database/schema.sql
# - Click "Execute" (lightning bolt icon)
```

**OR** manually run these commands in MySQL:

```sql
CREATE DATABASE IF NOT EXISTS household_service_db;
USE household_service_db;
-- Then copy-paste the rest of database/schema.sql
```

---

## Step 3: Create .env File

1. In the **root folder** of your project (same level as `backend` folder), create a file named `.env`
2. Copy this content into `.env`:

```env
# MySQL Database Configuration
MYSQL_HOST=127.0.0.1
MYSQL_USER=root
MYSQL_PASSWORD=YOUR_MYSQL_ROOT_PASSWORD_HERE
MYSQL_DATABASE=household_service_db
MYSQL_PORT=3306

# Flask Secret Key
SECRET_KEY=dev-secret-key-change-me-in-production

# Complaint Limit
COMPLAINT_LIMIT=3
```

3. **IMPORTANT**: Replace `YOUR_MYSQL_ROOT_PASSWORD_HERE` with your actual MySQL root password

---

## Step 4: Install Python Dependencies

1. Open Command Prompt or PowerShell
2. Navigate to your project folder:
   ```bash
   cd "C:\Users\Drisya\OneDrive\Desktop\my project"
   ```

3. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   ```

4. Activate the virtual environment:
   ```bash
   # Windows PowerShell
   .\venv\Scripts\Activate.ps1
   
   # Windows Command Prompt
   venv\Scripts\activate.bat
   ```

5. Install required packages:
   ```bash
   pip install -r backend/requirements.txt
   ```

---

## Step 5: Test Database Connection

1. Make sure your `.env` file has the correct MySQL password
2. Test the connection by running a simple Python script:

Create a test file `test_db.py` in the root folder:

```python
from backend.config import Config

print("Testing database configuration...")
print(f"Host: {Config.MYSQL_HOST}")
print(f"User: {Config.MYSQL_USER}")
print(f"Database: {Config.MYSQL_DATABASE}")
print(f"Port: {Config.MYSQL_PORT}")
print("If you see this, config loaded successfully!")
```

Run it:
```bash
python test_db.py
```

---

## Step 6: Start the Flask Server

1. Make sure you're in the project root folder
2. Make sure your virtual environment is activated
3. Run:

```bash
python backend/app.py
```

You should see:
```
Starting Flask server...
API will be available at: http://127.0.0.1:5000
 * Running on http://127.0.0.1:5000
```

4. Open your browser and go to: `http://127.0.0.1:5000`
5. You should see: `{"message": "Household Service Provider API is running!", "status": "ok"}`

---

## Step 7: Test the API

You can test the API using:
- **Postman** (recommended)
- **Browser** (for GET requests)
- **curl** (command line)

### Example: Register a User

**Using Postman:**
1. Method: POST
2. URL: `http://127.0.0.1:5000/api/auth/user/register`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "name": "John Doe",
  "phone": "1234567890",
  "password": "password123",
  "pincode": "12345",
  "area": "Downtown"
}
```

**Using curl (PowerShell):**
```powershell
curl -X POST http://127.0.0.1:5000/api/auth/user/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"John Doe\",\"phone\":\"1234567890\",\"password\":\"password123\",\"pincode\":\"12345\"}'
```

---

## Step 8: Create Default Admin (Optional)

To create an admin account, you need to hash a password first.

1. Open Python in your project:
```bash
python
```

2. Run these commands:
```python
from werkzeug.security import generate_password_hash
password = "admin123"  # Change this to your desired admin password
hash = generate_password_hash(password)
print(f"Password hash: {hash}")
# Copy the hash
```

3. Then in MySQL:
```sql
USE household_service_db;
INSERT INTO admins (username, password_hash) 
VALUES ('admin', 'PASTE_THE_HASH_HERE');
```

---

## Troubleshooting

### Error: "Can't connect to MySQL server"
- Make sure MySQL service is running (check Windows Services)
- Verify your MySQL password in `.env` file
- Check if MySQL port 3306 is correct

### Error: "Access denied for user"
- Check your MySQL username and password in `.env`
- Make sure the user has permissions to access the database

### Error: "Module not found"
- Make sure virtual environment is activated
- Run: `pip install -r backend/requirements.txt` again

### Error: "Database doesn't exist"
- Run the `database/schema.sql` file in MySQL to create the database

### Port 5000 already in use
- Change the port in `backend/app.py`:
  ```python
  app.run(debug=True, host="127.0.0.1", port=5001)  # Change to 5001 or any free port
  ```

---

## Next Steps

Once the server is running:
1. ✅ Backend is ready
2. ⏭️ Build the React frontend
3. ⏭️ Connect frontend to backend APIs
4. ⏭️ Test all features

---

## Quick Reference

**Start Server:**
```bash
python backend/app.py
```

**API Base URL:**
```
http://127.0.0.1:5000/api
```

**Available Endpoints:**
- `POST /api/auth/user/register` - Register user
- `POST /api/auth/user/login` - User login
- `POST /api/auth/worker/register` - Register worker
- `POST /api/auth/worker/login` - Worker login
- `POST /api/auth/admin/login` - Admin login
- `GET /api/workers/search?service_type=Plumber&pincode=12345` - Search workers
- `POST /api/workers/status` - Update worker status

---

Good luck with your project! 🚀

