import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    ForbiddenError,
    InvalidCredentialsError,
    InvalidTokenError,
    UserAlreadyExistsError,
)
from app.core.security import decode_token, verify_password
from app.schemas.user import UserCreate
from app.services.auth_service import auth_service


@pytest.mark.asyncio
async def test_register_user_success(db_session: AsyncSession):
    user_in = UserCreate(
        email="newuser@example.com",
        username="newuser",
        password="SecurePassword123!",
    )
    user = await auth_service.register_user(db_session, user_in)

    assert user.id is not None
    assert user.email == "newuser@example.com"
    assert user.username == "newuser"
    assert user.role == "USER"
    assert user.is_active is True
    assert user.token_version == 1
    # Verify password was hashed and not stored in plaintext
    assert user.password_hash != "SecurePassword123!"
    assert verify_password("SecurePassword123!", user.password_hash) is True


@pytest.mark.asyncio
async def test_register_user_duplicate_email(db_session: AsyncSession):
    user_in1 = UserCreate(
        email="duplicate@example.com",
        username="user_one",
        password="SecurePassword123!",
    )
    await auth_service.register_user(db_session, user_in1)

    user_in2 = UserCreate(
        email="DUPLICATE@example.com",
        username="user_two",
        password="SecurePassword123!",
    )
    with pytest.raises(UserAlreadyExistsError) as exc_info:
        await auth_service.register_user(db_session, user_in2)
    assert "email already exists" in str(exc_info.value.message).lower()


@pytest.mark.asyncio
async def test_register_user_duplicate_username(db_session: AsyncSession):
    user_in1 = UserCreate(
        email="first@example.com",
        username="same_handle",
        password="SecurePassword123!",
    )
    await auth_service.register_user(db_session, user_in1)

    user_in2 = UserCreate(
        email="second@example.com",
        username="same_handle",
        password="SecurePassword123!",
    )
    with pytest.raises(UserAlreadyExistsError) as exc_info:
        await auth_service.register_user(db_session, user_in2)
    assert "username is already taken" in str(exc_info.value.message).lower()


@pytest.mark.asyncio
async def test_authenticate_user_success(db_session: AsyncSession):
    user_in = UserCreate(
        email="authuser@example.com",
        username="authuser",
        password="SecurePassword123!",
    )
    created = await auth_service.register_user(db_session, user_in)

    authenticated = await auth_service.authenticate_user(
        db_session,
        email="authuser@example.com",
        password="SecurePassword123!",
    )
    assert authenticated.id == created.id


@pytest.mark.asyncio
async def test_authenticate_user_invalid_password(db_session: AsyncSession):
    user_in = UserCreate(
        email="wrongpass@example.com",
        username="wrongpass",
        password="SecurePassword123!",
    )
    await auth_service.register_user(db_session, user_in)

    with pytest.raises(InvalidCredentialsError):
        await auth_service.authenticate_user(
            db_session,
            email="wrongpass@example.com",
            password="IncorrectPassword999!",
        )


@pytest.mark.asyncio
async def test_authenticate_user_non_existent_email(db_session: AsyncSession):
    with pytest.raises(InvalidCredentialsError):
        await auth_service.authenticate_user(
            db_session,
            email="doesnotexist@example.com",
            password="SomePassword123!",
        )


@pytest.mark.asyncio
async def test_authenticate_user_inactive_account(db_session: AsyncSession):
    user_in = UserCreate(
        email="inactive@example.com",
        username="inactive_user",
        password="SecurePassword123!",
    )
    user = await auth_service.register_user(db_session, user_in)

    # Deactivate user
    user.is_active = False
    await db_session.commit()

    with pytest.raises(ForbiddenError) as exc_info:
        await auth_service.authenticate_user(
            db_session,
            email="inactive@example.com",
            password="SecurePassword123!",
        )
    assert "deactivated" in str(exc_info.value.message).lower()


@pytest.mark.asyncio
async def test_token_generation_and_refresh_validation(db_session: AsyncSession):
    user_in = UserCreate(
        email="tokens@example.com",
        username="tokens_user",
        password="SecurePassword123!",
    )
    user = await auth_service.register_user(db_session, user_in)

    access_token, refresh_token = auth_service.generate_tokens_for_user(user)

    # Validate access token structure
    access_payload = decode_token(access_token, expected_type="access")
    assert access_payload["sub"] == str(user.id)
    assert access_payload["type"] == "access"

    # Validate refresh token via service
    validated_user = await auth_service.validate_refresh_token(db_session, refresh_token)
    assert validated_user.id == user.id


@pytest.mark.asyncio
async def test_refresh_token_revocation_on_version_increment(db_session: AsyncSession):
    user_in = UserCreate(
        email="revoke@example.com",
        username="revoke_user",
        password="SecurePassword123!",
    )
    user = await auth_service.register_user(db_session, user_in)

    _, refresh_token = auth_service.generate_tokens_for_user(user)

    # Revoke sessions (increments token_version)
    await auth_service.revoke_user_sessions(db_session, user.id)

    # Validating the old refresh token must fail
    with pytest.raises(InvalidTokenError) as exc_info:
        await auth_service.validate_refresh_token(db_session, refresh_token)
    assert "revoked" in str(exc_info.value.message).lower()


@pytest.mark.asyncio
async def test_rotate_refresh_token_success(db_session: AsyncSession):
    user_in = UserCreate(
        email="rotate@example.com",
        username="rotate_user",
        password="SecurePassword123!",
    )
    user = await auth_service.register_user(db_session, user_in)

    _, initial_refresh_token = auth_service.generate_tokens_for_user(user)

    new_access, new_refresh, rotated_user = await auth_service.rotate_refresh_token(
        db_session,
        initial_refresh_token,
    )

    assert new_access is not None
    assert new_refresh is not None
    assert rotated_user.id == user.id
