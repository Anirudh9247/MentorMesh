import os
import sys
import datetime
from sqlalchemy.orm import Session
from backend.database import SessionLocal, Base, engine
from backend.models import User, MentorProfile, ConnectionRequest, MentorshipConnection, Session as SessionModel, Review
from backend.auth import get_password_hash

# 15 realistic mentors data covering Hyderabad, Bangalore, Chennai, Pune
MENTORS = [
    {
        "name": "Harsha Vardhan",
        "email": "harsha@mentor.com",
        "city": "Hyderabad",
        "domains": ["AI/ML", "Research"],
        "bio": "AI researcher focused on machine learning systems and deep learning models. I help students publish papers and build PyTorch models.",
        "max_sessions_per_month": 4,
        "what_ill_discuss": "Academic paper writing, Neural networks, PyTorch projects",
        "avg_rating": 4.9,
        "session_count": 47,
        "avatar_gradient": "from-violet-600 to-indigo-600"
    },
    {
        "name": "Raj Malhotra",
        "email": "raj@mentor.com",
        "city": "Bangalore",
        "domains": ["Cloud/DevOps", "Web Dev"],
        "bio": "Cloud architect specializing in Kubernetes, AWS deployments, and CI/CD pipelines. Love helping beginners transition into DevOps roles.",
        "max_sessions_per_month": 6,
        "what_ill_discuss": "AWS scaling, Terraform scripting, Dockerizing microservices",
        "avg_rating": 4.8,
        "session_count": 32,
        "avatar_gradient": "from-cyan-500 to-blue-600"
    },
    {
        "name": "Sneha Iyer",
        "email": "sneha@mentor.com",
        "city": "Pune",
        "domains": ["Design", "Web Dev"],
        "bio": "Product designer at a fintech startup. Expert in Figma user interfaces, React visual components, and design systems.",
        "max_sessions_per_month": 8,
        "what_ill_discuss": "Figma prototyping, React component styling, design critique",
        "avg_rating": 4.7,
        "session_count": 27,
        "avatar_gradient": "from-pink-500 to-rose-500"
    },
    {
        "name": "Anirudh Sharma",
        "email": "anirudh@mentor.com",
        "city": "Bangalore",
        "domains": ["Web Dev", "Data Science"],
        "bio": "Senior backend developer focused on building scalable Django APIs and database architecture. I optimize SQL queries and structure tables.",
        "max_sessions_per_month": 4,
        "what_ill_discuss": "Database indexes, Django REST framework, system design basics",
        "avg_rating": 4.6,
        "session_count": 29,
        "avatar_gradient": "from-teal-500 to-emerald-600"
    },
    {
        "name": "Divya Nair",
        "email": "divya@mentor.com",
        "city": "Chennai",
        "domains": ["Web Dev", "Research"],
        "bio": "Algorithms instructor helping students build coding confidence. Expert in sorting algorithms, dynamic programming, and FAANG prep.",
        "max_sessions_per_month": 5,
        "what_ill_discuss": "FAANG technical interview rounds, Dynamic programming, Java basics",
        "avg_rating": 4.9,
        "session_count": 45,
        "avatar_gradient": "from-amber-500 to-orange-600"
    },
    {
        "name": "Karthik Rao",
        "email": "karthik@mentor.com",
        "city": "Hyderabad",
        "domains": ["Finance", "Design"],
        "bio": "Co-founder of two tech startups. Helping aspiring builders iterate on product roadmaps, build MVPs, and acquire early users.",
        "max_sessions_per_month": 3,
        "what_ill_discuss": "Pitch decks, Minimum viable products, growth hacking heuristics",
        "avg_rating": 4.8,
        "session_count": 18,
        "avatar_gradient": "from-purple-600 to-pink-600"
    },
    {
        "name": "Pooja Patel",
        "email": "pooja@mentor.com",
        "city": "Hyderabad",
        "domains": ["Web Dev", "Cloud/DevOps"],
        "bio": "Mobile engineer building cross-platform apps with Flutter. Specialized in app store deployment, state management, and Dart core.",
        "max_sessions_per_month": 4,
        "what_ill_discuss": "Flutter clean architecture, Bloc vs Provider, responsive app layouts",
        "avg_rating": 4.5,
        "session_count": 22,
        "avatar_gradient": "from-red-500 to-orange-500"
    },
    {
        "name": "Rohan Das",
        "email": "rohan@mentor.com",
        "city": "Bangalore",
        "domains": ["Cloud/DevOps", "AI/ML"],
        "bio": "Certified penetration tester. Offering guidance on Linux commands, application security audits, and network defense strategies.",
        "max_sessions_per_month": 4,
        "what_ill_discuss": "Linux security hardening, OWASP Top 10, penetration testing labs",
        "avg_rating": 4.7,
        "session_count": 31,
        "avatar_gradient": "from-slate-700 to-slate-900"
    },
    {
        "name": "Meera Krishnan",
        "email": "meera@mentor.com",
        "city": "Bangalore",
        "domains": ["Data Science", "AI/ML"],
        "bio": "Data analyst focused on data visualization and SQL query optimization. Explaining analytics pipelines and machine learning basics.",
        "max_sessions_per_month": 6,
        "what_ill_discuss": "Tableau dashboards, Window functions in SQL, data cleaning scripts",
        "avg_rating": 4.4,
        "session_count": 15,
        "avatar_gradient": "from-lime-500 to-green-600"
    },
    {
        "name": "Siddharth Roy",
        "email": "siddharth@mentor.com",
        "city": "Bangalore",
        "domains": ["Finance", "Research"],
        "bio": "Smart contract auditor. I teach solidity, smart contract deployments, and building decentralized web applications using Go.",
        "max_sessions_per_month": 3,
        "what_ill_discuss": "Ethereum architectures, solidity auditing, Go web servers",
        "avg_rating": 4.8,
        "session_count": 12,
        "avatar_gradient": "from-emerald-600 to-teal-600"
    },
    {
        "name": "Alok Mishra",
        "email": "alok@mentor.com",
        "city": "Hyderabad",
        "domains": ["Cloud/DevOps", "Data Science"],
        "bio": "Site reliability engineer. Expert in AWS deployments, Terraform configuration scripting, and continuous integration pipeline automation.",
        "max_sessions_per_month": 4,
        "what_ill_discuss": "Terraform, Kubernetes configs, AWS deployment pipelines",
        "avg_rating": 4.7,
        "session_count": 41,
        "avatar_gradient": "from-sky-500 to-blue-600"
    },
    {
        "name": "Aditi Verma",
        "email": "aditi@mentor.com",
        "city": "Pune",
        "domains": ["Design", "Research"],
        "bio": "Lead user experience researcher. Helping beginners organize their Figma workflows, build design portfolios, and run user testing.",
        "max_sessions_per_month": 5,
        "what_ill_discuss": "Figma design portfolios, User research templates, wireframing workflows",
        "avg_rating": 4.6,
        "session_count": 20,
        "avatar_gradient": "from-rose-500 to-pink-600"
    },
    {
        "name": "Pranav Joshi",
        "email": "pranav@mentor.com",
        "city": "Chennai",
        "domains": ["Web Dev", "Cloud/DevOps"],
        "bio": "System engineer specialized in Go web servers and WebSocket architectures. I help build event-driven and real-time backend software.",
        "max_sessions_per_month": 4,
        "what_ill_discuss": "Go backend scaling, Node.js event loops, real-time sync systems",
        "avg_rating": 4.5,
        "session_count": 8,
        "avatar_gradient": "from-violet-500 to-purple-600"
    },
    {
        "name": "Kavita Sen",
        "email": "kavita@mentor.com",
        "city": "Pune",
        "domains": ["Finance", "Web Dev"],
        "bio": "Technical recruiter guiding engineers in transition. I review resumes, run FAANG mock interviews, and structure career paths.",
        "max_sessions_per_month": 8,
        "what_ill_discuss": "FAANG mock interviews, Resume revisions, tech career paths",
        "avg_rating": 4.8,
        "session_count": 47,
        "avatar_gradient": "from-amber-600 to-amber-800"
    },
    {
        "name": "Manoj Kumar",
        "email": "manoj@mentor.com",
        "city": "Chennai",
        "domains": ["Web Dev", "Cloud/DevOps"],
        "bio": "Cloud architect. Guiding students in understanding AWS resource groups, serverless deployment architectures, and access management.",
        "max_sessions_per_month": 4,
        "what_ill_discuss": "AWS serverless stack, IAM permission models, CloudFormation scripts",
        "avg_rating": 4.5,
        "session_count": 11,
        "avatar_gradient": "from-cyan-600 to-teal-500"
    }
]

