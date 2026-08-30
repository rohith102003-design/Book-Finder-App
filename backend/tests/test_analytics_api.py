from datetime import datetime, timezone
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
        email="analytics_a@example.com",
        username="analytics_alice",
        password_hash="$2b$12$somehashplaceholder",
    )
    return create_access_token(subject=user.id)


@pytest.fixture
async def user_b_token(db_session: AsyncSession) -> str:
    user = await user_repository.create(
        db_session,
        email="analytics_b@example.com",
        username="analytics_bob",
        password_hash="$2b$12$somehashplaceholder",
    )
    return create_access_token(subject=user.id)


@pytest.fixture
async def sample_book(db_session: AsyncSession):
    book_in = BookCreate(
        openlibrary_work_id="OL_API_ANALYTICS_001W",
        title="Snow Crash",
        authors=["Neal Stephenson"],
        subjects=["Sci-Fi", "Cyberpunk"],
    )
    return await book_repository.upsert_by_openlibrary_id(db_session, book_in)


@pytest.mark.asyncio
async def test_analytics_unauthenticated_rejected(client: AsyncClient):
    res_overview = await client.get("/api/v1/analytics/overview")
    assert res_overview.status_code == 401

    res_goal = await client.get("/api/v1/analytics/goals/2026")
    assert res_goal.status_code == 401


@pytest.mark.asyncio
async def test_create_and_get_reading_goal(client: AsyncClient, user_a_token: str):
    # Create goal
    res = await client.post(
        "/api/v1/analytics/goals",
        json={"year": 2026, "target_books": 25},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert res.status_code == 201
    data = res.json()["data"]
    assert data["year"] == 2026
    assert data["target_books"] == 25
    assert data["completed_books"] == 0
    assert data["progress_percentage"] == 0.0
    assert data["is_completed"] is False

    # Get goal
    get_res = await client.get(
        "/api/v1/analytics/goals/2026",
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert get_res.status_code == 200
    assert get_res.json()["data"]["target_books"] == 25


@pytest.mark.asyncio
async def test_create_duplicate_reading_goal_rejected(client: AsyncClient, user_a_token: str):
    await client.post(
        "/api/v1/analytics/goals",
        json={"year": 2026, "target_books": 20},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )

    dup_res = await client.post(
        "/api/v1/analytics/goals",
        json={"year": 2026, "target_books": 30},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert dup_res.status_code == 409


@pytest.mark.asyncio
async def test_update_reading_goal(client: AsyncClient, user_a_token: str):
    await client.post(
        "/api/v1/analytics/goals",
        json={"year": 2026, "target_books": 10},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )

    patch_res = await client.patch(
        "/api/v1/analytics/goals/2026",
        json={"target_books": 15},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["data"]["target_books"] == 15


@pytest.mark.asyncio
async def test_update_nonexistent_goal_404(client: AsyncClient, user_a_token: str):
    patch_res = await client.patch(
        "/api/v1/analytics/goals/2099",
        json={"target_books": 20},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert patch_res.status_code == 404


@pytest.mark.asyncio
async def test_get_reading_goal_cross_user_isolation(
    client: AsyncClient, user_a_token: str, user_b_token: str
):
    # User A creates a goal for 2026
    await client.post(
        "/api/v1/analytics/goals",
        json={"year": 2026, "target_books": 30},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )

    # User B requests 2026 goal -> 404 (because User B has no goal)
    res_b = await client.get(
        "/api/v1/analytics/goals/2026",
        headers={"Authorization": f"Bearer {user_b_token}"},
    )
    assert res_b.status_code == 404


@pytest.mark.asyncio
async def test_analytics_overview_endpoint(
    client: AsyncClient, user_a_token: str, sample_book, db_session: AsyncSession
):
    # Create reading goal for 2026
    await client.post(
        "/api/v1/analytics/goals",
        json={"year": 2026, "target_books": 5},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )

    # Fetch overview
    res = await client.get(
        "/api/v1/analytics/overview?year=2026",
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert res.status_code == 200
    data = res.json()["data"]
    assert "total_books_completed" in data
    assert "total_pages_read" in data
    assert "average_personal_rating" in data
    assert "monthly_breakdown" in data
    assert len(data["monthly_breakdown"]) == 12
    assert data["active_goal"] is not None
    assert data["active_goal"]["target_books"] == 5


@pytest.mark.asyncio
async def test_analytics_schema_validations_produce_422(client: AsyncClient, user_a_token: str):
    # Year < 2000
    res_year = await client.post(
        "/api/v1/analytics/goals",
        json={"year": 1990, "target_books": 10},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert res_year.status_code == 422

    # Target books < 1
    res_target = await client.post(
        "/api/v1/analytics/goals",
        json={"year": 2026, "target_books": 0},
        headers={"Authorization": f"Bearer {user_a_token}"},
    )
    assert res_target.status_code == 422
