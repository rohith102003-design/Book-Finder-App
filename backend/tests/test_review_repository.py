import uuid
import pytest
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.review import Review
from app.repositories.book_repository import book_repository
from app.repositories.review_repository import review_repository
from app.repositories.user_repository import user_repository
from app.schemas.book import BookCreate
from app.schemas.review import ReviewCreate, ReviewUpdate


@pytest.fixture
async def user_reviewer(db_session: AsyncSession):
    return await user_repository.create(
        db_session,
        email="reviewer@example.com",
        username="reviewer_one",
        password_hash="$2b$12$somehashplaceholder",
    )


@pytest.fixture
async def second_reviewer(db_session: AsyncSession):
    return await user_repository.create(
        db_session,
        email="second_reviewer@example.com",
        username="reviewer_two",
        password_hash="$2b$12$somehashplaceholder",
    )


@pytest.fixture
async def reviewed_book(db_session: AsyncSession):
    book_in = BookCreate(
        openlibrary_work_id="OL_REVIEW_001W",
        title="Project Hail Mary",
        authors=["Andy Weir"],
        first_publish_year=2021,
        edition_count=10,
        subjects=["Sci-Fi", "Space"],
    )
    return await book_repository.upsert_by_openlibrary_id(db_session, book_in)


@pytest.mark.asyncio
async def test_create_review_successfully(db_session: AsyncSession, user_reviewer, reviewed_book):
    review = await review_repository.create(
        db_session,
        user_id=user_reviewer.id,
        book_id=reviewed_book.id,
        rating=5,
        title="Masterpiece!",
        content="Incredible sci-fi adventure from start to finish.",
        contains_spoilers=False,
    )

    assert review.id is not None
    assert review.user_id == user_reviewer.id
    assert review.book_id == reviewed_book.id
    assert review.rating == 5
    assert review.title == "Masterpiece!"
    assert review.content == "Incredible sci-fi adventure from start to finish."
    assert review.contains_spoilers is False
    assert review.likes_count == 0
    assert review.user.username == "reviewer_one"
    assert review.book.title == "Project Hail Mary"


@pytest.mark.asyncio
async def test_get_review_by_id(db_session: AsyncSession, user_reviewer, reviewed_book):
    created = await review_repository.create(
        db_session,
        user_id=user_reviewer.id,
        book_id=reviewed_book.id,
        rating=4,
        content="Great pacing and characters.",
    )

    fetched = await review_repository.get_by_id(db_session, created.id)
    assert fetched is not None
    assert fetched.id == created.id
    assert fetched.user.username == "reviewer_one"


@pytest.mark.asyncio
async def test_get_by_user_and_book(db_session: AsyncSession, user_reviewer, second_reviewer, reviewed_book):
    await review_repository.create(
        db_session,
        user_id=user_reviewer.id,
        book_id=reviewed_book.id,
        rating=5,
        content="Loved it.",
    )

    # Found for user_reviewer
    found = await review_repository.get_by_user_and_book(db_session, user_reviewer.id, reviewed_book.id)
    assert found is not None
    assert found.rating == 5

    # Not found for second_reviewer
    not_found = await review_repository.get_by_user_and_book(db_session, second_reviewer.id, reviewed_book.id)
    assert not_found is None


@pytest.mark.asyncio
async def test_list_reviews_by_book_and_pagination(
    db_session: AsyncSession, user_reviewer, second_reviewer, reviewed_book
):
    await review_repository.create(
        db_session,
        user_id=user_reviewer.id,
        book_id=reviewed_book.id,
        rating=5,
        content="First review.",
    )
    await review_repository.create(
        db_session,
        user_id=second_reviewer.id,
        book_id=reviewed_book.id,
        rating=3,
        content="Second review.",
    )

    reviews = await review_repository.list_by_book(db_session, reviewed_book.id, skip=0, limit=10)
    assert len(reviews) == 2

    # Test pagination limit 1
    page1 = await review_repository.list_by_book(db_session, reviewed_book.id, skip=0, limit=1)
    assert len(page1) == 1


@pytest.mark.asyncio
async def test_get_book_rating_stats_aggregation(
    db_session: AsyncSession, user_reviewer, second_reviewer, reviewed_book
):
    # Review 1: 5 stars
    await review_repository.create(
        db_session,
        user_id=user_reviewer.id,
        book_id=reviewed_book.id,
        rating=5,
        content="Five star review.",
    )
    # Review 2: 3 stars
    await review_repository.create(
        db_session,
        user_id=second_reviewer.id,
        book_id=reviewed_book.id,
        rating=3,
        content="Three star review.",
    )

    stats = await review_repository.get_book_rating_stats(db_session, reviewed_book.id)
    assert stats["total_reviews"] == 2
    assert stats["average_rating"] == 4.0
    assert stats["five_star"] == 1
    assert stats["three_star"] == 1
    assert stats["one_star"] == 0
    assert stats["two_star"] == 0
    assert stats["four_star"] == 0


@pytest.mark.asyncio
async def test_update_review(db_session: AsyncSession, user_reviewer, reviewed_book):
    review = await review_repository.create(
        db_session,
        user_id=user_reviewer.id,
        book_id=reviewed_book.id,
        rating=3,
        content="Initial thoughts.",
    )

    review.rating = 5
    review.title = "Updated Thoughts"
    review.content = "Changed my mind, loved it!"
    updated = await review_repository.update(db_session, review)

    assert updated.rating == 5
    assert updated.title == "Updated Thoughts"
    assert updated.content == "Changed my mind, loved it!"


@pytest.mark.asyncio
async def test_delete_review(db_session: AsyncSession, user_reviewer, reviewed_book):
    review = await review_repository.create(
        db_session,
        user_id=user_reviewer.id,
        book_id=reviewed_book.id,
        rating=4,
        content="To be deleted.",
    )

    await review_repository.delete(db_session, review)

    fetched = await review_repository.get_by_id(db_session, review.id)
    assert fetched is None


@pytest.mark.asyncio
async def test_duplicate_user_book_review_rejected(db_session: AsyncSession, user_reviewer, reviewed_book):
    await review_repository.create(
        db_session,
        user_id=user_reviewer.id,
        book_id=reviewed_book.id,
        rating=5,
        content="Original review.",
    )

    with pytest.raises(IntegrityError):
        await review_repository.create(
            db_session,
            user_id=user_reviewer.id,
            book_id=reviewed_book.id,
            rating=4,
            content="Duplicate review attempt.",
        )
    await db_session.rollback()


def test_review_schema_validation():
    # Valid
    valid = ReviewCreate(
        openlibrary_work_id="OL123W",
        rating=5,
        title="Great Read",
        content="A fantastic book with rich lore.",
        contains_spoilers=True,
    )
    assert valid.rating == 5

    # Rating < 1
    with pytest.raises(ValidationError):
        ReviewCreate(openlibrary_work_id="OL123W", rating=0, content="Valid text.")

    # Rating > 5
    with pytest.raises(ValidationError):
        ReviewCreate(openlibrary_work_id="OL123W", rating=6, content="Valid text.")

    # Content < 5 characters
    with pytest.raises(ValidationError):
        ReviewCreate(openlibrary_work_id="OL123W", rating=5, content="Bad")

    # Title > 200 characters
    with pytest.raises(ValidationError):
        ReviewCreate(openlibrary_work_id="OL123W", rating=5, title="x" * 201, content="Valid text.")