# 5 students data
STUDENTS = [
    {
        "name": "Ramu Prasad",
        "email": "ramu@student.com",
        "city": "Bangalore",
        "next_target": "Learn Web Dev and deployment to AWS",
        "focus_area": "Cloud/DevOps",
        "learnt_so_far": "React hooks, basic Python, SQL foundations",
        "achievements": "Co-built student directory, solved 50+ LeetCode milestones"
    },
    {
        "name": "Ananya Reddy",
        "email": "ananya@student.com",
        "city": "Hyderabad",
        "next_target": "Learn deep learning/AI models and publish research",
        "focus_area": "AI/ML",
        "learnt_so_far": "Linear algebra, Python basics, numpy/pandas",
        "achievements": "Built a custom CNN for digit classification"
    },
    {
        "name": "Vikram Sen",
        "email": "vikram@student.com",
        "city": "Bangalore",
        "next_target": "Master React frontend and UI/UX design systems",
        "focus_area": "Design",
        "learnt_so_far": "HTML/CSS layout, Figma essentials",
        "achievements": "Redesigned landing page mockups for university portal"
    },
    {
        "name": "Divya Krishnan",
        "email": "divya_student@student.com",
        "city": "Chennai",
        "next_target": "Build scalable Node.js/Go APIs and deploy DevOps",
        "focus_area": "Web Dev",
        "learnt_so_far": "JavaScript ES6, basic Express.js, git",
        "achievements": "Created a simple real-time polling server"
    },
    {
        "name": "Kiran Rao",
        "email": "kiran@student.com",
        "city": "Pune",
        "next_target": "Learn Data Science, SQL query optimization, and ML pipelines",
        "focus_area": "Data Science",
        "learnt_so_far": "Basic statistics, SQL SELECT queries, Jupyter Notebooks",
        "achievements": "Cleaned a noisy dataset of 10,000 retail records"
    }
]

