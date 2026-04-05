"""
Test Admin Endpoints
Test if admin endpoints are working correctly.
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000/api/admin"

def test_pending_workers():
    print("\n" + "="*60)
    print("Testing GET /api/admin/pending-workers")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/pending-workers", timeout=5)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200:
            workers = data.get("workers", [])
            print(f"\n[OK] Found {len(workers)} pending workers")
            if workers:
                print("\nSample worker:")
                print(f"  - ID: {workers[0].get('id')}")
                print(f"  - Name: {workers[0].get('name')}")
                print(f"  - Service: {workers[0].get('service_type')}")
        else:
            print(f"[ERROR] Request failed")
    except requests.exceptions.ConnectionError:
        print("[ERROR] Could not connect to backend. Is Flask running?")
    except Exception as e:
        print(f"[ERROR] {e}")

def test_complaints():
    print("\n" + "="*60)
    print("Testing GET /api/admin/complaints")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/complaints", timeout=5)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200:
            complaints = data.get("complaints", [])
            print(f"\n[OK] Found {len(complaints)} complaints")
            if complaints:
                print("\nSample complaint:")
                print(f"  - ID: {complaints[0].get('id')}")
                print(f"  - User: {complaints[0].get('user_name')}")
                print(f"  - Worker: {complaints[0].get('worker_name')}")
                print(f"  - Complaint: {complaints[0].get('complaint_text', '')[:50]}...")
                print(f"  - Status: {complaints[0].get('status')}")
        else:
            print(f"[ERROR] Request failed")
    except requests.exceptions.ConnectionError:
        print("[ERROR] Could not connect to backend. Is Flask running?")
    except Exception as e:
        print(f"[ERROR] {e}")

def test_all_workers():
    print("\n" + "="*60)
    print("Testing GET /api/admin/workers")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/workers", timeout=5)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        
        if response.status_code == 200:
            workers = data.get("workers", [])
            print(f"\n[OK] Found {len(workers)} total workers")
            pending = [w for w in workers if w.get('verification_status') == 'pending']
            print(f"  - Pending: {len(pending)}")
            approved = [w for w in workers if w.get('verification_status') == 'approved']
            print(f"  - Approved: {len(approved)}")
            blocked = [w for w in workers if w.get('verification_status') == 'blocked']
            print(f"  - Blocked: {len(blocked)}")
        else:
            print(f"[ERROR] Request failed: {data}")
    except requests.exceptions.ConnectionError:
        print("[ERROR] Could not connect to backend. Is Flask running?")
    except Exception as e:
        print(f"[ERROR] {e}")

if __name__ == "__main__":
    print("\n" + "="*60)
    print("Admin Endpoints Test")
    print("="*60)
    print("\nMake sure Flask backend is running on http://127.0.0.1:5000")
    
    test_pending_workers()
    test_complaints()
    test_all_workers()
    
    print("\n" + "="*60)
    print("Test Complete")
    print("="*60 + "\n")

