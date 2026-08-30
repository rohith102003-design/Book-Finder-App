import uuid
from datetime import datetime
from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.book import GUID
from app.models.user import User


class UserFollow(Base):
    __tablename__ = "user_follows"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    follower_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    following_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    follower: Mapped[User] = relationship("User", foreign_keys=[follower_id], lazy="selectin")
    following: Mapped[User] = relationship("User", foreign_keys=[following_id], lazy="selectin")

    __table_args__ = (
        UniqueConstraint("follower_id", "following_id", name="uq_user_follow"),
        CheckConstraint("follower_id != following_id", name="ck_user_follow_no_self"),
    )

    def __repr__(self) -> str:
        return f"<UserFollow(id={self.id}, follower_id={self.follower_id}, following_id={self.following_id})>"
