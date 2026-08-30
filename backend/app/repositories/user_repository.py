import uuid
from typing import Optional
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User


class UserRepository:
    """Repository handling all database operations for the User entity"""

    async def get_by_id(self, db: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
        statement = select(User).where(User.id == user_id)
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        normalized_email = email.strip().lower()
        statement = select(User).where(func.lower(User.email) == normalized_email)
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_provider_user_id(self, db: AsyncSession, provider_user_id: str) -> Optional[User]:
        clean_id = provider_user_id.strip()
        statement = select(User).where(User.provider_user_id == clean_id)
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_username(self, db: AsyncSession, username: str) -> Optional[User]:
        clean_username = username.strip()
        statement = select(User).where(func.lower(User.username) == clean_username.lower())
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    async def create(
        self,
        db: AsyncSession,
        email: str,
        username: str,
        password_hash: str,
        auth_provider: str = "LOCAL",
        provider_user_id: Optional[str] = None,
        email_verified: bool = False,
        avatar_url: Optional[str] = None,
        role: str = "USER",
        is_active: bool = True,
    ) -> User:
        user = User(
            email=email.strip().lower(),
            username=username.strip(),
            password_hash=password_hash,
            auth_provider=auth_provider,
            provider_user_id=provider_user_id,
            email_verified=email_verified,
            avatar_url=avatar_url,
            role=role,
            is_active=is_active,
            token_version=1,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    async def update_user(self, db: AsyncSession, user: User) -> User:
        await db.commit()
        await db.refresh(user)
        return user

    async def increment_token_version(self, db: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
        user = await self.get_by_id(db, user_id)
        if user:
            user.token_version += 1
            await db.commit()
            await db.refresh(user)
            return user
        return None


user_repository = UserRepository()
