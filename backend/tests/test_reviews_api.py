import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.repositories.book_repository import book_repository
from app.repositories.bookshelf_repository import bookshelf_repository
from app.repositories.user_repository import user_repository
from app.schemas.book import BookCreate


@pytest.fixture
async def user_a_token(db_session: AsyncSession) -> str:
    user = await user_repository.create(
        db_session,
        email="rev_api_a@example.com",
        username="rev_api_alice",
        password_hash="$2b$12$somehashplaceholder",
    )
    return create_access_token(subject=user.id)


@pytest.fixture
async def user_b_token(db_session: AsyncSession) -> str:
    user = await user_repository.create(
        db_session,
        email="rev_api_b@example.com",
        username="rev_api_bob",
        password_hash="$2b$12$somehashplaceholder",
    )
    return create_access_token(subject=user.id)


@pytest.fixture
async def admin_token(db_session: AsyncSession) -> str:
    user = await user_repository.create(
        db_session,
        email="rev_api_admin@example.com",
        username="rev_api_admin",
        password_hash="$2b$12$somehashplaceholder",
    )
    user.role = "ADMIN"
    await db_session.commit()
    await db_session.refresh(user)
    return create_access_token(subject=user.id)


@pytest.fixture
async def setup_book(db_session: AsyncSession):
    book_in = BookCreate(
        openlibrary_work_id="OL_API_REV_001W",
        title="Foundation",
        authors=["Isaac Asimov"],
        first_publish_year=1951,
        edition_count=20,
        subjects=["Sci-Fi", "Classics"],
    )
    return await book_repository.upsert_by_openlibrary_id(db_session, book_in)


@pytest.mark.asyncio
async def test_public_book_reviews_endpoint_no_auth(client: AsyncClient, setup_book):
    response = await client.get("/api/v1/books/OL_API_REV_001W/reviews")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["openlibrary_work_id"] == "OL_API_REV_001W"
    assert data["data"]["total_reviews"] == 0
    assert data["data"]["average_rating"] == 0.0


