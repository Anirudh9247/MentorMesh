import os
from datetime import datetime

# Set environment variable to use a test database
os.environ["DATABASE_URL"] = "sqlite:///./test_mentors.db"

from backend.database import engine, Base, SessionLocal
from backend.main import app
from backend.models import User, MentorProfile, MentorshipConnection
from fastapi.testclient import TestClient
from backend.auth import create_access_token

client = TestClient(app)

def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def teardown_db():
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test_mentors.db"):
        try:
            os.remove("./test_mentors.db")
        except PermissionError:
            pass

def create_user(db, name, email, role, city):
    from backend.auth import get_password_hash
    user = User(
        name=name,
        email=email,
        password_hash=get_password_hash("password123"),
        role=role,
        city=city
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_mentor_profile(db, user_id, domains, bio, what_ill_discuss, max_sessions_per_month=4):
    profile = MentorProfile(
        user_id=user_id,
        domains=domains,
        bio=bio,
        max_sessions_per_month=max_sessions_per_month,
        what_ill_discuss=what_ill_discuss
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

def test_mentors():
    setup_db()
    try:
        db = SessionLocal()

        # 1. Create accounts
        student = create_user(db, "Student Sam", "sam@student.com", "student", "Seattle")
        mentor1 = create_user(db, "Mentor Mike", "mike@mentor.com", "mentor", "Seattle")
        mentor2 = create_user(db, "Mentor Mia", "mia@mentor.com", "mentor", "New York")

        # Tokens
        student_token = create_access_token({"sub": student.email, "role": student.role})
        mentor1_token = create_access_token({"sub": mentor1.email, "role": mentor1.role})

        student_headers = {"Authorization": f"Bearer {student_token}"}
        mentor1_headers = {"Authorization": f"Bearer {mentor1_token}"}

        # 2. Test GET /mentors/me when not found
        response = client.get("/mentors/me", headers=mentor1_headers)
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

        # 3. Test PUT /mentors/me (creation)
        payload = {
            "domains": ["Web Dev", "React"],
            "bio": "Frontend expert",
            "what_ill_discuss": "UI architecture",
            "max_sessions_per_month": 5
        }
        response = client.put("/mentors/me", json=payload, headers=mentor1_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["bio"] == "Frontend expert"
        assert data["domains"] == ["Web Dev", "React"]

        # 4. Test PUT /mentors/me (forbidden for students)
        response = client.put("/mentors/me", json=payload, headers=student_headers)
        assert response.status_code == 403

        # 5. Test GET /mentors/me (fetch own profile)
        response = client.get("/mentors/me", headers=mentor1_headers)
        assert response.status_code == 200
        assert response.json()["bio"] == "Frontend expert"

        # Add second mentor profile via db directly
        create_mentor_profile(db, mentor2.id, ["AI/ML", "Python"], "Data scientist", "Machine learning")

        # 6. Test GET /mentors (list and filters)
        response = client.get("/mentors", headers=student_headers)
        assert response.status_code == 200
        assert len(response.json()) == 2

        # Filter by city
        response = client.get("/mentors?city=Seattle", headers=student_headers)
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["user"]["city"] == "Seattle"

        # Filter by domain
        response = client.get("/mentors?domain=AI", headers=student_headers)
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert "AI/ML" in response.json()[0]["domains"]

        # Filter by search
        response = client.get("/mentors?search=Data scientist", headers=student_headers)
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["bio"] == "Data scientist"

        # 7. Test GET /mentors/{user_id}
        response = client.get(f"/mentors/{mentor1.id}")
        assert response.status_code == 200
        assert response.json()["user"]["name"] == "Mentor Mike"

        # 8. Test POST /mentors/{mentor_id}/reviews
        # Should fail initially since no active mentorship connection
        review_payload = {"rating": 5, "note": "Great mentor"}
        response = client.post(f"/mentors/{mentor1.id}/reviews", json=review_payload, headers=student_headers)
        assert response.status_code == 400

        # Should forbid mentors from leaving reviews
        response = client.post(f"/mentors/{mentor1.id}/reviews", json=review_payload, headers=mentor1_headers)
        assert response.status_code == 403

        # Create active mentorship connection
        conn = MentorshipConnection(
            student_id=student.id,
            mentor_id=mentor1.id,
            created_from_request_id=999, # Dummy request ID
            status="active"
        )
        db.add(conn)
        db.commit()

        # Submit review successfully
        response = client.post(f"/mentors/{mentor1.id}/reviews", json=review_payload, headers=student_headers)
        assert response.status_code == 201

        # Check mentor state update
        response = client.get(f"/mentors/{mentor1.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["avg_rating"] == 5.0
        assert data["session_count"] == 1
        assert len(data["reviews"]) == 1
        assert data["reviews"][0]["rating"] == 5

        print("\nALL MENTOR ENDPOINT TESTS PASSED SUCCESSFULLY!")
    finally:
        db.close()
        teardown_db()

if __name__ == "__main__":
    test_mentors()
