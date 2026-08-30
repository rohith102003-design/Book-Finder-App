from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.social import SocialFeedResponse
from app.services.social_feed_service import social_feed_service

router = APIRouter()


@router.get(
    "/feed",
    response_model=ApiResponse[SocialFeedResponse],
    status_code=status.HTTP_200_OK,
    summary="Get personalized social activity feed",
    description="Returns chronological review and like activities from followed users.",
)
async def get_social_feed(
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(20, ge=1, le=100, description="Feed items per page"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[SocialFeedResponse]:
    feed = await social_feed_service.get_social_feed(
        db, current_user, skip=skip, limit=limit
    )
    return ApiResponse(data=feed)
