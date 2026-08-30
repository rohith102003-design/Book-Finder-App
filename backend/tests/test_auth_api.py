from datetime import timedelta
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, create_refresh_token
from app.repositories.user_repository import user_repository


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    payload = {
        "email": "reader@example.com",
        "username": "alex_reads",
        "password": "SecurePassword123!",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert data["data"]["token_type"] == "bearer"
    assert data["data"]["user"]["email"] == "reader@example.com"
    assert data["data"]["user"]["username"] == "alex_reads"
    assert data["data"]["user"]["role"] == "USER"

    # Security assertions: never return password or refresh token in JSON
    assert "password" not in data["data"]["user"]
    assert "password_hash" not in data["data"]["user"]
    assert "refreshToken" not in data["data"]

    # Cookie assertions
    assert "refreshToken" in response.cookies


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    payload1 = {
        "email": "dup@example.com",
        "username": "user_one",
        "password": "SecurePassword123!",
    }
    await client.post("/api/v1/auth/register", json=payload1)

    payload2 = {
        "email": "DUP@example.com",
        "username": "user_two",
        "password": "SecurePassword123!",
    }
    response = await client.post("/api/v1/auth/register", json=payload2)
    assert response.status_code == 409
    body = response.json()
    assert body["success"] is False
    assert body["error"]["code"] == "USER_ALREADY_EXISTS"


@pytest.mark.asyncio
async def test_register_duplicate_username(client: AsyncClient):
    payload1 = {
        "email": "user1@example.com",
        "username": "same_handle",
        "password": "SecurePassword123!",
    }
    await client.post("/api/v1/auth/register", json=payload1)

    payload2 = {
        "email": "user2@example.com",
        "username": "same_handle",
        "password": "SecurePassword123!",
    }
    response = await client.post("/api/v1/auth/register", json=payload2)
    assert response.status_code == 409
    body = response.json()
    assert body["success"] is False
    assert body["error"]["code"] == "USER_ALREADY_EXISTS"


@pytest.mark.asyncio
async def test_register_weak_password_validation(client: AsyncClient):
    # Missing special character and uppercase
    payload = {
        "email": "weak@example.com",
        "username": "weak_user",
        "password": "weakpassword123",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    register_payload = {
        "email": "login_test@example.com",
        "username": "login_user",
        "password": "SecurePassword123!",
    }
    await client.post("/api/v1/auth/register", json=register_payload)

    login_payload = {
        "email": "login_test@example.com",
        "password": "SecurePassword123!",
    }
    response = await client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert data["data"]["user"]["email"] == "login_test@example.com"
    assert "refreshToken" in response.cookies


@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    login_payload = {
        "email": "nonexistent@example.com",
        "password": "WrongPassword123!",
    }
    response = await client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 401
    body = response.json()
    assert body["success"] is False
    assert body["error"]["code"] == "INVALID_CREDENTIALS"


@pytest.mark.asyncio
async def test_login_inactive_account(client: AsyncClient, db_session: AsyncSession):
    register_payload = {
        "email": "inactive_api@example.com",
        "username": "inactive_api",
        "password": "SecurePassword123!",
    }
    await client.post("/api/v1/auth/register", json=register_payload)

    # Deactivate account directly in DB
    user = await user_repository.get_by_email(db_session, "inactive_api@example.com")
    assert user is not None
    user.is_active = False
    await db_session.commit()

    login_payload = {
        "email": "inactive_api@example.com",
        "password": "SecurePassword123!",
    }
    response = await client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 403
    body = response.json()
    assert body["success"] is False
    assert body["error"]["code"] == "FORBIDDEN"


@pytest.mark.asyncio
async def test_refresh_token_flow(client: AsyncClient):
    register_payload = {
        "email": "refresh_api@example.com",
        "username": "refresh_api_user",
        "password": "SecurePassword123!",
    }
    reg_res = await client.post("/api/v1/auth/register", json=register_payload)
    assert "refreshToken" in reg_res.cookies
    initial_refresh_cookie = reg_res.cookies["refreshToken"]

    # Call /refresh endpoint with Cookie header
    refresh_res = await client.post(
        "/api/v1/auth/refresh",
        headers={"Cookie": f"refreshToken={initial_refresh_cookie}"},
    )
    assert refresh_res.status_code == 200

    data = refresh_res.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert "refreshToken" in refresh_res.cookies


@pytest.mark.asyncio
async def test_refresh_token_missing_cookie(client: AsyncClient):
    response = await client.post("/api/v1/auth/refresh")
    assert response.status_code == 401
    body = response.json()
    assert body["success"] is False
    assert body["error"]["code"] == "INVALID_CREDENTIALS"


@pytest.mark.asyncio
async def test_refresh_token_expired(client: AsyncClient, db_session: AsyncSession):
    register_payload = {
        "email": "expired_refresh@example.com",
        "username": "expired_refresh_user",
        "password": "SecurePassword123!",
    }
    await client.post("/api/v1/auth/register", json=register_payload)
    user = await user_repository.get_by_email(db_session, "expired_refresh@example.com")
    assert user is not None

    expired_refresh_jwt = create_refresh_token(
        subject=user.id,
        token_version=user.token_version,
        expires_delta=timedelta(seconds=-10),
    )

    response = await client.post(
        "/api/v1/auth/refresh",
        headers={"Cookie": f"refreshToken={expired_refresh_jwt}"},
    )
    assert response.status_code == 401
    body = response.json()
    assert body["error"]["code"] == "TOKEN_EXPIRED"


@pytest.mark.asyncio
async def test_refresh_token_wrong_type(client: AsyncClient, db_session: AsyncSession):
    register_payload = {
        "email": "wrong_type_refresh@example.com",
        "username": "wrong_type_refresh_user",
        "password": "SecurePassword123!",
    }
    await client.post("/api/v1/auth/register", json=register_payload)
    user = await user_repository.get_by_email(db_session, "wrong_type_refresh@example.com")
    assert user is not None

    # Pass access token instead of refresh token in cookie
    access_token = create_access_token(subject=user.id)

    response = await client.post(
        "/api/v1/auth/refresh",
        headers={"Cookie": f"refreshToken={access_token}"},
    )
    assert response.status_code == 401
    body = response.json()
    assert body["error"]["code"] == "INVALID_TOKEN"


@pytest.mark.asyncio
async def test_logout_and_session_revocation(client: AsyncClient, db_session: AsyncSession):
    register_payload = {
        "email": "logout_test@example.com",
        "username": "logout_user",
        "password": "SecurePassword123!",
    }
    reg_res = await client.post("/api/v1/auth/register", json=register_payload)
    access_token = reg_res.json()["data"]["access_token"]
    refresh_cookie = reg_res.cookies["refreshToken"]

    # Logout
    logout_res = await client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert logout_res.status_code == 200
    assert logout_res.json()["success"] is True

    # Check that previous refresh token is now revoked (token_version mismatch)
    attempt_refresh = await client.post(
        "/api/v1/auth/refresh",
        headers={"Cookie": f"refreshToken={refresh_cookie}"},
    )
    assert attempt_refresh.status_code == 401
    assert "revoked" in attempt_refresh.json()["error"]["message"].lower()


@pytest.mark.asyncio
async def test_get_me_success(client: AsyncClient):
    register_payload = {
        "email": "me_test@example.com",
        "username": "me_user",
        "password": "SecurePassword123!",
    }
    reg_res = await client.post("/api/v1/auth/register", json=register_payload)
    access_token = reg_res.json()["data"]["access_token"]

    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "me_test@example.com"
    assert data["data"]["username"] == "me_user"
    assert "password_hash" not in data["data"]


@pytest.mark.asyncio
async def test_get_me_unauthorized(client: AsyncClient):
    # Missing token
    response_no_token = await client.get("/api/v1/auth/me")
    assert response_no_token.status_code == 401

    # Invalid token
    response_invalid = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.jwt.payload"},
    )
    assert response_invalid.status_code == 401


@pytest.mark.asyncio
async def test_get_me_inactive_user(client: AsyncClient, db_session: AsyncSession):
    register_payload = {
        "email": "me_inactive@example.com",
        "username": "me_inactive_user",
        "password": "SecurePassword123!",
    }
    reg_res = await client.post("/api/v1/auth/register", json=register_payload)
    access_token = reg_res.json()["data"]["access_token"]

    # Deactivate in database
    user = await user_repository.get_by_email(db_session, "me_inactive@example.com")
    assert user is not None
    user.is_active = False
    await db_session.commit()

    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "FORBIDDEN"
