import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.book import GUID, Book
from app.models.user import User


class BookshelfItem(Base):
    __tablename__ = "bookshelf_items"

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
    status: Mapped[str] = mapped_column(
        String(20),
        default="WANT_TO_READ",
        nullable=False,
        index=True,
    )
    current_page: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    total_pages: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    rating: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
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

    # Relationships
    user: Mapped[User] = relationship("User", lazy="selectin")
    book: Mapped[Book] = relationship("Book", lazy="selectin")

    __table_args__ = (
        UniqueConstraint("user_id", "book_id", name="uq_user_bookshelf_book"),
        Index("ix_bookshelf_items_user_status", "user_id", "status"),
    )

    def __repr__(self) -> str:
        return f"<BookshelfItem(id={self.id}, user_id={self.user_id}, book_id={self.book_id}, status='{self.status}')>"
