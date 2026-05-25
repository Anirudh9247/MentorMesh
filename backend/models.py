import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.mutable import MutableList
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, index=True)  # 'student' or 'mentor'
    city = Column(String, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    # A user can have one mentor profile (if they are a mentor)
    mentor_profile = relationship("MentorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    # Connection requests sent by this user (as student)
    sent_requests = relationship(
        "ConnectionRequest",
        foreign_keys="ConnectionRequest.student_id",
        back_populates="student",
        cascade="all, delete-orphan"
    )
    
    # Connection requests received by this user (as mentor)
    received_requests = relationship(
        "ConnectionRequest",
        foreign_keys="ConnectionRequest.mentor_id",
        back_populates="mentor",
        cascade="all, delete-orphan"
    )
    
    # Sessions this user has as a student
    student_sessions = relationship(
        "Session",
        foreign_keys="Session.student_id",
        back_populates="student",
        cascade="all, delete-orphan"
    )
    
    # Sessions this user has as a mentor
    mentor_sessions = relationship(
        "Session",
        foreign_keys="Session.mentor_id",
        back_populates="mentor",
        cascade="all, delete-orphan"
    )


class MentorProfile(Base):
    __tablename__ = "mentor_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    domains = Column(MutableList.as_mutable(JSON), nullable=False, default=list)  # JSON array of strings, e.g., ["Web Development", "AI/ML"]
    bio = Column(String, nullable=True)
    max_sessions_per_month = Column(Integer, default=4, nullable=False)
    what_ill_discuss = Column(String, nullable=True)
    avg_rating = Column(Float, default=0.0, nullable=False)
    session_count = Column(Integer, default=0, nullable=False)

    # Relationships
    user = relationship("User", back_populates="mentor_profile")


class ConnectionRequest(Base):
    __tablename__ = "connection_requests"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    mentor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    answer_1 = Column(String, nullable=False)  # What specifically do you want to learn or achieve?
    answer_2 = Column(String, nullable=False)  # What have you already tried or explored on your own?
    answer_3 = Column(String, nullable=False)  # What is your concrete ask for the first session?
    status = Column(String, default="pending", nullable=False)  # pending, accepted, declined
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    student = relationship("User", foreign_keys=[student_id], back_populates="sent_requests")
    mentor = relationship("User", foreign_keys=[mentor_id], back_populates="received_requests")
    session = relationship("Session", back_populates="connection_request", uselist=False, cascade="all, delete-orphan")


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("connection_requests.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    mentor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scheduled_at = Column(DateTime, nullable=False)
    agenda = Column(String, nullable=False)
    status = Column(String, default="upcoming", nullable=False)  # upcoming, completed

    # Relationships
    connection_request = relationship("ConnectionRequest", back_populates="session")
    student = relationship("User", foreign_keys=[student_id], back_populates="student_sessions")
    mentor = relationship("User", foreign_keys=[mentor_id], back_populates="mentor_sessions")
    review = relationship("Review", back_populates="session", uselist=False, cascade="all, delete-orphan")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1 to 5
    note = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    session = relationship("Session", back_populates="review")
