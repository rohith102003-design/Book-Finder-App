import uuid
from datetime import datetime
from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.book import GUID
from app.models.user import User


class ReadingGoal(Base):
    __tablename__ = "reading_goals"

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
    year: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    target_books: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationship
    user: Mapped[User] = relationship("User", lazy="selectin")

    __table_args__ = (
        UniqueConstraint("user_id", "year", name="uq_user_reading_goal_year"),
    )

    def __repr__(self) -> str:
        return f"<ReadingGoal(id={self.id}, user_id={self.user_id}, year={self.year}, target_books={self.target_books})>"
