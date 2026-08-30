import uuid
from typing import Dict
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.social import ReviewLikeResponse
from app.services.review_like_service import review_like_service

router = APIRouter()


@router.post(
    "/{review_id}/like",
    response_model=ApiResponse[ReviewLikeResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Like / helpful vote on a review",
    description="Adds a helpful vote to a community review from the authenticated user.",
)
async def create_review_like(
    review_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ReviewLikeResponse]:
    like = await review_like_service.create_like(db, current_user, review_id)
    return ApiResponse(data=like)


@router.delete(
    "/{review_id}/like",
    response_model=ApiResponse[Dict[str, str]],
    status_code=status.HTTP_200_OK,
    summary="Remove like / helpful vote from a review",
    description="Removes the authenticated user's helpful vote from a review.",
)
async def delete_review_like(
    review_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[Dict[str, str]]:
    await review_like_service.delete_like(db, current_user, review_id)
    return ApiResponse(data={"message": "Review like removed successfully."})


@router.get(
    "/{review_id}/like",
    response_model=ApiResponse[Dict[str, bool]],
    status_code=status.HTTP_200_OK,
    summary="Get user's like status for a review",
    description="Returns whether the authenticated user has voted on this review.",
)
async def get_review_like_status(
    review_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[Dict[str, bool]]:
    is_liked = await review_like_service.get_like_status(db, current_user, review_id)
    return ApiResponse(data={"is_liked": is_liked})


@router.get(
    "/{review_id}/likes/count",
    response_model=ApiResponse[Dict[str, int]],
    status_code=status.HTTP_200_OK,
    summary="Get total helpful vote count for a review",
    description="Returns the aggregate count of helpful votes for a review.",
)
async def get_review_likes_count(
    review_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[Dict[str, int]]:
    count = await review_like_service.get_like_count(db, review_id)
    return ApiResponse(data={"likes_count": count})
