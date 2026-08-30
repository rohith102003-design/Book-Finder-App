import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.recommendation_profile import RecommendationProfile


class RecommendationProfileRepository:
    """Repository handling database operations for RecommendationProfile entities"""

    async def get_by_id(
        self,
        db: AsyncSession,
        profile_id: uuid.UUID,
    ) -> Optional[RecommendationProfile]:
        """Fetch a recommendation profile by primary key ID"""
        statement = select(RecommendationProfile).where(
            RecommendationProfile.id == profile_id
        )
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_user_id(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
    ) -> Optional[RecommendationProfile]:
        """Fetch a recommendation profile strictly owned by a user"""
        statement = select(RecommendationProfile).where(
            RecommendationProfile.user_id == user_id
        )
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    async def create(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        preferred_genres: Optional[List[str]] = None,
        preferred_authors: Optional[List[str]] = None,
        preferred_languages: Optional[List[str]] = None,
        min_rating: Optional[int] = None,
        max_rating: Optional[int] = None,
    ) -> RecommendationProfile:
        """Create and persist a new user recommendation profile"""
        profile = RecommendationProfile(
            user_id=user_id,
            preferred_genres=preferred_genres,
            preferred_authors=preferred_authors,
            preferred_languages=preferred_languages,
            min_rating=min_rating,
            max_rating=max_rating,
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
        return profile

    async def update(
        self,
        db: AsyncSession,
        profile: RecommendationProfile,
        preferred_genres: Optional[List[str]] = None,
        preferred_authors: Optional[List[str]] = None,
        preferred_languages: Optional[List[str]] = None,
        min_rating: Optional[int] = None,
        max_rating: Optional[int] = None,
    ) -> RecommendationProfile:
        """Update fields on an existing recommendation profile"""
        if preferred_genres is not None:
            profile.preferred_genres = preferred_genres
        if preferred_authors is not None:
            profile.preferred_authors = preferred_authors
        if preferred_languages is not None:
            profile.preferred_languages = preferred_languages
        if min_rating is not None:
            profile.min_rating = min_rating
        if max_rating is not None:
            profile.max_rating = max_rating

        await db.commit()
        await db.refresh(profile)
        return profile

    async def delete(
        self,
        db: AsyncSession,
        profile: RecommendationProfile,
    ) -> None:
        """Remove a recommendation profile from the database"""
        await db.delete(profile)
        await db.commit()


recommendation_profile_repository = RecommendationProfileRepository()
