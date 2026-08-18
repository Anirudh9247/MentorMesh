import os

# Set environment variable to use a test database
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

from backend.database import engine, Base, SessionLocal
from backend.main import app
from backend.models import User
from fastapi.testclient import TestClient

client = TestClient(app)

def setup_db():
    # Re-create all tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def teardown_db():
    Base.metadata.drop_all(bind=engine)
    # Don't delete the test.db file since other tests might need the engine's open connection

def test_auth_register():
    setup_db()
    try:
        db = SessionLocal()

        # Test 1: Successful Registration
        payload = {
            "name": "Test User",
            "email": "testuser@example.com",
            "password": "password123",
            "role": "student",
            "city": "Seattle"
        }

        response = client.post("/auth/register", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "testuser@example.com"
        assert data["role"] == "student"
        assert data["name"] == "Test User"
        assert "id" in data

        # Verify in DB
        db_user = db.query(User).filter_by(email="testuser@example.com").first()
        assert db_user is not None
        assert db_user.name == "Test User"
        assert db_user.role == "student"

        # Test 2: Duplicate Email Registration
        response = client.post("/auth/register", json=payload)
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

        # Test 3: Invalid Role Registration
        invalid_role_payload = {
            "name": "Invalid Role User",
            "email": "invalid@example.com",
            "password": "password123",
            "role": "admin",
            "city": "Seattle"
        }
        response = client.post("/auth/register", json=invalid_role_payload)
        assert response.status_code == 422

        db.close()
        print("\nALL AUTH REGISTER TESTS PASSED SUCCESSFULLY!")
    finally:
        teardown_db()

if __name__ == "__main__":
    test_auth_register()
