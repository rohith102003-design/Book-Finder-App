import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union
import jwt
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher

from app.core.config import settings
from app.core.exceptions import InvalidTokenError, TokenExpiredError

# Configure password hashing with bcrypt (cost factor = 12)
password_hash_handler = PasswordHash((BcryptHasher(rounds=12),))


def hash_password(password: str) -> str:
    """Hashes a plaintext password using bcrypt with salt factor 12"""
    return password_hash_handler.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plaintext password against a bcrypt hash"""
    return password_hash_handler.verify(plain_password, hashed_password)


def create_access_token(
    subject: Union[str, Any],
    role: str = "USER",
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Generates a short-lived access JWT (default: 15 minutes)"""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    payload: Dict[str, Any] = {
        "sub": str(subject),
        "type": "access",
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }

    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(
    subject: Union[str, Any],
    token_version: int = 1,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Generates a long-lived refresh JWT (default: 7 days) with unique JTI and token version"""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    payload: Dict[str, Any] = {
        "sub": str(subject),
        "type": "refresh",
        "ver": token_version,
        "jti": str(uuid.uuid4()),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }

    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_password_reset_token(
    user_id: Union[str, Any],
    email: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Generates a secure password reset JWT token valid for 15 minutes"""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=15)

    payload: Dict[str, Any] = {
        "sub": str(user_id),
        "email": str(email).lower(),
        "type": "password_reset",
        "jti": str(uuid.uuid4()),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }

    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(
    token: str,
    expected_type: Optional[str] = None,
) -> Dict[str, Any]:
    """Decodes and strictly validates a JWT signature, expiration, and token type"""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except jwt.ExpiredSignatureError:
        raise TokenExpiredError("Token has expired.")
    except (jwt.InvalidTokenError, jwt.PyJWTError):
        raise InvalidTokenError("Invalid or malformed token.")

    if not isinstance(payload, dict):
        raise InvalidTokenError("Invalid token payload format.")

    if "sub" not in payload:
        raise InvalidTokenError("Token payload missing required 'sub' claim.")

    token_type = payload.get("type")
    if not token_type:
        raise InvalidTokenError("Token payload missing required 'type' claim.")

    if expected_type is not None and token_type != expected_type:
        raise InvalidTokenError(
            f"Invalid token type '{token_type}'. Expected '{expected_type}' token."
        )

    return payload
