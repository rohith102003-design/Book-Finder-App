import uuid
from datetime import timedelta
import pytest
import jwt

from app.core.config import settings
from app.core.exceptions import InvalidTokenError, TokenExpiredError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_password_hashing_not_plaintext():
    password = "MySecurePassword123!"
    hashed = hash_password(password)

    assert hashed != password
    assert hashed.startswith("$2b$") or hashed.startswith("$2a$") or "$bcrypt$" in hashed or len(hashed) > 30


def test_password_verification_success():
    password = "MySecurePassword123!"
    hashed = hash_password(password)

    assert verify_password(password, hashed) is True


def test_password_verification_failure():
    password = "MySecurePassword123!"
    hashed = hash_password(password)

    assert verify_password("WrongPassword999!", hashed) is False


def test_access_token_creation_and_decoding():
    user_id = str(uuid.uuid4())
    token = create_access_token(subject=user_id, role="USER")

    payload = decode_token(token, expected_type="access")
    assert payload["sub"] == user_id
    assert payload["role"] == "USER"
    assert payload["type"] == "access"
    assert "iat" in payload
    assert "exp" in payload
    assert payload["exp"] > payload["iat"]


def test_refresh_token_creation_and_decoding():
    user_id = str(uuid.uuid4())
    token = create_refresh_token(subject=user_id, token_version=2)

    payload = decode_token(token, expected_type="refresh")
    assert payload["sub"] == user_id
    assert payload["type"] == "refresh"
    assert payload["ver"] == 2
    assert "jti" in payload
    assert isinstance(payload["jti"], str)
    assert len(payload["jti"]) > 10


def test_access_and_refresh_tokens_have_different_types():
    user_id = str(uuid.uuid4())
    access_token = create_access_token(subject=user_id)
    refresh_token = create_refresh_token(subject=user_id)

    access_payload = decode_token(access_token)
    refresh_payload = decode_token(refresh_token)

    assert access_payload["type"] == "access"
    assert refresh_payload["type"] == "refresh"
    assert access_payload["type"] != refresh_payload["type"]


def test_expired_jwt_is_rejected():
    user_id = str(uuid.uuid4())
    # Create token expired 10 seconds ago
    expired_token = create_access_token(subject=user_id, expires_delta=timedelta(seconds=-10))

    with pytest.raises(TokenExpiredError) as exc_info:
        decode_token(expired_token)
    assert "expired" in str(exc_info.value.message).lower()


def test_tampered_jwt_is_rejected():
    user_id = str(uuid.uuid4())
    token = create_access_token(subject=user_id)

    # Tamper with the payload portion of the JWT
    parts = token.split(".")
    tampered_payload = parts[1][:-2] + "AA"
    tampered_token = f"{parts[0]}.{tampered_payload}.{parts[2]}"

    with pytest.raises(InvalidTokenError):
        decode_token(tampered_token)


def test_malformed_jwt_is_rejected():
    with pytest.raises(InvalidTokenError):
        decode_token("not.a.valid.jwt.string")

    with pytest.raises(InvalidTokenError):
        decode_token("")


def test_wrong_token_type_is_rejected():
    user_id = str(uuid.uuid4())
    access_token = create_access_token(subject=user_id)

    # Attempt to validate access token as a refresh token
    with pytest.raises(InvalidTokenError) as exc_info:
        decode_token(access_token, expected_type="refresh")
    assert "expected 'refresh'" in str(exc_info.value.message).lower()

    # Attempt to validate refresh token as an access token
    refresh_token = create_refresh_token(subject=user_id)
    with pytest.raises(InvalidTokenError) as exc_info:
        decode_token(refresh_token, expected_type="access")
    assert "expected 'access'" in str(exc_info.value.message).lower()
