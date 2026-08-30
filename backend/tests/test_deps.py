from datetime import timedelta
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, get_current_user, require_role
from app.core.exceptions import (
    ForbiddenError,
    InvalidCredentialsError,
    InvalidTokenError,
    TokenExpiredError,
)
from app.core.security import create_access_token, create_refresh_token
from app.models.user import User
from app.repositories.user_repository import user_repository


@pytest.mark.asyncio
async def test_get_current_user_success(db_session: AsyncSession):
    user = await user_repository.create(
        db_session,
        email="deps_user@example.com",
        username="deps_user",
        password_hash="$2b$12$fakehash",
    )

    token = create_access_token(subject=user.id, role=user.role)
    current_user = await get_current_user(token=token, db=db_session)

    assert current_user.id == user.id
    assert current_user.email == "deps_user@example.com"


@pytest.mark.asyncio
async def test_get_current_user_missing_token(db_session: AsyncSession):
    with pytest.raises(InvalidCredentialsError):
        await get_current_user(token=None, db=db_session)

    with pytest.raises(InvalidCredentialsError):
        await get_current_user(token="   ", db=db_session)


@pytest.mark.asyncio
async def test_get_current_user_expired_token(db_session: AsyncSession):
    user = await user_repository.create(
        db_session,
        email="expired_deps@example.com",
        username="expired_deps",
        password_hash="$2b$12$fakehash",
    )

    expired_token = create_access_token(
        subject=user.id,
        expires_delta=timedelta(seconds=-10),
    )

    with pytest.raises(TokenExpiredError):
        await get_current_user(token=expired_token, db=db_session)


@pytest.mark.asyncio
async def test_get_current_user_wrong_token_type(db_session: AsyncSession):
    user = await user_repository.create(
        db_session,
        email="wrong_type@example.com",
        username="wrong_type",
        password_hash="$2b$12$fakehash",
    )

    # Refresh token should be rejected by get_current_user (which expects access token)
    refresh_token = create_refresh_token(subject=user.id)

    with pytest.raises(InvalidTokenError) as exc_info:
        await get_current_user(token=refresh_token, db=db_session)
    assert "expected 'access'" in str(exc_info.value.message).lower()


@pytest.mark.asyncio
async def test_get_current_active_user_success(db_session: AsyncSession):
    user = await user_repository.create(
        db_session,
        email="active_user@example.com",
        username="active_user",
        password_hash="$2b$12$fakehash",
        is_active=True,
    )

    active_user = await get_current_active_user(current_user=user)
    assert active_user.id == user.id


@pytest.mark.asyncio
async def test_get_current_active_user_inactive_rejected(db_session: AsyncSession):
    user = await user_repository.create(
        db_session,
        email="inactive_dep@example.com",
        username="inactive_dep",
        password_hash="$2b$12$fakehash",
        is_active=False,
    )

    with pytest.raises(ForbiddenError) as exc_info:
        await get_current_active_user(current_user=user)
    assert "deactivated" in str(exc_info.value.message).lower()


@pytest.mark.asyncio
async def test_require_role_rbac_authorization(db_session: AsyncSession):
    regular_user = await user_repository.create(
        db_session,
        email="regular@example.com",
        username="regular_user",
        password_hash="$2b$12$fakehash",
        role="USER",
    )

    admin_user = await user_repository.create(
        db_session,
        email="admin_role@example.com",
        username="admin_role_user",
        password_hash="$2b$12$fakehash",
        role="ADMIN",
    )

    # 1. Regular user accessing USER role check -> OK
    user_checker = require_role("USER")
    res1 = await user_checker(current_user=regular_user)
    assert res1.id == regular_user.id

    # 2. Regular user accessing ADMIN role check -> Rejected with ForbiddenError
    admin_checker = require_role("ADMIN")
    with pytest.raises(ForbiddenError) as exc_info:
        await admin_checker(current_user=regular_user)
    assert "permissions" in str(exc_info.value.message).lower()

    # 3. Admin user accessing ADMIN role check -> OK
    res2 = await admin_checker(current_user=admin_user)
    assert res2.id == admin_user.id

    # 4. Admin user accessing USER role check -> OK (Admin override)
    res3 = await user_checker(current_user=admin_user)
    assert res3.id == admin_user.id