@pytest.mark.asyncio
async def test_create_review_unauthenticated_rejected(client: AsyncClient, setup_book):
    payload = {
        "openlibrary_work_id": "OL_API_REV_001W",
        "rating": 5,
        "content": "Unauthenticated review attempt.",
    }
    response = await client.post("/api/v1/reviews", json=payload)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_review_success(client: AsyncClient, user_a_token: str, setup_book):
    payload = {
        "openlibrary_work_id": "OL_API_REV_001W",
        "rating": 5,
        "title": "Masterpiece of Sci-Fi",
        "content": "Psychohistory is one of the coolest concepts in literature.",
        "contains_spoilers": True,
    }
    response = await client.post(
        "/api/v1/reviews",
        json=payload,
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert response.status_code == 201
    data = response.json()["data"]
    assert data["rating"] == 5
    assert data["title"] == "Masterpiece of Sci-Fi"
    assert data["contains_spoilers"] is True
    assert data["author"]["username"] == "rev_api_alice"
    assert data["author"]["is_verified_reader"] is False


@pytest.mark.asyncio
async def test_create_review_duplicate_rejected(client: AsyncClient, user_a_token: str, setup_book):
    payload = {
        "openlibrary_work_id": "OL_API_REV_001W",
        "rating": 4,
        "content": "First valid review content.",
    }
    res1 = await client.post(
        "/api/v1/reviews",
        json=payload,
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert res1.status_code == 201

    res2 = await client.post(
        "/api/v1/reviews",
        json=payload,
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert res2.status_code == 409
    assert res2.json()["error"]["code"] == "DUPLICATE_REVIEW"


@pytest.mark.asyncio
async def test_verified_reader_returned_in_api(
    client: AsyncClient, user_a_token: str, setup_book
):
    # User A adds book to bookshelf as COMPLETED
    await client.post(
        "/api/v1/bookshelf",
        json={
            "openlibrary_work_id": "OL_API_REV_001W",
            "title": "Foundation",
            "status": "COMPLETED",
            "total_pages": 250,
            "current_page": 250,
        },
        headers={"Authorization": f"Bearer {user_a_token}"},
    )

    # Post review
    res = await client.post(
        "/api/v1/reviews",
        json={
            "openlibrary_work_id": "OL_API_REV_001W",
            "rating": 5,
            "content": "Read it and loved it completely!",
        },
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert res.status_code == 201
    assert res.json()["data"]["author"]["is_verified_reader"] is True


@pytest.mark.asyncio
async def test_get_my_review(client: AsyncClient, user_a_token: str, user_b_token: str, setup_book):
    await client.post(
        "/api/v1/reviews",
        json={
            "openlibrary_work_id": "OL_API_REV_001W",
            "rating": 5,
            "content": "Alice's review of Foundation.",
        },
        headers={"Authorization": f"Bearer {user_a_token}"},
    )

    # User A gets my review -> 200 with review
    res_a = await client.get(
        "/api/v1/reviews/me/OL_API_REV_001W",
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert res_a.status_code == 200
    assert res_a.json()["data"]["content"] == "Alice's review of Foundation."

    # User B gets my review -> 200 with null data
    res_b = await client.get(
        "/api/v1/reviews/me/OL_API_REV_001W",
        headers={"Authorization": f"Bearer {user_b_token}"},
    )
    assert res_b.status_code == 200
    assert res_b.json()["data"] is None


@pytest.mark.asyncio
async def test_update_review_owner_success(client: AsyncClient, user_a_token: str, setup_book):
    create_res = await client.post(
        "/api/v1/reviews",
        json={
            "openlibrary_work_id": "OL_API_REV_001W",
            "rating": 3,
            "content": "Initial 3 star review.",
        },
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    review_id = create_res.json()["data"]["id"]

    patch_res = await client.patch(
        f"/api/v1/reviews/{review_id}",
        json={"rating": 5, "title": "Upgraded Rating", "content": "Changed mind to 5 stars!"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert patch_res.status_code == 200
    data = patch_res.json()["data"]
    assert data["rating"] == 5
    assert data["title"] == "Upgraded Rating"
    assert data["content"] == "Changed mind to 5 stars!"


@pytest.mark.asyncio
async def test_update_review_non_owner_404(
    client: AsyncClient, user_a_token: str, user_b_token: str, setup_book
):
    create_res = await client.post(
        "/api/v1/reviews",
        json={
            "openlibrary_work_id": "OL_API_REV_001W",
            "rating": 4,
            "content": "Alice's private thoughts.",
        },
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    review_id = create_res.json()["data"]["id"]

    # Bob attempts to update Alice's review -> 404
    patch_res = await client.patch(
        f"/api/v1/reviews/{review_id}",
        json={"rating": 1},
        headers={"Authorization": f"Bearer {user_b_token}"},
    )
    assert patch_res.status_code == 404
    assert patch_res.json()["error"]["code"] == "REVIEW_NOT_FOUND"


@pytest.mark.asyncio
async def test_delete_review_owner_success(client: AsyncClient, user_a_token: str, setup_book):
    create_res = await client.post(
        "/api/v1/reviews",
        json={
            "openlibrary_work_id": "OL_API_REV_001W",
            "rating": 4,
            "content": "Delete me please.",
        },
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    review_id = create_res.json()["data"]["id"]

    del_res = await client.delete(
        f"/api/v1/reviews/{review_id}",
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert del_res.status_code == 200

    # Public stream reflects deletion
    summary_res = await client.get("/api/v1/books/OL_API_REV_001W/reviews")
    assert summary_res.json()["data"]["total_reviews"] == 0


@pytest.mark.asyncio
async def test_delete_review_admin_moderation(
    client: AsyncClient, user_a_token: str, admin_token: str, setup_book
):
    create_res = await client.post(
        "/api/v1/reviews",
        json={
            "openlibrary_work_id": "OL_API_REV_001W",
            "rating": 1,
            "content": "Spam comments.",
        },
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    review_id = create_res.json()["data"]["id"]

    # Admin deletes Alice's review
    del_res = await client.delete(
        f"/api/v1/reviews/{review_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert del_res.status_code == 200


@pytest.mark.asyncio
async def test_delete_review_non_owner_non_admin_404(
    client: AsyncClient, user_a_token: str, user_b_token: str, setup_book
):
    create_res = await client.post(
        "/api/v1/reviews",
        json={
            "openlibrary_work_id": "OL_API_REV_001W",
            "rating": 5,
            "content": "Alice's review.",
        },
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    review_id = create_res.json()["data"]["id"]

    # Bob attempts to delete Alice's review -> 404
    del_res = await client.delete(
        f"/api/v1/reviews/{review_id}",
        headers={"Authorization": f"Bearer {user_b_token}"},
    )
    assert del_res.status_code == 404
    assert del_res.json()["error"]["code"] == "REVIEW_NOT_FOUND"


@pytest.mark.asyncio
async def test_schema_validations_produce_422(client: AsyncClient, user_a_token: str):
    # Rating > 5
    res_rating = await client.post(
        "/api/v1/reviews",
        json={"openlibrary_work_id": "OL_X", "rating": 6, "content": "Valid length content."},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert res_rating.status_code == 422

    # Content < 5 chars
    res_content = await client.post(
        "/api/v1/reviews",
        json={"openlibrary_work_id": "OL_X", "rating": 5, "content": "Bad"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert res_content.status_code == 422
