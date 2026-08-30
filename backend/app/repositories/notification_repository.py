import uuid
from typing import List, Optional
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification


class NotificationRepository:
    """Repository handling database operations for Notification entities"""

    async def get_by_id(
        self,
        db: AsyncSession,
        notification_id: uuid.UUID,
    ) -> Optional[Notification]:
        """Fetch a specific notification by ID"""
        statement = select(Notification).where(Notification.id == notification_id)
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    async def list_by_user(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        skip: int = 0,
        limit: int = 20,
    ) -> List[Notification]:
        """List notifications for a user ordered by newest first"""
        statement = (
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(statement)
        return list(result.scalars().all())

    async def count_unread(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> int:
        """Count unread notifications for a user"""
        statement = (
            select(func.count(Notification.id))
            .where(
                Notification.user_id == user_id,
                Notification.is_read == False,  # noqa: E712
            )
        )
        result = await db.execute(statement)
        return result.scalar_one() or 0

    async def mark_as_read(
        self,
        db: AsyncSession,
        notification: Notification,
    ) -> Notification:
        """Mark a single notification as read"""
        notification.is_read = True
        await db.commit()
        await db.refresh(notification)
        return notification

    async def mark_all_as_read(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> int:
        """Mark all unread notifications for a user as read"""
        statement = (
            update(Notification)
            .where(
                Notification.user_id == user_id,
                Notification.is_read == False,  # noqa: E712
            )
            .values(is_read=True)
        )
        result = await db.execute(statement)
        await db.commit()
        return result.rowcount

    async def create(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        notification_type: str,
        title: str,
        message: str,
        related_user_id: Optional[uuid.UUID] = None,
        related_review_id: Optional[uuid.UUID] = None,
    ) -> Notification:
        """Create and persist a new notification"""
        notification = Notification(
            user_id=user_id,
            notification_type=notification_type,
            title=title,
            message=message,
            related_user_id=related_user_id,
            related_review_id=related_review_id,
            is_read=False,
        )
        db.add(notification)
        await db.commit()
        await db.refresh(notification)
        return notification

    async def delete(
        self,
        db: AsyncSession,
        notification: Notification,
    ) -> None:
        """Delete a notification from the database"""
        await db.delete(notification)
        await db.commit()


notification_repository = NotificationRepository()
