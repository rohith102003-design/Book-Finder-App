import uuid
import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.book import Book
from app.models.user import User
from app.models.review import Review
from app.repositories.review_like_repository import review_like_repository
from app.repositories.user_follow_repository import user_follow_repository
from app.repositories.notification_repository import notification_repository
from app.repositories.recommendation_profile_repository import recommendation_profile_repository
from app.schemas.social import (
    ReviewLikeResponse,
    UserFollowCreate,
    UserFollowResponse,
    FollowStatsResponse,
)
from app.schemas.notification import (
    NotificationResponse,
    NotificationListResponse,
)
from app.schemas.recommendation import (
    RecommendationProfileCreate,
    RecommendationProfileUpdate,
    RecommendationProfileResponse,
)


@pytest.mark.asyncio
async def test_review_like_repository(db_session: AsyncSession):
    user1 = User(
        email=f"liker1_{uuid.uuid4().hex[:6]}@example.com",
        username=f"liker1_{uuid.uuid4().hex[:6]}",
        password_hash="fakehash",
    )
    user2 = User(
        email=f"liker2_{uuid.uuid4().hex[:6]}@example.com",
        username=f"liker2_{uuid.uuid4().hex[:6]}",
        password_hash="fakehash",
    )
    author = User(
        email=f"author_{uuid.uuid4().hex[:6]}@example.com",
        username=f"author_{uuid.uuid4().hex[:6]}",
        password_hash="fakehash",
    )
    book = Book(
        openlibrary_work_id=f"OL{uuid.uuid4().hex[:8]}W",
        title="Test Book for Repo Likes",
        authors=["Author 1"],
    )
    db_session.add_all([user1, user2, author, book])
    await db_session.commit()

    u1_id = user1.id
    u2_id = user2.id

    review = Review(
        user_id=author.id,
        book_id=book.id,
        rating=5,
        content="Outstanding read!",
    )
    db_session.add(review)
    await db_session.commit()
    rev_id = review.id

    # Test create & get_by_id
    like1 = await review_like_repository.create(db_session, review_id=rev_id, user_id=u1_id)
    assert like1.id is not None
    assert like1.review_id == rev_id
    assert like1.user_id == u1_id

    fetched = await review_like_repository.get_by_id(db_session, like1.id)
    assert fetched is not None
    assert fetched.id == like1.id

    # Test get_by_review_and_user
    found = await review_like_repository.get_by_review_and_user(db_session, rev_id, u1_id)
    assert found is not None
    assert found.id == like1.id

    not_found = await review_like_repository.get_by_review_and_user(db_session, rev_id, u2_id)
    assert not_found is None

    # Test count_by_review & list_by_review
    like2 = await review_like_repository.create(db_session, review_id=rev_id, user_id=u2_id)
    count = await review_like_repository.count_by_review(db_session, rev_id)
    assert count == 2

    likes_list = await review_like_repository.list_by_review(db_session, rev_id)
    assert len(likes_list) == 2

    # Test duplicate like raises error
    with pytest.raises(IntegrityError):
        await review_like_repository.create(db_session, review_id=rev_id, user_id=u1_id)
    await db_session.rollback()

    # Test delete
    to_delete = await review_like_repository.get_by_review_and_user(db_session, rev_id, u1_id)
    assert to_delete is not None
    await review_like_repository.delete(db_session, to_delete)

    count_after = await review_like_repository.count_by_review(db_session, rev_id)
    assert count_after == 1


