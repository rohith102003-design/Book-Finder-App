import uuid
from datetime import datetime
from sqlalchemy import (
    DateTime,
    ForeignKey,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.book import GUID
from app.models.review import Review
from app.models.user import User


class ReviewLike(Base):
    __tablename__ = "review_likes"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    review_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("reviews.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
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
    review: Mapped[Review] = relationship("Review", lazy="selectin")
    user: Mapped[User] = relationship("User", lazy="selectin")

    __table_args__ = (
        UniqueConstraint("review_id", "user_id", name="uq_review_like_user"),
    )

    def __repr__(self) -> str:
        return f"<ReviewLike(id={self.id}, review_id={self.review_id}, user_id={self.user_id})>"
