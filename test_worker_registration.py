"""
Test Worker Registration
Test the registration endpoint to see if it works correctly.
"""
import requests
import json

def test_worker_registration():
    print("\n" + "="*60)
    print("Testing Worker Registration")
    print("="*60 + "\n")
    
    url = "http://127.0.0.1:5000/api/auth/register"
    
    test_data = {
        "role": "worker",
        "name": "Test Worker",
        "email": "testworker@example.com",
        "phone": "9999999999",
        "password": "test123",
        "location": "560001",
        "service_type": "Plumber",
        "experience": 5,
        "address": "Test Address"
    }
    
    print("Sending registration request...")
    print(f"URL: {url}")
    print(f"Data: {json.dumps(test_data, indent=2)}")
    print()
    
    try:
        response = requests.post(url, json=test_data, timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201:
            print("\n[OK] Worker registration successful!")
        else:
            print(f"\n[ERROR] Registration failed with status {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("[ERROR] Could not connect to backend server.")
        print("[INFO] Make sure Flask server is running: python backend/app.py")
    except Exception as e:
        print(f"[ERROR] Error: {e}")

if __name__ == "__main__":
    test_worker_registration()

