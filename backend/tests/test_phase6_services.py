import uuid
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    DuplicateRecommendationProfileError,
    DuplicateReviewLikeError,
    DuplicateUserFollowError,
    InvalidRecommendationPreferencesError,
    NotificationNotFoundError,
    RecommendationProfileNotFoundError,
    ReviewLikeNotFoundError,
    ReviewNotFoundError,
    SelfFollowError,
    UserFollowNotFoundError,
    UserNotFoundError,
)
from app.models.book import Book
from app.models.bookshelf import BookshelfItem
from app.models.review import Review
from app.models.user import User
from app.schemas.recommendation import (
    RecommendationProfileCreate,
    RecommendationProfileUpdate,
)
from app.services.notification_service import notification_service
from app.services.recommendation_profile_service import (
    recommendation_profile_service,
)
from app.services.recommendation_service import recommendation_service
from app.services.review_like_service import review_like_service
from app.services.social_feed_service import social_feed_service
from app.services.user_follow_service import user_follow_service


@pytest.mark.asyncio
async def test_review_like_service(db_session: AsyncSession):
    # Setup users, book, review
    liker = User(
        email=f"liker_{uuid.uuid4().hex[:6]}@test.com",
        username=f"liker_{uuid.uuid4().hex[:6]}",
        password_hash="pwd",
    )
    author = User(
        email=f"author_{uuid.uuid4().hex[:6]}@test.com",
        username=f"author_{uuid.uuid4().hex[:6]}",
        password_hash="pwd",
    )
    book = Book(
        openlibrary_work_id=f"OL{uuid.uuid4().hex[:8]}W",
        title="Test Book for Like Service",
        authors=["Author One"],
    )
    db_session.add_all([liker, author, book])
    await db_session.commit()

    review = Review(
        user_id=author.id,
        book_id=book.id,
        rating=5,
        content="Incredible masterpiece!",
        likes_count=0,
    )
    db_session.add(review)
    await db_session.commit()

    # 1. Create Like
    like_resp = await review_like_service.create_like(db_session, liker, review.id)
    assert like_resp.review_id == review.id
    assert like_resp.user_id == liker.id

    # Verify review.likes_count incremented
    await db_session.refresh(review)
    assert review.likes_count == 1

    # Verify notification created for author
    notifs = await notification_service.get_my_notifications(db_session, author)
    assert notifs.unread_count == 1
    assert notifs.items[0].notification_type == "REVIEW_LIKE"

    # 2. Check like status & count
    assert await review_like_service.get_like_status(db_session, liker, review.id) is True
    assert await review_like_service.get_like_status(db_session, author, review.id) is False
    assert await review_like_service.get_like_count(db_session, review.id) == 1

    # 3. Duplicate like raises 409
    with pytest.raises(DuplicateReviewLikeError):
        await review_like_service.create_like(db_session, liker, review.id)

    # 4. Unlike
    await review_like_service.delete_like(db_session, liker, review.id)
    await db_session.refresh(review)
    assert review.likes_count == 0
    assert await review_like_service.get_like_status(db_session, liker, review.id) is False

    # 5. Unlike nonexistent raises 404
    with pytest.raises(ReviewLikeNotFoundError):
        await review_like_service.delete_like(db_session, liker, review.id)


@pytest.mark.asyncio
async def test_user_follow_service(db_session: AsyncSession):
    user_a = User(
        email=f"ua_{uuid.uuid4().hex[:6]}@test.com",
        username=f"user_a_{uuid.uuid4().hex[:6]}",
        password_hash="pwd",
    )
    user_b = User(
        email=f"ub_{uuid.uuid4().hex[:6]}@test.com",
        username=f"user_b_{uuid.uuid4().hex[:6]}",
        password_hash="pwd",
    )
    db_session.add_all([user_a, user_b])
    await db_session.commit()

    # 1. Follow User B
    follow_resp = await user_follow_service.follow_user(db_session, user_a, user_b.id)
    assert follow_resp.follower_id == user_a.id
    assert follow_resp.following_id == user_b.id

    # Verify notification created for User B
    notifs = await notification_service.get_my_notifications(db_session, user_b)
    assert notifs.unread_count == 1
    assert notifs.items[0].notification_type == "FOLLOW"

    # 2. Self-follow error
    with pytest.raises(SelfFollowError):
        await user_follow_service.follow_user(db_session, user_a, user_a.id)

    # 3. Duplicate follow error
    with pytest.raises(DuplicateUserFollowError):
        await user_follow_service.follow_user(db_session, user_a, user_b.id)

    # 4. Follow nonexistent user error
    with pytest.raises(UserNotFoundError):
        await user_follow_service.follow_user(db_session, user_a, uuid.uuid4())

    # 5. Stats and status
    assert await user_follow_service.get_follow_status(db_session, user_a, user_b.id) is True
    assert await user_follow_service.get_follow_status(db_session, user_b, user_a.id) is False

    stats = await user_follow_service.get_follow_stats(db_session, user_a, user_b.id)
    assert stats.followers_count == 1
    assert stats.following_count == 0
    assert stats.is_following is True

    # 6. Unfollow
    await user_follow_service.unfollow_user(db_session, user_a, user_b.id)
    assert await user_follow_service.get_follow_status(db_session, user_a, user_b.id) is False

    # 7. Unfollow nonexistent
    with pytest.raises(UserFollowNotFoundError):
        await user_follow_service.unfollow_user(db_session, user_a, user_b.id)


