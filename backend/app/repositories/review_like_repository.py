import uuid
from typing import List, Optional
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.review_like import ReviewLike


class ReviewLikeRepository:
    """Repository handling database operations for ReviewLike entities"""

    async def get_by_id(
        self,
        db: AsyncSession,
        like_id: uuid.UUID,
    ) -> Optional[ReviewLike]:
        """Fetch a specific review like record by ID"""
        statement = select(ReviewLike).where(ReviewLike.id == like_id)
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_review_and_user(
        self,
        db: AsyncSession,
        review_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> Optional[ReviewLike]:
        """Fetch a like record by review and user to check for prior likes"""
        statement = select(ReviewLike).where(
            ReviewLike.review_id == review_id,
            ReviewLike.user_id == user_id,
        )
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    async def list_by_review(
        self,
        db: AsyncSession,
        review_id: uuid.UUID,
        skip: int = 0,
        limit: int = 20,
    ) -> List[ReviewLike]:
        """List likes for a specific review"""
        statement = (
            select(ReviewLike)
            .where(ReviewLike.review_id == review_id)
            .order_by(ReviewLike.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(statement)
        return list(result.scalars().all())

    async def count_by_review(
        self,
        db: AsyncSession,
        review_id: uuid.UUID,
    ) -> int:
        """Count total likes for a review"""
        statement = (
            select(func.count(ReviewLike.id))
            .where(ReviewLike.review_id == review_id)
        )
        result = await db.execute(statement)
        return result.scalar_one() or 0

    async def create(
        self,
        db: AsyncSession,
        review_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> ReviewLike:
        """Persist a new review like"""
        like = ReviewLike(
            review_id=review_id,
            user_id=user_id,
        )
        db.add(like)
        await db.commit()
        await db.refresh(like)
        return like

    async def delete(
        self,
        db: AsyncSession,
        review_like: ReviewLike,
    ) -> None:
        """Delete a review like record"""
        await db.delete(review_like)
        await db.commit()


review_like_repository = ReviewLikeRepository()
