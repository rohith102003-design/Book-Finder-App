import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    BookshelfItemNotFoundError,
    DuplicateBookshelfItemError,
    InvalidReadingProgressError,
)
from app.models.bookshelf import BookshelfItem
from app.repositories.book_repository import book_repository
from app.repositories.bookshelf_repository import bookshelf_repository
from app.schemas.book import BookCreate, BookResponse
from app.schemas.bookshelf import (
    BookshelfItemCreate,
    BookshelfItemResponse,
    BookshelfListResponse,
    ReadingStatus,
)


class BookshelfService:
    """Service layer coordinating bookshelf operations and reading progress state machines"""

    @staticmethod
    def calculate_progress_percentage(current_page: int, total_pages: int) -> float:
        """Calculates reading progress percentage safely clamped between 0.0 and 100.0"""
        if total_pages <= 0:
            return 0.0
        percentage = (current_page / total_pages) * 100.0
        return round(min(100.0, max(0.0, percentage)), 2)

    def to_item_response(self, item: BookshelfItem) -> BookshelfItemResponse:
        """Converts a BookshelfItem ORM instance to BookshelfItemResponse with computed progress"""
        progress = self.calculate_progress_percentage(item.current_page, item.total_pages)
        return BookshelfItemResponse(
            id=item.id,
            user_id=item.user_id,
            book_id=item.book_id,
            book=BookResponse.model_validate(item.book),
            status=ReadingStatus(item.status),
            current_page=item.current_page,
            total_pages=item.total_pages,
            progress_percentage=progress,
            rating=item.rating,
            notes=item.notes,
            started_at=item.started_at,
            completed_at=item.completed_at,
            created_at=item.created_at,
            updated_at=item.updated_at,
        )

    async def add_book_to_bookshelf(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        item_in: BookshelfItemCreate,
    ) -> BookshelfItemResponse:
        """Adds a book to the user's personal bookshelf, creating the book locally if needed"""
        # 1. Ensure book exists in the local database
        book_create = BookCreate(
            openlibrary_work_id=item_in.openlibrary_work_id,
            title=item_in.title,
            authors=item_in.authors,
            cover_url=item_in.cover_url,
            first_publish_year=item_in.first_publish_year,
            description=item_in.description,
            edition_count=item_in.edition_count,
            subjects=item_in.subjects,
        )
        book = await book_repository.upsert_by_openlibrary_id(db, book_create)

        # 2. Check for duplicate bookshelf entry for this user
        existing = await bookshelf_repository.get_by_user_and_book(db, user_id, book.id)
        if existing:
            raise DuplicateBookshelfItemError()

        # 3. Validate cross-field progress constraints
        if item_in.total_pages > 0 and item_in.current_page > item_in.total_pages:
            raise InvalidReadingProgressError()

        # 4. Determine initial reading status and timestamps
        now = datetime.now(timezone.utc)
        started_at: Optional[datetime] = None
        completed_at: Optional[datetime] = None
        current_page = item_in.current_page

        if item_in.status == ReadingStatus.READING:
            started_at = now
        elif item_in.status == ReadingStatus.COMPLETED:
            completed_at = now
            if item_in.total_pages > 0:
                current_page = item_in.total_pages

        # 5. Create item via repository
        item = await bookshelf_repository.create(
            db=db,
            user_id=user_id,
            book_id=book.id,
            status=item_in.status.value,
            current_page=current_page,
            total_pages=item_in.total_pages,
            notes=item_in.notes,
            rating=item_in.rating,
        )

        if started_at or completed_at:
            item.started_at = started_at
            item.completed_at = completed_at
            item = await bookshelf_repository.update(db, item)

        return self.to_item_response(item)

    async def get_bookshelf_item(
        self,
        db: AsyncSession,
        item_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> BookshelfItemResponse:
        """Retrieves a single bookshelf item scoped strictly to the authenticated user"""
        item = await bookshelf_repository.get_by_id(db, item_id, user_id)
        if not item:
            raise BookshelfItemNotFoundError()
        return self.to_item_response(item)

    async def list_bookshelf(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        status: Optional[ReadingStatus] = None,
    ) -> BookshelfListResponse:
        """Lists user's bookshelf items with aggregate status counts"""
        all_items = await bookshelf_repository.list_by_user(db, user_id)

        want_to_read_count = sum(1 for i in all_items if i.status == ReadingStatus.WANT_TO_READ.value)
        reading_count = sum(1 for i in all_items if i.status == ReadingStatus.READING.value)
        completed_count = sum(1 for i in all_items if i.status == ReadingStatus.COMPLETED.value)
        total = len(all_items)

        if status:
            filtered_items = [i for i in all_items if i.status == status.value]
        else:
            filtered_items = all_items

        return BookshelfListResponse(
            items=[self.to_item_response(i) for i in filtered_items],
            total=total,
            want_to_read_count=want_to_read_count,
            reading_count=reading_count,
            completed_count=completed_count,
        )

    async def update_status(
        self,
        db: AsyncSession,
        item_id: uuid.UUID,
        user_id: uuid.UUID,
        new_status: ReadingStatus,
    ) -> BookshelfItemResponse:
        """Updates the reading status with state transition timestamp side-effects"""
        item = await bookshelf_repository.get_by_id(db, item_id, user_id)
        if not item:
            raise BookshelfItemNotFoundError()

        now = datetime.now(timezone.utc)

        if new_status == ReadingStatus.READING:
            if item.started_at is None:
                item.started_at = now
            if item.status == ReadingStatus.COMPLETED.value:
                item.completed_at = None
            item.status = ReadingStatus.READING.value

        elif new_status == ReadingStatus.COMPLETED:
            item.status = ReadingStatus.COMPLETED.value
            item.completed_at = now
            if item.total_pages > 0:
                item.current_page = item.total_pages

        elif new_status == ReadingStatus.WANT_TO_READ:
            item.status = ReadingStatus.WANT_TO_READ.value

        updated = await bookshelf_repository.update(db, item)
        return self.to_item_response(updated)

    async def update_progress(
        self,
        db: AsyncSession,
        item_id: uuid.UUID,
        user_id: uuid.UUID,
        current_page: int,
        total_pages: Optional[int] = None,
    ) -> BookshelfItemResponse:
        """Updates reading page progress with automatic completion transitions"""
        item = await bookshelf_repository.get_by_id(db, item_id, user_id)
        if not item:
            raise BookshelfItemNotFoundError()

        if current_page < 0:
            raise InvalidReadingProgressError("Current page cannot be negative.")

        if total_pages is not None:
            if total_pages < 0:
                raise InvalidReadingProgressError("Total pages cannot be negative.")
            item.total_pages = total_pages

        effective_total_pages = item.total_pages

        if effective_total_pages > 0 and current_page > effective_total_pages:
            raise InvalidReadingProgressError("Current page cannot exceed total pages.")

        item.current_page = current_page
        now = datetime.now(timezone.utc)

        # Transition 1: Reaching maximum pages automatically completes the book
        if effective_total_pages > 0 and current_page == effective_total_pages:
            item.status = ReadingStatus.COMPLETED.value
            item.completed_at = now

        # Transition 2: Lowering pages on a completed book transitions back to READING
        elif current_page < effective_total_pages and item.status == ReadingStatus.COMPLETED.value:
            item.status = ReadingStatus.READING.value
            item.completed_at = None

        # Transition 3: Advancing pages on an unstarted book transitions to READING
        if current_page > 0 and item.started_at is None:
            item.started_at = now
            if item.status == ReadingStatus.WANT_TO_READ.value:
                item.status = ReadingStatus.READING.value

        updated = await bookshelf_repository.update(db, item)
        return self.to_item_response(updated)

    async def remove_from_bookshelf(
        self,
        db: AsyncSession,
        item_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> None:
        """Removes a book from the user's bookshelf scoped strictly to the authenticated user"""
        item = await bookshelf_repository.get_by_id(db, item_id, user_id)
        if not item:
            raise BookshelfItemNotFoundError()
        await bookshelf_repository.delete(db, item)


bookshelf_service = BookshelfService()
