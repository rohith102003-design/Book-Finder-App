from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.book import BookResponse, BookSearchResponse
from app.schemas.common import ApiResponse
from app.services.book_service import book_service

router = APIRouter()


@router.get(
    "/search",
    response_model=ApiResponse[BookSearchResponse],
    status_code=status.HTTP_200_OK,
    summary="Search books by title",
    description="Proxies search query to OpenLibrary, normalizes results, and handles timeouts.",
)
async def search_books(
    q: str = Query(..., min_length=1, max_length=200, description="Book title or keywords"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(24, ge=1, le=50, description="Items per page"),
):
    result = await book_service.search_books(query=q, page=page, limit=limit)
    return ApiResponse(
        success=True,
        data=result,
        meta={
            "query": q,
            "page": page,
            "limit": limit,
            "total": result.total,
        },
    )


@router.get(
    "/{work_id}",
    response_model=ApiResponse[BookResponse],
    status_code=status.HTTP_200_OK,
    summary="Get book details by OpenLibrary work ID",
    description="Retrieves book from local database if cached; otherwise fetches from OpenLibrary and caches locally.",
)
async def get_book_details(
    work_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await book_service.get_book_by_work_id(db=db, work_id=work_id)
    return ApiResponse(
        success=True,
        data=result,
    )
