import os
import json
import datetime
from sqlalchemy.orm import Session
from backend.database import SessionLocal, Base, engine
from backend.models import User, MentorProfile, ConnectionRequest, MentorshipConnection, Session as SessionModel, Review
from backend.auth import get_password_hash

def seed_db():
    print("Initializing database seed...")
    # Re-create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # 1. Clear existing data
        print("Clearing existing records...")
        db.query(Review).delete()
        db.query(SessionModel).delete()
        db.query(MentorshipConnection).delete()
        db.query(ConnectionRequest).delete()
        db.query(MentorProfile).delete()
        db.query(User).delete()
        db.commit()
        
        # Resolve seed directories
        seed_dir = os.path.dirname(os.path.abspath(__file__))
        
        with open(os.path.join(seed_dir, "mentors.json"), "r") as f:
            mentors_data = json.load(f)
            
        with open(os.path.join(seed_dir, "students.json"), "r") as f:
            students_data = json.load(f)
            
        with open(os.path.join(seed_dir, "requests.json"), "r") as f:
            requests_data = json.load(f)
            
        with open(os.path.join(seed_dir, "connections.json"), "r") as f:
            connections_data = json.load(f)

        # 2. Insert Mentors
        print(f"Seeding {len(mentors_data)} mentors...")
        mentor_email_map = {}
        for m in mentors_data:
            user = User(
                name=m["name"],
                email=m["email"],
                password_hash=get_password_hash("password123"),
                role="mentor",
                city=m["city"],
                avatar_url=m.get("avatar_url"),
                avatar_gradient=m.get("avatar_gradient")
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
            profile = MentorProfile(
                user_id=user.id,
                domains=m["domains"],
                bio=m["bio"],
                max_sessions_per_month=m["max_sessions_per_month"],
                what_ill_discuss=m["what_ill_discuss"],
                avg_rating=m["avg_rating"],
                session_count=m["session_count"],
                availability_state=m.get("availability_state", "available")
            )
            db.add(profile)
            db.commit()
            
            mentor_email_map[user.email] = user.id

        # 3. Insert Students
        print(f"Seeding {len(students_data)} students...")
        student_email_map = {}
        for s in students_data:
            user = User(
                name=s["name"],
                email=s["email"],
                password_hash=get_password_hash("password123"),
                role="student",
                city=s["city"]
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
            student_email_map[user.email] = user.id

        # 4. Insert Connection Requests
        print(f"Seeding {len(requests_data)} connection requests...")
        request_key_map = {}
        for r in requests_data:
            s_id = student_email_map.get(r["student_email"])
            m_id = mentor_email_map.get(r["mentor_email"])
            if not s_id or not m_id:
                print(f"Warning: Could not find student/mentor for request: {r['student_email']} -> {r['mentor_email']}")
                continue
                
            offset_mins = r.get("time_offset_minutes", 60)
            created_time = datetime.datetime.utcnow() - datetime.timedelta(minutes=offset_mins)
            
            req = ConnectionRequest(
                student_id=s_id,
                mentor_id=m_id,
                answer_1=r["answer_1"],
                answer_2=r["answer_2"],
                answer_3=r["answer_3"],
                status=r["status"],
                created_at=created_time,
                updated_at=created_time + datetime.timedelta(minutes=5)
            )
            db.add(req)
            db.commit()
            db.refresh(req)
            
            # Map request for connection insertion lookup
            request_key_map[(r["student_email"], r["mentor_email"])] = req.id

        # 5. Insert Mentorship Connections
        print(f"Seeding {len(connections_data)} active/paused/completed connections...")
        for c in connections_data:
            s_id = student_email_map.get(c["student_email"])
            m_id = mentor_email_map.get(c["mentor_email"])
            req_id = request_key_map.get((c["student_email"], c["mentor_email"]))
            if not s_id or not m_id or not req_id:
                print(f"Warning: Connection ignored, missing request: {c['student_email']} -> {c['mentor_email']}")
                continue
                
            conn = MentorshipConnection(
                student_id=s_id,
                mentor_id=m_id,
                created_from_request_id=req_id,
                status=c["status"],
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=24)
            )
            db.add(conn)
            db.commit()
            
        print("Database seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
