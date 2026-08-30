import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class BookBase(BaseModel):
    openlibrary_work_id: str = Field(..., description="OpenLibrary unique work identifier, e.g. OL45804W")
    title: str = Field(..., min_length=1, max_length=500)
    authors: List[str] = Field(default_factory=list)
    first_publish_year: Optional[int] = Field(default=None)
    cover_url: Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None)
    edition_count: int = Field(default=1, ge=1)
    subjects: List[str] = Field(default_factory=list)


class BookCreate(BookBase):
    pass


class BookResponse(BookBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookSearchItem(BaseModel):
    key: str
    title: str
    authors: List[str]
    first_publish_year: Optional[int] = None
    cover_url: Optional[str] = None
    description: Optional[str] = None
    edition_count: int = 1
    subjects: List[str] = Field(default_factory=list)


class BookSearchResponse(BaseModel):
    books: List[BookSearchItem]
    total: int
    page: int = 1
    limit: int = 24
