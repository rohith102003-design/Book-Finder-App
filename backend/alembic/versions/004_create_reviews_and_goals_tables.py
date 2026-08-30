"""Create reviews and reading_goals tables

Revision ID: 004_create_reviews_and_goals_tables
Revises: 003_create_bookshelf_items_table
Create Date: 2026-08-28 13:35:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from app.models.book import GUID

# revision identifiers, used by Alembic.
revision: str = '004'
down_revision: Union[str, None] = '003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create reviews table
    op.create_table(
        'reviews',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('user_id', GUID(), nullable=False),
        sa.Column('book_id', GUID(), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('contains_spoilers', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('likes_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['book_id'], ['books.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'book_id', name='uq_user_book_review'),
    )
    op.create_index(op.f('ix_reviews_id'), 'reviews', ['id'], unique=False)
    op.create_index(op.f('ix_reviews_user_id'), 'reviews', ['user_id'], unique=False)
    op.create_index(op.f('ix_reviews_book_id'), 'reviews', ['book_id'], unique=False)
    op.create_index('ix_reviews_book_created', 'reviews', ['book_id', 'created_at'], unique=False)

    # 2. Create reading_goals table
    op.create_table(
        'reading_goals',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('user_id', GUID(), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('target_books', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'year', name='uq_user_reading_goal_year'),
    )
    op.create_index(op.f('ix_reading_goals_id'), 'reading_goals', ['id'], unique=False)
    op.create_index(op.f('ix_reading_goals_user_id'), 'reading_goals', ['user_id'], unique=False)


def downgrade() -> None:
    # Drop reading_goals table and indexes
    op.drop_index(op.f('ix_reading_goals_user_id'), table_name='reading_goals')
    op.drop_index(op.f('ix_reading_goals_id'), table_name='reading_goals')
    op.drop_table('reading_goals')

    # Drop reviews table and indexes
    op.drop_index('ix_reviews_book_created', table_name='reviews')
    op.drop_index(op.f('ix_reviews_book_id'), table_name='reviews')
    op.drop_index(op.f('ix_reviews_user_id'), table_name='reviews')
    op.drop_index(op.f('ix_reviews_id'), table_name='reviews')
    op.drop_table('reviews')
