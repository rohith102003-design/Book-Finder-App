from typing import Dict, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.recommendation import (
    BookRecommendationResponse,
    RecommendationProfileCreate,
    RecommendationProfileResponse,
    RecommendationProfileUpdate,
)
from app.services.recommendation_profile_service import (
    recommendation_profile_service,
)
from app.services.recommendation_service import recommendation_service

router = APIRouter()


@router.get(
    "/profile",
    response_model=ApiResponse[Optional[RecommendationProfileResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get user recommendation profile",
    description="Returns the authenticated user's recommendation preferences, or null if not yet configured.",
)
async def get_my_recommendation_profile(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[Optional[RecommendationProfileResponse]]:
    profile = await recommendation_profile_service.get_my_profile(db, current_user)
    return ApiResponse(data=profile)


@router.post(
    "/profile",
    response_model=ApiResponse[RecommendationProfileResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create recommendation profile",
    description="Configures initial recommendation preferences for the authenticated user.",
)
async def create_recommendation_profile(
    profile_in: RecommendationProfileCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[RecommendationProfileResponse]:
    profile = await recommendation_profile_service.create_profile(
        db, current_user, profile_in
    )
    return ApiResponse(data=profile)


@router.patch(
    "/profile",
    response_model=ApiResponse[RecommendationProfileResponse],
    status_code=status.HTTP_200_OK,
    summary="Update recommendation profile",
    description="Updates preference criteria on the authenticated user's recommendation profile.",
)
async def update_recommendation_profile(
    profile_in: RecommendationProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[RecommendationProfileResponse]:
    profile = await recommendation_profile_service.update_profile(
        db, current_user, profile_in
    )
    return ApiResponse(data=profile)


@router.delete(
    "/profile",
    response_model=ApiResponse[Dict[str, str]],
    status_code=status.HTTP_200_OK,
    summary="Delete recommendation profile",
    description="Deletes the authenticated user's recommendation profile.",
)
async def delete_recommendation_profile(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[Dict[str, str]]:
    await recommendation_profile_service.delete_profile(db, current_user)
    return ApiResponse(data={"message": "Recommendation profile deleted successfully."})


@router.get(
    "",
    response_model=ApiResponse[BookRecommendationResponse],
    status_code=status.HTTP_200_OK,
    summary="Get personalized book recommendations",
    description="Generates personalized book recommendations ranked by preference profile, bookshelf history, and community rating signals.",
)
async def get_recommendations(
    limit: int = Query(10, ge=1, le=50, description="Maximum number of recommendations"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[BookRecommendationResponse]:
    recommendations = await recommendation_service.get_recommendations(
        db, current_user, limit=limit
    )
    return ApiResponse(data=recommendations)
