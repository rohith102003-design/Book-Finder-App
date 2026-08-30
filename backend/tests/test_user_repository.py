import uuid
import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repository import user_repository


@pytest.mark.asyncio
async def test_user_creation_and_defaults(db_session: AsyncSession):
    user = await user_repository.create(
        db_session,
        email="testuser@example.com",
        username="testuser",
        password_hash="$2b$12$hashedpasswordplaceholder",
    )

    assert user.id is not None
    assert user.email == "testuser@example.com"
    assert user.username == "testuser"
    assert user.password_hash == "$2b$12$hashedpasswordplaceholder"
    # Verify defaults
    assert user.role == "USER"
    assert user.is_active is True
    assert user.token_version == 1
    assert user.created_at is not None
    assert user.updated_at is not None


@pytest.mark.asyncio
async def test_get_user_by_id(db_session: AsyncSession):
    created = await user_repository.create(
        db_session,
        email="byid@example.com",
        username="byid_user",
        password_hash="$2b$12$hash",
    )

    fetched = await user_repository.get_by_id(db_session, created.id)
    assert fetched is not None
    assert fetched.id == created.id
    assert fetched.email == "byid@example.com"


@pytest.mark.asyncio
async def test_get_user_by_email_and_casing_normalization(db_session: AsyncSession):
    # Create with mixed case in input
    created = await user_repository.create(
        db_session,
        email="Reader.Book@Example.COM",
        username="reader_book",
        password_hash="$2b$12$hash",
    )

    assert created.email == "reader.book@example.com"

    # Query with uppercase, lowercase, mixed case
    found_upper = await user_repository.get_by_email(db_session, "READER.BOOK@EXAMPLE.COM")
    found_lower = await user_repository.get_by_email(db_session, "reader.book@example.com")
    found_mixed = await user_repository.get_by_email(db_session, "  Reader.Book@Example.com  ")

    assert found_upper is not None and found_upper.id == created.id
    assert found_lower is not None and found_lower.id == created.id
    assert found_mixed is not None and found_mixed.id == created.id


@pytest.mark.asyncio
async def test_get_user_by_username(db_session: AsyncSession):
    created = await user_repository.create(
        db_session,
        email="username_test@example.com",
        username="unique_handle",
        password_hash="$2b$12$hash",
    )

    fetched = await user_repository.get_by_username(db_session, "unique_handle")
    assert fetched is not None
    assert fetched.id == created.id


@pytest.mark.asyncio
async def test_increment_token_version(db_session: AsyncSession):
    user = await user_repository.create(
        db_session,
        email="token_test@example.com",
        username="token_user",
        password_hash="$2b$12$hash",
    )
    assert user.token_version == 1

    updated = await user_repository.increment_token_version(db_session, user.id)
    assert updated is not None
    assert updated.token_version == 2

    updated_again = await user_repository.increment_token_version(db_session, user.id)
    assert updated_again is not None
    assert updated_again.token_version == 3


@pytest.mark.asyncio
async def test_duplicate_email_rejected(db_session: AsyncSession):
    await user_repository.create(
        db_session,
        email="duplicate@example.com",
        username="first_user",
        password_hash="$2b$12$hash1",
    )

    with pytest.raises(IntegrityError):
        await user_repository.create(
            db_session,
            email="DUPLICATE@example.com",  # Should trigger unique constraint
            username="second_user",
            password_hash="$2b$12$hash2",
        )
    await db_session.rollback()


@pytest.mark.asyncio
async def test_duplicate_username_rejected(db_session: AsyncSession):
    await user_repository.create(
        db_session,
        email="user1@example.com",
        username="same_username",
        password_hash="$2b$12$hash1",
    )

    with pytest.raises(IntegrityError):
        await user_repository.create(
            db_session,
            email="user2@example.com",
            username="same_username",
            password_hash="$2b$12$hash2",
        )
    await db_session.rollback()


@pytest.mark.asyncio
async def test_custom_role_assignment(db_session: AsyncSession):
    admin = await user_repository.create(
        db_session,
        email="admin@example.com",
        username="admin_user",
        password_hash="$2b$12$hash",
        role="ADMIN",
    )

    assert admin.role == "ADMIN"
