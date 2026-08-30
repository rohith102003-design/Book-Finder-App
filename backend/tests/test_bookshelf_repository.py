import uuid
import pytest
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.bookshelf import BookshelfItem
from app.repositories.book_repository import book_repository
from app.repositories.bookshelf_repository import bookshelf_repository
from app.repositories.user_repository import user_repository
from app.schemas.book import BookCreate
from app.schemas.bookshelf import (
    BookshelfItemCreate,
    BookshelfProgressUpdate,
    BookshelfStatusUpdate,
    ReadingStatus,
)


@pytest.fixture
async def sample_user(db_session: AsyncSession):
    return await user_repository.create(
        db_session,
        email="bookshelf_user@example.com",
        username="bookshelf_user",
        password_hash="$2b$12$somehashplaceholder",
    )


@pytest.fixture
async def secondary_user(db_session: AsyncSession):
    return await user_repository.create(
        db_session,
        email="other_user@example.com",
        username="other_user",
        password_hash="$2b$12$somehashplaceholder",
    )


@pytest.fixture
async def sample_book(db_session: AsyncSession):
    book_in = BookCreate(
        openlibrary_work_id="OL_SHELF_001W",
        title="The Hobbit",
        authors=["J.R.R. Tolkien"],
        first_publish_year=1937,
        cover_url="https://covers.openlibrary.org/b/id/123.jpg",
        description="A fantasy novel.",
        edition_count=50,
        subjects=["Fantasy", "Adventure"],
    )
    return await book_repository.upsert_by_openlibrary_id(db_session, book_in)


@pytest.fixture
async def secondary_book(db_session: AsyncSession):
    book_in = BookCreate(
        openlibrary_work_id="OL_SHELF_002W",
        title="Dune",
        authors=["Frank Herbert"],
        first_publish_year=1965,
        cover_url="https://covers.openlibrary.org/b/id/456.jpg",
        description="A sci-fi epic.",
        edition_count=30,
        subjects=["Sci-Fi", "Space"],
    )
    return await book_repository.upsert_by_openlibrary_id(db_session, book_in)


@pytest.mark.asyncio
async def test_create_bookshelf_item_successfully(db_session: AsyncSession, sample_user, sample_book):
    item = await bookshelf_repository.create(
        db_session,
        user_id=sample_user.id,
        book_id=sample_book.id,
        status="WANT_TO_READ",
        current_page=0,
        total_pages=310,
        notes="Excited to read!",
        rating=5,
    )

    assert item.id is not None
    assert item.user_id == sample_user.id
    assert item.book_id == sample_book.id
    assert item.status == "WANT_TO_READ"
    assert item.current_page == 0
    assert item.total_pages == 310
    assert item.notes == "Excited to read!"
    assert item.rating == 5
    assert item.book.title == "The Hobbit"


@pytest.mark.asyncio
async def test_get_by_id_for_correct_user(db_session: AsyncSession, sample_user, sample_book):
    created = await bookshelf_repository.create(
        db_session,
        user_id=sample_user.id,
        book_id=sample_book.id,
        status="READING",
        current_page=50,
        total_pages=310,
    )

    fetched = await bookshelf_repository.get_by_id(db_session, created.id, sample_user.id)
    assert fetched is not None
    assert fetched.id == created.id
    assert fetched.user_id == sample_user.id
    assert fetched.book.openlibrary_work_id == "OL_SHELF_001W"


@pytest.mark.asyncio
async def test_get_by_id_returns_none_for_different_user(
    db_session: AsyncSession, sample_user, secondary_user, sample_book
):
    created = await bookshelf_repository.create(
        db_session,
        user_id=sample_user.id,
        book_id=sample_book.id,
        status="READING",
    )

    # Attempt to fetch User A's item using User B's user_id
    cross_user_fetch = await bookshelf_repository.get_by_id(
        db_session, created.id, secondary_user.id
    )
    assert cross_user_fetch is None


@pytest.mark.asyncio
async def test_get_by_user_and_book_found_and_not_found(
    db_session: AsyncSession, sample_user, sample_book, secondary_book
):
    await bookshelf_repository.create(
        db_session,
        user_id=sample_user.id,
        book_id=sample_book.id,
        status="WANT_TO_READ",
    )

    # Found
    found = await bookshelf_repository.get_by_user_and_book(
        db_session, sample_user.id, sample_book.id
    )
    assert found is not None
    assert found.book_id == sample_book.id

    # Not found
    not_found = await bookshelf_repository.get_by_user_and_book(
        db_session, sample_user.id, secondary_book.id
    )
    assert not_found is None


