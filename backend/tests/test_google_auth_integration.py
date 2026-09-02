import uuid
import pytest
from httpx import AsyncClient
from unittest.mock import patch
from app.services.auth_service import auth_service
from app.schemas.user import GoogleAuthPayload, UserCreate
from app.core.config import settings
from app.core.exceptions import InvalidCredentialsError


@pytest.mark.asyncio
async def test_google_auth_and_account_linking(client: AsyncClient, db_session):
    # 1. Test normal registration first
    user_email = f"google_link_{uuid.uuid4().hex[:6]}@gmail.com"
    user_in = UserCreate(
        email=user_email,
        username=f"guser_{uuid.uuid4().hex[:6]}",
        password="Password123!"
    )
    user, _ = await auth_service.register_user(db_session, user_in)
    original_user_id = user.id
    assert user.auth_provider == "LOCAL"
    assert user.provider_user_id is None

    # 2. Mock Google TokenInfo endpoint response
    google_sub_id = f"google_sub_{uuid.uuid4().hex[:12]}"
    mock_tokeninfo = {
        "iss": "https://accounts.google.com",
        "sub": google_sub_id,
        "email": user_email,
        "email_verified": "true",
        "name": "Google User",
        "picture": "https://lh3.googleusercontent.com/a/avatar.jpg",
        "exp": 9999999999,
    }

    class MockResponse:
        status_code = 200
        def json(self):
            return mock_tokeninfo

    with patch("httpx.AsyncClient.get", return_value=MockResponse()):
        payload = GoogleAuthPayload(credential="mock_valid_id_token")
        auth_user = await auth_service.authenticate_google_user(db_session, payload)

        # Confirm account linking: SAME user ID!
        assert auth_user.id == original_user_id
        assert auth_user.email == user_email
        assert auth_user.provider_user_id == google_sub_id
        assert auth_user.auth_provider == "GOOGLE"
        assert auth_user.avatar_url == "https://lh3.googleusercontent.com/a/avatar.jpg"
        assert auth_user.email_verified is True

    # 3. Test new Google user creation (non-existing email)
    new_google_email = f"brand_new_{uuid.uuid4().hex[:6]}@gmail.com"
    new_google_sub = f"google_sub_{uuid.uuid4().hex[:12]}"
    new_mock_tokeninfo = {
        "iss": "accounts.google.com",
        "sub": new_google_sub,
        "email": new_google_email,
        "email_verified": True,
        "name": "Brand New Google User",
        "picture": "https://lh3.googleusercontent.com/a/new_avatar.jpg",
        "exp": 9999999999,
    }

    class MockNewResponse:
        status_code = 200
        def json(self):
            return new_mock_tokeninfo

    with patch("httpx.AsyncClient.get", return_value=MockNewResponse()):
        payload2 = GoogleAuthPayload(credential="mock_new_id_token")
        new_auth_user = await auth_service.authenticate_google_user(db_session, payload2)

        assert new_auth_user.id != original_user_id
        assert new_auth_user.email == new_google_email
        assert new_auth_user.provider_user_id == new_google_sub
        assert new_auth_user.auth_provider == "GOOGLE"
        assert new_auth_user.avatar_url == "https://lh3.googleusercontent.com/a/new_avatar.jpg"
        assert new_auth_user.email_verified is True


@pytest.mark.asyncio
async def test_google_auth_strict_audience_validation(client: AsyncClient, db_session):
    """
    Verifies that when GOOGLE_CLIENT_ID is configured on the server:
    1. A token matching settings.GOOGLE_CLIENT_ID is accepted.
    2. A token with a mismatched aud is rejected, even if the request payload supplies client_id.
    3. A token with a missing aud is rejected.
    """
    server_client_id = "trusted-server-app-123.apps.googleusercontent.com"
    attacker_client_id = "untrusted-rogue-app-999.apps.googleusercontent.com"

    original_client_id = settings.GOOGLE_CLIENT_ID
    settings.GOOGLE_CLIENT_ID = server_client_id

    try:
        # Case 1: Matching aud -> Accepted
        matching_tokeninfo = {
            "iss": "https://accounts.google.com",
            "aud": server_client_id,
            "sub": f"sub_{uuid.uuid4().hex[:8]}",
            "email": f"valid_{uuid.uuid4().hex[:6]}@gmail.com",
            "email_verified": True,
            "exp": 9999999999,
        }

        class MockMatchingResp:
            status_code = 200
            def json(self):
                return matching_tokeninfo

        with patch("httpx.AsyncClient.get", return_value=MockMatchingResp()):
            payload = GoogleAuthPayload(credential="token_matching_aud")
            user = await auth_service.authenticate_google_user(db_session, payload)
            assert user.email == matching_tokeninfo["email"]

        # Case 2: Mismatched aud -> Strictly rejected (even if payload passes matching client_id)
        mismatched_tokeninfo = {
            "iss": "https://accounts.google.com",
            "aud": attacker_client_id,
            "sub": f"sub_{uuid.uuid4().hex[:8]}",
            "email": f"attacker_{uuid.uuid4().hex[:6]}@gmail.com",
            "email_verified": True,
            "exp": 9999999999,
        }

        class MockMismatchedResp:
            status_code = 200
            def json(self):
                return mismatched_tokeninfo

        with patch("httpx.AsyncClient.get", return_value=MockMismatchedResp()):
            # Even if frontend payload sends the rogue client_id, server must reject
            payload_rogue = GoogleAuthPayload(
                credential="token_rogue_aud",
                client_id=attacker_client_id,
            )
            with pytest.raises(InvalidCredentialsError) as exc_info:
                await auth_service.authenticate_google_user(db_session, payload_rogue)
            assert "Client ID mismatch" in str(exc_info.value)

        # Case 3: Missing/empty aud -> Strictly rejected
        missing_aud_tokeninfo = {
            "iss": "https://accounts.google.com",
            "aud": "",
            "sub": f"sub_{uuid.uuid4().hex[:8]}",
            "email": f"noaud_{uuid.uuid4().hex[:6]}@gmail.com",
            "email_verified": True,
            "exp": 9999999999,
        }

        class MockMissingAudResp:
            status_code = 200
            def json(self):
                return missing_aud_tokeninfo

        with patch("httpx.AsyncClient.get", return_value=MockMissingAudResp()):
            payload_no_aud = GoogleAuthPayload(credential="token_no_aud")
            with pytest.raises(InvalidCredentialsError) as exc_info:
                await auth_service.authenticate_google_user(db_session, payload_no_aud)
            assert "Client ID mismatch" in str(exc_info.value)

    finally:
        settings.GOOGLE_CLIENT_ID = original_client_id
