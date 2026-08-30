import uuid
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    BookshelfItemNotFoundError,
    DuplicateBookshelfItemError,
    InvalidReadingProgressError,
)
from app.repositories.user_repository import user_repository
from app.schemas.bookshelf import BookshelfItemCreate, ReadingStatus
from app.services.bookshelf_service import bookshelf_service


@pytest.fixture
async def user_a(db_session: AsyncSession):
    return await user_repository.create(
        db_session,
        email="user_a@example.com",
        username="user_a",
        password_hash="$2b$12$somehashplaceholder",
    )


@pytest.fixture
async def user_b(db_session: AsyncSession):
    return await user_repository.create(
        db_session,
        email="user_b@example.com",
        username="user_b",
        password_hash="$2b$12$somehashplaceholder",
    )


@pytest.mark.asyncio
async def test_add_book_to_bookshelf_success(db_session: AsyncSession, user_a):
    item_in = BookshelfItemCreate(
        openlibrary_work_id="OL_SERVICE_001W",
        title="Foundation",
        authors=["Isaac Asimov"],
        first_publish_year=1951,
        edition_count=25,
        subjects=["Sci-Fi"],
        status=ReadingStatus.WANT_TO_READ,
        current_page=0,
        total_pages=250,
        notes="Classic sci-fi",
        rating=5,
    )

    result = await bookshelf_service.add_book_to_bookshelf(db_session, user_a.id, item_in)

    assert result.id is not None
    assert result.user_id == user_a.id
    assert result.book.openlibrary_work_id == "OL_SERVICE_001W"
    assert result.book.title == "Foundation"
    assert result.status == ReadingStatus.WANT_TO_READ
    assert result.progress_percentage == 0.0
    assert result.started_at is None
    assert result.completed_at is None


@pytest.mark.asyncio
async def test_add_book_creates_book_when_not_exists(db_session: AsyncSession, user_a):
    item_in = BookshelfItemCreate(
        openlibrary_work_id="OL_NEW_BOOK_999W",
        title="Hyperion",
        authors=["Dan Simmons"],
        status=ReadingStatus.WANT_TO_READ,
    )

    result = await bookshelf_service.add_book_to_bookshelf(db_session, user_a.id, item_in)
    assert result.book.title == "Hyperion"


@pytest.mark.asyncio
async def test_duplicate_bookshelf_item_raises_error(db_session: AsyncSession, user_a):
    item_in = BookshelfItemCreate(
        openlibrary_work_id="OL_DUP_001W",
        title="Dune",
        authors=["Frank Herbert"],
    )

    await bookshelf_service.add_book_to_bookshelf(db_session, user_a.id, item_in)

    with pytest.raises(DuplicateBookshelfItemError):
        await bookshelf_service.add_book_to_bookshelf(db_session, user_a.id, item_in)


@pytest.mark.asyncio
async def test_invalid_current_page_greater_than_total_raises_error(db_session: AsyncSession, user_a):
    item_in = BookshelfItemCreate(
        openlibrary_work_id="OL_INVALID_PROGRESS_001W",
        title="Neuromancer",
        authors=["William Gibson"],
        current_page=300,
        total_pages=200,
    )

    with pytest.raises(InvalidReadingProgressError):
        await bookshelf_service.add_book_to_bookshelf(db_session, user_a.id, item_in)


@pytest.mark.asyncio
async def test_adding_book_with_want_to_read_timestamps_unset(db_session: AsyncSession, user_a):
    item_in = BookshelfItemCreate(
        openlibrary_work_id="OL_WANT_001W",
        title="Snow Crash",
        status=ReadingStatus.WANT_TO_READ,
    )

    result = await bookshelf_service.add_book_to_bookshelf(db_session, user_a.id, item_in)
    assert result.started_at is None
    assert result.completed_at is None


@pytest.mark.asyncio
async def test_adding_book_as_reading_sets_started_at(db_session: AsyncSession, user_a):
    item_in = BookshelfItemCreate(
        openlibrary_work_id="OL_READING_001W",
        title="1984",
        status=ReadingStatus.READING,
    )

    result = await bookshelf_service.add_book_to_bookshelf(db_session, user_a.id, item_in)
    assert result.started_at is not None
    assert result.completed_at is None


