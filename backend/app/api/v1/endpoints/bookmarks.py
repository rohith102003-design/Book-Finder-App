import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.reading_progress import (
    BookmarkCreate,
    BookmarkListResponse,
    BookmarkResponse,
)
from app.services.reading_progress_service import reading_progress_service

router = APIRouter()


@router.get(
    "",
    response_model=ApiResponse[BookmarkListResponse],
    status_code=status.HTTP_200_OK,
    summary="Get user bookmarks",
    description="Retrieves all saved lesson bookmarks for the authenticated user.",
)
async def get_bookmarks(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[BookmarkListResponse]:
    bookmarks = await reading_progress_service.get_user_bookmarks(db, current_user.id)
    items = [BookmarkResponse.model_validate(b) for b in bookmarks]
    return ApiResponse(
        data=BookmarkListResponse(
            items=items,
            total=len(items),
        )
    )


@router.post(
    "",
    response_model=ApiResponse[BookmarkResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Save bookmark",
    description="Saves or updates a lesson bookmark for the authenticated user.",
)
async def save_bookmark(
    payload: BookmarkCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[BookmarkResponse]:
    bookmark = await reading_progress_service.save_bookmark(db, current_user.id, payload)
    return ApiResponse(
        data=BookmarkResponse.model_validate(bookmark)
    )


@router.delete(
    "/{bookmark_id}",
    response_model=ApiResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Delete bookmark",
    description="Removes a lesson bookmark for the authenticated user.",
)
async def delete_bookmark(
    bookmark_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[dict]:
    await reading_progress_service.remove_bookmark(db, current_user.id, bookmark_id)
    return ApiResponse(
        data={"message": "Bookmark removed successfully."}
    )
