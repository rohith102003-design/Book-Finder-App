import pytest
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.reading_goal import ReadingGoal
from app.repositories.reading_goal_repository import reading_goal_repository
from app.repositories.user_repository import user_repository
from app.schemas.analytics import (
    GenreStat,
    MonthlyReadingStat,
    ReadingGoalCreate,
    ReadingGoalUpdate,
)


@pytest.fixture
async def goal_user(db_session: AsyncSession):
    return await user_repository.create(
        db_session,
        email="goal_user@example.com",
        username="goal_reader",
        password_hash="$2b$12$somehashplaceholder",
    )


@pytest.fixture
async def second_goal_user(db_session: AsyncSession):
    return await user_repository.create(
        db_session,
        email="second_goal@example.com",
        username="second_goal_reader",
        password_hash="$2b$12$somehashplaceholder",
    )


@pytest.mark.asyncio
async def test_create_reading_goal_successfully(db_session: AsyncSession, goal_user):
    goal = await reading_goal_repository.create(
        db_session,
        user_id=goal_user.id,
        year=2026,
        target_books=25,
    )

    assert goal.id is not None
    assert goal.user_id == goal_user.id
    assert goal.year == 2026
    assert goal.target_books == 25


@pytest.mark.asyncio
async def test_get_reading_goal_by_user_and_year(
    db_session: AsyncSession, goal_user, second_goal_user
):
    await reading_goal_repository.create(
        db_session,
        user_id=goal_user.id,
        year=2026,
        target_books=30,
    )

    # Found
    found = await reading_goal_repository.get_by_user_and_year(db_session, goal_user.id, 2026)
    assert found is not None
    assert found.target_books == 30

    # Not found for different year
    not_found_year = await reading_goal_repository.get_by_user_and_year(db_session, goal_user.id, 2025)
    assert not_found_year is None

    # Not found for different user
    not_found_user = await reading_goal_repository.get_by_user_and_year(db_session, second_goal_user.id, 2026)
    assert not_found_user is None


@pytest.mark.asyncio
async def test_update_reading_goal(db_session: AsyncSession, goal_user):
    goal = await reading_goal_repository.create(
        db_session,
        user_id=goal_user.id,
        year=2026,
        target_books=20,
    )

    updated = await reading_goal_repository.update(db_session, goal, target_books=35)
    assert updated.target_books == 35


@pytest.mark.asyncio
async def test_delete_reading_goal(db_session: AsyncSession, goal_user):
    goal = await reading_goal_repository.create(
        db_session,
        user_id=goal_user.id,
        year=2026,
        target_books=15,
    )

    await reading_goal_repository.delete(db_session, goal)

    fetched = await reading_goal_repository.get_by_user_and_year(db_session, goal_user.id, 2026)
    assert fetched is None


@pytest.mark.asyncio
async def test_duplicate_user_year_goal_rejected(db_session: AsyncSession, goal_user):
    await reading_goal_repository.create(
        db_session,
        user_id=goal_user.id,
        year=2026,
        target_books=25,
    )

    with pytest.raises(IntegrityError):
        await reading_goal_repository.create(
            db_session,
            user_id=goal_user.id,
            year=2026,
            target_books=50,
        )
    await db_session.rollback()


def test_reading_goal_and_analytics_schemas_validation():
    # Valid goal create
    valid = ReadingGoalCreate(year=2026, target_books=20)
    assert valid.year == 2026
    assert valid.target_books == 20

    # Year < 2000
    with pytest.raises(ValidationError):
        ReadingGoalCreate(year=1999, target_books=10)

    # Year > 2100
    with pytest.raises(ValidationError):
        ReadingGoalCreate(year=2101, target_books=10)

    # Target books < 1
    with pytest.raises(ValidationError):
        ReadingGoalCreate(year=2026, target_books=0)

    # Valid goal update
    update_valid = ReadingGoalUpdate(target_books=30)
    assert update_valid.target_books == 30

    with pytest.raises(ValidationError):
        ReadingGoalUpdate(target_books=0)

    # Monthly stat validation: month 1-12
    monthly = MonthlyReadingStat(month=5, books_completed=3, pages_read=800)
    assert monthly.month == 5

    with pytest.raises(ValidationError):
        MonthlyReadingStat(month=0, books_completed=1, pages_read=100)

    with pytest.raises(ValidationError):
        MonthlyReadingStat(month=13, books_completed=1, pages_read=100)
