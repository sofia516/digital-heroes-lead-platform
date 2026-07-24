from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.core.dependencies import require_admin


router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


@router.get(
    "/members",
    response_model=list[UserResponse]
)
def list_members(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    return (
        db.query(User)
        .filter(
            User.role == "member",
            User.is_active.is_(True)
        )
        .order_by(User.name.asc())
        .all()
    )