@pytest.mark.asyncio
async def test_adding_book_as_completed_sets_completed_at_and_max_pages(db_session: AsyncSession, user_a):
    item_in = BookshelfItemCreate(
        openlibrary_work_id="OL_COMPLETED_001W",
        title="Brave New World",
        status=ReadingStatus.COMPLETED,
        current_page=50,
        total_pages=280,
    )

    result = await bookshelf_service.add_book_to_bookshelf(db_session, user_a.id, item_in)
    assert result.completed_at is not None
    assert result.current_page == 280  # Automatically filled to total_pages
    assert result.progress_percentage == 100.0


@pytest.mark.asyncio
async def test_updating_status_want_to_read_to_reading_sets_started_at(db_session: AsyncSession, user_a):
    item_in = BookshelfItemCreate(
        openlibrary_work_id="OL_TRANSITION_001W",
        title="Fahrenheit 451",
        status=ReadingStatus.WANT_TO_READ,
    )
    created = await bookshelf_service.add_book_to_bookshelf(db_session, user_a.id, item_in)
    assert created.started_at is None

    updated = await bookshelf_service.update_status(
        db_session, created.id, user_a.id, ReadingStatus.READING
    )
    assert updated.status == ReadingStatus.READING
    assert updated.started_at is not None


@pytest.mark.asyncio
async def test_updating_status_reading_to_completed_sets_completed_at(db_session: AsyncSession, user_a):
    item_in = BookshelfItemCreate(
        openlibrary_work_id="OL_TRANSITION_002W",
        title="The Martian",
        status=ReadingStatus.READING,
        total_pages=360,
    )
    created = await bookshelf_service.add_book_to_bookshelf(db_session, user_a.id, item_in)

    updated = await bookshelf_service.update_status(
        db_session, created.id, user_a.id, ReadingStatus.COMPLETED
    )
    assert updated.status == ReadingStatus.COMPLETED
    assert updated.completed_at is not None
    assert updated.current_page == 360
    assert updated.progress_percentage == 100.0


@pytest.mark.asyncio
async def test_updating_status_completed_to_reading_clears_completed_at(db_session: AsyncSession, user_a):
    item_in = BookshelfItemCreate(
        openlibrary_work_id="OL_TRANSITION_003W",
        title="Project Hail Mary",
        status=ReadingStatus.COMPLETED,
        total_pages=400,
    )
    created = await bookshelf_service.add_book_to_bookshelf(db_session, user_a.id, item_in)
    assert created.completed_at is not None

    updated = await bookshelf_service.update_status(
        db_session, created.id, user_a.id, ReadingStatus.READING
    )
    assert updated.status == ReadingStatus.READING
    assert updated.completed_at is None


@pytest.mark.asyncio
async def test_update_progress_success(db_session: AsyncSession, user_a):
    item_in = BookshelfItemCreate(
        openlibrary_work_id="OL_PROG_001W",
        title="Children of Time",
        total_pages=500,
        status=ReadingStatus.WANT_TO_READ,
    )
    created = await bookshelf_service.add_book_to_bookshelf(db_session, user_a.id, item_in)

    updated = await bookshelf_service.update_progress(
        db_session, created.id, user_a.id, current_page=250
    )
    assert updated.current_page == 250
    assert updated.progress_percentage == 50.0
    assert updated.status == ReadingStatus.READING
    assert updated.started_at is not None


@pytest.mark.asyncio
async def test_update_progress_exceeding_total_raises_error(db_session: AsyncSession, user_a):
    item_in = BookshelfItemCreate(
        openlibrary_work_id="OL_PROG_002W",
        title="Leviathan Wakes",
        total_pages=400,
    )
    created = await bookshelf_service.add_book_to_bookshelf(db_session, user_a.id, item_in)

    with pytest.raises(InvalidReadingProgressError):
        await bookshelf_service.update_progress(
            db_session, created.id, user_a.id, current_page=450
        )


@pytest.mark.asyncio
async def test_reaching_total_pages_auto_completes(db_session: AsyncSession, user_a):
    item_in = BookshelfItemCreate(
        openlibrary_work_id="OL_PROG_003W",
        title="Caliban's War",
        total_pages=400,
        status=ReadingStatus.READING,
    )
    created = await bookshelf_service.add_book_to_bookshelf(db_session, user_a.id, item_in)

    updated = await bookshelf_service.update_progress(
        db_session, created.id, user_a.id, current_page=400
    )
    assert updated.status == ReadingStatus.COMPLETED
    assert updated.completed_at is not None
    assert updated.progress_percentage == 100.0


