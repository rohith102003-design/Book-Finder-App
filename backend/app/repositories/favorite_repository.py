import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.favorite import Favorite


class FavoriteRepository:
    """Repository handling all database operations for Favorites"""

    async def get_by_user_and_book(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        book_id: uuid.UUID,
    ) -> Optional[Favorite]:
        statement = (
            select(Favorite)
            .where(Favorite.user_id == user_id, Favorite.book_id == book_id)
            .options(selectinload(Favorite.book))
        )
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    async def get_user_favorites(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> List[Favorite]:
        statement = (
            select(Favorite)
            .where(Favorite.user_id == user_id)
            .order_by(Favorite.created_at.desc())
            .options(selectinload(Favorite.book))
        )
        result = await db.execute(statement)
        return list(result.scalars().all())

    async def create(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        book_id: uuid.UUID,
    ) -> Favorite:
        favorite = Favorite(
            user_id=user_id,
            book_id=book_id,
        )
        db.add(favorite)
        await db.commit()
        refreshed = await self.get_by_user_and_book(db, user_id, book_id)
        return refreshed if refreshed else favorite

    async def delete(
        self,
        db: AsyncSession,
        favorite: Favorite,
    ) -> None:
        await db.delete(favorite)
        await db.commit()


favorite_repository = FavoriteRepository()
