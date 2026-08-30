from datetime import datetime, timezone
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException, ReadingGoalNotFoundError
from app.repositories.book_repository import book_repository
from app.repositories.bookshelf_repository import bookshelf_repository
from app.repositories.review_repository import review_repository
from app.repositories.user_repository import user_repository
from app.schemas.analytics import ReadingGoalCreate, ReadingGoalUpdate
from app.schemas.book import BookCreate
from app.services.reading_analytics_service import reading_analytics_service


@pytest.fixture
async def analytics_user(db_session: AsyncSession):
    return await user_repository.create(
        db_session,
        email="analytics_user@example.com",
        username="data_reader",
        password_hash="$2b$12$somehashplaceholder",
    )


@pytest.fixture
async def second_analytics_user(db_session: AsyncSession):
    return await user_repository.create(
        db_session,
        email="other_analytics@example.com",
        username="other_reader",
        password_hash="$2b$12$somehashplaceholder",
    )


@pytest.fixture
async def book_one(db_session: AsyncSession):
    return await book_repository.upsert_by_openlibrary_id(
        db_session,
        BookCreate(
            openlibrary_work_id="OL_ANALYTICS_001W",
            title="Dune",
            authors=["Frank Herbert"],
            subjects=["Sci-Fi", "Space"],
        ),
    )


@pytest.fixture
async def book_two(db_session: AsyncSession):
    return await book_repository.upsert_by_openlibrary_id(
        db_session,
        BookCreate(
            openlibrary_work_id="OL_ANALYTICS_002W",
            title="Hyperion",
            authors=["Dan Simmons"],
            subjects=["Sci-Fi", "Philosophy"],
        ),
    )


def test_goal_progress_math():
    assert reading_analytics_service.calculate_goal_progress(10, 20) == 50.0
    assert reading_analytics_service.calculate_goal_progress(20, 20) == 100.0
    assert reading_analytics_service.calculate_goal_progress(25, 20) == 100.0  # Clamped
    assert reading_analytics_service.calculate_goal_progress(0, 20) == 0.0
    assert reading_analytics_service.calculate_goal_progress(10, 0) == 0.0  # Zero division safe


@pytest.mark.asyncio
async def test_create_and_get_reading_goal(db_session: AsyncSession, analytics_user):
    goal_in = ReadingGoalCreate(year=2026, target_books=20)
    created = await reading_analytics_service.create_reading_goal(db_session, analytics_user, goal_in)

    assert created.id is not None
    assert created.year == 2026
    assert created.target_books == 20
    assert created.completed_books == 0
    assert created.progress_percentage == 0.0
    assert created.is_completed is False

    fetched = await reading_analytics_service.get_reading_goal(db_session, analytics_user.id, 2026)
    assert fetched is not None
    assert fetched.id == created.id


@pytest.mark.asyncio
async def test_create_duplicate_reading_goal_rejected(db_session: AsyncSession, analytics_user):
    goal_in = ReadingGoalCreate(year=2026, target_books=20)
    await reading_analytics_service.create_reading_goal(db_session, analytics_user, goal_in)

    with pytest.raises(AppException) as exc_info:
        await reading_analytics_service.create_reading_goal(db_session, analytics_user, goal_in)
    assert exc_info.value.status_code == 409
    assert exc_info.value.code == "DUPLICATE_READING_GOAL"


@pytest.mark.asyncio
async def test_update_and_delete_reading_goal(db_session: AsyncSession, analytics_user):
    goal_in = ReadingGoalCreate(year=2026, target_books=15)
    await reading_analytics_service.create_reading_goal(db_session, analytics_user, goal_in)

    updated = await reading_analytics_service.update_reading_goal(
        db_session, analytics_user, 2026, ReadingGoalUpdate(target_books=30)
    )
    assert updated.target_books == 30

    await reading_analytics_service.delete_reading_goal(db_session, analytics_user, 2026)
    fetched = await reading_analytics_service.get_reading_goal(db_session, analytics_user.id, 2026)
    assert fetched is None


@pytest.mark.asyncio
async def test_update_nonexistent_goal_raises_not_found(db_session: AsyncSession, analytics_user):
    with pytest.raises(ReadingGoalNotFoundError):
        await reading_analytics_service.update_reading_goal(
            db_session, analytics_user, 2099, ReadingGoalUpdate(target_books=10)
        )


@pytest.mark.asyncio
async def test_analytics_overview_calculations(
    db_session: AsyncSession, analytics_user, second_analytics_user, book_one, book_two
):
    # Set up goal for 2026: 2 books
    await reading_analytics_service.create_reading_goal(
        db_session, analytics_user, ReadingGoalCreate(year=2026, target_books=2)
    )

    # 1. Complete book 1 in March 2026 (300 pages)
    march_date = datetime(2026, 3, 15, 12, 0, 0, tzinfo=timezone.utc)
    item1 = await bookshelf_repository.create(
        db_session,
        user_id=analytics_user.id,
        book_id=book_one.id,
        status="COMPLETED",
        total_pages=300,
        current_page=300,
    )
    item1.completed_at = march_date
    await db_session.commit()

    # 2. Complete book 2 in June 2026 (500 pages)
    june_date = datetime(2026, 6, 20, 15, 0, 0, tzinfo=timezone.utc)
    item2 = await bookshelf_repository.create(
        db_session,
        user_id=analytics_user.id,
        book_id=book_two.id,
        status="COMPLETED",
        total_pages=500,
        current_page=500,
    )
    item2.completed_at = june_date
    await db_session.commit()

    # 3. Add a review with rating 5 for book 1
    await review_repository.create(
        db_session,
        user_id=analytics_user.id,
        book_id=book_one.id,
        rating=5,
        content="Loved Dune!",
    )

    # Other user completes a book (must NOT leak into analytics_user)
    other_item = await bookshelf_repository.create(
        db_session,
        user_id=second_analytics_user.id,
        book_id=book_one.id,
        status="COMPLETED",
        total_pages=1000,
        current_page=1000,
    )
    other_item.completed_at = march_date
    await db_session.commit()

    # Fetch analytics
    overview = await reading_analytics_service.get_analytics_overview(
        db_session, analytics_user, year=2026
    )

    # Assertions
    assert overview.total_books_completed == 2
    assert overview.total_pages_read == 800
    assert overview.average_personal_rating == 5.0

    # Goal assertions (2 out of 2 completed -> 100%)
    assert overview.active_goal is not None
    assert overview.active_goal.completed_books == 2
    assert overview.active_goal.progress_percentage == 100.0
    assert overview.active_goal.is_completed is True

    # Monthly breakdown (12 months)
    assert len(overview.monthly_breakdown) == 12
    march_stat = next(m for m in overview.monthly_breakdown if m.month == 3)
    assert march_stat.books_completed == 1
    assert march_stat.pages_read == 300

    june_stat = next(m for m in overview.monthly_breakdown if m.month == 6)
    assert june_stat.books_completed == 1
    assert june_stat.pages_read == 500

    jan_stat = next(m for m in overview.monthly_breakdown if m.month == 1)
    assert jan_stat.books_completed == 0
    assert jan_stat.pages_read == 0

    # Genre stats
    sci_fi_genre = next(g for g in overview.top_genres if g.genre == "Sci-Fi")
    assert sci_fi_genre.count == 2
