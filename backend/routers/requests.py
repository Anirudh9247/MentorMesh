from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import User, ConnectionRequest, MentorshipConnection, RequestStatus, ConnectionStatus
from ..schemas import ConnectionRequestCreate, ConnectionRequestUpdate, ConnectionRequestRead
from ..auth import get_current_user

router = APIRouter(prefix="/requests", tags=["Requests"])

# ─────────────────────────────────────────────
# POST /requests: Create a connection request
# ─────────────────────────────────────────────
@router.post("", status_code=status.HTTP_201_CREATED)
def create_connection_request(
    payload: ConnectionRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Enforce student role for creating requests
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only student accounts can create connection requests."
        )

    # 2. Enforce target mentor exists and has mentor role
    target_mentor = db.query(User).filter(User.id == payload.mentor_id).first()
    if not target_mentor or target_mentor.role != "mentor":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target mentor not found or user is not a mentor."
        )

    # 3. Prevent self-requests (safety fallback)
    if current_user.id == payload.mentor_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot send a connection request to yourself."
        )

    # 4. Enforce duplication prevention: check connection table
    existing_connection = db.query(MentorshipConnection).filter(
        MentorshipConnection.student_id == current_user.id,
        MentorshipConnection.mentor_id == payload.mentor_id
    ).first()
    if existing_connection:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active mentorship connection with this mentor."
        )

    # 5. Enforce duplication prevention: check pending or accepted requests
    existing_request = db.query(ConnectionRequest).filter(
        ConnectionRequest.student_id == current_user.id,
        ConnectionRequest.mentor_id == payload.mentor_id,
        ConnectionRequest.status.in_([RequestStatus.PENDING.value, RequestStatus.ACCEPTED.value])
    ).first()
    if existing_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A connection request is already {existing_request.status} with this mentor."
        )

    # 6. Create request
    new_request = ConnectionRequest(
        student_id=current_user.id,
        mentor_id=payload.mentor_id,
        answer_1=payload.answer_1.strip(),
        answer_2=payload.answer_2.strip(),
        answer_3=payload.answer_3.strip(),
        status=RequestStatus.PENDING.value
    )
    db.add(new_request)
    db.commit()

    return {
        "message": "Request sent successfully",
        "status": RequestStatus.PENDING.value
    }

# ─────────────────────────────────────────────
# GET /requests/sent: View sent requests
# ─────────────────────────────────────────────
@router.get("/sent", response_model=List[ConnectionRequestRead])
def get_sent_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only student accounts can access sent requests."
        )

    return db.query(ConnectionRequest).filter(
        ConnectionRequest.student_id == current_user.id
    ).order_by(ConnectionRequest.created_at.desc()).all()

# ─────────────────────────────────────────────
# GET /requests/received: View received requests
# ─────────────────────────────────────────────
@router.get("/received", response_model=List[ConnectionRequestRead])
def get_received_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "mentor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentor accounts can access received requests."
        )

    return db.query(ConnectionRequest).filter(
        ConnectionRequest.mentor_id == current_user.id
    ).order_by(ConnectionRequest.created_at.desc()).all()

# ─────────────────────────────────────────────
# PATCH /requests/{id}: Respond to request
# ─────────────────────────────────────────────
@router.patch("/{id}", response_model=ConnectionRequestRead)
def update_request_status(
    id: int,
    payload: ConnectionRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Enforce mentor role for responding
    if current_user.role != "mentor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentor accounts can update connection requests."
        )

    # 2. Fetch the request
    req = db.query(ConnectionRequest).filter(ConnectionRequest.id == id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection request not found."
        )

    # 3. Ownership validation: request's mentor must match current user
    if req.mentor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this connection request."
        )

    # 4. Check if request has already been processed
    if req.status != RequestStatus.PENDING.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This request has already been processed (status: {req.status})."
        )

    # 5. Enforce accepted/declined status
    if payload.status not in [RequestStatus.ACCEPTED, RequestStatus.DECLINED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be 'accepted' or 'declined'."
        )

    # 6. Apply status update
    req.status = payload.status.value

    # 7. Auto-create relationship connection if accepted
    if payload.status == RequestStatus.ACCEPTED:
        # Check if relation already exists just in case
        existing_conn = db.query(MentorshipConnection).filter(
            MentorshipConnection.student_id == req.student_id,
            MentorshipConnection.mentor_id == req.mentor_id
        ).first()
        if not existing_conn:
            connection = MentorshipConnection(
                student_id=req.student_id,
                mentor_id=req.mentor_id,
                created_from_request_id=req.id,
                status=ConnectionStatus.ACTIVE.value
            )
            db.add(connection)

    db.commit()
    db.refresh(req)
    return req
