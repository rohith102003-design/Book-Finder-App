import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.book import BookResponse


class FavoriteCreate(BaseModel):
    openlibrary_work_id: str = Field(..., min_length=1, max_length=50, description="OpenLibrary Work ID")
    title: str = Field(..., min_length=1, max_length=500)
    authors: List[str] = Field(default_factory=list)
    cover_url: Optional[str] = None
    first_publish_year: Optional[int] = None
    description: Optional[str] = None
    edition_count: int = Field(default=1, ge=1)
    subjects: List[str] = Field(default_factory=list)


class FavoriteResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    book_id: uuid.UUID
    book: BookResponse
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FavoriteListResponse(BaseModel):
    items: List[FavoriteResponse]
    total: int
