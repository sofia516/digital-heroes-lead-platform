import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.core.security import hash_password
from app.models.user import User


TEST_DATABASE_URL = "sqlite://"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def override_get_db():
    db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()

    admin = User(
        name="Test Admin",
        email="admin@test.com",
        hashed_password=hash_password("Admin@123"),
        role="admin",
        is_active=True,
    )

    member = User(
        name="Test Member",
        email="member@test.com",
        hashed_password=hash_password("Member@123"),
        role="member",
        is_active=True,
    )

    db.add_all([admin, member])
    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=engine)


def login(email, password):
    response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert response.status_code == 200

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}"
    }


# ---------------------------------------------------------
# AUTH TEST
# ---------------------------------------------------------

def test_protected_leads_requires_authentication():
    response = client.get("/api/leads")

    assert response.status_code in (401, 403)


# ---------------------------------------------------------
# CORE FLOW 1:
# Public visitor creates lead
# ---------------------------------------------------------

def test_public_can_create_lead():
    response = client.post(
        "/api/leads",
        json={
            "name": "Aarav Sharma",
            "email": "aarav@example.com",
            "phone": "9876543210",
            "company": "Nova Technologies",
            "message": "Interested in a demo.",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Aarav Sharma"
    assert data["status"] == "new"
    assert data["assigned_to_id"] is None


# ---------------------------------------------------------
# CORE FLOW 2:
# Admin assigns lead to member
# ---------------------------------------------------------

def test_admin_can_assign_lead():
    create_response = client.post(
        "/api/leads",
        json={
            "name": "Test Lead",
            "email": "lead@example.com",
        },
    )

    lead_id = create_response.json()["id"]

    db = TestingSessionLocal()

    member = db.query(User).filter(
        User.email == "member@test.com"
    ).first()

    member_id = member.id

    db.close()

    headers = login(
        "admin@test.com",
        "Admin@123"
    )

    response = client.patch(
        f"/api/leads/{lead_id}",
        json={
            "assigned_to_id": member_id
        },
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json()["assigned_to_id"] == member_id


# ---------------------------------------------------------
# AUTHORIZATION RULE:
# Member cannot assign leads
# ---------------------------------------------------------

def test_member_cannot_assign_lead():
    create_response = client.post(
        "/api/leads",
        json={
            "name": "Permission Test",
            "email": "permission@example.com",
        },
    )

    lead_id = create_response.json()["id"]

    db = TestingSessionLocal()

    member = db.query(User).filter(
        User.email == "member@test.com"
    ).first()

    member_id = member.id

    lead = db.query(
        __import__(
            "app.models.lead",
            fromlist=["Lead"]
        ).Lead
    ).filter_by(id=lead_id).first()

    lead.assigned_to_id = member_id

    db.commit()
    db.close()

    headers = login(
        "member@test.com",
        "Member@123"
    )

    response = client.patch(
        f"/api/leads/{lead_id}",
        json={
            "assigned_to_id": member_id
        },
        headers=headers,
    )

    assert response.status_code == 403


# ---------------------------------------------------------
# CORE FLOW 3:
# Assigned member updates status and adds note
# ---------------------------------------------------------

def test_member_can_manage_assigned_lead():
    create_response = client.post(
        "/api/leads",
        json={
            "name": "Sales Prospect",
            "email": "sales@example.com",
        },
    )

    lead_id = create_response.json()["id"]

    db = TestingSessionLocal()

    member = db.query(User).filter(
        User.email == "member@test.com"
    ).first()

    member_id = member.id

    from app.models.lead import Lead

    lead = db.query(Lead).filter(
        Lead.id == lead_id
    ).first()

    lead.assigned_to_id = member_id

    db.commit()
    db.close()

    headers = login(
        "member@test.com",
        "Member@123"
    )

    status_response = client.patch(
        f"/api/leads/{lead_id}",
        json={
            "status": "contacted"
        },
        headers=headers,
    )

    assert status_response.status_code == 200
    assert status_response.json()["status"] == "contacted"

    note_response = client.post(
        f"/api/leads/{lead_id}/notes",
        json={
            "content": "Prospect requested a demo."
        },
        headers=headers,
    )

    assert note_response.status_code == 201
    assert note_response.json()["content"] == (
        "Prospect requested a demo."
    )

    activity_response = client.get(
        f"/api/leads/{lead_id}/activities",
        headers=headers,
    )

    assert activity_response.status_code == 200

    actions = [
        activity["action"]
        for activity in activity_response.json()
    ]

    assert "lead_created" in actions
    assert "status_changed" in actions
    assert "note_added" in actions