import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class NotificationResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    notification_type: str
    title: str
    message: str
    related_user_id: Optional[uuid.UUID] = None
    related_username: Optional[str] = None
    related_review_id: Optional[uuid.UUID] = None
    is_read: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationListResponse(BaseModel):
    items: List[NotificationResponse] = Field(default_factory=list)
    unread_count: int = 0
