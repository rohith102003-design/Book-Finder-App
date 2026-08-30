import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotificationNotFoundError
from app.models.notification import Notification
from app.models.review import Review
from app.models.user import User
from app.repositories.notification_repository import notification_repository
from app.schemas.notification import (
    NotificationListResponse,
    NotificationResponse,
)


class NotificationService:
    """Service handling notification generation, user-isolated retrieval, and read status updates"""

    async def create_notification(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        notification_type: str,
        title: str,
        message: str,
        related_user_id: Optional[uuid.UUID] = None,
        related_review_id: Optional[uuid.UUID] = None,
    ) -> Notification:
        """Persist a generic notification"""
        return await notification_repository.create(
            db=db,
            user_id=user_id,
            notification_type=notification_type,
            title=title,
            message=message,
            related_user_id=related_user_id,
            related_review_id=related_review_id,
        )

    async def create_follow_notification(
        self,
        db: AsyncSession,
        target_user_id: uuid.UUID,
        follower: User,
    ) -> Optional[Notification]:
        """Trigger a notification when a user is followed by someone else"""
        if target_user_id == follower.id:
            return None

        return await self.create_notification(
            db=db,
            user_id=target_user_id,
            notification_type="FOLLOW",
            title="New Follower",
            message=f"@{follower.username} started following you.",
            related_user_id=follower.id,
        )

    async def create_review_like_notification(
        self,
        db: AsyncSession,
        review: Review,
        liker: User,
    ) -> Optional[Notification]:
        """Trigger a notification when another user likes a review"""
        if review.user_id == liker.id:
            return None

        return await self.create_notification(
            db=db,
            user_id=review.user_id,
            notification_type="REVIEW_LIKE",
            title="Review Liked",
            message=f"@{liker.username} found your review helpful.",
            related_user_id=liker.id,
            related_review_id=review.id,
        )

    async def get_my_notifications(
        self,
        db: AsyncSession,
        current_user: User,
        skip: int = 0,
        limit: int = 20,
    ) -> NotificationListResponse:
        """Fetch paginated notifications and unread count for current user"""
        items = await notification_repository.list_by_user(
            db, current_user.id, skip=skip, limit=limit
        )
        unread_count = await notification_repository.count_unread(db, current_user.id)

        resp_items = []
        for n in items:
            username_val = n.related_user.username if n.related_user else None
            resp_items.append(
                NotificationResponse(
                    id=n.id,
                    user_id=n.user_id,
                    notification_type=n.notification_type,
                    title=n.title,
                    message=n.message,
                    related_user_id=n.related_user_id,
                    related_username=username_val,
                    related_review_id=n.related_review_id,
                    is_read=n.is_read,
                    created_at=n.created_at,
                )
            )

        return NotificationListResponse(
            items=resp_items,
            unread_count=unread_count,
        )

    async def get_unread_count(
        self,
        db: AsyncSession,
        current_user: User,
    ) -> int:
        """Get total unread notification count for current user"""
        return await notification_repository.count_unread(db, current_user.id)

    async def mark_notification_as_read(
        self,
        db: AsyncSession,
        current_user: User,
        notification_id: uuid.UUID,
    ) -> NotificationResponse:
        """Mark a single notification as read with tenant isolation"""
        notification = await notification_repository.get_by_id(db, notification_id)
        if not notification or notification.user_id != current_user.id:
            raise NotificationNotFoundError()

        updated = await notification_repository.mark_as_read(db, notification)
        return NotificationResponse.model_validate(updated)

    async def mark_all_notifications_as_read(
        self,
        db: AsyncSession,
        current_user: User,
    ) -> int:
        """Mark all notifications as read for current user"""
        return await notification_repository.mark_all_as_read(db, current_user.id)


notification_service = NotificationService()
