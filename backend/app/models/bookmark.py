import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.book import GUID, Book
from app.models.user import User


class Bookmark(Base):
    __tablename__ = "bookmarks"

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
    chapter_index: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    lesson_index: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    lesson_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    lesson_title: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    user: Mapped[User] = relationship("User", lazy="selectin")
    book: Mapped[Book] = relationship("Book", lazy="selectin")

    __table_args__ = (
        UniqueConstraint("user_id", "book_id", "lesson_id", name="uq_user_bookmark_lesson"),
    )

    def __repr__(self) -> str:
        return f"<Bookmark(id={self.id}, user_id={self.user_id}, book_id={self.book_id}, lesson_id='{self.lesson_id}')>"