def seed_db():
    print("Initializing database seed...")
    force = "--force" in sys.argv
    
    db: Session = SessionLocal()
    try:
        if not force:
            try:
                user_count = db.query(User).count()
                if user_count > 0:
                    print(f"Database already contains {user_count} users. Run with '--force' to reset and re-seed. Aborting.")
                    return
            except Exception:
                print("Database schema is outdated or missing. Run with '--force' to reset and re-create schema. Aborting.")
                return

        print("Recreating database schema (dropping and creating all tables)...")
        db.close()
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        
        # 1. Insert Mentors
        print(f"Seeding {len(MENTORS)} mentors...")
        mentor_map = {}
        for m in MENTORS:
            user = User(
                name=m["name"],
                email=m["email"],
                password_hash=get_password_hash("password123"),
                role="mentor",
                city=m["city"],
                avatar_gradient=m["avatar_gradient"]
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
                availability_state="available"
            )
            db.add(profile)
            db.commit()
            mentor_map[user.email] = user
            
        # 2. Insert Students
        print(f"Seeding {len(STUDENTS)} students...")
        student_map = {}
        for s in STUDENTS:
            user = User(
                name=s["name"],
                email=s["email"],
                password_hash=get_password_hash("password123"),
                role="student",
                city=s["city"],
                focus_area=s.get("focus_area"),
                learnt_so_far=s.get("learnt_so_far"),
                achievements=s.get("achievements"),
                next_target=s.get("next_target")
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            student_map[user.email] = user

        # 3. Create connections, completed sessions and reviews
        # We will dynamically map each student to 2-3 accepted mentors and 1 completed session
        
        # Student 1: Ramu Prasad -> Bangalore (Cloud/DevOps)
        # Connect to: Raj Malhotra (Bangalore), Anirudh Sharma (Bangalore), Rohan Das (Bangalore)
        ramu = student_map["ramu@student.com"]
        raj = mentor_map["raj@mentor.com"]
        anirudh = mentor_map["anirudh@mentor.com"]
        rohan = mentor_map["rohan@mentor.com"]
        
        # Setup accepted requests
        for m_user, has_completed in [(raj, True), (anirudh, False), (rohan, False)]:
            req = ConnectionRequest(
                student_id=ramu.id,
                mentor_id=m_user.id,
                answer_1="I want to learn cloud architecture and CI/CD pipelines.",
                answer_2="I deployed a small node app to render and build a basic github action.",
                answer_3="I want help understanding Docker overlays and setting up terraform configurations.",
                status="accepted"
            )
            db.add(req)
            db.commit()
            db.refresh(req)
            
            conn = MentorshipConnection(
                student_id=ramu.id,
                mentor_id=m_user.id,
                created_from_request_id=req.id,
                status="active"
            )
            db.add(conn)
            db.commit()
            
            if has_completed:
                sess = SessionModel(
                    request_id=req.id,
                    student_id=ramu.id,
                    mentor_id=m_user.id,
                    scheduled_at=datetime.datetime.utcnow() - datetime.timedelta(days=5),
                    agenda="AWS scaling, Terraform scripting, Dockerizing microservices",
                    status="completed"
                )
                db.add(sess)
                db.commit()
                db.refresh(sess)
                
                rev = Review(
                    session_id=sess.id,
                    rating=5,
                    note="Raj is an absolute master of Cloud Engineering! He explained Kubernetes clustering and AWS security groups using visual analogies that clicked instantly. Helped me containerize my backend. Highly recommended!"
                )
                db.add(rev)
                db.commit()

        # Student 2: Ananya Reddy -> Hyderabad (AI/ML)
        # Connect to: Harsha Vardhan (Hyderabad), Karthik Rao (Hyderabad), Alok Mishra (Hyderabad)
        ananya = student_map["ananya@student.com"]
        harsha = mentor_map["harsha@mentor.com"]
        karthik = mentor_map["karthik@mentor.com"]
        alok = mentor_map["alok@mentor.com"]
        
        for m_user, has_completed in [(harsha, True), (karthik, False), (alok, False)]:
            req = ConnectionRequest(
                student_id=ananya.id,
                mentor_id=m_user.id,
                answer_1="I want to understand PyTorch and deep learning.",
                answer_2="Read a few research papers and took Andrew Ng's courses.",
                answer_3="Discuss neural network layers, weights, and gradient descent optimization.",
                status="accepted"
            )
            db.add(req)
            db.commit()
            db.refresh(req)
            
            conn = MentorshipConnection(
                student_id=ananya.id,
                mentor_id=m_user.id,
                created_from_request_id=req.id,
                status="active"
            )
            db.add(conn)
            db.commit()
            
            if has_completed:
                sess = SessionModel(
                    request_id=req.id,
                    student_id=ananya.id,
                    mentor_id=m_user.id,
                    scheduled_at=datetime.datetime.utcnow() - datetime.timedelta(days=3),
                    agenda="Introduction to PyTorch neural models and backpropagation mechanics",
                    status="completed"
                )
                db.add(sess)
                db.commit()
                db.refresh(sess)
                
                rev = Review(
                    session_id=sess.id,
                    rating=5,
                    note="Harsha helped me structure my first deep learning research paper. His grasp of PyTorch and neural networks is outstanding. We walked through gradient flow debugging line-by-line."
                )
                db.add(rev)
                db.commit()

        # Student 3: Vikram Sen -> Bangalore (Design)
        # Connect to: Sneha Iyer (Pune), Aditi Verma (Pune)
        vikram = student_map["vikram@student.com"]
        sneha = mentor_map["sneha@mentor.com"]
        aditi = mentor_map["aditi@mentor.com"]
        
        for m_user, has_completed in [(sneha, True), (aditi, False)]:
            req = ConnectionRequest(
                student_id=vikram.id,
                mentor_id=m_user.id,
                answer_1="I want to master design systems and Figma developer handoffs.",
                answer_2="I built a few personal websites and created wireframes in Figma.",
                answer_3="Review my portfolio wireframes and guide me on tokenized design variables.",
                status="accepted"
            )
            db.add(req)
            db.commit()
            db.refresh(req)
            
            conn = MentorshipConnection(
                student_id=vikram.id,
                mentor_id=m_user.id,
                created_from_request_id=req.id,
                status="active"
            )
            db.add(conn)
            db.commit()
            
            if has_completed:
                sess = SessionModel(
                    request_id=req.id,
                    student_id=vikram.id,
                    mentor_id=m_user.id,
                    scheduled_at=datetime.datetime.utcnow() - datetime.timedelta(days=7),
                    agenda="Portfolio wireframe review and layout alignment optimization",
                    status="completed"
                )
                db.add(sess)
                db.commit()
                db.refresh(sess)
                
                rev = Review(
                    session_id=sess.id,
                    rating=4,
                    note="Sneha provided extremely detailed feedback on my Figma design. She showed me how to structure reusable React components that match tokens. Great session!"
                )
                db.add(rev)
                db.commit()

        # Student 4: Divya Krishnan -> Chennai (Web Dev)
        # Connect to: Divya Nair (Chennai), Pranav Joshi (Chennai), Manoj Kumar (Chennai)
        divya_s = student_map["divya_student@student.com"]
        divya_m = mentor_map["divya@mentor.com"]
        pranav = mentor_map["pranav@mentor.com"]
        manoj = mentor_map["manoj@mentor.com"]
        
        for m_user, has_completed in [(divya_m, True), (pranav, False), (manoj, False)]:
            req = ConnectionRequest(
                student_id=divya_s.id,
                mentor_id=m_user.id,
                answer_1="I want to learn algorithms, data structures, and Go backend services.",
                answer_2="Completed basic Go tutorials and solved 50 LeetCode easy questions.",
                answer_3="Discuss dynamic programming strategies and Go channel patterns.",
                status="accepted"
            )
            db.add(req)
            db.commit()
            db.refresh(req)
            
            conn = MentorshipConnection(
                student_id=divya_s.id,
                mentor_id=m_user.id,
                created_from_request_id=req.id,
                status="active"
            )
            db.add(conn)
            db.commit()
            
            if has_completed:
                sess = SessionModel(
                    request_id=req.id,
                    student_id=divya_s.id,
                    mentor_id=m_user.id,
                    scheduled_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
                    agenda="FAANG Coding Interviews Prep and Dynamic Programming logic",
                    status="completed"
                )
                db.add(sess)
                db.commit()
                db.refresh(sess)
                
                rev = Review(
                    session_id=sess.id,
                    rating=5,
                    note="Divya is an incredible teacher! She demystified Dynamic Programming and memoization in under an hour. Her FAANG prep tips were extremely practical."
                )
                db.add(rev)
                db.commit()

        # Student 5: Kiran Rao -> Pune (Data Science)
        # Connect to: Kavita Sen (Pune), Sneha Iyer (Pune)
        kiran = student_map["kiran@student.com"]
        kavita = mentor_map["kavita@mentor.com"]
        sneha = mentor_map["sneha@mentor.com"]
        
        for m_user, has_completed in [(kavita, True), (sneha, False)]:
            req = ConnectionRequest(
                student_id=kiran.id,
                mentor_id=m_user.id,
                answer_1="I want to structure pandas clean datasets and review tech interview mock tests.",
                answer_2="Cleaned a couple of Kaggle datasets and ran basic sklearn classifiers.",
                answer_3="Discuss pipeline efficiency, query indexes, and mock interview checklists.",
                status="accepted"
            )
            db.add(req)
            db.commit()
            db.refresh(req)
            
            conn = MentorshipConnection(
                student_id=kiran.id,
                mentor_id=m_user.id,
                created_from_request_id=req.id,
                status="active"
            )
            db.add(conn)
            db.commit()
            
            if has_completed:
                sess = SessionModel(
                    request_id=req.id,
                    student_id=kiran.id,
                    mentor_id=m_user.id,
                    scheduled_at=datetime.datetime.utcnow() - datetime.timedelta(days=4),
                    agenda="Pandas data pipelines and resume revision strategy session",
                    status="completed"
                )
                db.add(sess)
                db.commit()
                db.refresh(sess)
                
                rev = Review(
                    session_id=sess.id,
                    rating=5,
                    note="Kavita ran a mock interview with me that mirrored a real tech round perfectly. Her advice on pandas query optimizations and portfolio presentation was gold."
                )
                db.add(rev)
                db.commit()

        print("Database seeded successfully with 15 mentors, 5 students, and active connections + reviews!")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
