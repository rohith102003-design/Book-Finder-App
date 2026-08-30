import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.book import GUID
from app.models.review import Review
from app.models.user import User


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    notification_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )
    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    related_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    related_review_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID(),
        ForeignKey("reviews.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    is_read: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    user: Mapped[User] = relationship("User", foreign_keys=[user_id], lazy="selectin")
    related_user: Mapped[Optional[User]] = relationship(
        "User", foreign_keys=[related_user_id], lazy="selectin"
    )
    related_review: Mapped[Optional[Review]] = relationship(
        "Review", foreign_keys=[related_review_id], lazy="selectin"
    )

    __table_args__ = (
        Index("ix_notifications_user_created", "user_id", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<Notification(id={self.id}, user_id={self.user_id}, type='{self.notification_type}', is_read={self.is_read})>"
