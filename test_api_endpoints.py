"""
Automated API Testing Script
Tests all endpoints of the Household Service Provider Management System.

Make sure your Flask server is running before executing this script!
Run: python backend/app.py (in a separate terminal)
"""
import requests
import json
import sys

# Base URL of your API
BASE_URL = "http://127.0.0.1:5000"

# Colors for terminal output (Windows compatible)
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.RESET}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.RESET}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.RESET}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.RESET}")

def test_endpoint(name, method, url, data=None, params=None, expected_status=200):
    """Test a single endpoint"""
    print(f"\n{'='*60}")
    print(f"Testing: {name}")
    print(f"{'='*60}")
    print(f"Method: {method}")
    print(f"URL: {url}")
    if data:
        print(f"Body: {json.dumps(data, indent=2)}")
    if params:
        print(f"Params: {params}")
    
    try:
        if method == "GET":
            response = requests.get(url, params=params, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=5)
        else:
            print_error(f"Unsupported method: {method}")
            return None
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == expected_status:
            print_success(f"{name} - PASSED")
            return response.json()
        else:
            print_error(f"{name} - FAILED (Expected {expected_status}, got {response.status_code})")
            return None
            
    except requests.exceptions.ConnectionError:
        print_error(f"Could not connect to {BASE_URL}")
        print_warning("Make sure Flask server is running: python backend/app.py")
        return None
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return None


def main():
    print("\n" + "="*60)
    print("🧪 API Endpoint Testing Script")
    print("="*60)
    print_info("Make sure your Flask server is running on http://127.0.0.1:5000")
    print()
    
    # Test data
    user_phone = "9876543210"
    user_password = "password123"
    worker_phone = "9876543211"
    worker_password = "worker123"
    
    results = {}
    
    # ============================================
    # 1. TEST USER REGISTRATION
    # ============================================
    user_data = {
        "name": "John Doe",
        "phone": user_phone,
        "password": user_password,
        "pincode": "560001",
        "area": "Bangalore",
        "email": "john@example.com",
        "address": "123 Main Street"
    }
    result = test_endpoint(
        "User Registration",
        "POST",
        f"{BASE_URL}/api/auth/user/register",
        data=user_data,
        expected_status=201
    )
    results["user_register"] = result
    
    # ============================================
    # 2. TEST USER LOGIN
    # ============================================
    login_data = {
        "phone": user_phone,
        "password": user_password
    }
    result = test_endpoint(
        "User Login",
        "POST",
        f"{BASE_URL}/api/auth/user/login",
        data=login_data,
        expected_status=200
    )
    results["user_login"] = result
    user_id = result.get("user_id") if result else None
    
    # ============================================
    # 3. TEST WORKER REGISTRATION
    # ============================================
    worker_data = {
        "name": "Rajesh Kumar",
        "phone": worker_phone,
        "password": worker_password,
        "service_type": "Plumber",
        "pincode": "560001",
        "area": "Bangalore",
        "email": "rajesh@example.com"
    }
    result = test_endpoint(
        "Worker Registration",
        "POST",
        f"{BASE_URL}/api/auth/worker/register",
        data=worker_data,
        expected_status=201
    )
    results["worker_register"] = result
    
    # ============================================
    # 4. TEST WORKER LOGIN
    # ============================================
    worker_login_data = {
        "phone": worker_phone,
        "password": worker_password
    }
    result = test_endpoint(
        "Worker Login",
        "POST",
        f"{BASE_URL}/api/auth/worker/login",
        data=worker_login_data,
        expected_status=200
    )
    results["worker_login"] = result
    worker_id = result.get("worker_id") if result else None
    
    # ============================================
    # 5. TEST UPDATE WORKER STATUS
    # ============================================
    if worker_id:
        status_data = {
            "worker_id": worker_id,
            "status": "Available"
        }
        result = test_endpoint(
            "Update Worker Status (to Available)",
            "POST",
            f"{BASE_URL}/api/workers/status",
            data=status_data,
            expected_status=200
        )
        results["update_status_available"] = result
        
        # Test updating to Busy
        status_data["status"] = "Busy"
        result = test_endpoint(
            "Update Worker Status (to Busy)",
            "POST",
            f"{BASE_URL}/api/workers/status",
            data=status_data,
            expected_status=200
        )
        results["update_status_busy"] = result
        
        # Change back to Available for search test
        status_data["status"] = "Available"
        test_endpoint(
            "Update Worker Status (back to Available)",
            "POST",
            f"{BASE_URL}/api/workers/status",
            data=status_data,
            expected_status=200
        )
    else:
        print_warning("Skipping worker status update (worker_id not available)")
    
    # ============================================
    # 6. TEST SEARCH WORKERS
    # ============================================
    # Search by service_type and pincode
    result = test_endpoint(
        "Search Workers (by service_type and pincode)",
        "GET",
        f"{BASE_URL}/api/workers/search",
        params={"service_type": "Plumber", "pincode": "560001"},
        expected_status=200
    )
    results["search_by_pincode"] = result
    
    # Search by service_type and area
    result = test_endpoint(
        "Search Workers (by service_type and area)",
        "GET",
        f"{BASE_URL}/api/workers/search",
        params={"service_type": "Plumber", "area": "Bangalore"},
        expected_status=200
    )
    results["search_by_area"] = result
    
    # Search by service_type only
    result = test_endpoint(
        "Search Workers (by service_type only)",
        "GET",
        f"{BASE_URL}/api/workers/search",
        params={"service_type": "Plumber"},
        expected_status=200
    )
    results["search_by_service"] = result
    
    # ============================================
    # 7. TEST ERROR CASES
    # ============================================
    print(f"\n{'='*60}")
    print("Testing Error Cases")
    print(f"{'='*60}")
    
    # Try to register same user again (should fail)
    test_endpoint(
        "User Registration (duplicate phone - should fail)",
        "POST",
        f"{BASE_URL}/api/auth/user/register",
        data=user_data,
        expected_status=409
    )
    
    # Try login with wrong password
    wrong_login = {
        "phone": user_phone,
        "password": "wrongpassword"
    }
    test_endpoint(
        "User Login (wrong password - should fail)",
        "POST",
        f"{BASE_URL}/api/auth/user/login",
        data=wrong_login,
        expected_status=401
    )
    
    # Search without service_type (should fail)
    test_endpoint(
        "Search Workers (missing service_type - should fail)",
        "GET",
        f"{BASE_URL}/api/workers/search",
        params={"pincode": "560001"},
        expected_status=400
    )
    
    # ============================================
    # SUMMARY
    # ============================================
    print(f"\n{'='*60}")
    print("📊 TEST SUMMARY")
    print(f"{'='*60}")
    
    passed = sum(1 for r in results.values() if r is not None)
    total = len([r for r in results.values() if r is not None])
    
    print(f"\nTotal tests run: {total}")
    print_success(f"Passed: {passed}")
    
    if passed == total:
        print_success("\n🎉 All tests passed!")
    else:
        print_warning(f"\n⚠️  {total - passed} test(s) failed. Check the output above.")
    
    print("\n" + "="*60)
    print("Testing complete!")
    print("="*60 + "\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Testing interrupted by user")
        sys.exit(0)
    except Exception as e:
        print_error(f"\nUnexpected error: {str(e)}")
        sys.exit(1)

