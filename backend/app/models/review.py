import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Boolean,
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


class Review(Base):
    __tablename__ = "reviews"

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
    rating: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    title: Mapped[Optional[str]] = mapped_column(
        String(200),
        nullable=True,
    )
    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    contains_spoilers: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    likes_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
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

    # Relationships
    user: Mapped[User] = relationship("User", lazy="selectin")
    book: Mapped[Book] = relationship("Book", lazy="selectin")

    __table_args__ = (
        UniqueConstraint("user_id", "book_id", name="uq_user_book_review"),
        Index("ix_reviews_book_created", "book_id", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<Review(id={self.id}, user_id={self.user_id}, book_id={self.book_id}, rating={self.rating})>"
