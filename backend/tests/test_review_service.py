import uuid
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import DuplicateReviewError, ReviewNotFoundError
from app.repositories.book_repository import book_repository
from app.repositories.bookshelf_repository import bookshelf_repository
from app.repositories.user_repository import user_repository
from app.schemas.book import BookCreate
from app.schemas.review import ReviewCreate, ReviewUpdate
from app.services.review_service import review_service


@pytest.fixture
async def reviewer_user(db_session: AsyncSession):
    return await user_repository.create(
        db_session,
        email="rev_user@example.com",
        username="reviewer_alice",
        password_hash="$2b$12$somehashplaceholder",
    )


@pytest.fixture
async def other_user(db_session: AsyncSession):
    return await user_repository.create(
        db_session,
        email="other_rev@example.com",
        username="reviewer_bob",
        password_hash="$2b$12$somehashplaceholder",
    )


@pytest.fixture
async def admin_user(db_session: AsyncSession):
    user = await user_repository.create(
        db_session,
        email="admin_mod@example.com",
        username="mod_admin",
        password_hash="$2b$12$somehashplaceholder",
    )
    user.role = "ADMIN"
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def catalog_book(db_session: AsyncSession):
    book_in = BookCreate(
        openlibrary_work_id="OL_REV_SVC_001W",
        title="Neuromancer",
        authors=["William Gibson"],
        first_publish_year=1984,
        edition_count=10,
        subjects=["Cyberpunk", "Sci-Fi"],
    )
    return await book_repository.upsert_by_openlibrary_id(db_session, book_in)


@pytest.mark.asyncio
async def test_create_review_success(db_session: AsyncSession, reviewer_user, catalog_book):
    review_in = ReviewCreate(
        openlibrary_work_id="OL_REV_SVC_001W",
        rating=5,
        title="Seminal Cyberpunk",
        content="The sky above the port was the color of television, tuned to a dead channel.",
        contains_spoilers=False,
    )

    result = await review_service.create_review(db_session, reviewer_user, review_in)

    assert result.id is not None
    assert result.user_id == reviewer_user.id
    assert result.book_id == catalog_book.id
    assert result.rating == 5
    assert result.title == "Seminal Cyberpunk"
    assert result.author.username == "reviewer_alice"
    assert result.author.is_verified_reader is False


@pytest.mark.asyncio
async def test_create_review_duplicate_raises_error(db_session: AsyncSession, reviewer_user, catalog_book):
    review_in = ReviewCreate(
        openlibrary_work_id="OL_REV_SVC_001W",
        rating=4,
        content="Great atmosphere and worldbuilding.",
    )
    await review_service.create_review(db_session, reviewer_user, review_in)

    with pytest.raises(DuplicateReviewError):
        await review_service.create_review(db_session, reviewer_user, review_in)


@pytest.mark.asyncio
async def test_verified_reader_true_when_completed(db_session: AsyncSession, reviewer_user, catalog_book):
    # Add book to bookshelf as COMPLETED
    await bookshelf_repository.create(
        db_session,
        user_id=reviewer_user.id,
        book_id=catalog_book.id,
        status="COMPLETED",
        total_pages=300,
        current_page=300,
    )

    review_in = ReviewCreate(
        openlibrary_work_id="OL_REV_SVC_001W",
        rating=5,
        content="Loved the entire journey.",
    )
    result = await review_service.create_review(db_session, reviewer_user, review_in)

    assert result.author.is_verified_reader is True


@pytest.mark.asyncio
async def test_verified_reader_false_when_not_completed(db_session: AsyncSession, reviewer_user, catalog_book):
    # Add book to bookshelf as READING (not COMPLETED)
    await bookshelf_repository.create(
        db_session,
        user_id=reviewer_user.id,
        book_id=catalog_book.id,
        status="READING",
        total_pages=300,
        current_page=150,
    )

    review_in = ReviewCreate(
        openlibrary_work_id="OL_REV_SVC_001W",
        rating=4,
        content="Halfway through, really enjoying it.",
    )
    result = await review_service.create_review(db_session, reviewer_user, review_in)

    assert result.author.is_verified_reader is False


