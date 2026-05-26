from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models import User, MentorProfile
from ..schemas import MentorProfileCreate, MentorProfileUpdate, MentorProfileRead, MatchRequest, MatchResult
from ..auth import get_current_user
from ..services.match import run_ai_match

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
    else:
        # Create a brand-new profile
        profile = MentorProfile(
            user_id=current_user.id,
            domains=payload.domains,
            bio=payload.bio,
            max_sessions_per_month=payload.max_sessions_per_month,
            what_ill_discuss=payload.what_ill_discuss,
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

    return profile


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

    return matches

