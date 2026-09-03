import uuid
from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, get_optional_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.social import FollowStatsResponse, UserFollowResponse
from app.services.user_follow_service import user_follow_service

router = APIRouter()


@router.post(
    "/{user_id}/follow",
    response_model=ApiResponse[UserFollowResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Follow a user",
    description="Follows a target user and dispatches a notification.",
)
async def follow_user(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[UserFollowResponse]:
    follow = await user_follow_service.follow_user(db, current_user, user_id)
    return ApiResponse(data=follow)


@router.delete(
    "/{user_id}/follow",
    response_model=ApiResponse[Dict[str, str]],
    status_code=status.HTTP_200_OK,
    summary="Unfollow a user",
    description="Unfollows a target user.",
)
async def unfollow_user(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[Dict[str, str]]:
    await user_follow_service.unfollow_user(db, current_user, user_id)
    return ApiResponse(data={"message": "Unfollowed user successfully."})


@router.get(
    "/{user_id}/follow-status",
    response_model=ApiResponse[Dict[str, bool]],
    status_code=status.HTTP_200_OK,
    summary="Get follow status for a user",
    description="Returns whether the authenticated user follows the specified target user.",
)
async def get_follow_status(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[Dict[str, bool]]:
    is_following = await user_follow_service.get_follow_status(
        db, current_user, user_id
    )
    return ApiResponse(data={"is_following": is_following})


@router.get(
    "/{user_id}/followers",
    response_model=ApiResponse[List[UserFollowResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get user's followers",
    description="Returns paginated list of users following the target user.",
)
async def get_followers(
    user_id: uuid.UUID,
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(20, ge=1, le=100, description="Followers per page"),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[List[UserFollowResponse]]:
    followers = await user_follow_service.get_followers(
        db, user_id, skip=skip, limit=limit
    )
    return ApiResponse(data=followers)


@router.get(
    "/{user_id}/following",
    response_model=ApiResponse[List[UserFollowResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get users followed by user",
    description="Returns paginated list of users followed by the target user.",
)
async def get_following(
    user_id: uuid.UUID,
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(20, ge=1, le=100, description="Following per page"),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[List[UserFollowResponse]]:
    following = await user_follow_service.get_following(
        db, user_id, skip=skip, limit=limit
    )
    return ApiResponse(data=following)


@router.get(
    "/{user_id}/follow-stats",
    response_model=ApiResponse[FollowStatsResponse],
    status_code=status.HTTP_200_OK,
    summary="Get user follow stats",
    description="Returns follower count, following count, and relationship status.",
)
async def get_follow_stats(
    user_id: uuid.UUID,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[FollowStatsResponse]:
    stats = await user_follow_service.get_follow_stats(db, current_user, user_id)
    return ApiResponse(data=stats)
