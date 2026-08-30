from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.reading_progress import (
    ReadingProgressListResponse,
    ReadingProgressResponse,
    ReadingProgressUpdate,
)
from app.services.reading_progress_service import reading_progress_service

router = APIRouter()


@router.get(
    "",
    response_model=ApiResponse[ReadingProgressListResponse],
    status_code=status.HTTP_200_OK,
    summary="Get user reading progress",
    description="Retrieves all active reading sessions and completed books for the authenticated user.",
)
async def get_all_reading_progress(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ReadingProgressListResponse]:
    result = await reading_progress_service.get_user_progress(db, current_user.id)
    return ApiResponse(
        data=ReadingProgressListResponse(
            active_sessions=[ReadingProgressResponse.model_validate(r) for r in result["active_sessions"]],
            completed_books=[ReadingProgressResponse.model_validate(r) for r in result["completed_books"]],
        )
    )


@router.get(
    "/{work_id}",
    response_model=ApiResponse[ReadingProgressResponse],
    status_code=status.HTTP_200_OK,
    summary="Get book reading progress",
    description="Retrieves reading progress for a specific book by OpenLibrary work ID.",
)
async def get_book_progress(
    work_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ReadingProgressResponse]:
    progress = await reading_progress_service.get_book_progress(db, current_user.id, work_id)
    if not progress:
        return ApiResponse(data=None)
    return ApiResponse(
        data=ReadingProgressResponse.model_validate(progress)
    )


@router.post(
    "",
    response_model=ApiResponse[ReadingProgressResponse],
    status_code=status.HTTP_200_OK,
    summary="Save reading progress",
    description="Updates or creates reading progress for a book.",
)
async def save_reading_progress(
    payload: ReadingProgressUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ReadingProgressResponse]:
    progress = await reading_progress_service.save_progress(db, current_user.id, payload)
    return ApiResponse(
        data=ReadingProgressResponse.model_validate(progress)
    )


@router.delete(
    "/{work_id}",
    response_model=ApiResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Delete reading progress",
    description="Removes an active reading session for a book.",
)
async def delete_reading_progress(
    work_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[dict]:
    await reading_progress_service.delete_progress(db, current_user.id, work_id)
    return ApiResponse(
        data={"message": "Reading progress removed successfully."}
    )
