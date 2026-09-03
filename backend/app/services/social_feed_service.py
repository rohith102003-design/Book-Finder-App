from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.review import Review
from app.models.review_like import ReviewLike
from app.models.user import User
from app.repositories.user_follow_repository import user_follow_repository
from app.schemas.social import SocialFeedItem, SocialFeedResponse


class SocialFeedService:
    """Service generating personalized and community social activity feed of reviews and likes"""

    async def get_social_feed(
        self,
        db: AsyncSession,
        current_user: User,
        skip: int = 0,
        limit: int = 20,
    ) -> SocialFeedResponse:
        """Fetch chronological activity feed from users followed by the current user"""

        # 1. Fetch IDs of users followed by current_user
        following_list = await user_follow_repository.list_following(
            db, current_user.id, skip=0, limit=500
        )
        followed_user_ids = [f.following_id for f in following_list]

        # If the user follows nobody, there is no personalized social feed.
        if not followed_user_ids:
            return SocialFeedResponse(
                items=[],
                total_count=0,
            )

        # 2. Fetch reviews from followed users or the current user
        reviews_stmt = (
            select(Review)
            .options(
                selectinload(Review.user),
                selectinload(Review.book),
            )
            .where(
                (Review.user_id.in_(followed_user_ids))
                | (Review.user_id == current_user.id)
            )
            .order_by(Review.created_at.desc())
            .limit(limit * 2)
        )

        reviews_result = await db.execute(reviews_stmt)
        reviews = list(reviews_result.scalars().all())

        # 3. Fetch review likes from followed users
        likes_stmt = (
            select(ReviewLike)
            .options(
                selectinload(ReviewLike.user),
                selectinload(ReviewLike.review).selectinload(Review.book),
                selectinload(ReviewLike.review).selectinload(Review.user),
            )
            .where(ReviewLike.user_id.in_(followed_user_ids))
            .order_by(ReviewLike.created_at.desc())
            .limit(limit * 2)
        )

        likes_result = await db.execute(likes_stmt)
        likes = list(likes_result.scalars().all())

        # 4. Map into uniform activity feed items
        feed_items: List[SocialFeedItem] = []

        for rev in reviews:
            if rev.book and rev.user:
                feed_items.append(
                    SocialFeedItem(
                        id=f"rev_{rev.id}",
                        activity_type="REVIEW_CREATED",
                        actor_id=rev.user_id,
                        actor_username=rev.user.username,
                        book_title=rev.book.title,
                        book_openlibrary_id=rev.book.openlibrary_work_id,
                        review_id=rev.id,
                        review_rating=rev.rating,
                        review_title=rev.title,
                        review_content=rev.content,
                        created_at=rev.created_at,
                    )
                )

        for lk in likes:
            if lk.user and lk.review and lk.review.book:
                feed_items.append(
                    SocialFeedItem(
                        id=f"like_{lk.id}",
                        activity_type="REVIEW_LIKED",
                        actor_id=lk.user_id,
                        actor_username=lk.user.username,
                        book_title=lk.review.book.title,
                        book_openlibrary_id=lk.review.book.openlibrary_work_id,
                        review_id=lk.review_id,
                        review_rating=lk.review.rating,
                        review_title=lk.review.title,
                        review_content=lk.review.content,
                        created_at=lk.created_at,
                    )
                )

        # 5. Sort newest first and paginate
        feed_items.sort(key=lambda x: x.created_at, reverse=True)
        paginated_items = feed_items[skip : skip + limit]

        return SocialFeedResponse(
            items=paginated_items,
            total_count=len(feed_items),
        )


social_feed_service = SocialFeedService()