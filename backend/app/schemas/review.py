import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    openlibrary_work_id: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="OpenLibrary Work ID",
    )
    rating: int = Field(
        ...,
        ge=1,
        le=5,
        description="Rating from 1 to 5 stars",
    )
    title: Optional[str] = Field(
        default=None,
        max_length=200,
        description="Optional headline for the review",
    )
    content: str = Field(
        ...,
        min_length=5,
        max_length=5000,
        description="Review body text",
    )
    contains_spoilers: bool = Field(
        default=False,
        description="Flag indicating if the review contains plot spoilers",
    )


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(
        default=None,
        ge=1,
        le=5,
        description="Updated rating from 1 to 5 stars",
    )
    title: Optional[str] = Field(
        default=None,
        max_length=200,
        description="Updated headline for the review",
    )
    content: Optional[str] = Field(
        default=None,
        min_length=5,
        max_length=5000,
        description="Updated review body text",
    )
    contains_spoilers: Optional[bool] = Field(
        default=None,
        description="Updated spoiler flag",
    )


class ReviewAuthorResponse(BaseModel):
    id: uuid.UUID
    username: str
    is_verified_reader: bool = False

    model_config = ConfigDict(from_attributes=True)


class ReviewResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    book_id: uuid.UUID
    rating: int
    title: Optional[str] = None
    content: str
    contains_spoilers: bool
    likes_count: int = 0
    author: ReviewAuthorResponse
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RatingDistribution(BaseModel):
    one_star: int = 0
    two_star: int = 0
    three_star: int = 0
    four_star: int = 0
    five_star: int = 0


class BookReviewSummaryResponse(BaseModel):
    book_id: uuid.UUID
    openlibrary_work_id: str
    average_rating: float = 0.0
    total_reviews: int = 0
    rating_distribution: RatingDistribution = Field(default_factory=RatingDistribution)
    reviews: List[ReviewResponse] = Field(default_factory=list)