@pytest.mark.asyncio
async def test_reducing_progress_from_completed_reverts_to_reading(db_session: AsyncSession, user_a):
    item_in = BookshelfItemCreate(
        openlibrary_work_id="OL_PROG_004W",
        title="Abaddon's Gate",
        total_pages=400,
        status=ReadingStatus.COMPLETED,
    )
    created = await bookshelf_service.add_book_to_bookshelf(db_session, user_a.id, item_in)

    updated = await bookshelf_service.update_progress(
        db_session, created.id, user_a.id, current_page=350
    )
    assert updated.status == ReadingStatus.READING
    assert updated.completed_at is None
    assert updated.progress_percentage == 87.5


def test_progress_percentage_calculations():
    assert bookshelf_service.calculate_progress_percentage(50, 100) == 50.0
    assert bookshelf_service.calculate_progress_percentage(0, 300) == 0.0
    assert bookshelf_service.calculate_progress_percentage(300, 300) == 100.0
    assert bookshelf_service.calculate_progress_percentage(1, 3) == 33.33
    # Division by zero safety
    assert bookshelf_service.calculate_progress_percentage(50, 0) == 0.0
    assert bookshelf_service.calculate_progress_percentage(0, 0) == 0.0


@pytest.mark.asyncio
async def test_cross_user_access_raises_not_found(db_session: AsyncSession, user_a, user_b):
    item_in = BookshelfItemCreate(
        openlibrary_work_id="OL_CROSS_001W",
        title="User A Private Book",
    )
    created = await bookshelf_service.add_book_to_bookshelf(db_session, user_a.id, item_in)

    # User B tries to read
    with pytest.raises(BookshelfItemNotFoundError):
        await bookshelf_service.get_bookshelf_item(db_session, created.id, user_b.id)

    # User B tries to update status
    with pytest.raises(BookshelfItemNotFoundError):
        await bookshelf_service.update_status(
            db_session, created.id, user_b.id, ReadingStatus.COMPLETED
        )

    # User B tries to update progress
    with pytest.raises(BookshelfItemNotFoundError):
        await bookshelf_service.update_progress(
            db_session, created.id, user_b.id, current_page=100
        )

    # User B tries to delete
    with pytest.raises(BookshelfItemNotFoundError):
        await bookshelf_service.remove_from_bookshelf(db_session, created.id, user_b.id)


@pytest.mark.asyncio
async def test_list_bookshelf_and_aggregates(db_session: AsyncSession, user_a):
    await bookshelf_service.add_book_to_bookshelf(
        db_session,
        user_a.id,
        BookshelfItemCreate(openlibrary_work_id="OL_LIST_1", title="Book 1", status=ReadingStatus.WANT_TO_READ),
    )
    await bookshelf_service.add_book_to_bookshelf(
        db_session,
        user_a.id,
        BookshelfItemCreate(openlibrary_work_id="OL_LIST_2", title="Book 2", status=ReadingStatus.READING),
    )
    await bookshelf_service.add_book_to_bookshelf(
        db_session,
        user_a.id,
        BookshelfItemCreate(openlibrary_work_id="OL_LIST_3", title="Book 3", status=ReadingStatus.COMPLETED),
    )

    full_list = await bookshelf_service.list_bookshelf(db_session, user_a.id)
    assert full_list.total == 3
    assert full_list.want_to_read_count == 1
    assert full_list.reading_count == 1
    assert full_list.completed_count == 1
    assert len(full_list.items) == 3

    # Filtered
    reading_only = await bookshelf_service.list_bookshelf(
        db_session, user_a.id, status=ReadingStatus.READING
    )
    assert reading_only.total == 3  # Total remains overall count
    assert len(reading_only.items) == 1
    assert reading_only.items[0].book.title == "Book 2"


@pytest.mark.asyncio
async def test_remove_from_bookshelf(db_session: AsyncSession, user_a):
    item_in = BookshelfItemCreate(
        openlibrary_work_id="OL_REMOVE_001W",
        title="Book to Delete",
    )
    created = await bookshelf_service.add_book_to_bookshelf(db_session, user_a.id, item_in)

    await bookshelf_service.remove_from_bookshelf(db_session, created.id, user_a.id)

    with pytest.raises(BookshelfItemNotFoundError):
        await bookshelf_service.get_bookshelf_item(db_session, created.id, user_a.id)
