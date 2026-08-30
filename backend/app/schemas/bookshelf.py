import uuid
from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.book import BookResponse


class ReadingStatus(str, Enum):
    WANT_TO_READ = "WANT_TO_READ"
    READING = "READING"
    COMPLETED = "COMPLETED"


class BookshelfItemCreate(BaseModel):
    openlibrary_work_id: str = Field(..., min_length=1, max_length=50, description="OpenLibrary Work ID")
    title: str = Field(..., min_length=1, max_length=500)
    authors: List[str] = Field(default_factory=list)
    cover_url: Optional[str] = None
    first_publish_year: Optional[int] = None
    description: Optional[str] = None
    edition_count: int = Field(default=1, ge=1)
    subjects: List[str] = Field(default_factory=list)
    status: ReadingStatus = ReadingStatus.WANT_TO_READ
    current_page: int = Field(default=0, ge=0)
    total_pages: int = Field(default=0, ge=0)
    notes: Optional[str] = None
    rating: Optional[int] = Field(default=None, ge=1, le=5)


class BookshelfStatusUpdate(BaseModel):
    status: ReadingStatus


class BookshelfProgressUpdate(BaseModel):
    current_page: int = Field(..., ge=0)
    total_pages: Optional[int] = Field(default=None, ge=0)


class BookshelfItemResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    book_id: uuid.UUID
    book: BookResponse
    status: ReadingStatus
    current_page: int
    total_pages: int
    progress_percentage: float = 0.0
    rating: Optional[int] = None
    notes: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookshelfListResponse(BaseModel):
    items: List[BookshelfItemResponse]
    total: int
    want_to_read_count: int
    reading_count: int
    completed_count: int
