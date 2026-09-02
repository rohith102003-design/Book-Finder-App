import datetime
from datetime import timedelta, timezone
import os
import re
import secrets
import time
import uuid
import httpx
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import (
    EmailNotVerifiedError,
    ForbiddenError,
    InvalidCredentialsError,
    InvalidTokenError,
    InvalidVerificationCodeError,
    UserAlreadyExistsError,
    UserNotFoundError,
)
from app.core.security import (
    create_access_token,
    create_password_reset_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.repositories.email_verification_repository import (
    email_verification_repository,
)
from app.repositories.user_repository import user_repository
from app.schemas.user import GoogleAuthPayload, UserCreate, UserRole
from app.services.email_service import email_service


class AuthService:
    """Business logic service for user authentication, registration, email verification, and token lifecycle management"""

    def __init__(self):
        self.repository = user_repository
        self.verification_repo = email_verification_repository
        self.email_service = email_service

    def is_gmail_address(self, email: str) -> bool:
        """Validates that email address belongs to Gmail/Google Mail domain"""
        normalized = email.strip().lower()
        return normalized.endswith("@gmail.com") or normalized.endswith("@googlemail.com")

    async def register_user(
        self,
        db: AsyncSession,
        user_in: UserCreate,
    ) -> Tuple[User, Optional[str]]:
        """Registers a new user account, enforces Gmail domain, and immediately activates account when SMTP verification is disabled"""
        email = user_in.email.strip().lower()

        # Enforce Gmail address requirement on normal registration
        if not self.is_gmail_address(email):
            raise InvalidCredentialsError("Please use a Gmail address (@gmail.com) to create an account.")

        # 1. Check email uniqueness (case-insensitive)
        existing_email_user = await self.repository.get_by_email(db, email)
        if existing_email_user:
            raise UserAlreadyExistsError("An account with this email already exists.")

        # 2. Check username uniqueness
        existing_username_user = await self.repository.get_by_username(db, user_in.username)
        if existing_username_user:
            raise UserAlreadyExistsError("Username is already taken.")

        # 3. Hash password and persist user
        # When REQUIRE_EMAIL_VERIFICATION is False (default), mark email_verified = True immediately
        initial_verified = not settings.REQUIRE_EMAIL_VERIFICATION
        password_hash = hash_password(user_in.password)
        created_user = await self.repository.create(
            db=db,
            email=email,
            username=user_in.username,
            password_hash=password_hash,
            auth_provider="LOCAL",
            provider_user_id=None,
            email_verified=initial_verified,
            avatar_url=None,
            role=UserRole.USER.value,
            is_active=True,
        )

        code: Optional[str] = None
        # If mandatory verification is explicitly enabled via config, generate code & send email
        if settings.REQUIRE_EMAIL_VERIFICATION:
            code = f"{secrets.randbelow(900000) + 100000}"
            expires_at = datetime.datetime.now(timezone.utc) + timedelta(
                minutes=settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES
            )
            await self.verification_repo.create_token(
                db=db,
                user_id=created_user.id,
                code=code,
                expires_at=expires_at,
            )
            self.email_service.send_verification_email(
                to_email=created_user.email,
                username=created_user.username,
                code=code,
            )

        return created_user, code

    async def verify_email(
        self,
        db: AsyncSession,
        email: str,
        code: str,
    ) -> User:
        """Validates 6-digit code, marks user as email_verified=True, and returns activated User"""
        normalized_email = email.strip().lower()
        user = await self.repository.get_by_email(db, normalized_email)
        if not user:
            raise UserNotFoundError("User account not found.")

        if user.email_verified:
            return user

        token = await self.verification_repo.get_active_token(db, user.id, code.strip())
        if not token:
            raise InvalidVerificationCodeError("Invalid or expired verification code.")

        # Mark token as used
        await self.verification_repo.mark_as_used(db, token)

        # Activate user account
        user.email_verified = True
        await self.repository.update_user(db, user)

        return user

    async def resend_verification_code(
        self,
        db: AsyncSession,
        email: str,
    ) -> str:
        """Invalidates older tokens, generates a fresh 6-digit code, and resends activation email"""
        normalized_email = email.strip().lower()
        user = await self.repository.get_by_email(db, normalized_email)
        if not user:
            return "If an account with this email exists, a verification code has been dispatched."

        if user.email_verified:
            return "This email address is already verified."

        # Invalidate old unused tokens
        await self.verification_repo.invalidate_user_tokens(db, user.id)

        # Generate fresh code
        code = f"{secrets.randbelow(900000) + 100000}"
        expires_at = datetime.datetime.now(timezone.utc) + timedelta(
            minutes=settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES
        )
        await self.verification_repo.create_token(
            db=db,
            user_id=user.id,
            code=code,
            expires_at=expires_at,
        )

        self.email_service.send_verification_email(
            to_email=user.email,
            username=user.username,
            code=code,
        )

        return "A new 6-digit verification code has been sent to your email."

    async def authenticate_user(
        self,
        db: AsyncSession,
        email: str,
        password: str,
    ) -> User:
        """Authenticates user credentials, active status, and email verification state"""
        normalized_email = email.strip().lower()

        # Enforce Gmail address requirement on normal login
        if not self.is_gmail_address(normalized_email):
            raise InvalidCredentialsError("Please use a Gmail address (@gmail.com) to sign in.")

        user = await self.repository.get_by_email(db, normalized_email)
        if not user or not verify_password(password, user.password_hash):
            raise InvalidCredentialsError("Invalid email or password.")

        if not user.is_active:
            raise ForbiddenError("Account has been deactivated.")

        # Only block if REQUIRE_EMAIL_VERIFICATION is explicitly configured True
        if settings.REQUIRE_EMAIL_VERIFICATION and not user.email_verified:
            raise EmailNotVerifiedError(
                "Email is not verified. Please verify your email address to access your account."
            )

        return user

    async def authenticate_google_user(
        self,
        db: AsyncSession,
        payload: GoogleAuthPayload,
    ) -> User:
        """
        Cryptographically verifies Google OAuth ID Token credential via Google's tokeninfo API,
        validates issuer, audience, expiration, and email claims, performs safe account linking,
        and returns the authenticated User record.
        """
        token = payload.credential.strip()
        google_user_info = None

        # 1. Cryptographically verify token with Google TokenInfo endpoint
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={token}")
                if resp.status_code == 200:
                    google_user_info = resp.json()
        except Exception:
            pass

        # Fallback for OAuth access tokens if supplied
        if not google_user_info or "email" not in google_user_info:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.get(
                        "https://www.googleapis.com/oauth2/v3/userinfo",
                        headers={"Authorization": f"Bearer {token}"},
                    )
                    if resp.status_code == 200:
                        google_user_info = resp.json()
            except Exception:
                pass

        if not google_user_info or "email" not in google_user_info:
            raise InvalidCredentialsError("Google authentication failed. Invalid token.")

        # 2. Validate token claims
        issuer = google_user_info.get("iss", "")
        if issuer not in ["accounts.google.com", "https://accounts.google.com"]:
            raise InvalidCredentialsError("Google authentication failed. Untrusted issuer.")

        # Verify audience/client_id strictly against server-configured GOOGLE_CLIENT_ID
        aud = str(google_user_info.get("aud", "")).strip()
        if settings.GOOGLE_CLIENT_ID:
            if not aud or aud != settings.GOOGLE_CLIENT_ID:
                raise InvalidCredentialsError("Google authentication failed. Client ID mismatch.")

        # Verify expiration
        exp = int(google_user_info.get("exp", 0))
        if exp > 0 and exp < int(time.time()):
            raise InvalidCredentialsError("Google authentication failed. Token expired.")

        google_email = google_user_info.get("email", "").strip().lower()
        google_sub = str(google_user_info.get("sub", "")).strip()
        google_name = google_user_info.get("name", "") or google_user_info.get("given_name", "") or google_email.split("@")[0]
        google_picture = google_user_info.get("picture", None)
        raw_email_verified = google_user_info.get("email_verified", True)
        email_verified = raw_email_verified is True or raw_email_verified == "true"

        if not google_email:
            raise InvalidCredentialsError("Google account does not have a valid email.")

        if not google_sub:
            raise InvalidCredentialsError("Google authentication failed. Missing user identifier.")

        # 3. Safe Account Linking: Look up existing user by Google sub ID or email
        existing_user = None
        if google_sub:
            existing_user = await self.repository.get_by_provider_user_id(db, google_sub)

        if not existing_user:
            existing_user = await self.repository.get_by_email(db, google_email)

        if existing_user:
            # Safely link Google identity to existing account
            if not existing_user.provider_user_id and google_sub:
                existing_user.provider_user_id = google_sub
            if existing_user.auth_provider == "LOCAL":
                existing_user.auth_provider = "GOOGLE"
            if google_picture and not existing_user.avatar_url:
                existing_user.avatar_url = google_picture
            if email_verified and not existing_user.email_verified:
                existing_user.email_verified = True
            await self.repository.update_user(db, existing_user)
            return existing_user

        # 4. Create a new user for this Google account with a clean, unique username
        base_username = re.sub(r"[^a-zA-Z0-9_-]", "", google_name)[:30] or "reader"
        if len(base_username) < 3:
            base_username = f"reader_{base_username}"

        candidate_username = base_username
        suffix = 1
        while await self.repository.get_by_username(db, candidate_username):
            candidate_username = f"{base_username[:25]}_{suffix}"
            suffix += 1

        # Secure random password placeholder for OAuth accounts
        oauth_dummy_password = f"OAuth_{secrets.token_urlsafe(32)}!Aa1"
        password_hash = hash_password(oauth_dummy_password)

        new_user = await self.repository.create(
            db=db,
            email=google_email,
            username=candidate_username,
            password_hash=password_hash,
            auth_provider="GOOGLE",
            provider_user_id=google_sub,
            email_verified=email_verified,
            avatar_url=google_picture,
            role=UserRole.USER.value,
            is_active=True,
        )
        return new_user

    def generate_tokens_for_user(self, user: User) -> Tuple[str, str]:
        """Generates access token and refresh token pair for authenticated user"""
        access_token = create_access_token(
            subject=user.id,
            role=user.role,
        )
        refresh_token = create_refresh_token(
            subject=user.id,
            token_version=user.token_version,
        )
        return access_token, refresh_token

    async def validate_refresh_token(
        self,
        db: AsyncSession,
        refresh_token: str,
    ) -> User:
        """Decodes refresh token and validates subject, active status, and token_version"""
        payload = decode_token(refresh_token, expected_type="refresh")

        user_id_str = payload.get("sub")
        token_ver = payload.get("ver")

        if not user_id_str or token_ver is None:
            raise InvalidTokenError("Invalid refresh token payload.")

        try:
            user_id = uuid.UUID(str(user_id_str))
        except ValueError:
            raise InvalidTokenError("Malformed user ID in token.")

        user = await self.repository.get_by_id(db, user_id)
        if not user:
            raise InvalidTokenError("User account no longer exists.")

        if not user.is_active:
            raise ForbiddenError("Account has been deactivated.")

        if user.token_version != token_ver:
            raise InvalidTokenError("Refresh token has been revoked.")

        return user

    async def rotate_refresh_token(
        self,
        db: AsyncSession,
        refresh_token: str,
    ) -> Tuple[str, str, User]:
        """Validates existing refresh token and issues a new access/refresh token pair"""
        user = await self.validate_refresh_token(db, refresh_token)
        access_token, new_refresh_token = self.generate_tokens_for_user(user)
        return access_token, new_refresh_token, user

    async def revoke_user_sessions(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> Optional[User]:
        """Increments token version in database, instantly invalidating all existing refresh tokens"""
        return await self.repository.increment_token_version(db, user_id)

    async def request_password_reset(
        self,
        db: AsyncSession,
        email: str,
    ) -> Tuple[str, Optional[str]]:
        """Generates a secure password reset token for a registered account"""
        normalized_email = email.strip().lower()
        user = await self.repository.get_by_email(db, normalized_email)
        if not user:
            return "If an account with this email exists, a password reset token has been generated.", None

        if not user.is_active:
            raise ForbiddenError("Account has been deactivated.")

        reset_token = create_password_reset_token(user.id, user.email)
        return "Password reset token generated successfully.", reset_token

    async def reset_password(
        self,
        db: AsyncSession,
        email: str,
        reset_token: str,
        new_password: str,
    ) -> str:
        """Validates password reset token, updates password hash, and increments token version"""
        payload = decode_token(reset_token.strip(), expected_type="password_reset")
        token_user_id = payload.get("sub")
        token_email = payload.get("email")

        if not token_user_id or not token_email:
            raise InvalidTokenError("Invalid reset token payload.")

        normalized_email = email.strip().lower()
        if token_email.lower() != normalized_email:
            raise InvalidTokenError("Reset token does not match the provided email.")

        try:
            user_id = uuid.UUID(str(token_user_id))
        except ValueError:
            raise InvalidTokenError("Malformed user ID in reset token.")

        user = await self.repository.get_by_id(db, user_id)
        if not user or user.email.lower() != normalized_email:
            raise InvalidTokenError("User account not found.")

        if not user.is_active:
            raise ForbiddenError("Account has been deactivated.")

        # Update password hash & increment token_version to invalidate old sessions
        user.password_hash = hash_password(new_password)
        user.token_version += 1
        await self.repository.update_user(db, user)

        return "Password has been successfully reset. You may now sign in with your new password."


auth_service = AuthService()
