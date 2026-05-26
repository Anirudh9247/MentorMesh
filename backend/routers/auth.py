from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import UserRegister, UserLogin, Token, UserRead
from ..auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """
    Registers a new student or mentor.
    Verifies that the email is unique, hashes the password, and commits the user to the database.
    """
    # Check if email is already taken
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    # Validate role value
    role_lower = user_in.role.lower()
    if role_lower not in ["student", "mentor"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be either 'student' or 'mentor'."
        )

    # Create new user record
    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hashed_password,
        role=role_lower,
        city=user_in.city
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates a user with email and password,
    returning a signed JWT token on success.
    """
    # Fetch user by email
    user = db.query(User).filter(User.email == login_in.email).first()
    
    # Check if user exists and verify password
    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create JWT token incorporating email (sub) and role (role)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}
    )

    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the currently authenticated user's details.
    """
    return current_user

