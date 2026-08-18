import os
from datetime import datetime

# Set environment variable to use a test database
os.environ["DATABASE_URL"] = "sqlite:///./test_mentors.db"

from backend.database import engine, Base, SessionLocal
from backend.main import app
from backend.models import User, MentorProfile, ConnectionRequest, MentorshipConnection, RequestStatus, ConnectionStatus, Session, Review
from fastapi.testclient import TestClient

client = TestClient(app)

def setup_db():
    # Re-create all tables
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

def test_submit_mentor_review():
    setup_db()
    try:
        db = SessionLocal()

        # 1. Setup users
        student = create_user(db, "Student Sam", "sam@student.com", "student", "Seattle")
        student2 = create_user(db, "Student Two", "two@student.com", "student", "Austin")
        mentor = create_user(db, "Mentor Mark", "mark@mentor.com", "mentor", "Seattle")

        # Add mentor profile
        profile = MentorProfile(
            user_id=mentor.id,
            domains=["Web Development"],
            bio="Experienced dev",
            max_sessions_per_month=4,
            session_count=0,
            avg_rating=0.0
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

        # Setup active connection between student and mentor
        req = ConnectionRequest(
            student_id=student.id,
            mentor_id=mentor.id,
            answer_1="Learn testing",
            answer_2="Read docs",
            answer_3="Review my tests",
            status=RequestStatus.ACCEPTED.value
        )
        db.add(req)
        db.commit()
        db.refresh(req)

        conn = MentorshipConnection(
            student_id=student.id,
            mentor_id=mentor.id,
            created_from_request_id=req.id,
            status=ConnectionStatus.ACTIVE.value
        )
        db.add(conn)
        db.commit()
        db.refresh(conn)

        # Generate JWT tokens
        from backend.auth import create_access_token
        student_token = create_access_token({"sub": student.email, "role": student.role})
        student2_token = create_access_token({"sub": student2.email, "role": student2.role})
        mentor_token = create_access_token({"sub": mentor.email, "role": mentor.role})

        student_headers = {"Authorization": f"Bearer {student_token}"}
        student2_headers = {"Authorization": f"Bearer {student2_token}"}
        mentor_headers = {"Authorization": f"Bearer {mentor_token}"}

        # 2. Test: Mentor (or non-student) trying to leave a review fails
        payload = {
            "rating": 5,
            "note": "Great mentor!"
        }
        response = client.post(f"/mentors/{mentor.id}/reviews", json=payload, headers=mentor_headers)
        assert response.status_code == 403
        assert "Only student accounts can leave reviews" in response.json()["detail"]

        # 3. Test: Student trying to leave review with NO active connection fails
        response = client.post(f"/mentors/{mentor.id}/reviews", json=payload, headers=student2_headers)
        assert response.status_code == 400
        assert "must have an active connection" in response.json()["detail"]

        # 4. Test: Student with active connection successfully leaves a review
        response = client.post(f"/mentors/{mentor.id}/reviews", json=payload, headers=student_headers)
        assert response.status_code == 201
        assert response.json()["message"] == "Review submitted successfully"

        # Verify Session was auto-generated
        session = db.query(Session).filter_by(student_id=student.id, mentor_id=mentor.id).first()
        assert session is not None
        assert session.request_id == req.id
        assert session.status == "completed"
        assert session.agenda == "Completed Mentorship Review Session"

        # Verify Review was created
        review = db.query(Review).filter_by(session_id=session.id).first()
        assert review is not None
        assert review.rating == 5
        assert review.note == "Great mentor!"

        # Verify mentor profile stats updated
        db.refresh(profile)
        assert profile.session_count == 1
        assert profile.avg_rating == 5.0

        # Leave another review to test average rating calculation
        payload2 = {
            "rating": 3,
            "note": "Okay mentor."
        }
        response = client.post(f"/mentors/{mentor.id}/reviews", json=payload2, headers=student_headers)
        assert response.status_code == 201

        db.refresh(profile)
        assert profile.session_count == 2
        assert profile.avg_rating == 4.0

        db.close()
        print("\nALL MENTOR REVIEW TESTS PASSED SUCCESSFULLY!")
    finally:
        teardown_db()

if __name__ == "__main__":
    test_submit_mentor_review()
