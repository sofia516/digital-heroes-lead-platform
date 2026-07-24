from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.activity import Activity
from app.models.lead import Lead
from app.models.user import User
from app.schemas.lead import (
    LeadCreate,
    LeadListResponse,
    LeadResponse,
    LeadUpdate,
)
from app.core.dependencies import get_current_user
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteResponse
from app.schemas.activity import ActivityResponse


router = APIRouter(
    prefix="/api/leads",
    tags=["Leads"]
)


VALID_STATUSES = {
    "new",
    "contacted",
    "qualified",
    "won",
    "lost"
}


# ============================================================
# CREATE LEAD - PUBLIC
# ============================================================

@router.post(
    "",
    response_model=LeadResponse,
    status_code=status.HTTP_201_CREATED
)
def create_lead(
    data: LeadCreate,
    db: Session = Depends(get_db)
):
    lead = Lead(
        name=data.name,
        email=data.email,
        phone=data.phone,
        company=data.company,
        message=data.message,
        status="new"
    )

    db.add(lead)
    db.flush()

    # Record lead creation in activity trail
    activity = Activity(
        lead_id=lead.id,
        user_id=None,
        action="lead_created",
        details="Lead submitted through public capture form"
    )

    db.add(activity)

    db.commit()
    db.refresh(lead)

    return lead


# ============================================================
# LIST LEADS - AUTHENTICATED
# ============================================================

@router.get(
    "",
    response_model=LeadListResponse
)
def list_leads(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    lead_status: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Lead)

    # Members can only see leads assigned to them
    if current_user.role == "member":
        query = query.filter(
            Lead.assigned_to_id == current_user.id
        )

    # Filter by lead status
    if lead_status:

        if lead_status not in VALID_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid lead status"
            )

        query = query.filter(
            Lead.status == lead_status
        )

    # Search by name, email or company
    if search:
        pattern = f"%{search}%"

        query = query.filter(
            Lead.name.ilike(pattern)
            | Lead.email.ilike(pattern)
            | Lead.company.ilike(pattern)
        )

    total = query.count()

    leads = (
        query
        .order_by(Lead.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": leads
    }


# ============================================================
# GET SINGLE LEAD - AUTHENTICATED
# ============================================================

@router.get(
    "/{lead_id}",
    response_model=LeadResponse
)
def get_lead(
    lead_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id
    ).first()

    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )

    # Members can only access their assigned leads
    if (
        current_user.role == "member"
        and lead.assigned_to_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this lead"
        )

    return lead


# ============================================================
# UPDATE LEAD - AUTHENTICATED
# ============================================================

@router.patch(
    "/{lead_id}",
    response_model=LeadResponse
)
def update_lead(
    lead_id: int,
    data: LeadUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id
    ).first()

    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )

    # Members can only update their assigned leads
    if (
        current_user.role == "member"
        and lead.assigned_to_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this lead"
        )

    # --------------------------------------------------------
    # STATUS CHANGE
    # --------------------------------------------------------

    if data.status is not None:

        if data.status not in VALID_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid lead status"
            )

        old_status = lead.status

        if old_status != data.status:
            lead.status = data.status

            activity = Activity(
                lead_id=lead.id,
                user_id=current_user.id,
                action="status_changed",
                details=f"{old_status} -> {data.status}"
            )

            db.add(activity)

    # --------------------------------------------------------
    # LEAD ASSIGNMENT - ADMIN ONLY
    # --------------------------------------------------------

    if data.assigned_to_id is not None:

        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can assign leads"
            )

        member = db.query(User).filter(
            User.id == data.assigned_to_id,
            User.role == "member",
            User.is_active.is_(True)
        ).first()

        if not member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assigned user must be an active member"
            )

        old_assignee = lead.assigned_to_id

        lead.assigned_to_id = member.id

        if old_assignee != member.id:

            activity = Activity(
                lead_id=lead.id,
                user_id=current_user.id,
                action="lead_assigned",
                details=f"Assigned to user {member.id}"
            )

            db.add(activity)

    db.commit()
    db.refresh(lead)

    return lead

    # ============================================================
# ADD NOTE TO LEAD
# ============================================================

@router.post(
    "/{lead_id}/notes",
    response_model=NoteResponse,
    status_code=status.HTTP_201_CREATED
)
def add_note(
    lead_id: int,
    data: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id
    ).first()

    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )

    if (
        current_user.role == "member"
        and lead.assigned_to_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to add notes to this lead"
        )

    if not data.content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Note cannot be empty"
        )

    note = Note(
        lead_id=lead.id,
        author_id=current_user.id,
        content=data.content.strip()
    )

    db.add(note)
    db.flush()

    activity = Activity(
        lead_id=lead.id,
        user_id=current_user.id,
        action="note_added",
        details="A note was added to the lead"
    )

    db.add(activity)

    db.commit()
    db.refresh(note)

    return note


# ============================================================
# GET LEAD NOTES
# ============================================================

@router.get(
    "/{lead_id}/notes",
    response_model=list[NoteResponse]
)
def get_notes(
    lead_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id
    ).first()

    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )

    if (
        current_user.role == "member"
        and lead.assigned_to_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view these notes"
        )

    return (
        db.query(Note)
        .filter(Note.lead_id == lead.id)
        .order_by(Note.created_at.desc())
        .all()
    )


# ============================================================
# GET ACTIVITY TRAIL
# ============================================================

@router.get(
    "/{lead_id}/activities",
    response_model=list[ActivityResponse]
)
def get_activities(
    lead_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lead = db.query(Lead).filter(
        Lead.id == lead_id
    ).first()

    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )

    if (
        current_user.role == "member"
        and lead.assigned_to_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this activity trail"
        )

    return (
        db.query(Activity)
        .filter(Activity.lead_id == lead.id)
        .order_by(Activity.created_at.desc())
        .all()
    )