import uuid
from datetime import datetime
from typing import Any, List, Optional
from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.book import GUID
from app.models.user import User


class RecommendationProfile(Base):
    __tablename__ = "recommendation_profiles"

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
    preferred_genres: Mapped[Optional[List[str]]] = mapped_column(
        JSON,
        nullable=True,
    )
    preferred_authors: Mapped[Optional[List[str]]] = mapped_column(
        JSON,
        nullable=True,
    )
    preferred_languages: Mapped[Optional[List[str]]] = mapped_column(
        JSON,
        nullable=True,
    )
    min_rating: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )
    max_rating: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
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
        UniqueConstraint("user_id", name="uq_recommendation_profile_user"),
    )

    def __repr__(self) -> str:
        return f"<RecommendationProfile(id={self.id}, user_id={self.user_id})>"
