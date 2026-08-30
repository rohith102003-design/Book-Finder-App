import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.reading_progress import ReadingProgress


class ReadingProgressRepository:
    """Repository handling all database operations for ReadingProgress"""

    async def get_by_user_and_book(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        book_id: uuid.UUID,
    ) -> Optional[ReadingProgress]:
        statement = (
            select(ReadingProgress)
            .where(ReadingProgress.user_id == user_id, ReadingProgress.book_id == book_id)
            .options(selectinload(ReadingProgress.book))
        )
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    async def get_user_progress_list(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> List[ReadingProgress]:
        statement = (
            select(ReadingProgress)
            .where(ReadingProgress.user_id == user_id)
            .order_by(ReadingProgress.last_read_at.desc())
            .options(selectinload(ReadingProgress.book))
        )
        result = await db.execute(statement)
        return list(result.scalars().all())

    async def upsert(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        book_id: uuid.UUID,
        current_lesson_index: int,
        current_chapter_index: int,
        completed_lesson_ids: List[str],
        progress_percentage: int,
        is_completed: bool,
    ) -> ReadingProgress:
        existing = await self.get_by_user_and_book(db, user_id, book_id)
        now = datetime.now()

        if existing:
            existing.current_lesson_index = current_lesson_index
            existing.current_chapter_index = current_chapter_index
            existing.completed_lesson_ids = completed_lesson_ids
            existing.progress_percentage = progress_percentage
            existing.is_completed = is_completed
            existing.last_read_at = now
            if is_completed and not existing.completed_at:
                existing.completed_at = now
            await db.commit()
            refreshed = await self.get_by_user_and_book(db, user_id, book_id)
            return refreshed if refreshed else existing

        new_progress = ReadingProgress(
            user_id=user_id,
            book_id=book_id,
            current_lesson_index=current_lesson_index,
            current_chapter_index=current_chapter_index,
            completed_lesson_ids=completed_lesson_ids,
            progress_percentage=progress_percentage,
            is_completed=is_completed,
            started_at=now,
            last_read_at=now,
            completed_at=now if is_completed else None,
        )
        db.add(new_progress)
        await db.commit()
        refreshed = await self.get_by_user_and_book(db, user_id, book_id)
        return refreshed if refreshed else new_progress

    async def delete(
        self,
        db: AsyncSession,
        progress: ReadingProgress,
    ) -> None:
        await db.delete(progress)
        await db.commit()


reading_progress_repository = ReadingProgressRepository()