@pytest.mark.asyncio
async def test_user_follow_repository(db_session: AsyncSession):
    user_a = User(
        email=f"ua_{uuid.uuid4().hex[:6]}@example.com",
        username=f"ua_{uuid.uuid4().hex[:6]}",
        password_hash="fakehash",
    )
    user_b = User(
        email=f"ub_{uuid.uuid4().hex[:6]}@example.com",
        username=f"ub_{uuid.uuid4().hex[:6]}",
        password_hash="fakehash",
    )
    user_c = User(
        email=f"uc_{uuid.uuid4().hex[:6]}@example.com",
        username=f"uc_{uuid.uuid4().hex[:6]}",
        password_hash="fakehash",
    )
    db_session.add_all([user_a, user_b, user_c])
    await db_session.commit()

    ua_id = user_a.id
    ub_id = user_b.id
    uc_id = user_c.id

    # Test create follow (A follows B, C follows B)
    follow_ab = await user_follow_repository.create(db_session, follower_id=ua_id, following_id=ub_id)
    assert follow_ab.id is not None
    assert follow_ab.follower_id == ua_id
    assert follow_ab.following_id == ub_id

    follow_cb = await user_follow_repository.create(db_session, follower_id=uc_id, following_id=ub_id)
    assert follow_cb.id is not None

    # Test get_by_follower_and_following
    fetched_ab = await user_follow_repository.get_by_follower_and_following(db_session, ua_id, ub_id)
    assert fetched_ab is not None
    assert fetched_ab.id == follow_ab.id

    # Test counts
    assert await user_follow_repository.count_followers(db_session, ub_id) == 2
    assert await user_follow_repository.count_following(db_session, ua_id) == 1
    assert await user_follow_repository.count_following(db_session, ub_id) == 0

    # Test list_followers of B
    followers_of_b = await user_follow_repository.list_followers(db_session, ub_id)
    assert len(followers_of_b) == 2

    # Test list_following of A
    following_of_a = await user_follow_repository.list_following(db_session, ua_id)
    assert len(following_of_a) == 1
    assert following_of_a[0].following_id == ub_id

    # Test duplicate follow raises IntegrityError
    with pytest.raises(IntegrityError):
        await user_follow_repository.create(db_session, follower_id=ua_id, following_id=ub_id)
    await db_session.rollback()

    # Test self-follow raises IntegrityError
    with pytest.raises(IntegrityError):
        await user_follow_repository.create(db_session, follower_id=ua_id, following_id=ua_id)
    await db_session.rollback()

    # Test delete
    to_delete = await user_follow_repository.get_by_follower_and_following(db_session, ua_id, ub_id)
    assert to_delete is not None
    await user_follow_repository.delete(db_session, to_delete)

    assert await user_follow_repository.count_followers(db_session, ub_id) == 1


@pytest.mark.asyncio
async def test_notification_repository(db_session: AsyncSession):
    user1 = User(
        email=f"n1_{uuid.uuid4().hex[:6]}@example.com",
        username=f"n1_{uuid.uuid4().hex[:6]}",
        password_hash="fakehash",
    )
    user2 = User(
        email=f"n2_{uuid.uuid4().hex[:6]}@example.com",
        username=f"n2_{uuid.uuid4().hex[:6]}",
        password_hash="fakehash",
    )
    db_session.add_all([user1, user2])
    await db_session.commit()

    u1_id = user1.id
    u2_id = user2.id

    # Create notifications for user1
    notif1 = await notification_repository.create(
        db_session,
        user_id=u1_id,
        notification_type="SYSTEM",
        title="Welcome",
        message="Welcome to BiblioTrack!",
    )
    notif2 = await notification_repository.create(
        db_session,
        user_id=u1_id,
        notification_type="FOLLOW",
        title="New Follower",
        message="user2 started following you",
        related_user_id=u2_id,
    )
    # Create notification for user2 (tenant isolation)
    notif3 = await notification_repository.create(
        db_session,
        user_id=u2_id,
        notification_type="SYSTEM",
        title="User 2 Alert",
        message="Alert for user 2 only",
    )

    # Test list_by_user and user isolation
    user1_notifs = await notification_repository.list_by_user(db_session, u1_id)
    assert len(user1_notifs) == 2
    assert all(n.user_id == u1_id for n in user1_notifs)

    user2_notifs = await notification_repository.list_by_user(db_session, u2_id)
    assert len(user2_notifs) == 1
    assert user2_notifs[0].id == notif3.id

    # Test count_unread
    assert await notification_repository.count_unread(db_session, u1_id) == 2

    # Test mark_as_read
    await notification_repository.mark_as_read(db_session, notif1)
    assert await notification_repository.count_unread(db_session, u1_id) == 1

    # Test mark_all_as_read
    updated_count = await notification_repository.mark_all_as_read(db_session, u1_id)
    assert updated_count == 1
    assert await notification_repository.count_unread(db_session, u1_id) == 0

    # Test delete
    await notification_repository.delete(db_session, notif1)
    assert len(await notification_repository.list_by_user(db_session, u1_id)) == 1


