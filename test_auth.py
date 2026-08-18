import os
import pytest
import sqlite3
import tempfile

db_fd, db_path = tempfile.mkstemp(suffix=".db")
os.close(db_fd)
os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"

from backend.database import engine, Base, SessionLocal
from backend.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def setup_db():
    Base.metadata.create_all(bind=engine)

def teardown_db():
    Base.metadata.drop_all(bind=engine)

def test_register_success():
    setup_db()
    try:
        payload = {
            "name": "Test User",
            "email": "test@test.com",
            "password": "password123",
            "role": "student",
            "city": "Seattle"
        }
        response = client.post("/auth/register", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "test@test.com"
        assert data["name"] == "Test User"
        assert data["role"] == "student"
        assert data["city"] == "Seattle"
        assert "id" in data
        assert "created_at" in data
        assert "password" not in data
        assert "password_hash" not in data
    finally:
        teardown_db()

def test_register_duplicate_email():
    setup_db()
    try:
        payload = {
            "name": "Duplicate User",
            "email": "duplicate@test.com",
            "password": "password123",
            "role": "mentor",
            "city": "Austin"
        }
        response1 = client.post("/auth/register", json=payload)
        assert response1.status_code == 201

        response2 = client.post("/auth/register", json=payload)
        assert response2.status_code == 400
        assert response2.json()["detail"] == "A user with this email already exists."
    finally:
        teardown_db()

def test_invalid_role():
    setup_db()
    try:
        payload = {
            "name": "Invalid Role User",
            "email": "invalid@test.com",
            "password": "password123",
            "role": "admin",
            "city": "New York"
        }
        response = client.post("/auth/register", json=payload)
        assert response.status_code == 422
    finally:
        teardown_db()
