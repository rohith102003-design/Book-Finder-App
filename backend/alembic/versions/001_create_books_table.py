"""Create books table

Revision ID: 001_create_books_table
Revises: 
Create Date: 2026-08-28 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from app.models.book import GUID

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'books',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('openlibrary_work_id', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('authors', sa.JSON(), nullable=False),
        sa.Column('first_publish_year', sa.Integer(), nullable=True),
        sa.Column('cover_url', sa.String(length=500), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('edition_count', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('subjects', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_books_id'), 'books', ['id'], unique=False)
    op.create_index(op.f('ix_books_openlibrary_work_id'), 'books', ['openlibrary_work_id'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_books_openlibrary_work_id'), table_name='books')
    op.drop_index(op.f('ix_books_id'), table_name='books')
    op.drop_table('books')
