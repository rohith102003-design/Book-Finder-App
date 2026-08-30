import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.bookshelf import BookshelfItem


class BookshelfRepository:
    """Repository handling all database operations for user BookshelfItem entities"""

    async def get_by_id(
        self,
        db: AsyncSession,
        item_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> Optional[BookshelfItem]:
        """Fetch a specific bookshelf item scoped strictly to the authenticated user"""
        statement = (
            select(BookshelfItem)
            .options(selectinload(BookshelfItem.book))
            .where(
                BookshelfItem.id == item_id,
                BookshelfItem.user_id == user_id,
            )
        )
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_user_and_book(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        book_id: uuid.UUID,
    ) -> Optional[BookshelfItem]:
        """Check if a specific book is already on the user's bookshelf"""
        statement = (
            select(BookshelfItem)
            .options(selectinload(BookshelfItem.book))
            .where(
                BookshelfItem.user_id == user_id,
                BookshelfItem.book_id == book_id,
            )
        )
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    async def list_by_user(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        status: Optional[str] = None,
    ) -> List[BookshelfItem]:
        """List all bookshelf items for a user, optionally filtered by reading status"""
        statement = (
            select(BookshelfItem)
            .options(selectinload(BookshelfItem.book))
            .where(BookshelfItem.user_id == user_id)
        )
        if status:
            statement = statement.where(BookshelfItem.status == status)

        statement = statement.order_by(BookshelfItem.updated_at.desc())
        result = await db.execute(statement)
        return list(result.scalars().all())

    async def create(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        book_id: uuid.UUID,
        status: str = "WANT_TO_READ",
        current_page: int = 0,
        total_pages: int = 0,
        notes: Optional[str] = None,
        rating: Optional[int] = None,
    ) -> BookshelfItem:
        """Create and persist a new BookshelfItem record"""
        item = BookshelfItem(
            user_id=user_id,
            book_id=book_id,
            status=status,
            current_page=current_page,
            total_pages=total_pages,
            notes=notes,
            rating=rating,
        )
        db.add(item)
        await db.commit()
        await db.refresh(item)
        # Fetch with eager loaded book relationship
        reloaded = await self.get_by_id(db, item.id, user_id)
        return reloaded or item

    async def update(
        self,
        db: AsyncSession,
        item: BookshelfItem,
    ) -> BookshelfItem:
        """Persist updates to an existing BookshelfItem"""
        await db.commit()
        await db.refresh(item)
        return item

    async def delete(
        self,
        db: AsyncSession,
        item: BookshelfItem,
    ) -> None:
        """Remove a BookshelfItem from the database"""
        await db.delete(item)
        await db.commit()


bookshelf_repository = BookshelfRepository()
