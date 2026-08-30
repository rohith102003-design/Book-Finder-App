import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.book import Book
from app.schemas.book import BookCreate


class BookRepository:
    """Repository handling all database operations for the Book entity"""

    async def get_by_id(self, db: AsyncSession, book_id: uuid.UUID) -> Optional[Book]:
        statement = select(Book).where(Book.id == book_id)
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_openlibrary_id(self, db: AsyncSession, openlibrary_work_id: str) -> Optional[Book]:
        # Normalize work_id to remove any leading "/works/" prefix if present
        clean_id = openlibrary_work_id.replace("/works/", "")
        statement = select(Book).where(
            (Book.openlibrary_work_id == clean_id) | (Book.openlibrary_work_id == openlibrary_work_id)
        )
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    get_by_openlibrary_work_id = get_by_openlibrary_id

    async def create(self, db: AsyncSession, book_in: BookCreate) -> Book:
        clean_id = book_in.openlibrary_work_id.replace("/works/", "")
        book = Book(
            openlibrary_work_id=clean_id,
            title=book_in.title,
            authors=book_in.authors,
            first_publish_year=book_in.first_publish_year,
            cover_url=book_in.cover_url,
            description=book_in.description,
            edition_count=book_in.edition_count,
            subjects=book_in.subjects,
        )
        db.add(book)
        await db.commit()
        await db.refresh(book)
        return book

    async def upsert_by_openlibrary_id(self, db: AsyncSession, book_in: BookCreate) -> Book:
        clean_id = book_in.openlibrary_work_id.replace("/works/", "")
        existing = await self.get_by_openlibrary_id(db, clean_id)
        if existing:
            existing.title = book_in.title
            existing.authors = book_in.authors
            existing.first_publish_year = book_in.first_publish_year
            existing.cover_url = book_in.cover_url or existing.cover_url
            existing.description = book_in.description or existing.description
            existing.edition_count = book_in.edition_count
            existing.subjects = book_in.subjects or existing.subjects
            await db.commit()
            await db.refresh(existing)
            return existing

        return await self.create(db, book_in)

    async def list_books(self, db: AsyncSession, skip: int = 0, limit: int = 20) -> List[Book]:
        statement = select(Book).offset(skip).limit(limit).order_by(Book.created_at.desc())
        result = await db.execute(statement)
        return list(result.scalars().all())


book_repository = BookRepository()
