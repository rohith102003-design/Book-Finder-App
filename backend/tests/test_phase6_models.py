import uuid
import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.book import Book
from app.models.user import User
from app.models.review import Review
from app.models.review_like import ReviewLike
from app.models.user_follow import UserFollow
from app.models.notification import Notification
from app.models.recommendation_profile import RecommendationProfile


@pytest.mark.asyncio
async def test_review_like_model_and_uniqueness(db_session: AsyncSession):
    # Setup test user, author, book, review
    user = User(
        email=f"liker_{uuid.uuid4().hex[:6]}@example.com",
        username=f"liker_{uuid.uuid4().hex[:6]}",
        password_hash="fakehash",
    )
    author = User(
        email=f"author_{uuid.uuid4().hex[:6]}@example.com",
        username=f"author_{uuid.uuid4().hex[:6]}",
        password_hash="fakehash",
    )
    book = Book(
        openlibrary_work_id=f"OL{uuid.uuid4().hex[:8]}W",
        title="Test Book for Likes",
        authors=["Author 1"],
    )
    db_session.add_all([user, author, book])
    await db_session.commit()

    user_id = user.id
    review = Review(
        user_id=author.id,
        book_id=book.id,
        rating=5,
        content="Superb book!",
    )
    db_session.add(review)
    await db_session.commit()
    review_id = review.id

    # Create first like
    like = ReviewLike(review_id=review_id, user_id=user_id)
    db_session.add(like)
    await db_session.commit()
    await db_session.refresh(like)

    assert like.id is not None
    assert like.review_id == review_id
    assert like.user_id == user_id

    # Test duplicate like constraint
    duplicate_like = ReviewLike(review_id=review_id, user_id=user_id)
    db_session.add(duplicate_like)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


@pytest.mark.asyncio
async def test_user_follow_model_and_constraints(db_session: AsyncSession):
    user1 = User(
        email=f"u1_{uuid.uuid4().hex[:6]}@example.com",
        username=f"u1_{uuid.uuid4().hex[:6]}",
        password_hash="fakehash",
    )
    user2 = User(
        email=f"u2_{uuid.uuid4().hex[:6]}@example.com",
        username=f"u2_{uuid.uuid4().hex[:6]}",
        password_hash="fakehash",
    )
    db_session.add_all([user1, user2])
    await db_session.commit()

    u1_id = user1.id
    u2_id = user2.id

    # Successful follow
    follow = UserFollow(follower_id=u1_id, following_id=u2_id)
    db_session.add(follow)
    await db_session.commit()
    await db_session.refresh(follow)

    assert follow.id is not None
    assert follow.follower_id == u1_id
    assert follow.following_id == u2_id

    # Duplicate follow constraint
    dup_follow = UserFollow(follower_id=u1_id, following_id=u2_id)
    db_session.add(dup_follow)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()

    # Self-follow check constraint
    self_follow = UserFollow(follower_id=u1_id, following_id=u1_id)
    db_session.add(self_follow)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


@pytest.mark.asyncio
async def test_notification_model_and_cascade(db_session: AsyncSession):
    user = User(
        email=f"notif_{uuid.uuid4().hex[:6]}@example.com",
        username=f"notif_{uuid.uuid4().hex[:6]}",
        password_hash="fakehash",
    )
    other_user = User(
        email=f"other_{uuid.uuid4().hex[:6]}@example.com",
        username=f"other_{uuid.uuid4().hex[:6]}",
        password_hash="fakehash",
    )
    book = Book(
        openlibrary_work_id=f"OL{uuid.uuid4().hex[:8]}W",
        title="Test Book for Notifs",
        authors=["Author 1"],
    )
    db_session.add_all([user, other_user, book])
    await db_session.commit()

    user_id = user.id
    other_user_id = other_user.id

    review = Review(
        user_id=other_user_id,
        book_id=book.id,
        rating=4,
        content="Enjoyed reading this.",
    )
    db_session.add(review)
    await db_session.commit()
    review_id = review.id

    notif = Notification(
        user_id=user_id,
        notification_type="REVIEW_LIKE",
        title="Someone liked your review",
        message="User other liked your review on Test Book",
        related_user_id=other_user_id,
        related_review_id=review_id,
    )
    db_session.add(notif)
    await db_session.commit()
    await db_session.refresh(notif)

    assert notif.id is not None
    assert notif.is_read is False
    assert notif.user_id == user_id
    assert notif.related_user_id == other_user_id
    assert notif.related_review_id == review_id


@pytest.mark.asyncio
async def test_recommendation_profile_model_and_uniqueness(db_session: AsyncSession):
    user = User(
        email=f"rec_{uuid.uuid4().hex[:6]}@example.com",
        username=f"rec_{uuid.uuid4().hex[:6]}",
        password_hash="fakehash",
    )
    db_session.add(user)
    await db_session.commit()

    user_id = user.id

    profile = RecommendationProfile(
        user_id=user_id,
        preferred_genres=["Sci-Fi", "Cyberpunk"],
        preferred_authors=["William Gibson", "Philip K. Dick"],
        preferred_languages=["en"],
        min_rating=4,
        max_rating=5,
    )
    db_session.add(profile)
    await db_session.commit()
    await db_session.refresh(profile)

    assert profile.id is not None
    assert profile.user_id == user_id
    assert "Sci-Fi" in profile.preferred_genres
    assert profile.min_rating == 4

    # Duplicate profile per user should raise IntegrityError
    dup_profile = RecommendationProfile(
        user_id=user_id,
        preferred_genres=["Fantasy"],
    )
    db_session.add(dup_profile)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()
