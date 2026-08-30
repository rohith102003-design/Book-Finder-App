import uuid
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ReadingGoalCreate(BaseModel):
    year: int = Field(
        ...,
        ge=2000,
        le=2100,
        description="Target challenge year (between 2000 and 2100)",
    )
    target_books: int = Field(
        ...,
        ge=1,
        description="Number of books intended to be read in the target year",
    )


class ReadingGoalUpdate(BaseModel):
    target_books: int = Field(
        ...,
        ge=1,
        description="Updated target number of books",
    )


class ReadingGoalResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    year: int
    target_books: int
    completed_books: int = 0
    progress_percentage: float = 0.0
    is_completed: bool = False

    model_config = ConfigDict(from_attributes=True)


class MonthlyReadingStat(BaseModel):
    month: int = Field(..., ge=1, le=12, description="Month number from 1 to 12")
    books_completed: int = 0
    pages_read: int = 0


class GenreStat(BaseModel):
    genre: str
    count: int = 0


class ReadingAnalyticsResponse(BaseModel):
    total_books_completed: int = 0
    total_pages_read: int = 0
    average_personal_rating: float = 0.0
    active_goal: Optional[ReadingGoalResponse] = None
    monthly_breakdown: List[MonthlyReadingStat] = Field(default_factory=list)
    top_genres: List[GenreStat] = Field(default_factory=list)
