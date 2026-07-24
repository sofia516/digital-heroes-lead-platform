from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class LeadCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    message: Optional[str] = None


class LeadUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to_id: Optional[int] = None


class LeadResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str]
    company: Optional[str]
    message: Optional[str]
    status: str
    assigned_to_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LeadListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[LeadResponse]