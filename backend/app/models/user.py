import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
from app.models.book import GUID


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    username: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    auth_provider: Mapped[str] = mapped_column(
        String(20),
        default="LOCAL",
        nullable=False,
    )
    provider_user_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        index=True,
    )
    email_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    avatar_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )
    role: Mapped[str] = mapped_column(
        String(20),
        default="USER",
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    token_version: Mapped[int] = mapped_column(
        Integer,
        default=1,
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

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', username='{self.username}', provider='{self.auth_provider}', role='{self.role}')>"
