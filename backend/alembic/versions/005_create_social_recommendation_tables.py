"""Create social and recommendation tables

Revision ID: 005_create_social_recommendation_tables
Revises: 004_create_reviews_and_goals_tables
Create Date: 2026-08-28 14:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from app.models.book import GUID

# revision identifiers, used by Alembic.
revision: str = '005'
down_revision: Union[str, None] = '004'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create review_likes table
    op.create_table(
        'review_likes',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('review_id', GUID(), nullable=False),
        sa.Column('user_id', GUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['review_id'], ['reviews.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('review_id', 'user_id', name='uq_review_like_user'),
    )
    op.create_index(op.f('ix_review_likes_id'), 'review_likes', ['id'], unique=False)
    op.create_index(op.f('ix_review_likes_review_id'), 'review_likes', ['review_id'], unique=False)
    op.create_index(op.f('ix_review_likes_user_id'), 'review_likes', ['user_id'], unique=False)

    # 2. Create user_follows table
    op.create_table(
        'user_follows',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('follower_id', GUID(), nullable=False),
        sa.Column('following_id', GUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['follower_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['following_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('follower_id', 'following_id', name='uq_user_follow'),
        sa.CheckConstraint('follower_id != following_id', name='ck_user_follow_no_self'),
    )
    op.create_index(op.f('ix_user_follows_id'), 'user_follows', ['id'], unique=False)
    op.create_index(op.f('ix_user_follows_follower_id'), 'user_follows', ['follower_id'], unique=False)
    op.create_index(op.f('ix_user_follows_following_id'), 'user_follows', ['following_id'], unique=False)

    # 3. Create notifications table
    op.create_table(
        'notifications',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('user_id', GUID(), nullable=False),
        sa.Column('notification_type', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('related_user_id', GUID(), nullable=True),
        sa.Column('related_review_id', GUID(), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['related_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['related_review_id'], ['reviews.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_notifications_id'), 'notifications', ['id'], unique=False)
    op.create_index(op.f('ix_notifications_user_id'), 'notifications', ['user_id'], unique=False)
    op.create_index(op.f('ix_notifications_related_user_id'), 'notifications', ['related_user_id'], unique=False)
    op.create_index(op.f('ix_notifications_related_review_id'), 'notifications', ['related_review_id'], unique=False)
    op.create_index('ix_notifications_user_created', 'notifications', ['user_id', 'created_at'], unique=False)

    # 4. Create recommendation_profiles table
    op.create_table(
        'recommendation_profiles',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('user_id', GUID(), nullable=False),
        sa.Column('preferred_genres', sa.JSON(), nullable=True),
        sa.Column('preferred_authors', sa.JSON(), nullable=True),
        sa.Column('preferred_languages', sa.JSON(), nullable=True),
        sa.Column('min_rating', sa.Integer(), nullable=True),
        sa.Column('max_rating', sa.Integer(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', name='uq_recommendation_profile_user'),
    )
    op.create_index(op.f('ix_recommendation_profiles_id'), 'recommendation_profiles', ['id'], unique=False)
    op.create_index(op.f('ix_recommendation_profiles_user_id'), 'recommendation_profiles', ['user_id'], unique=False)


def downgrade() -> None:
    # Drop recommendation_profiles table and indexes
    op.drop_index(op.f('ix_recommendation_profiles_user_id'), table_name='recommendation_profiles')
    op.drop_index(op.f('ix_recommendation_profiles_id'), table_name='recommendation_profiles')
    op.drop_table('recommendation_profiles')

    # Drop notifications table and indexes
    op.drop_index('ix_notifications_user_created', table_name='notifications')
    op.drop_index(op.f('ix_notifications_related_review_id'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_related_user_id'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_user_id'), table_name='notifications')
    op.drop_index(op.f('ix_notifications_id'), table_name='notifications')
    op.drop_table('notifications')

    # Drop user_follows table and indexes
    op.drop_index(op.f('ix_user_follows_following_id'), table_name='user_follows')
    op.drop_index(op.f('ix_user_follows_follower_id'), table_name='user_follows')
    op.drop_index(op.f('ix_user_follows_id'), table_name='user_follows')
    op.drop_table('user_follows')

    # Drop review_likes table and indexes
    op.drop_index(op.f('ix_review_likes_user_id'), table_name='review_likes')
    op.drop_index(op.f('ix_review_likes_review_id'), table_name='review_likes')
    op.drop_index(op.f('ix_review_likes_id'), table_name='review_likes')
    op.drop_table('review_likes')
