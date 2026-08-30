import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.bookshelf import (
    BookshelfItemCreate,
    BookshelfItemResponse,
    BookshelfListResponse,
    BookshelfProgressUpdate,
    BookshelfStatusUpdate,
    ReadingStatus,
)
from app.services.bookshelf_service import bookshelf_service

router = APIRouter()


@router.post(
    "",
    response_model=ApiResponse[BookshelfItemResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Add a book to the personal bookshelf",
    description="Saves a book to the authenticated user's personal bookshelf, creating the book locally if needed.",
)
async def add_to_bookshelf(
    item_in: BookshelfItemCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[BookshelfItemResponse]:
    item = await bookshelf_service.add_book_to_bookshelf(db, current_user.id, item_in)
    return ApiResponse(data=item)


@router.get(
    "",
    response_model=ApiResponse[BookshelfListResponse],
    status_code=status.HTTP_200_OK,
    summary="Get user bookshelf",
    description="Returns all books in the authenticated user's personal bookshelf with aggregate metrics.",
)
async def get_bookshelf(
    status: Optional[ReadingStatus] = Query(None, description="Filter bookshelf items by reading status"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[BookshelfListResponse]:
    bookshelf = await bookshelf_service.list_bookshelf(db, current_user.id, status)
    return ApiResponse(data=bookshelf)


@router.get(
    "/{item_id}",
    response_model=ApiResponse[BookshelfItemResponse],
    status_code=status.HTTP_200_OK,
    summary="Get a specific bookshelf item",
    description="Returns the details of a specific bookshelf item strictly scoped to the authenticated user.",
)
async def get_bookshelf_item(
    item_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[BookshelfItemResponse]:
    item = await bookshelf_service.get_bookshelf_item(db, item_id, current_user.id)
    return ApiResponse(data=item)


@router.patch(
    "/{item_id}/status",
    response_model=ApiResponse[BookshelfItemResponse],
    status_code=status.HTTP_200_OK,
    summary="Update reading status",
    description="Updates the reading lifecycle status of a bookshelf item with timestamp side-effects.",
)
async def update_status(
    item_id: uuid.UUID,
    status_in: BookshelfStatusUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[BookshelfItemResponse]:
    item = await bookshelf_service.update_status(db, item_id, current_user.id, status_in.status)
    return ApiResponse(data=item)


@router.patch(
    "/{item_id}/progress",
    response_model=ApiResponse[BookshelfItemResponse],
    status_code=status.HTTP_200_OK,
    summary="Update reading progress",
    description="Updates current page progress with automatic completion transitions when max pages are reached.",
)
async def update_progress(
    item_id: uuid.UUID,
    progress_in: BookshelfProgressUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[BookshelfItemResponse]:
    item = await bookshelf_service.update_progress(
        db,
        item_id,
        current_user.id,
        progress_in.current_page,
        progress_in.total_pages,
    )
    return ApiResponse(data=item)


@router.delete(
    "/{item_id}",
    response_model=ApiResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Remove book from bookshelf",
    description="Removes a book from the authenticated user's bookshelf.",
)
async def remove_from_bookshelf(
    item_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[dict]:
    await bookshelf_service.remove_from_bookshelf(db, item_id, current_user.id)
    return ApiResponse(data={"message": "Book removed from bookshelf successfully."})
