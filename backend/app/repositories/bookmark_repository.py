import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.bookmark import Bookmark


class BookmarkRepository:
    """Repository handling all database operations for Bookmarks"""

    async def get_by_id(
        self,
        db: AsyncSession,
        bookmark_id: uuid.UUID,
    ) -> Optional[Bookmark]:
        statement = select(Bookmark).where(Bookmark.id == bookmark_id).options(selectinload(Bookmark.book))
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_user_and_lesson(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        book_id: uuid.UUID,
        lesson_id: str,
    ) -> Optional[Bookmark]:
        statement = (
            select(Bookmark)
            .where(
                Bookmark.user_id == user_id,
                Bookmark.book_id == book_id,
                Bookmark.lesson_id == lesson_id,
            )
            .options(selectinload(Bookmark.book))
        )
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    async def get_user_bookmarks(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> List[Bookmark]:
        statement = (
            select(Bookmark)
            .where(Bookmark.user_id == user_id)
            .order_by(Bookmark.created_at.desc())
            .options(selectinload(Bookmark.book))
        )
        result = await db.execute(statement)
        return list(result.scalars().all())

    async def upsert(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        book_id: uuid.UUID,
        chapter_index: int,
        lesson_index: int,
        lesson_id: str,
        lesson_title: Optional[str] = None,
    ) -> Bookmark:
        existing = await self.get_by_user_and_lesson(db, user_id, book_id, lesson_id)
        if existing:
            existing.chapter_index = chapter_index
            existing.lesson_index = lesson_index
            existing.lesson_title = lesson_title
            await db.commit()
            refreshed = await self.get_by_id(db, existing.id)
            return refreshed if refreshed else existing

        new_bookmark = Bookmark(
            user_id=user_id,
            book_id=book_id,
            chapter_index=chapter_index,
            lesson_index=lesson_index,
            lesson_id=lesson_id,
            lesson_title=lesson_title,
        )
        db.add(new_bookmark)
        await db.commit()
        refreshed = await self.get_by_id(db, new_bookmark.id)
        return refreshed if refreshed else new_bookmark

    async def delete(
        self,
        db: AsyncSession,
        bookmark: Bookmark,
    ) -> None:
        await db.delete(bookmark)
        await db.commit()


bookmark_repository = BookmarkRepository()
