import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ReviewLikeResponse(BaseModel):
    id: uuid.UUID
    review_id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserFollowCreate(BaseModel):
    following_id: uuid.UUID = Field(
        ...,
        description="ID of the user to follow",
    )


class UserFollowUserResponse(BaseModel):
    id: uuid.UUID
    username: str

    model_config = ConfigDict(from_attributes=True)


class UserFollowResponse(BaseModel):
    id: uuid.UUID
    follower_id: uuid.UUID
    following_id: uuid.UUID
    created_at: datetime
    follower: Optional[UserFollowUserResponse] = None
    following: Optional[UserFollowUserResponse] = None

    model_config = ConfigDict(from_attributes=True)


class FollowStatsResponse(BaseModel):
    followers_count: int = 0
    following_count: int = 0
    is_following: bool = False


class SocialFeedItem(BaseModel):
    id: str
    activity_type: str
    actor_id: uuid.UUID
    actor_username: str
    book_title: str
    book_openlibrary_id: str
    review_id: Optional[uuid.UUID] = None
    review_rating: Optional[int] = None
    review_title: Optional[str] = None
    review_content: Optional[str] = None
    created_at: datetime


class SocialFeedResponse(BaseModel):
    items: List[SocialFeedItem] = Field(default_factory=list)
    total_count: int = 0
