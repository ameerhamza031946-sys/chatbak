import sys
import os
from fastapi.testclient import TestClient

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app

client = TestClient(app)

def test_health_check():
    """Verify system health check and model definitions return successfully."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "database" in data

def test_models_list():
    """Verify available models are retrieved successfully."""
    response = client.get("/models")
    assert response.status_code == 200
    models = response.json()
    assert len(models) > 0
    assert any(m["id"] == "gpt-4o-mini" for m in models)

def test_auth_flow():
    """Verify register, login, and protected routes flow."""
    import random
    rand_id = random.randint(1000, 9999)
    email = f"testuser_{rand_id}@nexus.com"
    password = "securepassword123"
    name = "Test User"
    
    # 1. Register User
    reg_response = client.post("/auth/register", json={
        "name": name,
        "email": email,
        "password": password
    })
    assert reg_response.status_code == 201
    reg_data = reg_response.json()
    assert reg_data["email"] == email
    assert "id" in reg_data
    assert "password" not in reg_data
    
    # 2. Login User
    login_response = client.post("/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    token = token_data["access_token"]
    
    # 3. Retrieve Profile with JWT Header
    profile_response = client.get("/auth/me", headers={
        "Authorization": f"Bearer {token}"
    })
    assert profile_response.status_code == 200
    profile_data = profile_response.json()
    assert profile_data["email"] == email
    assert profile_data["name"] == name

if __name__ == "__main__":
    print("Starting integration tests...")
    try:
        print("Testing health check...")
        test_health_check()
        print("Health check: PASS")
        
        print("Testing models retrieval...")
        test_models_list()
        print("Models retrieval: PASS")
        
        print("Testing complete authentication flow...")
        test_auth_flow()
        print("Authentication flow: PASS")
        
        print("\n--- ALL BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY ---")
    except AssertionError as e:
        print(f"\n--- TEST FAILED ---")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    except Exception as e:
        print(f"\n--- UNEXPECTED ERROR: {e} ---")
        import traceback
        traceback.print_exc()
        sys.exit(1)
