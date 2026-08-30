from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.core.exceptions import ReadingGoalNotFoundError
from app.db.session import get_db
from app.models.user import User
from app.schemas.analytics import (
    ReadingAnalyticsResponse,
    ReadingGoalCreate,
    ReadingGoalResponse,
    ReadingGoalUpdate,
)
from app.schemas.common import ApiResponse
from app.services.reading_analytics_service import reading_analytics_service

router = APIRouter()


@router.get(
    "/overview",
    response_model=ApiResponse[ReadingAnalyticsResponse],
    status_code=status.HTTP_200_OK,
    summary="Get reading analytics overview",
    description="Returns comprehensive personal reading metrics, velocity breakdown, top genres, and annual goal progress.",
)
async def get_analytics_overview(
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Target analysis year"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ReadingAnalyticsResponse]:
    overview = await reading_analytics_service.get_analytics_overview(db, current_user, year)
    return ApiResponse(data=overview)


@router.get(
    "/goals/{year}",
    response_model=ApiResponse[ReadingGoalResponse],
    status_code=status.HTTP_200_OK,
    summary="Get reading goal for year",
    description="Returns the authenticated user's annual reading goal and current completion progress.",
)
async def get_reading_goal(
    year: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ReadingGoalResponse]:
    goal = await reading_analytics_service.get_reading_goal(db, current_user.id, year)
    if not goal:
        raise ReadingGoalNotFoundError()
    return ApiResponse(data=goal)


@router.post(
    "/goals",
    response_model=ApiResponse[ReadingGoalResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create annual reading goal",
    description="Sets an annual reading challenge target for the authenticated user.",
)
async def create_reading_goal(
    goal_in: ReadingGoalCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ReadingGoalResponse]:
    goal = await reading_analytics_service.create_reading_goal(db, current_user, goal_in)
    return ApiResponse(data=goal)


@router.patch(
    "/goals/{year}",
    response_model=ApiResponse[ReadingGoalResponse],
    status_code=status.HTTP_200_OK,
    summary="Update annual reading goal target",
    description="Updates target books for an existing annual reading challenge.",
)
async def update_reading_goal(
    year: int,
    update_in: ReadingGoalUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ReadingGoalResponse]:
    goal = await reading_analytics_service.update_reading_goal(db, current_user, year, update_in)
    return ApiResponse(data=goal)