@pytest.mark.asyncio
async def test_recommendation_profile_repository(db_session: AsyncSession):
    user = User(
        email=f"rec_repo_{uuid.uuid4().hex[:6]}@example.com",
        username=f"rec_repo_{uuid.uuid4().hex[:6]}",
        password_hash="fakehash",
    )
    other_user = User(
        email=f"rec_other_{uuid.uuid4().hex[:6]}@example.com",
        username=f"rec_other_{uuid.uuid4().hex[:6]}",
        password_hash="fakehash",
    )
    db_session.add_all([user, other_user])
    await db_session.commit()

    u_id = user.id
    other_u_id = other_user.id

    # Test create
    profile = await recommendation_profile_repository.create(
        db_session,
        user_id=u_id,
        preferred_genres=["Mystery", "Thriller"],
        preferred_authors=["Agatha Christie"],
        preferred_languages=["en"],
        min_rating=3,
        max_rating=5,
    )
    assert profile.id is not None
    assert profile.user_id == u_id
    assert "Mystery" in profile.preferred_genres

    # Test get_by_id & get_by_user_id
    fetched_by_id = await recommendation_profile_repository.get_by_id(db_session, profile.id)
    assert fetched_by_id is not None
    assert fetched_by_id.id == profile.id

    fetched_by_user = await recommendation_profile_repository.get_by_user_id(db_session, u_id)
    assert fetched_by_user is not None
    assert fetched_by_user.id == profile.id

    # Tenant isolation
    other_profile = await recommendation_profile_repository.get_by_user_id(db_session, other_u_id)
    assert other_profile is None

    # Test update
    updated = await recommendation_profile_repository.update(
        db_session,
        profile,
        preferred_genres=["Mystery", "Thriller", "Horror"],
        min_rating=4,
    )
    assert "Horror" in updated.preferred_genres
    assert updated.min_rating == 4

    # Test duplicate profile raises error
    with pytest.raises(IntegrityError):
        await recommendation_profile_repository.create(
            db_session,
            user_id=u_id,
            preferred_genres=["Sci-Fi"],
        )
    await db_session.rollback()

    # Test delete
    to_delete = await recommendation_profile_repository.get_by_user_id(db_session, u_id)
    assert to_delete is not None
    await recommendation_profile_repository.delete(db_session, to_delete)

    assert await recommendation_profile_repository.get_by_user_id(db_session, u_id) is None


def test_phase6_schemas_validation():
    # Test ReviewLikeResponse schema
    like_resp = ReviewLikeResponse(
        id=uuid.uuid4(),
        review_id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        created_at="2026-08-28T12:00:00Z",
    )
    assert like_resp.id is not None

    # Test UserFollowCreate & UserFollowResponse
    follow_create = UserFollowCreate(following_id=uuid.uuid4())
    assert follow_create.following_id is not None

    follow_resp = UserFollowResponse(
        id=uuid.uuid4(),
        follower_id=uuid.uuid4(),
        following_id=uuid.uuid4(),
        created_at="2026-08-28T12:00:00Z",
    )
    assert follow_resp.follower_id is not None

    follow_stats = FollowStatsResponse(
        followers_count=10,
        following_count=5,
        is_following=True,
    )
    assert follow_stats.followers_count == 10

    # Test NotificationResponse & NotificationListResponse
    notif_resp = NotificationResponse(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        notification_type="REVIEW_LIKE",
        title="Test Title",
        message="Test Message",
        is_read=False,
        created_at="2026-08-28T12:00:00Z",
    )
    notif_list = NotificationListResponse(items=[notif_resp], unread_count=1)
    assert len(notif_list.items) == 1
    assert notif_list.unread_count == 1

    # Test RecommendationProfileCreate, Update, Response
    rec_create = RecommendationProfileCreate(
        preferred_genres=["Sci-Fi"],
        min_rating=3,
        max_rating=5,
    )
    assert rec_create.preferred_genres == ["Sci-Fi"]

    rec_update = RecommendationProfileUpdate(min_rating=4)
    assert rec_update.min_rating == 4

    rec_resp = RecommendationProfileResponse(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        preferred_genres=["Fantasy"],
        min_rating=4,
        max_rating=5,
        updated_at="2026-08-28T12:00:00Z",
    )
    assert rec_resp.user_id is not None
