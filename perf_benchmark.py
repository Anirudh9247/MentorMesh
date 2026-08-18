import time
import os
import contextlib
from sqlalchemy import event
from sqlalchemy.engine import Engine

# Ensure we use test DB
os.environ["DATABASE_URL"] = "sqlite:///./test_perf.db"

from backend.database import engine, Base, SessionLocal
from backend.main import app
from backend.models import User, MentorProfile, Session as SessionModel, Review
from fastapi.testclient import TestClient

client = TestClient(app)

def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def create_data(db, num_sessions=50):
    from backend.auth import get_password_hash
    mentor = User(
        name="Perf Mentor",
        email="perf@mentor.com",
        password_hash=get_password_hash("password123"),
        role="mentor",
        city="Seattle"
    )
    db.add(mentor)
    db.commit()
    db.refresh(mentor)

    profile = MentorProfile(user_id=mentor.id, domains=["Web"], bio="Perf dev")
    db.add(profile)
    db.commit()

    student = User(
        name="Perf Student",
        email="perf_student@mentor.com",
        password_hash=get_password_hash("password123"),
        role="student",
        city="Seattle"
    )
    db.add(student)
    db.commit()
    db.refresh(student)

    # Insert 50 sessions and reviews
    import datetime

    # We need a dummy request id, let's create a dummy request
    from backend.models import ConnectionRequest
    req = ConnectionRequest(
        student_id=student.id,
        mentor_id=mentor.id,
        answer_1="1", answer_2="2", answer_3="3"
    )
    db.add(req)
    db.commit()
    db.refresh(req)

    for i in range(num_sessions):
        s = SessionModel(
            request_id=req.id,
            student_id=student.id,
            mentor_id=mentor.id,
            scheduled_at=datetime.datetime.now(),
            agenda="Agenda",
            status="completed"
        )
        db.add(s)
        db.commit()
        db.refresh(s)

        r = Review(
            session_id=s.id,
            rating=5,
            note=f"Great {i}"
        )
        db.add(r)
        db.commit()

    return mentor.id

class QueryCounter:
    def __init__(self):
        self.count = 0

    def callback(self, conn, cursor, statement, parameters, context, executemany):
        self.count += 1

@contextlib.contextmanager
def count_queries():
    counter = QueryCounter()
    event.listen(Engine, "before_cursor_execute", counter.callback)
    try:
        yield counter
    finally:
        event.remove(Engine, "before_cursor_execute", counter.callback)

if __name__ == "__main__":
    setup_db()
    db = SessionLocal()
    mentor_id = create_data(db, num_sessions=50)
    db.close()

    # Warmup
    client.get(f"/mentors/{mentor_id}")

    with count_queries() as counter:
        start_time = time.time()
        response = client.get(f"/mentors/{mentor_id}")
        end_time = time.time()

    print(f"Status Code: {response.status_code}")
    print(f"Number of SQL queries: {counter.count}")
    print(f"Time taken: {(end_time - start_time) * 1000:.2f} ms")
