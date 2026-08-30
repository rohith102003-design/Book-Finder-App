import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.email_verification import EmailVerificationToken


class EmailVerificationRepository:
    """Repository handling database operations for email verification tokens"""

    async def create_token(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        code: str,
        expires_at: datetime,
    ) -> EmailVerificationToken:
        """Create a new verification token for a user"""
        token = EmailVerificationToken(
            user_id=user_id,
            code=code.strip(),
            expires_at=expires_at,
            is_used=False,
        )
        db.add(token)
        await db.commit()
        await db.refresh(token)
        return token

    async def get_active_token(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        code: str,
    ) -> Optional[EmailVerificationToken]:
        """Find an unexpired, unused token for a user matching the 6-digit code"""
        now = datetime.now(timezone.utc)
        statement = select(EmailVerificationToken).where(
            EmailVerificationToken.user_id == user_id,
            EmailVerificationToken.code == code.strip(),
            EmailVerificationToken.is_used == False,
            EmailVerificationToken.expires_at > now,
        ).order_by(EmailVerificationToken.created_at.desc())

        result = await db.execute(statement)
        return result.scalars().first()

    async def invalidate_user_tokens(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> None:
        """Invalidate all prior tokens for a user when a new verification is requested"""
        statement = (
            update(EmailVerificationToken)
            .where(
                EmailVerificationToken.user_id == user_id,
                EmailVerificationToken.is_used == False,
            )
            .values(is_used=True)
        )
        await db.execute(statement)
        await db.commit()

    async def mark_as_used(
        self,
        db: AsyncSession,
        token: EmailVerificationToken,
    ) -> EmailVerificationToken:
        """Mark a token as successfully used"""
        token.is_used = True
        await db.commit()
        await db.refresh(token)
        return token


email_verification_repository = EmailVerificationRepository()