@pytest.mark.asyncio
async def test_update_review_owner_success(db_session: AsyncSession, reviewer_user, catalog_book):
    created = await review_service.create_review(
        db_session,
        reviewer_user,
        ReviewCreate(
            openlibrary_work_id="OL_REV_SVC_001W",
            rating=3,
            content="Good but confusing in parts.",
        ),
    )

    updated = await review_service.update_review(
        db_session,
        created.id,
        reviewer_user,
        ReviewUpdate(rating=5, title="Re-read: Masterpiece!", content="Appreciated it so much more on re-reading."),
    )

    assert updated.rating == 5
    assert updated.title == "Re-read: Masterpiece!"
    assert updated.content == "Appreciated it so much more on re-reading."


@pytest.mark.asyncio
async def test_update_review_non_owner_raises_not_found(
    db_session: AsyncSession, reviewer_user, other_user, catalog_book
):
    created = await review_service.create_review(
        db_session,
        reviewer_user,
        ReviewCreate(
            openlibrary_work_id="OL_REV_SVC_001W",
            rating=4,
            content="Alice's private review thoughts.",
        ),
    )

    with pytest.raises(ReviewNotFoundError):
        await review_service.update_review(
            db_session,
            created.id,
            other_user,
            ReviewUpdate(rating=1),
        )


@pytest.mark.asyncio
async def test_delete_review_owner_success(db_session: AsyncSession, reviewer_user, catalog_book):
    created = await review_service.create_review(
        db_session,
        reviewer_user,
        ReviewCreate(
            openlibrary_work_id="OL_REV_SVC_001W",
            rating=4,
            content="To be deleted by Alice.",
        ),
    )

    await review_service.delete_review(db_session, created.id, reviewer_user)

    summary = await review_service.get_book_reviews(db_session, "OL_REV_SVC_001W")
    assert summary.total_reviews == 0


@pytest.mark.asyncio
async def test_delete_review_admin_moderation_success(
    db_session: AsyncSession, reviewer_user, admin_user, catalog_book
):
    created = await review_service.create_review(
        db_session,
        reviewer_user,
        ReviewCreate(
            openlibrary_work_id="OL_REV_SVC_001W",
            rating=1,
            content="Inappropriate spam text.",
        ),
    )

    # Admin deletes Alice's review
    await review_service.delete_review(db_session, created.id, admin_user)

    summary = await review_service.get_book_reviews(db_session, "OL_REV_SVC_001W")
    assert summary.total_reviews == 0


@pytest.mark.asyncio
async def test_delete_review_non_owner_non_admin_raises_not_found(
    db_session: AsyncSession, reviewer_user, other_user, catalog_book
):
    created = await review_service.create_review(
        db_session,
        reviewer_user,
        ReviewCreate(
            openlibrary_work_id="OL_REV_SVC_001W",
            rating=5,
            content="Protected review.",
        ),
    )

    # Bob tries to delete Alice's review
    with pytest.raises(ReviewNotFoundError):
        await review_service.delete_review(db_session, created.id, other_user)


@pytest.mark.asyncio
async def test_get_book_reviews_and_aggregates(
    db_session: AsyncSession, reviewer_user, other_user, catalog_book
):
    await review_service.create_review(
        db_session,
        reviewer_user,
        ReviewCreate(openlibrary_work_id="OL_REV_SVC_001W", rating=5, content="Five star rating."),
    )
    await review_service.create_review(
        db_session,
        other_user,
        ReviewCreate(openlibrary_work_id="OL_REV_SVC_001W", rating=3, content="Three star rating."),
    )

    summary = await review_service.get_book_reviews(db_session, "OL_REV_SVC_001W")
    assert summary.total_reviews == 2
    assert summary.average_rating == 4.0
    assert summary.rating_distribution.five_star == 1
    assert summary.rating_distribution.three_star == 1
    assert len(summary.reviews) == 2


@pytest.mark.asyncio
async def test_get_my_review(db_session: AsyncSession, reviewer_user, other_user, catalog_book):
    await review_service.create_review(
        db_session,
        reviewer_user,
        ReviewCreate(openlibrary_work_id="OL_REV_SVC_001W", rating=5, content="Alice's review."),
    )

    my_review = await review_service.get_my_review(db_session, reviewer_user, "OL_REV_SVC_001W")
    assert my_review is not None
    assert my_review.content == "Alice's review."

    other_my_review = await review_service.get_my_review(db_session, other_user, "OL_REV_SVC_001W")
    assert other_my_review is None
