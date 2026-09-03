from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    DuplicateRecommendationProfileError,
    InvalidRecommendationPreferencesError,
    RecommendationProfileNotFoundError,
)
from app.models.user import User
from app.repositories.recommendation_profile_repository import (
    recommendation_profile_repository,
)
from app.schemas.recommendation import (
    RecommendationProfileCreate,
    RecommendationProfileResponse,
    RecommendationProfileUpdate,
)


class RecommendationProfileService:
    """Service handling recommendation preference profiles and rating constraint validations"""

    async def get_my_profile(
        self,
        db: AsyncSession,
        current_user: User,
    ) -> Optional[RecommendationProfileResponse]:
        """Fetch recommendation profile for the authenticated user"""
        profile = await recommendation_profile_repository.get_by_user_id(
            db, current_user.id
        )
        if not profile:
            return None
        return RecommendationProfileResponse.model_validate(profile)

    async def create_profile(
        self,
        db: AsyncSession,
        current_user: User,
        profile_in: RecommendationProfileCreate,
    ) -> RecommendationProfileResponse:
        """Create a recommendation profile ensuring rating range consistency and single profile constraint"""
        if (
            profile_in.min_rating is not None
            and profile_in.max_rating is not None
            and profile_in.min_rating > profile_in.max_rating
        ):
            raise InvalidRecommendationPreferencesError()

        existing = await recommendation_profile_repository.get_by_user_id(
            db, current_user.id
        )
        if existing:
            raise DuplicateRecommendationProfileError()

        profile = await recommendation_profile_repository.create(
            db=db,
            user_id=current_user.id,
            preferred_genres=profile_in.preferred_genres,
            preferred_authors=profile_in.preferred_authors,
            preferred_languages=profile_in.preferred_languages,
            min_rating=profile_in.min_rating,
            max_rating=profile_in.max_rating,
        )
        return RecommendationProfileResponse.model_validate(profile)

    async def update_profile(
        self,
        db: AsyncSession,
        current_user: User,
        profile_in: RecommendationProfileUpdate,
    ) -> RecommendationProfileResponse:
        """Update recommendation profile with rating range consistency checks"""
        profile = await recommendation_profile_repository.get_by_user_id(
            db, current_user.id
        )
        if not profile:
            raise RecommendationProfileNotFoundError()

        # Check combined effective min and max ratings
        effective_min = (
            profile_in.min_rating
            if profile_in.min_rating is not None
            else profile.min_rating
        )
        effective_max = (
            profile_in.max_rating
            if profile_in.max_rating is not None
            else profile.max_rating
        )
        if (
            effective_min is not None
            and effective_max is not None
            and effective_min > effective_max
        ):
            raise InvalidRecommendationPreferencesError()

        updated = await recommendation_profile_repository.update(
            db=db,
            profile=profile,
            preferred_genres=profile_in.preferred_genres,
            preferred_authors=profile_in.preferred_authors,
            preferred_languages=profile_in.preferred_languages,
            min_rating=profile_in.min_rating,
            max_rating=profile_in.max_rating,
        )
        return RecommendationProfileResponse.model_validate(updated)

    async def delete_profile(
        self,
        db: AsyncSession,
        current_user: User,
    ) -> None:
        """Delete user's recommendation profile"""
        profile = await recommendation_profile_repository.get_by_user_id(
            db, current_user.id
        )
        if not profile:
            raise RecommendationProfileNotFoundError()

        await recommendation_profile_repository.delete(db, profile)


recommendation_profile_service = RecommendationProfileService()