@pytest.mark.asyncio
async def test_notification_service(db_session: AsyncSession):
    user1 = User(
        email=f"u1_{uuid.uuid4().hex[:6]}@test.com",
        username=f"u1_{uuid.uuid4().hex[:6]}",
        password_hash="pwd",
    )
    user2 = User(
        email=f"u2_{uuid.uuid4().hex[:6]}@test.com",
        username=f"u2_{uuid.uuid4().hex[:6]}",
        password_hash="pwd",
    )
    db_session.add_all([user1, user2])
    await db_session.commit()

    # Create notifications
    n1 = await notification_service.create_notification(
        db_session, user1.id, "SYSTEM", "Update", "Welcome!"
    )
    n2 = await notification_service.create_notification(
        db_session, user1.id, "SYSTEM", "Reminder", "Set a goal!"
    )

    # Unread count
    assert await notification_service.get_unread_count(db_session, user1) == 2

    # Mark one as read
    updated_n1 = await notification_service.mark_notification_as_read(db_session, user1, n1.id)
    assert updated_n1.is_read is True
    assert await notification_service.get_unread_count(db_session, user1) == 1

    # Cross-user isolation: User2 cannot mark User1's notification as read
    with pytest.raises(NotificationNotFoundError):
        await notification_service.mark_notification_as_read(db_session, user2, n2.id)

    # Mark all as read
    marked_count = await notification_service.mark_all_notifications_as_read(db_session, user1)
    assert marked_count == 1
    assert await notification_service.get_unread_count(db_session, user1) == 0


@pytest.mark.asyncio
async def test_recommendation_profile_service(db_session: AsyncSession):
    user = User(
        email=f"prof_{uuid.uuid4().hex[:6]}@test.com",
        username=f"prof_{uuid.uuid4().hex[:6]}",
        password_hash="pwd",
    )
    db_session.add(user)
    await db_session.commit()

    # 1. Invalid rating validation (min > max)
    with pytest.raises(InvalidRecommendationPreferencesError):
        await recommendation_profile_service.create_profile(
            db_session,
            user,
            RecommendationProfileCreate(
                preferred_genres=["Sci-Fi"],
                min_rating=5,
                max_rating=2,
            ),
        )

    # 2. Successful create
    created = await recommendation_profile_service.create_profile(
        db_session,
        user,
        RecommendationProfileCreate(
            preferred_genres=["Sci-Fi", "Space Opera"],
            preferred_authors=["Frank Herbert"],
            min_rating=3,
            max_rating=5,
        ),
    )
    assert created.user_id == user.id
    assert "Sci-Fi" in created.preferred_genres

    # 3. Duplicate create raises 409
    with pytest.raises(DuplicateRecommendationProfileError):
        await recommendation_profile_service.create_profile(
            db_session,
            user,
            RecommendationProfileCreate(preferred_genres=["Fantasy"]),
        )

    # 4. Get profile
    profile = await recommendation_profile_service.get_my_profile(db_session, user)
    assert profile is not None
    assert profile.id == created.id

    # 5. Update profile
    updated = await recommendation_profile_service.update_profile(
        db_session,
        user,
        RecommendationProfileUpdate(preferred_genres=["Cyberpunk"]),
    )
    assert "Cyberpunk" in updated.preferred_genres

    # 6. Delete profile
    await recommendation_profile_service.delete_profile(db_session, user)
    assert await recommendation_profile_service.get_my_profile(db_session, user) is None


