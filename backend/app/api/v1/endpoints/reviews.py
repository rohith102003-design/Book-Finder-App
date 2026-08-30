import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.review import (
    BookReviewSummaryResponse,
    ReviewCreate,
    ReviewResponse,
    ReviewUpdate,
)
from app.services.review_service import review_service

router = APIRouter()
book_reviews_router = APIRouter()


@book_reviews_router.get(
    "/{work_id}/reviews",
    response_model=ApiResponse[BookReviewSummaryResponse],
    status_code=status.HTTP_200_OK,
    summary="Get book reviews and rating distribution",
    description="Returns public community reviews, average rating, and 1-5 star distribution for a book.",
)
async def get_book_reviews(
    work_id: str,
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(20, ge=1, le=100, description="Reviews per page"),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[BookReviewSummaryResponse]:
    summary = await review_service.get_book_reviews(db, work_id, skip=skip, limit=limit)
    return ApiResponse(data=summary)


@router.post(
    "",
    response_model=ApiResponse[ReviewResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create a book review",
    description="Creates a review and star rating for a book. Reviewer receives a verified reader badge if the book is marked completed on their bookshelf.",
)
async def create_review(
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ReviewResponse]:
    review = await review_service.create_review(db, current_user, review_in)
    return ApiResponse(data=review)


@router.get(
    "/me/{work_id}",
    response_model=ApiResponse[Optional[ReviewResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get current user's review for a book",
    description="Returns the authenticated user's review for the specified book, or null if not yet reviewed.",
)
async def get_my_review(
    work_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[Optional[ReviewResponse]]:
    review = await review_service.get_my_review(db, current_user, work_id)
    return ApiResponse(data=review)


@router.patch(
    "/{review_id}",
    response_model=ApiResponse[ReviewResponse],
    status_code=status.HTTP_200_OK,
    summary="Update a review",
    description="Updates an existing review. Strictly restricted to the review owner.",
)
async def update_review(
    review_id: uuid.UUID,
    update_in: ReviewUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ReviewResponse]:
    review = await review_service.update_review(db, review_id, current_user, update_in)
    return ApiResponse(data=review)


@router.delete(
    "/{review_id}",
    response_model=ApiResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Delete a review",
    description="Deletes a review. Permitted for the review owner or administrators.",
)
async def delete_review(
    review_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[dict]:
    await review_service.delete_review(db, review_id, current_user)
    return ApiResponse(data={"message": "Review deleted successfully."})
