import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class RecommendationProfileCreate(BaseModel):
    preferred_genres: Optional[List[str]] = Field(
        default=None,
        description="List of preferred genres/topics",
    )
    preferred_authors: Optional[List[str]] = Field(
        default=None,
        description="List of preferred author names",
    )
    preferred_languages: Optional[List[str]] = Field(
        default=None,
        description="List of preferred language codes (e.g. ['en', 'fr'])",
    )
    min_rating: Optional[int] = Field(
        default=None,
        ge=1,
        le=5,
        description="Minimum star rating filter (1 to 5)",
    )
    max_rating: Optional[int] = Field(
        default=None,
        ge=1,
        le=5,
        description="Maximum star rating filter (1 to 5)",
    )


class RecommendationProfileUpdate(BaseModel):
    preferred_genres: Optional[List[str]] = Field(
        default=None,
        description="Updated list of preferred genres/topics",
    )
    preferred_authors: Optional[List[str]] = Field(
        default=None,
        description="Updated list of preferred author names",
    )
    preferred_languages: Optional[List[str]] = Field(
        default=None,
        description="Updated list of preferred language codes",
    )
    min_rating: Optional[int] = Field(
        default=None,
        ge=1,
        le=5,
        description="Updated minimum star rating filter (1 to 5)",
    )
    max_rating: Optional[int] = Field(
        default=None,
        ge=1,
        le=5,
        description="Updated maximum star rating filter (1 to 5)",
    )


class RecommendationProfileResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    preferred_genres: Optional[List[str]] = None
    preferred_authors: Optional[List[str]] = None
    preferred_languages: Optional[List[str]] = None
    min_rating: Optional[int] = None
    max_rating: Optional[int] = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookRecommendationItem(BaseModel):
    book_id: uuid.UUID
    openlibrary_work_id: str
    title: str
    authors: List[str] = Field(default_factory=list)
    cover_url: Optional[str] = None
    first_publish_year: Optional[int] = None
    subjects: List[str] = Field(default_factory=list)
    score: float
    match_reasons: List[str] = Field(default_factory=list)
    average_rating: float = 0.0


class BookRecommendationResponse(BaseModel):
    recommendations: List[BookRecommendationItem] = Field(default_factory=list)
    total_count: int = 0
