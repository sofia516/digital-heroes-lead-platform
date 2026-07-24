from app.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password


def create_admin():
    db = SessionLocal()

    try:
        email = "admin@leadflow.com"

        existing = db.query(User).filter(
            User.email == email
        ).first()

        if existing:
            print("Admin already exists.")
            return

        admin = User(
            name="LeadFlow Admin",
            email=email,
            hashed_password=hash_password("Admin@123"),
            role="admin",
            is_active=True
        )

        db.add(admin)
        db.commit()

        print("Admin created successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()