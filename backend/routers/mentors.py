from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
import datetime
import logging

from ..database import get_db
from ..models import User, MentorProfile, Review, Session as SessionModel, MentorshipConnection
from ..schemas import MentorProfileCreate, MentorProfileUpdate, MentorProfileRead, MatchRequest, MatchResult, ReviewCreate
from ..auth import get_current_user
from ..services.match import run_ai_match, generate_chat_reply

router = APIRouter(prefix="/mentors", tags=["Mentors"])


# ─────────────────────────────────────────────
# CREATE OR UPDATE authenticated mentor profile
# ─────────────────────────────────────────────
@router.put("/me", response_model=MentorProfileRead)
def upsert_mentor_profile(
    payload: MentorProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "mentor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentor accounts can manage a mentor profile.",
        )

    profile = db.query(MentorProfile).filter(
        MentorProfile.user_id == current_user.id
    ).first()

    if profile:
        # Update existing profile fields
        profile.domains = payload.domains
        profile.bio = payload.bio
        profile.max_sessions_per_month = payload.max_sessions_per_month
        profile.what_ill_discuss = payload.what_ill_discuss
        profile.availability_state = payload.availability_state
    else:
        # Create a brand-new profile
        profile = MentorProfile(
            user_id=current_user.id,
            domains=payload.domains,
            bio=payload.bio,
            max_sessions_per_month=payload.max_sessions_per_month,
            what_ill_discuss=payload.what_ill_discuss,
            availability_state=payload.availability_state,
        )
        db.add(profile)

    db.commit()
    db.refresh(profile)
    return profile


# ─────────────────────────────────────────────
# GET authenticated mentor's own profile
# ─────────────────────────────────────────────
@router.get("/me", response_model=MentorProfileRead)
def get_my_mentor_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "mentor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentor accounts have a mentor profile.",
        )

    profile = db.query(MentorProfile).filter(
        MentorProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor profile not found. Please create one first.",
        )

    return profile


