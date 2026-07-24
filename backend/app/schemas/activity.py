from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ActivityResponse(BaseModel):
    id: int
    lead_id: int
    user_id: Optional[int]
    action: str
    details: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)