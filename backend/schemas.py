from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

# ==========================================
# AUTHENTICATION & USER SCHEMAS
# ==========================================

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., description="User's email address")
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    role: str = Field(..., description="Must be either 'student' or 'mentor'")
    city: str = Field(..., min_length=2, max_length=100, description="City for physical location matching")

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


class UserRead(BaseModel):
    id: int
    name: str
    email: str
    role: str
    city: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# MENTOR PROFILE SCHEMAS
# ==========================================

class MentorProfileBase(BaseModel):
    domains: List[str] = Field(default=[], description="List of expert domains, e.g. ['AI/ML', 'Web Dev']")
    bio: Optional[str] = Field(None, description="Short bio about the mentor's experience")
    max_sessions_per_month: int = Field(default=4, ge=1, le=20)
    what_ill_discuss: Optional[str] = Field(None, description="What the mentor is open to discuss")

class MentorProfileCreate(MentorProfileBase):
    pass

class MentorProfileUpdate(BaseModel):
    domains: Optional[List[str]] = None
    bio: Optional[str] = None
    max_sessions_per_month: Optional[int] = Field(None, ge=1, le=20)
    what_ill_discuss: Optional[str] = None

class MentorProfileRead(MentorProfileBase):
    id: int
    user_id: int
    avg_rating: float
    session_count: int
    user: UserRead

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# CONNECTION REQUEST SCHEMAS
# ==========================================

class ConnectionRequestCreate(BaseModel):
    mentor_id: int
    answer_1: str = Field(..., description="What specifically do you want to learn or achieve?")
    answer_2: str = Field(..., description="What have you already tried or explored on your own?")
    answer_3: str = Field(..., description="What is your concrete ask for the first session?")

class ConnectionRequestUpdate(BaseModel):
    status: str = Field(..., description="Must be either 'accepted' or 'declined'")

class ConnectionRequestRead(BaseModel):
    id: int
    student_id: int
    mentor_id: int
    answer_1: str
    answer_2: str
    answer_3: str
    status: str
    created_at: datetime
    student: UserRead
    mentor: UserRead

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SESSION SCHEMAS
# ==========================================

class SessionCreate(BaseModel):
    request_id: int
    scheduled_at: datetime
    agenda: str

class SessionRead(BaseModel):
    id: int
    request_id: int
    student_id: int
    mentor_id: int
    scheduled_at: datetime
    agenda: str
    status: str
    student: UserRead
    mentor: UserRead

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# REVIEW SCHEMAS
# ==========================================

class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    note: Optional[str] = Field(None, description="Optional written review text")

class ReviewRead(BaseModel):
    id: int
    session_id: int
    rating: int
    note: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