# ─────────────────────────────────────────────
# LIST / SEARCH all mentors (public endpoint)
# ─────────────────────────────────────────────
@router.get("", response_model=list[MentorProfileRead])
def list_mentors(
    city: Optional[str] = Query(None, description="Filter by city"),
    domain: Optional[str] = Query(None, description="Filter by domain keyword"),
    search: Optional[str] = Query(None, description="Text search across name and bio"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    query = db.query(MentorProfile).join(MentorProfile.user)

    # City filter (exact match, case-insensitive)
    if city:
        query = query.filter(User.city.ilike(f"%{city}%"))

    # Domain filter — handled in Python list filtering below for safe cross-DB compatibility

    profiles = query.all()

    # Domain filter in Python (safe fallback that works on both SQLite & PG)
    if domain:
        profiles = [
            p for p in profiles
            if any(domain.lower() in d.lower() for d in (p.domains or []))
        ]

    # Text search across mentor name and bio
    if search:
        search_lower = search.lower()
        profiles = [
            p for p in profiles
            if search_lower in (p.user.name or "").lower()
            or search_lower in (p.bio or "").lower()
        ]

    # ── Locality boost ──────────────────────────────────────────────────
    # If there's a logged-in user, sort mentors from the same city first.
    # We use a stable sort: local mentors first, then by session_count desc.
    if current_user:
        student_city = (current_user.city or "").lower().strip()
        profiles.sort(
            key=lambda p: (
                0 if (p.user.city or "").lower().strip() == student_city else 1,
                -p.session_count,
            )
        )
    else:
        profiles.sort(key=lambda p: -p.session_count)

    return profiles


# ─────────────────────────────────────────────
# GET single mentor match score
# ─────────────────────────────────────────────
@router.get("/match-score")
def get_mentor_match_score(
    mentor_id: int,
    student_goal: str = Query(..., min_length=5),
    provider: str = "anthropic",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Fetch the target mentor profile
    mp = db.query(MentorProfile).filter(MentorProfile.user_id == mentor_id).first()
    if not mp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No mentor profile found for user_id={mentor_id}."
        )

    # Format single mentor
    mentors_list = [{
        "id": mp.id,
        "user_id": mp.user_id,
        "domains": mp.domains,
        "bio": mp.bio,
        "max_sessions_per_month": mp.max_sessions_per_month,
        "what_ill_discuss": mp.what_ill_discuss,
        "avg_rating": mp.avg_rating,
        "session_count": mp.session_count,
        "user": {
            "id": mp.user.id,
            "name": mp.user.name,
            "email": mp.user.email,
            "role": mp.user.role,
            "city": mp.user.city,
            "created_at": mp.user.created_at
        }
    }]

    # Run matching service
    matches = run_ai_match(
        student_goals=student_goal,
        student_city=current_user.city,
        mentors=mentors_list,
        provider=provider
    )

    if not matches:
        return {"score": 0, "reason": "No match calculated."}

    return {
        "score": matches[0].score,
        "reason": matches[0].reason
    }


# ─────────────────────────────────────────────
# GET a single mentor profile by user_id
# ─────────────────────────────────────────────
@router.get("/{user_id}", response_model=MentorProfileRead)
def get_mentor_by_user_id(
    user_id: int,
    db: Session = Depends(get_db),
):
    profile = db.query(MentorProfile).filter(
        MentorProfile.user_id == user_id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No mentor profile found for user_id={user_id}.",
        )

    # Compute accepted requests count
    from ..models import ConnectionRequest, Session as SessionModel
    accepted_requests_count = db.query(ConnectionRequest).filter(
        ConnectionRequest.mentor_id == user_id,
        ConnectionRequest.status == "accepted"
    ).count()

    # Fetch completed sessions with reviews for this mentor
    sessions_with_reviews = db.query(SessionModel).filter(
        SessionModel.mentor_id == user_id,
        SessionModel.status == "completed"
    ).all()

    reviews_list = []
    for s in sessions_with_reviews:
        if s.review:
            reviews_list.append({
                "id": s.review.id,
                "session_id": s.review.session_id,
                "rating": s.review.rating,
                "note": s.review.note,
                "student_name": s.student.name if s.student else "Anonymous Student",
                "created_at": s.review.created_at
            })

    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "domains": profile.domains,
        "bio": profile.bio,
        "max_sessions_per_month": profile.max_sessions_per_month,
        "what_ill_discuss": profile.what_ill_discuss,
        "availability_state": profile.availability_state,
        "avg_rating": profile.avg_rating,
        "session_count": profile.session_count,
        "user": profile.user,
        "accepted_requests_count": accepted_requests_count,
        "reviews": reviews_list
    }


# ─────────────────────────────────────────────
# POST AI matching recommendations
# ─────────────────────────────────────────────
@router.post("/match", response_model=list[MatchResult])
def match_mentors(
    payload: MatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Fetch all mentors who have set up their profiles
    mentor_profiles = db.query(MentorProfile).all()
    if not mentor_profiles:
        return []

    # Format SQLAlchemy model instances into dictionary representations for the matching service
    mentors_list = []
    for mp in mentor_profiles:
        # Avoid matching the user with themselves if they are registered as a mentor
        if mp.user_id == current_user.id:
            continue
            
        mentors_list.append({
            "id": mp.id,
            "user_id": mp.user_id,
            "domains": mp.domains,
            "bio": mp.bio,
            "max_sessions_per_month": mp.max_sessions_per_month,
            "what_ill_discuss": mp.what_ill_discuss,
            "avg_rating": mp.avg_rating,
            "session_count": mp.session_count,
            "user": {
                "id": mp.user.id,
                "name": mp.user.name,
                "email": mp.user.email,
                "role": mp.user.role,
                "city": mp.user.city,
                "created_at": mp.user.created_at
            }
        })

    # Call LLM wrapper function
    matches = run_ai_match(
        student_goals=payload.student_goal,
        student_city=current_user.city,
        mentors=mentors_list,
        provider=payload.provider
    )

    # Filter out matches below 60% relevance to ensure accurate results
    filtered_matches = [m for m in matches if m["score"] >= 60]
    return filtered_matches


class ChatReplyRequest(BaseModel):
    mentor_id: int
    student_message: str


@router.post("/chat-reply")
def get_chat_reply(
    payload: ChatReplyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates a simulated, context-aware AI chat reply from the selected mentor.
    """
    mp = db.query(MentorProfile).filter(MentorProfile.user_id == payload.mentor_id).first()
    if not mp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentor profile not found")
        
    reply_text = generate_chat_reply(
        mentor_name=mp.user.name,
        mentor_bio=mp.bio or "",
        mentor_domains=mp.domains or [],
        student_name=current_user.name,
        student_city=current_user.city,
        student_message=payload.student_message
    )
    return {"reply": reply_text}


@router.post("/{mentor_id}/reviews", status_code=status.HTTP_201_CREATED)
def submit_mentor_review(
    mentor_id: int,
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits a rating and review for a mentor, auto-generating a completed session coordinate.
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only student accounts can leave reviews."
        )

    # 1. Enforce active connection exists
    connection = db.query(MentorshipConnection).filter(
        MentorshipConnection.student_id == current_user.id,
        MentorshipConnection.mentor_id == mentor_id
    ).first()
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must have an active connection with this mentor to leave a review."
        )

    # 2. Auto-generate completed session coordinates
    session = SessionModel(
        request_id=connection.created_from_request_id,
        student_id=current_user.id,
        mentor_id=mentor_id,
        scheduled_at=datetime.datetime.utcnow(),
        agenda="Completed Mentorship Review Session",
        status="completed"
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # 3. Create review record
    review = Review(
        session_id=session.id,
        rating=payload.rating,
        note=payload.note
    )
    db.add(review)

    # 4. Update mentor statistics
    profile = db.query(MentorProfile).filter(MentorProfile.user_id == mentor_id).first()
    if profile:
        mentor_sessions = db.query(SessionModel).filter(
            SessionModel.mentor_id == mentor_id,
            SessionModel.status == "completed"
        ).all()
        ratings = [s.review.rating for s in mentor_sessions if s.review]
        if payload.rating not in ratings or len(ratings) == 0:
            ratings.append(payload.rating)
        profile.avg_rating = sum(ratings) / len(ratings)
        profile.session_count = profile.session_count + 1

    db.commit()
    return {"message": "Review submitted successfully"}

