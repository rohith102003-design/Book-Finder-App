import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    DuplicateUserFollowError,
    SelfFollowError,
    UserFollowNotFoundError,
    UserNotFoundError,
)
from app.models.user import User
from app.models.user_follow import UserFollow
from app.repositories.user_follow_repository import user_follow_repository
from app.repositories.user_repository import user_repository
from app.schemas.social import (
    FollowStatsResponse,
    UserFollowResponse,
    UserFollowUserResponse,
)


class UserFollowService:
    """Service handling social follows, follower/following pagination, and notifications"""

    def to_user_follow_response(self, follow: UserFollow) -> UserFollowResponse:
        """Format UserFollow model into UserFollowResponse schema"""
        follower_info = None
        if follow.follower:
            follower_info = UserFollowUserResponse(
                id=follow.follower.id,
                username=follow.follower.username,
            )

        following_info = None
        if follow.following:
            following_info = UserFollowUserResponse(
                id=follow.following.id,
                username=follow.following.username,
            )

        return UserFollowResponse(
            id=follow.id,
            follower_id=follow.follower_id,
            following_id=follow.following_id,
            created_at=follow.created_at,
            follower=follower_info,
            following=following_info,
        )

    async def follow_user(
        self,
        db: AsyncSession,
        current_user: User,
        following_id: uuid.UUID,
    ) -> UserFollowResponse:
        """Create follow relationship and dispatch notification"""
        if current_user.id == following_id:
            raise SelfFollowError()

        target_user = await user_repository.get_by_id(db, following_id)
        if not target_user:
            raise UserNotFoundError()

        existing = await user_follow_repository.get_by_follower_and_following(
            db, current_user.id, following_id
        )
        if existing:
            raise DuplicateUserFollowError()

        follow = await user_follow_repository.create(
            db=db,
            follower_id=current_user.id,
            following_id=following_id,
        )

        # Trigger notification
        from app.services.notification_service import notification_service
        await notification_service.create_follow_notification(
            db=db,
            target_user_id=following_id,
            follower=current_user,
        )

        return self.to_user_follow_response(follow)

    async def unfollow_user(
        self,
        db: AsyncSession,
        current_user: User,
        following_id: uuid.UUID,
    ) -> None:
        """Remove an existing follow relationship"""
        if current_user.id == following_id:
            raise SelfFollowError()

        follow = await user_follow_repository.get_by_follower_and_following(
            db, current_user.id, following_id
        )
        if not follow:
            raise UserFollowNotFoundError()

        await user_follow_repository.delete(db, follow)

    async def get_follow_status(
        self,
        db: AsyncSession,
        current_user: Optional[User],
        target_user_id: uuid.UUID,
    ) -> bool:
        """Check if current user is following target user"""
        if not current_user:
            return False
        follow = await user_follow_repository.get_by_follower_and_following(
            db, current_user.id, target_user_id
        )
        return follow is not None

    async def get_followers(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        skip: int = 0,
        limit: int = 20,
    ) -> List[UserFollowResponse]:
        """Fetch list of followers for a user"""
        follows = await user_follow_repository.list_followers(
            db, user_id, skip=skip, limit=limit
        )
        return [self.to_user_follow_response(f) for f in follows]

    async def get_following(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        skip: int = 0,
        limit: int = 20,
    ) -> List[UserFollowResponse]:
        """Fetch list of users followed by a user"""
        follows = await user_follow_repository.list_following(
            db, user_id, skip=skip, limit=limit
        )
        return [self.to_user_follow_response(f) for f in follows]

    async def get_follow_stats(
        self,
        db: AsyncSession,
        current_user: Optional[User],
        user_id: uuid.UUID,
    ) -> FollowStatsResponse:
        """Get aggregate follower and following counts for a user"""
        followers_count = await user_follow_repository.count_followers(db, user_id)
        following_count = await user_follow_repository.count_following(db, user_id)
        is_following = await self.get_follow_status(db, current_user, user_id)

        return FollowStatsResponse(
            followers_count=followers_count,
            following_count=following_count,
            is_following=is_following,
        )


user_follow_service = UserFollowService()
