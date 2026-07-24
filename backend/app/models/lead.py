from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(30), nullable=True)
    company = Column(String(150), nullable=True)

    message = Column(Text, nullable=True)

    status = Column(
        String(30),
        nullable=False,
        default="new",
        index=True
    )

    assigned_to_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    assigned_to = relationship("User")
    notes = relationship(
        "Note",
        back_populates="lead",
        cascade="all, delete-orphan"
    )

    activities = relationship(
        "Activity",
        back_populates="lead",
        cascade="all, delete-orphan"
    )