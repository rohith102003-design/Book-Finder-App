import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.book import BookResponse


class ReadingProgressUpdate(BaseModel):
    openlibrary_work_id: str = Field(..., min_length=1, max_length=50, description="OpenLibrary Work ID")
    title: str = Field(..., min_length=1, max_length=500)
    authors: List[str] = Field(default_factory=list)
    cover_url: Optional[str] = None
    first_publish_year: Optional[int] = None
    description: Optional[str] = None
    edition_count: int = Field(default=1, ge=1)
    subjects: List[str] = Field(default_factory=list)
    current_lesson_index: int = Field(default=0, ge=0)
    current_chapter_index: int = Field(default=0, ge=0)
    completed_lesson_ids: List[str] = Field(default_factory=list)
    progress_percentage: int = Field(default=0, ge=0, le=100)
    is_completed: bool = False


class ReadingProgressResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    book_id: uuid.UUID
    book: BookResponse
    current_lesson_index: int
    current_chapter_index: int
    completed_lesson_ids: List[str]
    progress_percentage: int
    is_completed: bool
    started_at: datetime
    last_read_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ReadingProgressListResponse(BaseModel):
    active_sessions: List[ReadingProgressResponse]
    completed_books: List[ReadingProgressResponse]


class BookmarkCreate(BaseModel):
    openlibrary_work_id: str = Field(..., min_length=1, max_length=50)
    title: str = Field(..., min_length=1, max_length=500)
    authors: List[str] = Field(default_factory=list)
    cover_url: Optional[str] = None
    first_publish_year: Optional[int] = None
    description: Optional[str] = None
    edition_count: int = Field(default=1, ge=1)
    subjects: List[str] = Field(default_factory=list)
    chapter_index: int = Field(default=0, ge=0)
    lesson_index: int = Field(default=0, ge=0)
    lesson_id: str = Field(..., min_length=1, max_length=100)
    lesson_title: Optional[str] = None


class BookmarkResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    book_id: uuid.UUID
    book: BookResponse
    chapter_index: int
    lesson_index: int
    lesson_id: str
    lesson_title: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookmarkListResponse(BaseModel):
    items: List[BookmarkResponse]
    total: int
