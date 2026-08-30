import uuid
from typing import List, Optional
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.user_follow import UserFollow


class UserFollowRepository:
    """Repository handling database operations for UserFollow entities"""

    async def get_by_id(
        self,
        db: AsyncSession,
        follow_id: uuid.UUID,
    ) -> Optional[UserFollow]:
        """Fetch a specific follow relationship by ID"""
        statement = (
            select(UserFollow)
            .options(
                selectinload(UserFollow.follower),
                selectinload(UserFollow.following),
            )
            .where(UserFollow.id == follow_id)
        )
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_follower_and_following(
        self,
        db: AsyncSession,
        follower_id: uuid.UUID,
        following_id: uuid.UUID,
    ) -> Optional[UserFollow]:
        """Fetch a follow record by follower and target following user IDs"""
        statement = (
            select(UserFollow)
            .options(
                selectinload(UserFollow.follower),
                selectinload(UserFollow.following),
            )
            .where(
                UserFollow.follower_id == follower_id,
                UserFollow.following_id == following_id,
            )
        )
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    async def list_following(
        self,
        db: AsyncSession,
        follower_id: uuid.UUID,
        skip: int = 0,
        limit: int = 20,
    ) -> List[UserFollow]:
        """List users whom a specific user is following"""
        statement = (
            select(UserFollow)
            .options(
                selectinload(UserFollow.following),
            )
            .where(UserFollow.follower_id == follower_id)
            .order_by(UserFollow.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(statement)
        return list(result.scalars().all())

    async def list_followers(
        self,
        db: AsyncSession,
        following_id: uuid.UUID,
        skip: int = 0,
        limit: int = 20,
    ) -> List[UserFollow]:
        """List followers of a specific user"""
        statement = (
            select(UserFollow)
            .options(
                selectinload(UserFollow.follower),
            )
            .where(UserFollow.following_id == following_id)
            .order_by(UserFollow.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(statement)
        return list(result.scalars().all())

    async def count_followers(
        self,
        db: AsyncSession,
        following_id: uuid.UUID,
    ) -> int:
        """Count total followers for a user"""
        statement = (
            select(func.count(UserFollow.id))
            .where(UserFollow.following_id == following_id)
        )
        result = await db.execute(statement)
        return result.scalar_one() or 0

    async def count_following(
        self,
        db: AsyncSession,
        follower_id: uuid.UUID,
    ) -> int:
        """Count total users being followed by a user"""
        statement = (
            select(func.count(UserFollow.id))
            .where(UserFollow.follower_id == follower_id)
        )
        result = await db.execute(statement)
        return result.scalar_one() or 0

    async def create(
        self,
        db: AsyncSession,
        follower_id: uuid.UUID,
        following_id: uuid.UUID,
    ) -> UserFollow:
        """Create and persist a follow relationship"""
        follow = UserFollow(
            follower_id=follower_id,
            following_id=following_id,
        )
        db.add(follow)
        await db.commit()
        await db.refresh(follow)
        reloaded = await self.get_by_id(db, follow.id)
        return reloaded or follow

    async def delete(
        self,
        db: AsyncSession,
        follow: UserFollow,
    ) -> None:
        """Remove a follow relationship"""
        await db.delete(follow)
        await db.commit()


user_follow_repository = UserFollowRepository()
