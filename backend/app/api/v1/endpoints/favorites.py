from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.favorite import FavoriteCreate, FavoriteListResponse, FavoriteResponse
from app.services.favorite_service import favorite_service

router = APIRouter()


@router.get(
    "",
    response_model=ApiResponse[FavoriteListResponse],
    status_code=status.HTTP_200_OK,
    summary="Get user favorites",
    description="Retrieves all saved favorites for the currently authenticated user.",
)
async def get_favorites(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[FavoriteListResponse]:
    favorites = await favorite_service.get_user_favorites(db, current_user.id)
    items = [FavoriteResponse.model_validate(f) for f in favorites]
    return ApiResponse(
        data=FavoriteListResponse(
            items=items,
            total=len(items),
        )
    )


@router.post(
    "",
    response_model=ApiResponse[FavoriteResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Add book to favorites",
    description="Adds a book to the authenticated user's favorites list (idempotent).",
)
async def add_favorite(
    payload: FavoriteCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[FavoriteResponse]:
    favorite = await favorite_service.add_favorite(db, current_user.id, payload)
    return ApiResponse(
        data=FavoriteResponse.model_validate(favorite)
    )


@router.delete(
    "/{work_id}",
    response_model=ApiResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Remove book from favorites",
    description="Removes a book from the authenticated user's favorites list.",
)
async def remove_favorite(
    work_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[dict]:
    await favorite_service.remove_favorite(db, current_user.id, work_id)
    return ApiResponse(
        data={"message": "Favorite removed successfully."}
    )
