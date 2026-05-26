import os

# Set environment variable to use a test database
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

from backend.database import engine, Base, SessionLocal
from backend.main import app
from backend.models import User, MentorProfile, ConnectionRequest, MentorshipConnection
from fastapi.testclient import TestClient

client = TestClient(app)

def setup_db():
    # Re-create all tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def teardown_db():
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test.db"):
        try:
            os.remove("./test.db")
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

def test_connection_requests():
    setup_db()
    try:
        db = SessionLocal()
        
        # 1. Create student and mentor accounts
        student = create_user(db, "Student Alex", "alex@student.com", "student", "Seattle")
        mentor_1 = create_user(db, "Mentor Bob", "bob@mentor.com", "mentor", "Seattle")
        mentor_2 = create_user(db, "Mentor Charlie", "charlie@mentor.com", "mentor", "New York")
        
        # Add mentor profiles
        profile_1 = MentorProfile(user_id=mentor_1.id, domains=["Web Development"], bio="Experienced dev", max_sessions_per_month=4)
        profile_2 = MentorProfile(user_id=mentor_2.id, domains=["AI/ML"], bio="Research scientist", max_sessions_per_month=2)
        db.add(profile_1)
        db.add(profile_2)
        db.commit()

        # Generate JWT tokens for authentication
        from backend.auth import create_access_token
        student_token = create_access_token({"sub": student.email, "role": student.role})
        mentor_1_token = create_access_token({"sub": mentor_1.email, "role": mentor_1.role})
        mentor_2_token = create_access_token({"sub": mentor_2.email, "role": mentor_2.role})
        
        student_headers = {"Authorization": f"Bearer {student_token}"}
        mentor_1_headers = {"Authorization": f"Bearer {mentor_1_token}"}
        mentor_2_headers = {"Authorization": f"Bearer {mentor_2_token}"}

        # 2. Test: Student creates a valid request to Mentor Bob
        payload = {
            "mentor_id": mentor_1.id,
            "answer_1": "I want to learn database scaling.",
            "answer_2": "I read SQL indexing articles online.",
            "answer_3": "Review my schema draft for 30 minutes."
        }
        response = client.post("/requests", json=payload, headers=student_headers)
        assert response.status_code == 201
        assert response.json()["message"] == "Request sent successfully"
        assert response.json()["status"] == "pending"

        # Verify request was created in DB
        req = db.query(ConnectionRequest).filter_by(student_id=student.id, mentor_id=mentor_1.id).first()
        assert req is not None
        assert req.answer_1 == "I want to learn database scaling."
        assert req.status == "pending"

        # 3. Test: Mentor Bob trying to create a request to Mentor Charlie (should fail - only students can create requests)
        payload_invalid_role = {
            "mentor_id": mentor_2.id,
            "answer_1": "Discuss research collaboration.",
            "answer_2": "None",
            "answer_3": "None"
        }
        response = client.post("/requests", json=payload_invalid_role, headers=mentor_1_headers)
        assert response.status_code == 403
        assert "Only student accounts can create connection requests" in response.json()["detail"]

        # 4. Test: Duplicate pending request (should fail)
        response = client.post("/requests", json=payload, headers=student_headers)
        assert response.status_code == 400
        assert "already pending" in response.json()["detail"] or "already accepted" in response.json()["detail"]

        # 5. Test: Invalid request ID status patch (should fail 404)
        response = client.patch("/requests/9999", json={"status": "accepted"}, headers=mentor_1_headers)
        assert response.status_code == 404

        # 6. Test: Ownership validation (Mentor Charlie tries to accept Mentor Bob's request - should fail 403)
        response = client.patch(f"/requests/{req.id}", json={"status": "accepted"}, headers=mentor_2_headers)
        assert response.status_code == 403
        assert "permission" in response.json()["detail"]

        # 7. Test: Mentor Bob accepts request
        response = client.patch(f"/requests/{req.id}", json={"status": "accepted"}, headers=mentor_1_headers)
        assert response.status_code == 200
        assert response.json()["status"] == "accepted"

        # Verify relationship was auto-created
        conn = db.query(MentorshipConnection).filter_by(student_id=student.id, mentor_id=mentor_1.id).first()
        assert conn is not None
        assert conn.created_from_request_id == req.id

        # 8. Test: Duplicate request once accepted (should fail)
        response = client.post("/requests", json=payload, headers=student_headers)
        assert response.status_code == 400
        assert "active" in response.json()["detail"] or "accepted" in response.json()["detail"]

        # 9. Test: Student tries to accept request (should fail - only mentors can respond)
        response = client.patch(f"/requests/{req.id}", json={"status": "accepted"}, headers=student_headers)
        assert response.status_code == 403

        # 10. Test: Deleting student cascades and deletes requests and connections
        db.delete(student)
        db.commit()
        
        assert db.query(ConnectionRequest).filter_by(id=req.id).first() is None
        assert db.query(MentorshipConnection).filter_by(id=conn.id).first() is None

        db.close()
        print("\nALL EDGE CASE TESTS PASSED SUCCESSFULLY!")
    finally:
        teardown_db()

if __name__ == "__main__":
    test_connection_requests()
