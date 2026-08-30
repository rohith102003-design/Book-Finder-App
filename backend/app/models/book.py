import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    DateTime,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.types import JSON, TypeDecorator, CHAR
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class GUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type when on Postgres, otherwise stores as CHAR(36).
    """
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == "postgresql":
            return str(value)
        else:
            if not isinstance(value, uuid.UUID):
                return str(uuid.UUID(str(value)))
            else:
                return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(str(value))
            else:
                return value


class Book(Base):
    __tablename__ = "books"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    openlibrary_work_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )
    authors: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )
    first_publish_year: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )
    cover_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    edition_count: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )
    subjects: Mapped[list] = mapped_column(
        JSON,
        default=list,
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
        return f"<Book(id={self.id}, work_id='{self.openlibrary_work_id}', title='{self.title[:30]}')>"
