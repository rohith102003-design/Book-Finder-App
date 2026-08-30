import uuid
from typing import Dict, List, Optional
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.review import Review


class ReviewRepository:
    """Repository handling all database persistence and queries for Review entities"""

    async def get_by_id(
        self,
        db: AsyncSession,
        review_id: uuid.UUID,
    ) -> Optional[Review]:
        """Fetch a specific review by ID with user and book eager loaded"""
        statement = (
            select(Review)
            .options(
                selectinload(Review.user),
                selectinload(Review.book),
            )
            .where(Review.id == review_id)
        )
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_user_and_book(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        book_id: uuid.UUID,
    ) -> Optional[Review]:
        """Retrieve a user's existing review for a specific book"""
        statement = (
            select(Review)
            .options(
                selectinload(Review.user),
                selectinload(Review.book),
            )
            .where(
                Review.user_id == user_id,
                Review.book_id == book_id,
            )
        )
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    async def list_by_book(
        self,
        db: AsyncSession,
        book_id: uuid.UUID,
        skip: int = 0,
        limit: int = 20,
    ) -> List[Review]:
        """List reviews for a specific book ordered chronologically (newest first)"""
        statement = (
            select(Review)
            .options(
                selectinload(Review.user),
                selectinload(Review.book),
            )
            .where(Review.book_id == book_id)
            .order_by(Review.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(statement)
        return list(result.scalars().all())

    async def get_book_rating_stats(
        self,
        db: AsyncSession,
        book_id: uuid.UUID,
    ) -> Dict[str, float | int]:
        """Compute aggregate average rating and distribution counts for a book"""
        statement = (
            select(
                func.coalesce(func.avg(Review.rating), 0.0).label("average_rating"),
                func.count(Review.id).label("total_reviews"),
                func.count(case((Review.rating == 1, Review.id))).label("one_star"),
                func.count(case((Review.rating == 2, Review.id))).label("two_star"),
                func.count(case((Review.rating == 3, Review.id))).label("three_star"),
                func.count(case((Review.rating == 4, Review.id))).label("four_star"),
                func.count(case((Review.rating == 5, Review.id))).label("five_star"),
            )
            .where(Review.book_id == book_id)
        )
        result = await db.execute(statement)
        row = result.mappings().one()
        return {
            "average_rating": round(float(row["average_rating"]), 2),
            "total_reviews": int(row["total_reviews"]),
            "one_star": int(row["one_star"]),
            "two_star": int(row["two_star"]),
            "three_star": int(row["three_star"]),
            "four_star": int(row["four_star"]),
            "five_star": int(row["five_star"]),
        }

    async def create(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        book_id: uuid.UUID,
        rating: int,
        content: str,
        title: Optional[str] = None,
        contains_spoilers: bool = False,
    ) -> Review:
        """Create and persist a new review"""
        review = Review(
            user_id=user_id,
            book_id=book_id,
            rating=rating,
            title=title,
            content=content,
            contains_spoilers=contains_spoilers,
            likes_count=0,
        )
        db.add(review)
        await db.commit()
        await db.refresh(review)
        # Fetch with eager loaded relationships
        reloaded = await self.get_by_id(db, review.id)
        return reloaded or review

    async def update(
        self,
        db: AsyncSession,
        review: Review,
    ) -> Review:
        """Persist updates to an existing review"""
        await db.commit()
        await db.refresh(review)
        return review

    async def delete(
        self,
        db: AsyncSession,
        review: Review,
    ) -> None:
        """Remove a review from the database"""
        await db.delete(review)
        await db.commit()


review_repository = ReviewRepository()