@pytest.mark.asyncio
async def test_recommendation_engine_scoring(db_session: AsyncSession):
    user = User(
        email=f"rec_eng_{uuid.uuid4().hex[:6]}@test.com",
        username=f"rec_eng_{uuid.uuid4().hex[:6]}",
        password_hash="pwd",
    )
    db_session.add(user)
    await db_session.commit()

    # Set user profile with preferences for Sci-Fi and Isaac Asimov
    await recommendation_profile_service.create_profile(
        db_session,
        user,
        RecommendationProfileCreate(
            preferred_genres=["Sci-Fi", "Robotics"],
            preferred_authors=["Isaac Asimov"],
            min_rating=3,
        ),
    )

    # Add books
    book1 = Book(
        openlibrary_work_id="OL_FOUNDATION",
        title="Foundation",
        authors=["Isaac Asimov"],
        subjects=["Sci-Fi", "Space"],
        edition_count=10,
    )
    book2 = Book(
        openlibrary_work_id="OL_DUNE",
        title="Dune",
        authors=["Frank Herbert"],
        subjects=["Sci-Fi", "Epic"],
        edition_count=5,
    )
    book3 = Book(
        openlibrary_work_id="OL_ROMANCE",
        title="Pride and Prejudice",
        authors=["Jane Austen"],
        subjects=["Romance", "Classic"],
        edition_count=1,
    )
    db_session.add_all([book1, book2, book3])
    await db_session.commit()

    # Mark Pride and Prejudice as already in bookshelf
    shelf_item = BookshelfItem(
        user_id=user.id,
        book_id=book3.id,
        status="COMPLETED",
    )
    db_session.add(shelf_item)
    await db_session.commit()

    # Get recommendations
    rec_resp = await recommendation_service.get_recommendations(db_session, user, limit=5)

    # Excluded bookshelf item should not appear
    rec_work_ids = [r.openlibrary_work_id for r in rec_resp.recommendations]
    assert "OL_ROMANCE" not in rec_work_ids
    assert "OL_FOUNDATION" in rec_work_ids
    assert "OL_DUNE" in rec_work_ids

    # Top recommendation should be Foundation because it matches both preferred genre AND preferred author
    assert rec_resp.recommendations[0].openlibrary_work_id == "OL_FOUNDATION"
    assert rec_resp.recommendations[0].score > rec_resp.recommendations[1].score


@pytest.mark.asyncio
async def test_social_feed_service(db_session: AsyncSession):
    user_me = User(
        email=f"me_{uuid.uuid4().hex[:6]}@test.com",
        username=f"me_{uuid.uuid4().hex[:6]}",
        password_hash="pwd",
    )
    user_friend = User(
        email=f"friend_{uuid.uuid4().hex[:6]}@test.com",
        username=f"friend_{uuid.uuid4().hex[:6]}",
        password_hash="pwd",
    )
    user_stranger = User(
        email=f"stranger_{uuid.uuid4().hex[:6]}@test.com",
        username=f"stranger_{uuid.uuid4().hex[:6]}",
        password_hash="pwd",
    )
    book = Book(
        openlibrary_work_id=f"OL{uuid.uuid4().hex[:8]}W",
        title="Social Feed Book",
        authors=["Author"],
    )
    db_session.add_all([user_me, user_friend, user_stranger, book])
    await db_session.commit()

    # Friend creates a review
    rev_friend = Review(
        user_id=user_friend.id,
        book_id=book.id,
        rating=5,
        title="Friend's Review",
        content="Awesome book!",
    )
    # Stranger creates a review
    rev_stranger = Review(
        user_id=user_stranger.id,
        book_id=book.id,
        rating=1,
        title="Stranger's Review",
        content="Boring book!",
    )
    db_session.add_all([rev_friend, rev_stranger])
    await db_session.commit()

    # When not following anyone, feed should be empty
    empty_feed = await social_feed_service.get_social_feed(db_session, user_me)
    assert len(empty_feed.items) == 0

    # User Me follows Friend
    await user_follow_service.follow_user(db_session, user_me, user_friend.id)

    # Feed should now show Friend's review, but NOT stranger's review
    feed = await social_feed_service.get_social_feed(db_session, user_me)
    assert len(feed.items) == 1
    assert feed.items[0].actor_username == user_friend.username
    assert feed.items[0].review_title == "Friend's Review"
