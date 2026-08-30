import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import NotFoundError
from app.models.favorite import Favorite
from app.repositories.favorite_repository import favorite_repository
from app.schemas.favorite import FavoriteCreate
from app.services.book_service import book_service


class FavoriteService:
    """Service handling business logic for Favorites"""

    def __init__(self):
        self.repository = favorite_repository
        self.book_service = book_service

    async def get_user_favorites(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> List[Favorite]:
        return await self.repository.get_user_favorites(db, user_id)

    async def add_favorite(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        payload: FavoriteCreate,
    ) -> Favorite:
        # 1. Ensure book exists or create in books table
        book = await self.book_service.get_or_create_book(
            db=db,
            openlibrary_work_id=payload.openlibrary_work_id,
            title=payload.title,
            authors=payload.authors,
            cover_url=payload.cover_url,
            first_publish_year=payload.first_publish_year,
            description=payload.description,
            edition_count=payload.edition_count,
            subjects=payload.subjects,
        )

        # 2. Check if already favorited (idempotent)
        existing = await self.repository.get_by_user_and_book(db, user_id, book.id)
        if existing:
            return existing

        # 3. Create favorite
        return await self.repository.create(db, user_id, book.id)

    async def remove_favorite(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        openlibrary_work_id: str,
    ) -> None:
        clean_work_id = openlibrary_work_id.replace("/works/", "").strip()
        book = await self.book_service.repository.get_by_openlibrary_work_id(db, clean_work_id)
        if not book:
            return

        favorite = await self.repository.get_by_user_and_book(db, user_id, book.id)
        if favorite:
            await self.repository.delete(db, favorite)


favorite_service = FavoriteService()
