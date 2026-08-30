import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.models.book import Book
from app.models.bookshelf import BookshelfItem
from app.models.review import Review
from app.repositories.book_repository import book_repository
from app.repositories.user_repository import user_repository
from app.schemas.book import BookCreate
from app.services.notification_service import notification_service


@pytest.fixture
async def user_a(db_session: AsyncSession):
    return await user_repository.create(
        db_session,
        email="p6_alice@example.com",
        username="p6_alice",
        password_hash="pwd",
    )


@pytest.fixture
async def user_b(db_session: AsyncSession):
    return await user_repository.create(
        db_session,
        email="p6_bob@example.com",
        username="p6_bob",
        password_hash="pwd",
    )


@pytest.fixture
async def token_a(user_a) -> str:
    return create_access_token(subject=user_a.id)


@pytest.fixture
async def token_b(user_b) -> str:
    return create_access_token(subject=user_b.id)


@pytest.fixture
async def sample_book(db_session: AsyncSession):
    book_in = BookCreate(
        openlibrary_work_id="OL_P6_BOOK_001",
        title="Neuromancer",
        authors=["William Gibson"],
        subjects=["Cyberpunk", "Sci-Fi"],
        edition_count=15,
    )
    return await book_repository.upsert_by_openlibrary_id(db_session, book_in)


@pytest.fixture
async def sample_review(db_session: AsyncSession, user_a, sample_book):
    review = Review(
        user_id=user_a.id,
        book_id=sample_book.id,
        rating=5,
        title="Seminal Cyberpunk",
        content="The sky above the port was the color of television, tuned to a dead channel.",
    )
    db_session.add(review)
    await db_session.commit()
    await db_session.refresh(review)
    return review


# =====================================================================
# 1. REVIEW LIKES API TESTS
# =====================================================================

