"""Create favorites, reading_progress, and bookmarks tables, and extend users table

Revision ID: 006
Revises: 005
Create Date: 2026-08-29 18:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from app.models.book import GUID

# revision identifiers, used by Alembic.
revision: str = '006'
down_revision: Union[str, None] = '005'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Extend users table with auth provider & verification fields
    op.add_column('users', sa.Column('auth_provider', sa.String(length=20), nullable=False, server_default='LOCAL'))
    op.add_column('users', sa.Column('provider_user_id', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('email_verified', sa.Boolean(), nullable=False, server_default=sa.text('false')))
    op.add_column('users', sa.Column('avatar_url', sa.String(length=500), nullable=True))
    op.create_index(op.f('ix_users_provider_user_id'), 'users', ['provider_user_id'], unique=False)

    # 2. Create favorites table
    op.create_table(
        'favorites',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('user_id', GUID(), nullable=False),
        sa.Column('book_id', GUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['book_id'], ['books.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'book_id', name='uq_user_favorite_book'),
    )
    op.create_index(op.f('ix_favorites_id'), 'favorites', ['id'], unique=False)
    op.create_index(op.f('ix_favorites_user_id'), 'favorites', ['user_id'], unique=False)
    op.create_index(op.f('ix_favorites_book_id'), 'favorites', ['book_id'], unique=False)

    # 3. Create reading_progress table
    op.create_table(
        'reading_progress',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('user_id', GUID(), nullable=False),
        sa.Column('book_id', GUID(), nullable=False),
        sa.Column('current_lesson_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('current_chapter_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('completed_lesson_ids', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('progress_percentage', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_completed', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('last_read_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['book_id'], ['books.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'book_id', name='uq_user_reading_progress_book'),
    )
    op.create_index(op.f('ix_reading_progress_id'), 'reading_progress', ['id'], unique=False)
    op.create_index(op.f('ix_reading_progress_user_id'), 'reading_progress', ['user_id'], unique=False)
    op.create_index(op.f('ix_reading_progress_book_id'), 'reading_progress', ['book_id'], unique=False)

    # 4. Create bookmarks table
    op.create_table(
        'bookmarks',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('user_id', GUID(), nullable=False),
        sa.Column('book_id', GUID(), nullable=False),
        sa.Column('chapter_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('lesson_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('lesson_id', sa.String(length=100), nullable=False),
        sa.Column('lesson_title', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['book_id'], ['books.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'book_id', 'lesson_id', name='uq_user_bookmark_lesson'),
    )
    op.create_index(op.f('ix_bookmarks_id'), 'bookmarks', ['id'], unique=False)
    op.create_index(op.f('ix_bookmarks_user_id'), 'bookmarks', ['user_id'], unique=False)
    op.create_index(op.f('ix_bookmarks_book_id'), 'bookmarks', ['book_id'], unique=False)


def downgrade() -> None:
    # Drop bookmarks
    op.drop_index(op.f('ix_bookmarks_book_id'), table_name='bookmarks')
    op.drop_index(op.f('ix_bookmarks_user_id'), table_name='bookmarks')
    op.drop_index(op.f('ix_bookmarks_id'), table_name='bookmarks')
    op.drop_table('bookmarks')

    # Drop reading_progress
    op.drop_index(op.f('ix_reading_progress_book_id'), table_name='reading_progress')
    op.drop_index(op.f('ix_reading_progress_user_id'), table_name='reading_progress')
    op.drop_index(op.f('ix_reading_progress_id'), table_name='reading_progress')
    op.drop_table('reading_progress')

    # Drop favorites
    op.drop_index(op.f('ix_favorites_book_id'), table_name='favorites')
    op.drop_index(op.f('ix_favorites_user_id'), table_name='favorites')
    op.drop_index(op.f('ix_favorites_id'), table_name='favorites')
    op.drop_table('favorites')

    # Drop users columns
    op.drop_index(op.f('ix_users_provider_user_id'), table_name='users')
    op.drop_column('users', 'avatar_url')
    op.drop_column('users', 'email_verified')
    op.drop_column('users', 'provider_user_id')
    op.drop_column('users', 'auth_provider')
