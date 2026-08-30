import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    DuplicateReviewLikeError,
    ReviewLikeNotFoundError,
    ReviewNotFoundError,
)
from app.models.user import User
from app.repositories.review_like_repository import review_like_repository
from app.repositories.review_repository import review_repository
from app.schemas.social import ReviewLikeResponse


class ReviewLikeService:
    """Service handling review helpful votes / likes, counts, and notification triggering"""

    async def create_like(
        self,
        db: AsyncSession,
        current_user: User,
        review_id: uuid.UUID,
    ) -> ReviewLikeResponse:
        """Add a helpful vote to a review and increment denormalized likes count"""
        review = await review_repository.get_by_id(db, review_id)
        if not review:
            raise ReviewNotFoundError()

        existing = await review_like_repository.get_by_review_and_user(
            db, review_id, current_user.id
        )
        if existing:
            raise DuplicateReviewLikeError()

        like = await review_like_repository.create(db, review_id, current_user.id)

        # Update denormalized count on review
        review.likes_count = await review_like_repository.count_by_review(db, review_id)
        await db.commit()
        await db.refresh(review)

        # Trigger notification if liker is not the review author
        if review.user_id != current_user.id:
            from app.services.notification_service import notification_service
            await notification_service.create_review_like_notification(
                db=db,
                review=review,
                liker=current_user,
            )

        return ReviewLikeResponse.model_validate(like)

    async def delete_like(
        self,
        db: AsyncSession,
        current_user: User,
        review_id: uuid.UUID,
    ) -> None:
        """Remove a helpful vote and update denormalized likes count"""
        review = await review_repository.get_by_id(db, review_id)
        if not review:
            raise ReviewNotFoundError()

        like = await review_like_repository.get_by_review_and_user(
            db, review_id, current_user.id
        )
        if not like:
            raise ReviewLikeNotFoundError()

        await review_like_repository.delete(db, like)

        # Update denormalized count on review
        review.likes_count = await review_like_repository.count_by_review(db, review_id)
        await db.commit()
        await db.refresh(review)

    async def get_like_status(
        self,
        db: AsyncSession,
        current_user: Optional[User],
        review_id: uuid.UUID,
    ) -> bool:
        """Check if user has voted on a review"""
        if not current_user:
            return False
        like = await review_like_repository.get_by_review_and_user(
            db, review_id, current_user.id
        )
        return like is not None

    async def get_like_count(
        self,
        db: AsyncSession,
        review_id: uuid.UUID,
    ) -> int:
        """Fetch total likes for a review"""
        return await review_like_repository.count_by_review(db, review_id)


review_like_service = ReviewLikeService()