@pytest.mark.asyncio
async def test_review_likes_api(client: AsyncClient, token_b, sample_review):
    # 1. Unauthenticated like attempt -> 401
    res = await client.post(f"/api/v1/reviews/{sample_review.id}/like")
    assert res.status_code == 401

    # 2. Like review -> 201
    res = await client.post(
        f"/api/v1/reviews/{sample_review.id}/like",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert res.status_code == 201
    assert res.json()["data"]["review_id"] == str(sample_review.id)

    # 3. Duplicate like -> 409
    res = await client.post(
        f"/api/v1/reviews/{sample_review.id}/like",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert res.status_code == 409

    # 4. Check like status -> True
    res = await client.get(
        f"/api/v1/reviews/{sample_review.id}/like",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert res.status_code == 200
    assert res.json()["data"]["is_liked"] is True

    # 5. Check like count -> 1
    res = await client.get(f"/api/v1/reviews/{sample_review.id}/likes/count")
    assert res.status_code == 200
    assert res.json()["data"]["likes_count"] == 1

    # 6. Unlike review -> 200
    res = await client.delete(
        f"/api/v1/reviews/{sample_review.id}/like",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert res.status_code == 200

    # 7. Unlike again -> 404
    res = await client.delete(
        f"/api/v1/reviews/{sample_review.id}/like",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert res.status_code == 404


# =====================================================================
# 2. FOLLOWS API TESTS
# =====================================================================

@pytest.mark.asyncio
async def test_follows_api(client: AsyncClient, token_a, user_a, user_b):
    # 1. Unauthenticated follow -> 401
    res = await client.post(f"/api/v1/users/{user_b.id}/follow")
    assert res.status_code == 401

    # 2. Self follow -> 400
    res = await client.post(
        f"/api/v1/users/{user_a.id}/follow",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert res.status_code == 400

    # 3. Follow User B -> 201
    res = await client.post(
        f"/api/v1/users/{user_b.id}/follow",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert res.status_code == 201
    assert res.json()["data"]["following_id"] == str(user_b.id)

    # 4. Duplicate follow -> 409
    res = await client.post(
        f"/api/v1/users/{user_b.id}/follow",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert res.status_code == 409

    # 5. Follow status -> True
    res = await client.get(
        f"/api/v1/users/{user_b.id}/follow-status",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert res.status_code == 200
    assert res.json()["data"]["is_following"] is True

    # 6. Follow stats
    res = await client.get(
        f"/api/v1/users/{user_b.id}/follow-stats",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert res.status_code == 200
    assert res.json()["data"]["followers_count"] == 1
    assert res.json()["data"]["is_following"] is True

    # 7. Followers list
    res = await client.get(f"/api/v1/users/{user_b.id}/followers")
    assert res.status_code == 200
    assert len(res.json()["data"]) == 1

    # 8. Unfollow -> 200
    res = await client.delete(
        f"/api/v1/users/{user_b.id}/follow",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert res.status_code == 200

    # 9. Unfollow again -> 404
    res = await client.delete(
        f"/api/v1/users/{user_b.id}/follow",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert res.status_code == 404


# =====================================================================
# 3. NOTIFICATIONS API TESTS
# =====================================================================

@pytest.mark.asyncio
async def test_notifications_api(
    client: AsyncClient, db_session: AsyncSession, token_a, user_a, token_b, user_b
):
    # Setup notifications for user_a
    notif1 = await notification_service.create_notification(
        db_session, user_a.id, "SYSTEM", "Welcome", "Welcome to the platform!"
    )
    notif2 = await notification_service.create_notification(
        db_session, user_a.id, "SYSTEM", "Goal", "Remember to set your goal!"
    )

    # 1. Unauthenticated -> 401
    res = await client.get("/api/v1/notifications")
    assert res.status_code == 401

    # 2. Get notifications -> 200
    res = await client.get(
        "/api/v1/notifications",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert res.status_code == 200
    assert res.json()["data"]["unread_count"] == 2
    assert len(res.json()["data"]["items"]) == 2

    # 3. Unread count -> 200
    res = await client.get(
        "/api/v1/notifications/unread-count",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert res.status_code == 200
    assert res.json()["data"]["unread_count"] == 2

    # 4. Mark one as read -> 200
    res = await client.patch(
        f"/api/v1/notifications/{notif1.id}/read",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert res.status_code == 200
    assert res.json()["data"]["is_read"] is True

    # 5. Cross-user isolation: User B trying to mark User A's notification -> 404
    res = await client.patch(
        f"/api/v1/notifications/{notif2.id}/read",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert res.status_code == 404

    # 6. Mark all as read -> 200
    res = await client.post(
        "/api/v1/notifications/read-all",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert res.status_code == 200
    assert res.json()["data"]["updated_count"] == 1


# =====================================================================
# 4. RECOMMENDATION PROFILE & RECOMMENDATIONS API TESTS
# =====================================================================

@pytest.mark.asyncio
async def test_recommendations_api(
    client: AsyncClient, token_a, sample_book
):
    # 1. Get profile before creation -> data is null
    res = await client.get(
        "/api/v1/recommendations/profile",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert res.status_code == 200
    assert res.json()["data"] is None

    # 2. Invalid min > max rating -> 400
    res = await client.post(
        "/api/v1/recommendations/profile",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"preferred_genres": ["Sci-Fi"], "min_rating": 5, "max_rating": 2},
    )
    assert res.status_code == 400

    # 3. Create profile -> 201
    res = await client.post(
        "/api/v1/recommendations/profile",
        headers={"Authorization": f"Bearer {token_a}"},
        json={
            "preferred_genres": ["Cyberpunk", "Sci-Fi"],
            "preferred_authors": ["William Gibson"],
            "min_rating": 3,
            "max_rating": 5,
        },
    )
    assert res.status_code == 201
    assert "Cyberpunk" in res.json()["data"]["preferred_genres"]

    # 4. Duplicate profile creation -> 409
    res = await client.post(
        "/api/v1/recommendations/profile",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"preferred_genres": ["Fantasy"]},
    )
    assert res.status_code == 409

    # 5. Update profile -> 200
    res = await client.patch(
        "/api/v1/recommendations/profile",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"preferred_genres": ["Cyberpunk", "AI"]},
    )
    assert res.status_code == 200
    assert "AI" in res.json()["data"]["preferred_genres"]

    # 6. Get recommendations endpoint -> 200
    res = await client.get(
        "/api/v1/recommendations?limit=5",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert res.status_code == 200
    recs = res.json()["data"]["recommendations"]
    assert len(recs) >= 1
    assert recs[0]["openlibrary_work_id"] == "OL_P6_BOOK_001"

    # 7. Delete profile -> 200
    res = await client.delete(
        "/api/v1/recommendations/profile",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert res.status_code == 200


# =====================================================================
# 5. SOCIAL FEED API TESTS
# =====================================================================

@pytest.mark.asyncio
async def test_social_feed_api(
    client: AsyncClient, token_a, user_b, sample_book, token_b
):
    # User B writes a review
    await client.post(
        "/api/v1/reviews",
        headers={"Authorization": f"Bearer {token_b}"},
        json={
            "openlibrary_work_id": sample_book.openlibrary_work_id,
            "rating": 5,
            "title": "Bob's Great Review",
            "content": "A must read masterpiece!",
        },
    )

    # 1. Unauthenticated feed -> 401
    res = await client.get("/api/v1/social/feed")
    assert res.status_code == 401

    # 2. Before following User B -> Feed is empty
    res = await client.get(
        "/api/v1/social/feed",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert res.status_code == 200
    assert res.json()["data"]["total_count"] == 0

    # 3. User A follows User B
    await client.post(
        f"/api/v1/users/{user_b.id}/follow",
        headers={"Authorization": f"Bearer {token_a}"},
    )

    # 4. Feed now contains User B's review activity
    res = await client.get(
        "/api/v1/social/feed",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert res.status_code == 200
    assert res.json()["data"]["total_count"] == 1
    assert res.json()["data"]["items"][0]["actor_username"] == "p6_bob"
    assert res.json()["data"]["items"][0]["review_title"] == "Bob's Great Review"
