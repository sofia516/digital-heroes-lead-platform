from app.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password


def create_demo_users():
    db = SessionLocal()

    try:
        users = [
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

        for data in users:
            existing_user = (
                db.query(User)
                .filter(User.email == data["email"])
                .first()
            )

            if existing_user:
                print(f"{data['email']} already exists")
                continue

            user = User(
                name=data["name"],
                email=data["email"],
                hashed_password=hash_password(data["password"]),
                role=data["role"],
                is_active=True,
            )

            db.add(user)
            print(f"Created {data['role']}: {data['email']}")

        db.commit()

        print("Demo users ready.")

    except Exception as exc:
        db.rollback()
        print(f"Error: {exc}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    create_demo_users()