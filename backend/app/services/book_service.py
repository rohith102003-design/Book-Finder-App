from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import BookNotFoundError
from app.models.book import Book
from app.repositories.book_repository import book_repository
from app.schemas.book import BookCreate, BookResponse, BookSearchResponse
from app.services.openlibrary_service import openlibrary_service


class BookService:
    """Business logic service coordinating book discovery, caching, and repository persistence"""

    def __init__(self):
        self.repository = book_repository
        self.openlibrary = openlibrary_service

    async def search_books(
        self,
        query: str,
        page: int = 1,
        limit: int = 24,
    ) -> BookSearchResponse:
        return await self.openlibrary.search_books(query=query, page=page, limit=limit)

    async def get_or_create_book(
        self,
        db: AsyncSession,
        openlibrary_work_id: str,
        title: str,
        authors: Optional[List[str]] = None,
        cover_url: Optional[str] = None,
        first_publish_year: Optional[int] = None,
        description: Optional[str] = None,
        edition_count: int = 1,
        subjects: Optional[List[str]] = None,
    ) -> Book:
        clean_id = openlibrary_work_id.replace("/works/", "").strip()
        book_create = BookCreate(
            openlibrary_work_id=clean_id,
            title=title,
            authors=authors or [],
            cover_url=cover_url,
            first_publish_year=first_publish_year,
            description=description,
            edition_count=edition_count or 1,
            subjects=subjects or [],
        )
        return await self.repository.upsert_by_openlibrary_id(db, book_create)

    async def get_book_by_work_id(
        self,
        db: AsyncSession,
        work_id: str,
    ) -> BookResponse:
        clean_id = work_id.replace("/works/", "")

        # 1. Check local database cache first
        local_book = await self.repository.get_by_openlibrary_id(db, clean_id)
        if local_book:
            return BookResponse.model_validate(local_book)

        # 2. Fetch from OpenLibrary if not cached locally
        work_data = await self.openlibrary.get_work_details(clean_id)
        if not work_data:
            raise BookNotFoundError(clean_id)

        title = work_data.get("title", "Untitled Book")
        description = None
        raw_desc = work_data.get("description")
        if isinstance(raw_desc, str):
            description = raw_desc.strip()
        elif isinstance(raw_desc, dict) and "value" in raw_desc:
            description = str(raw_desc["value"]).strip()

        covers = work_data.get("covers", [])
        cover_url = None
        if covers and isinstance(covers, list) and len(covers) > 0 and isinstance(covers[0], int) and covers[0] > 0:
            cover_url = f"{self.openlibrary.covers_url}/b/id/{covers[0]}-L.jpg"

        subjects = work_data.get("subjects", [])
        if not isinstance(subjects, list):
            subjects = []

        # 3. Persist to local database
        book_create = BookCreate(
            openlibrary_work_id=clean_id,
            title=title,
            authors=["Unknown Author"],  # Work details endpoint has author keys, not names
            first_publish_year=None,
            cover_url=cover_url,
            description=description,
            edition_count=1,
            subjects=subjects[:5],
        )

        persisted_book = await self.repository.upsert_by_openlibrary_id(db, book_create)
        return BookResponse.model_validate(persisted_book)


book_service = BookService()
