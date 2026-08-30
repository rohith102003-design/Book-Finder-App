import uuid
from typing import Callable, Optional
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import (
    ForbiddenError,
    InvalidCredentialsError,
    InvalidTokenError,
)
from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import User
from app.repositories.user_repository import user_repository
from app.schemas.user import UserRole

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False,
)


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """FastAPI dependency to extract and validate Bearer access token from Authorization header"""
    if not token or not token.strip():
        raise InvalidCredentialsError("Authentication credentials were not provided.")

    payload = decode_token(token, expected_type="access")

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise InvalidTokenError("Token is missing user identification claim.")

    try:
        user_id = uuid.UUID(str(user_id_str))
    except ValueError:
        raise InvalidTokenError("Malformed user identifier in token.")

    user = await user_repository.get_by_id(db, user_id)
    if not user:
        raise InvalidCredentialsError("User account not found.")

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """FastAPI dependency ensuring the authenticated user account is active"""
    if not current_user.is_active:
        raise ForbiddenError("Account has been deactivated.")
    return current_user


def require_role(required_role: str) -> Callable:
    """FastAPI dependency factory enforcing Role-Based Access Control (RBAC)"""
    async def role_checker(
        current_user: User = Depends(get_current_active_user),
    ) -> User:
        # ADMIN users are granted full access to all roles
        if current_user.role != required_role and current_user.role != UserRole.ADMIN.value:
            raise ForbiddenError(f"Operation requires '{required_role}' permissions.")
        return current_user

    return role_checker
