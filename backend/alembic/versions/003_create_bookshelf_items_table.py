"""Create bookshelf_items table

Revision ID: 003_create_bookshelf_items_table
Revises: 002_create_users_table
Create Date: 2026-08-28 13:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from app.models.book import GUID

# revision identifiers, used by Alembic.
revision: str = '003'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'bookshelf_items',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('user_id', GUID(), nullable=False),
        sa.Column('book_id', GUID(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='WANT_TO_READ'),
        sa.Column('current_page', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_pages', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('rating', sa.Integer(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['book_id'], ['books.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'book_id', name='uq_user_bookshelf_book'),
    )
    op.create_index(op.f('ix_bookshelf_items_id'), 'bookshelf_items', ['id'], unique=False)
    op.create_index(op.f('ix_bookshelf_items_user_id'), 'bookshelf_items', ['user_id'], unique=False)
    op.create_index(op.f('ix_bookshelf_items_book_id'), 'bookshelf_items', ['book_id'], unique=False)
    op.create_index(op.f('ix_bookshelf_items_status'), 'bookshelf_items', ['status'], unique=False)
    op.create_index('ix_bookshelf_items_user_status', 'bookshelf_items', ['user_id', 'status'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_bookshelf_items_user_status', table_name='bookshelf_items')
    op.drop_index(op.f('ix_bookshelf_items_status'), table_name='bookshelf_items')
    op.drop_index(op.f('ix_bookshelf_items_book_id'), table_name='bookshelf_items')
    op.drop_index(op.f('ix_bookshelf_items_user_id'), table_name='bookshelf_items')
    op.drop_index(op.f('ix_bookshelf_items_id'), table_name='bookshelf_items')
    op.drop_table('bookshelf_items')