@pytest.mark.asyncio
async def test_list_by_user_isolation(
    db_session: AsyncSession, sample_user, secondary_user, sample_book, secondary_book
):
    # User 1 has book 1
    await bookshelf_repository.create(
        db_session,
        user_id=sample_user.id,
        book_id=sample_book.id,
        status="WANT_TO_READ",
    )

    # User 2 has book 2
    await bookshelf_repository.create(
        db_session,
        user_id=secondary_user.id,
        book_id=secondary_book.id,
        status="READING",
    )

    user1_items = await bookshelf_repository.list_by_user(db_session, sample_user.id)
    assert len(user1_items) == 1
    assert user1_items[0].book_id == sample_book.id

    user2_items = await bookshelf_repository.list_by_user(db_session, secondary_user.id)
    assert len(user2_items) == 1
    assert user2_items[0].book_id == secondary_book.id


@pytest.mark.asyncio
async def test_list_by_user_filtered_by_status(
    db_session: AsyncSession, sample_user, sample_book, secondary_book
):
    await bookshelf_repository.create(
        db_session,
        user_id=sample_user.id,
        book_id=sample_book.id,
        status="WANT_TO_READ",
    )
    await bookshelf_repository.create(
        db_session,
        user_id=sample_user.id,
        book_id=secondary_book.id,
        status="COMPLETED",
    )

    want_to_read = await bookshelf_repository.list_by_user(
        db_session, sample_user.id, status="WANT_TO_READ"
    )
    assert len(want_to_read) == 1
    assert want_to_read[0].book_id == sample_book.id

    completed = await bookshelf_repository.list_by_user(
        db_session, sample_user.id, status="COMPLETED"
    )
    assert len(completed) == 1
    assert completed[0].book_id == secondary_book.id

    reading = await bookshelf_repository.list_by_user(
        db_session, sample_user.id, status="READING"
    )
    assert len(reading) == 0


@pytest.mark.asyncio
async def test_update_bookshelf_item(db_session: AsyncSession, sample_user, sample_book):
    item = await bookshelf_repository.create(
        db_session,
        user_id=sample_user.id,
        book_id=sample_book.id,
        status="WANT_TO_READ",
        current_page=0,
        total_pages=300,
    )

    item.status = "READING"
    item.current_page = 150
    updated = await bookshelf_repository.update(db_session, item)

    assert updated.status == "READING"
    assert updated.current_page == 150


@pytest.mark.asyncio
async def test_delete_bookshelf_item(db_session: AsyncSession, sample_user, sample_book):
    item = await bookshelf_repository.create(
        db_session,
        user_id=sample_user.id,
        book_id=sample_book.id,
        status="WANT_TO_READ",
    )

    await bookshelf_repository.delete(db_session, item)

    fetched = await bookshelf_repository.get_by_id(db_session, item.id, sample_user.id)
    assert fetched is None


@pytest.mark.asyncio
async def test_duplicate_user_book_rejected(db_session: AsyncSession, sample_user, sample_book):
    await bookshelf_repository.create(
        db_session,
        user_id=sample_user.id,
        book_id=sample_book.id,
        status="WANT_TO_READ",
    )

    with pytest.raises(IntegrityError):
        await bookshelf_repository.create(
            db_session,
            user_id=sample_user.id,
            book_id=sample_book.id,
            status="READING",
        )
    await db_session.rollback()


def test_schema_validations():
    # Valid creation
    valid = BookshelfItemCreate(
        openlibrary_work_id="OL123W",
        title="Test Book",
        status=ReadingStatus.WANT_TO_READ,
        current_page=10,
        total_pages=100,
        rating=4,
    )
    assert valid.current_page == 10
    assert valid.rating == 4

    # Negative page
    with pytest.raises(ValidationError):
        BookshelfItemCreate(
            openlibrary_work_id="OL123W",
            title="Test Book",
            current_page=-1,
        )

    # Invalid rating (> 5)
    with pytest.raises(ValidationError):
        BookshelfItemCreate(
            openlibrary_work_id="OL123W",
            title="Test Book",
            rating=6,
        )

    # Invalid status
    with pytest.raises(ValidationError):
        BookshelfStatusUpdate(status="INVALID_STATUS")  # type: ignore

    # Negative progress page
    with pytest.raises(ValidationError):
        BookshelfProgressUpdate(current_page=-5)
