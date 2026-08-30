import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.repositories.user_repository import user_repository


@pytest.fixture
async def user_a_token(db_session: AsyncSession) -> str:
    user = await user_repository.create(
        db_session,
        email="api_user_a@example.com",
        username="api_user_a",
        password_hash="$2b$12$somehashplaceholder",
    )
    return create_access_token(subject=user.id)


@pytest.fixture
async def user_b_token(db_session: AsyncSession) -> str:
    user = await user_repository.create(
        db_session,
        email="api_user_b@example.com",
        username="api_user_b",
        password_hash="$2b$12$somehashplaceholder",
    )
    return create_access_token(subject=user.id)


@pytest.mark.asyncio
async def test_add_book_to_bookshelf_success(client: AsyncClient, user_a_token: str):
    payload = {
        "openlibrary_work_id": "OL_API_001W",
        "title": "Clean Architecture",
        "authors": ["Robert C. Martin"],
        "first_publish_year": 2017,
        "edition_count": 5,
        "subjects": ["Software Engineering"],
        "status": "WANT_TO_READ",
        "current_page": 0,
        "total_pages": 350,
        "notes": "Must read for backend design",
        "rating": 5,
    }

    response = await client.post(
        "/api/v1/bookshelf",
        json=payload,
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["book"]["title"] == "Clean Architecture"
    assert data["data"]["status"] == "WANT_TO_READ"
    assert data["data"]["current_page"] == 0
    assert data["data"]["total_pages"] == 350
    assert data["data"]["progress_percentage"] == 0.0
    assert data["data"]["rating"] == 5


@pytest.mark.asyncio
async def test_add_book_unauthenticated_rejected(client: AsyncClient):
    payload = {
        "openlibrary_work_id": "OL_API_UNAUTH_W",
        "title": "Unauthorized Book",
    }
    response = await client.post("/api/v1/bookshelf", json=payload)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_add_duplicate_book_rejected(client: AsyncClient, user_a_token: str):
    payload = {
        "openlibrary_work_id": "OL_API_DUP_W",
        "title": "Refactoring",
        "authors": ["Martin Fowler"],
    }
    # First add
    res1 = await client.post(
        "/api/v1/bookshelf",
        json=payload,
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert res1.status_code == 201

    # Second add -> 409
    res2 = await client.post(
        "/api/v1/bookshelf",
        json=payload,
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert res2.status_code == 409
    assert res2.json()["error"]["code"] == "DUPLICATE_BOOKSHELF_ITEM"


@pytest.mark.asyncio
async def test_list_bookshelf_scoped_to_user(
    client: AsyncClient, user_a_token: str, user_b_token: str
):
    # User A adds Book 1
    await client.post(
        "/api/v1/bookshelf",
        json={"openlibrary_work_id": "OL_USER_A_BOOK", "title": "Book A"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )

    # User B adds Book 2
    await client.post(
        "/api/v1/bookshelf",
        json={"openlibrary_work_id": "OL_USER_B_BOOK", "title": "Book B"},
        headers={"Authorization": f"Bearer {user_b_token}"},
    )

    # User A lists shelf
    res_a = await client.get(
        "/api/v1/bookshelf",
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert res_a.status_code == 200
    data_a = res_a.json()["data"]
    assert data_a["total"] == 1
    assert data_a["items"][0]["book"]["title"] == "Book A"

    # User B lists shelf
    res_b = await client.get(
        "/api/v1/bookshelf",
        headers={"Authorization": f"Bearer {user_b_token}"},
    )
    assert res_b.status_code == 200
    data_b = res_b.json()["data"]
    assert data_b["total"] == 1
    assert data_b["items"][0]["book"]["title"] == "Book B"


@pytest.mark.asyncio
async def test_list_bookshelf_filtered_by_status(client: AsyncClient, user_a_token: str):
    await client.post(
        "/api/v1/bookshelf",
        json={"openlibrary_work_id": "OL_FILTER_1", "title": "Want Read Book", "status": "WANT_TO_READ"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    await client.post(
        "/api/v1/bookshelf",
        json={"openlibrary_work_id": "OL_FILTER_2", "title": "Reading Book", "status": "READING"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )

    # Query with filter status=READING
    response = await client.get(
        "/api/v1/bookshelf?status=READING",
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["total"] == 2  # Total overall count
    assert len(data["items"]) == 1
    assert data["items"][0]["book"]["title"] == "Reading Book"


@pytest.mark.asyncio
async def test_get_single_bookshelf_item(client: AsyncClient, user_a_token: str):
    create_res = await client.post(
        "/api/v1/bookshelf",
        json={"openlibrary_work_id": "OL_SINGLE_ITEM", "title": "Single Item Book"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    item_id = create_res.json()["data"]["id"]

    response = await client.get(
        f"/api/v1/bookshelf/{item_id}",
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert response.status_code == 200
    assert response.json()["data"]["id"] == item_id


@pytest.mark.asyncio
async def test_get_bookshelf_item_other_user_404(
    client: AsyncClient, user_a_token: str, user_b_token: str
):
    create_res = await client.post(
        "/api/v1/bookshelf",
        json={"openlibrary_work_id": "OL_PRIVATE_A", "title": "User A Private"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    item_id = create_res.json()["data"]["id"]

    # User B tries to read User A's item -> 404
    response = await client.get(
        f"/api/v1/bookshelf/{item_id}",
        headers={"Authorization": f"Bearer {user_b_token}"},
    )
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "BOOKSHELF_ITEM_NOT_FOUND"


@pytest.mark.asyncio
async def test_update_status_success(client: AsyncClient, user_a_token: str):
    create_res = await client.post(
        "/api/v1/bookshelf",
        json={"openlibrary_work_id": "OL_STATUS_UPDATE", "title": "Status Book", "status": "WANT_TO_READ"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    item_id = create_res.json()["data"]["id"]

    response = await client.patch(
        f"/api/v1/bookshelf/{item_id}/status",
        json={"status": "READING"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "READING"
    assert response.json()["data"]["started_at"] is not None


@pytest.mark.asyncio
async def test_update_status_other_user_404(
    client: AsyncClient, user_a_token: str, user_b_token: str
):
    create_res = await client.post(
        "/api/v1/bookshelf",
        json={"openlibrary_work_id": "OL_STATUS_PRIVATE", "title": "Private Status Book"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    item_id = create_res.json()["data"]["id"]

    response = await client.patch(
        f"/api/v1/bookshelf/{item_id}/status",
        json={"status": "COMPLETED"},
        headers={"Authorization": f"Bearer {user_b_token}"},
    )
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "BOOKSHELF_ITEM_NOT_FOUND"


@pytest.mark.asyncio
async def test_update_progress_success(client: AsyncClient, user_a_token: str):
    create_res = await client.post(
        "/api/v1/bookshelf",
        json={"openlibrary_work_id": "OL_PROG_API", "title": "Progress Book", "total_pages": 400},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    item_id = create_res.json()["data"]["id"]

    response = await client.patch(
        f"/api/v1/bookshelf/{item_id}/progress",
        json={"current_page": 200},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["current_page"] == 200
    assert data["progress_percentage"] == 50.0
    assert data["status"] == "READING"


@pytest.mark.asyncio
async def test_update_progress_invalid_rejected(client: AsyncClient, user_a_token: str):
    create_res = await client.post(
        "/api/v1/bookshelf",
        json={"openlibrary_work_id": "OL_PROG_INV", "title": "Invalid Progress Book", "total_pages": 300},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    item_id = create_res.json()["data"]["id"]

    response = await client.patch(
        f"/api/v1/bookshelf/{item_id}/progress",
        json={"current_page": 350},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "INVALID_READING_PROGRESS"


@pytest.mark.asyncio
async def test_update_progress_reaching_total_auto_completes(
    client: AsyncClient, user_a_token: str
):
    create_res = await client.post(
        "/api/v1/bookshelf",
        json={"openlibrary_work_id": "OL_AUTO_COMP", "title": "Auto Complete Book", "total_pages": 250},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    item_id = create_res.json()["data"]["id"]

    response = await client.patch(
        f"/api/v1/bookshelf/{item_id}/progress",
        json={"current_page": 250},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["status"] == "COMPLETED"
    assert data["completed_at"] is not None
    assert data["progress_percentage"] == 100.0


@pytest.mark.asyncio
async def test_delete_bookshelf_item_success(client: AsyncClient, user_a_token: str):
    create_res = await client.post(
        "/api/v1/bookshelf",
        json={"openlibrary_work_id": "OL_DELETE_ME", "title": "Delete Book"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    item_id = create_res.json()["data"]["id"]

    del_res = await client.delete(
        f"/api/v1/bookshelf/{item_id}",
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # Verify 404 after deletion
    get_res = await client.get(
        f"/api/v1/bookshelf/{item_id}",
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert get_res.status_code == 404


@pytest.mark.asyncio
async def test_delete_bookshelf_item_other_user_404(
    client: AsyncClient, user_a_token: str, user_b_token: str
):
    create_res = await client.post(
        "/api/v1/bookshelf",
        json={"openlibrary_work_id": "OL_DEL_PRIVATE", "title": "Private Delete Book"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    item_id = create_res.json()["data"]["id"]

    del_res = await client.delete(
        f"/api/v1/bookshelf/{item_id}",
        headers={"Authorization": f"Bearer {user_b_token}"},
    )
    assert del_res.status_code == 404
    assert del_res.json()["error"]["code"] == "BOOKSHELF_ITEM_NOT_FOUND"


@pytest.mark.asyncio
async def test_schema_validations_produce_422(client: AsyncClient, user_a_token: str):
    # Invalid rating (> 5)
    res_rating = await client.post(
        "/api/v1/bookshelf",
        json={"openlibrary_work_id": "OL_V1", "title": "Bad Rating", "rating": 10},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert res_rating.status_code == 422

    # Negative page
    res_page = await client.post(
        "/api/v1/bookshelf",
        json={"openlibrary_work_id": "OL_V2", "title": "Bad Page", "current_page": -5},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert res_page.status_code == 422

    # Invalid status enum
    res_status = await client.post(
        "/api/v1/bookshelf",
        json={"openlibrary_work_id": "OL_V3", "title": "Bad Status", "status": "UNKNOWN"},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert res_status.status_code == 422
