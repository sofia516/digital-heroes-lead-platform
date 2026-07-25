import os

from fastapi import APIRouter, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password


router = APIRouter(
    prefix="/api/seed",
    tags=["Seed"],
)


@router.post("/demo-users")
def seed_demo_users(
    x_seed_key: str = Header(...)
):
    expected_key = os.getenv("SEED_KEY")

    if not expected_key or x_seed_key != expected_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid seed key",
        )

    db: Session = SessionLocal()

    try:
        demo_users = [
            {
                "name": "LeadFlow Admin",
                "email": "admin@leadflow.com",
                "password": "Admin@123",
                "role": "admin",
            },
            {
                "name": "Demo Sales Member",
                "email": "member@leadflow.com",
                "password": "Member@123",
                "role": "member",
            },
        ]

        created = []
        existing = []

        for data in demo_users:
            user = (
                db.query(User)
                .filter(User.email == data["email"])
                .first()
            )

            if user:
                existing.append(data["email"])
                continue

            user = User(
                name=data["name"],
                email=data["email"],
                hashed_password=hash_password(
                    data["password"]
                ),
                role=data["role"],
                is_active=True,
            )

            db.add(user)
            created.append(data["email"])

        db.commit()

        return {
            "message": "Demo users ready",
            "created": created,
            "already_existing": existing,
        }

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()