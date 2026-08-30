import uuid
from datetime import datetime
from typing import Any, List, Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.book import GUID, Book
from app.models.user import User


class ReadingProgress(Base):
    __tablename__ = "reading_progress"

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
    book_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("books.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    current_lesson_index: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    current_chapter_index: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    completed_lesson_ids: Mapped[List[str]] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )
    progress_percentage: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    is_completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    last_read_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    user: Mapped[User] = relationship("User", lazy="selectin")
    book: Mapped[Book] = relationship("Book", lazy="selectin")

    __table_args__ = (
        UniqueConstraint("user_id", "book_id", name="uq_user_reading_progress_book"),
    )

    def __repr__(self) -> str:
        return f"<ReadingProgress(id={self.id}, user_id={self.user_id}, book_id={self.book_id}, progress={self.progress_percentage}%)>"
