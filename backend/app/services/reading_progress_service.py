import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.bookmark import Bookmark
from app.models.reading_progress import ReadingProgress
from app.repositories.bookmark_repository import bookmark_repository
from app.repositories.bookshelf_repository import bookshelf_repository
from app.repositories.reading_progress_repository import reading_progress_repository
from app.schemas.reading_progress import BookmarkCreate, ReadingProgressUpdate
from app.services.book_service import book_service


class ReadingProgressService:
    """Service handling business logic for Reading Progress and Bookmarks, unified with Bookshelf states"""

    def __init__(self):
        self.progress_repository = reading_progress_repository
        self.bookmark_repository = bookmark_repository
        self.bookshelf_repository = bookshelf_repository
        self.book_service = book_service

    async def get_user_progress(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> Dict[str, List[ReadingProgress]]:
        # 1. Fetch reading progress records
        all_records = await self.progress_repository.get_user_progress_list(db, user_id)
        active_sessions = [r for r in all_records if not r.is_completed]
        completed_books = [r for r in all_records if r.is_completed]

        active_book_ids = {r.book_id for r in active_sessions}
        completed_book_ids = {r.book_id for r in completed_books}

        # 2. Synchronize with Bookshelf items to ensure 100% consistency across Reading Analytics & Bookshelf
        shelf_items = await self.bookshelf_repository.list_by_user(db, user_id)
        now = datetime.now()

        for item in shelf_items:
            if item.status == "COMPLETED" and item.book_id not in completed_book_ids:
                # Upsert reading progress record to match completed bookshelf status
                progress = await self.progress_repository.upsert(
                    db=db,
                    user_id=user_id,
                    book_id=item.book_id,
                    current_lesson_index=0,
                    current_chapter_index=0,
                    completed_lesson_ids=[],
                    progress_percentage=100,
                    is_completed=True,
                )
                completed_books.append(progress)
                completed_book_ids.add(item.book_id)

            elif item.status == "READING" and item.book_id not in active_book_ids and item.book_id not in completed_book_ids:
                pct = int((item.current_page / item.total_pages * 100)) if item.total_pages > 0 else 0
                progress = await self.progress_repository.upsert(
                    db=db,
                    user_id=user_id,
                    book_id=item.book_id,
                    current_lesson_index=0,
                    current_chapter_index=0,
                    completed_lesson_ids=[],
                    progress_percentage=pct,
                    is_completed=False,
                )
                active_sessions.append(progress)
                active_book_ids.add(item.book_id)

        return {
            "active_sessions": active_sessions,
            "completed_books": completed_books,
        }

    async def get_book_progress(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        openlibrary_work_id: str,
    ) -> Optional[ReadingProgress]:
        clean_id = openlibrary_work_id.replace("/works/", "").strip()
        book = await self.book_service.repository.get_by_openlibrary_id(db, clean_id)
        if not book:
            return None
        return await self.progress_repository.get_by_user_and_book(db, user_id, book.id)

    async def save_progress(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        payload: ReadingProgressUpdate,
    ) -> ReadingProgress:
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

        progress = await self.progress_repository.upsert(
            db=db,
            user_id=user_id,
            book_id=book.id,
            current_lesson_index=payload.current_lesson_index,
            current_chapter_index=payload.current_chapter_index,
            completed_lesson_ids=payload.completed_lesson_ids,
            progress_percentage=payload.progress_percentage,
            is_completed=payload.is_completed,
        )

        # Sync bookshelf item status if it exists for this book
        shelf_item = await self.bookshelf_repository.get_by_user_and_book(db, user_id, book.id)
        if shelf_item:
            if payload.is_completed and shelf_item.status != "COMPLETED":
                shelf_item.status = "COMPLETED"
                shelf_item.completed_at = datetime.now(timezone.utc)
                await db.commit()
            elif not payload.is_completed and shelf_item.status == "WANT_TO_READ":
                shelf_item.status = "READING"
                shelf_item.started_at = datetime.now(timezone.utc)
                await db.commit()

        return progress

    async def delete_progress(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        openlibrary_work_id: str,
    ) -> None:
        clean_id = openlibrary_work_id.replace("/works/", "").strip()
        book = await self.book_service.repository.get_by_openlibrary_id(db, clean_id)
        if not book:
            return

        progress = await self.progress_repository.get_by_user_and_book(db, user_id, book.id)
        if progress:
            await self.progress_repository.delete(db, progress)

    # Bookmark Operations
    async def get_user_bookmarks(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> List[Bookmark]:
        return await self.bookmark_repository.get_user_bookmarks(db, user_id)

    async def save_bookmark(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        payload: BookmarkCreate,
    ) -> Bookmark:
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

        return await self.bookmark_repository.upsert(
            db=db,
            user_id=user_id,
            book_id=book.id,
            chapter_index=payload.chapter_index,
            lesson_index=payload.lesson_index,
            lesson_id=payload.lesson_id,
            lesson_title=payload.lesson_title,
        )

    async def remove_bookmark(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        bookmark_id: uuid.UUID,
    ) -> None:
        bookmark = await self.bookmark_repository.get_by_id(db, bookmark_id)
        if bookmark and bookmark.user_id == user_id:
            await self.bookmark_repository.delete(db, bookmark)


reading_progress_service = ReadingProgressService()
