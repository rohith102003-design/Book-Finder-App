import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    DuplicateReviewError,
    ReviewNotFoundError,
)
from app.models.review import Review
from app.models.user import User
from app.repositories.book_repository import book_repository
from app.repositories.bookshelf_repository import bookshelf_repository
from app.repositories.review_repository import review_repository
from app.schemas.book import BookCreate
from app.schemas.review import (
    BookReviewSummaryResponse,
    RatingDistribution,
    ReviewAuthorResponse,
    ReviewCreate,
    ReviewResponse,
    ReviewUpdate,
)
from app.services.openlibrary_service import openlibrary_service


class ReviewService:
    """Service coordinating book resolution, review CRUD, verified reader badges, and rating aggregation"""

    async def is_user_verified_reader(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        book_id: uuid.UUID,
    ) -> bool:
        """Check if user has marked this book as COMPLETED on their bookshelf"""
        item = await bookshelf_repository.get_by_user_and_book(db, user_id, book_id)
        return bool(item and item.status == "COMPLETED")

    def to_review_response(
        self,
        review: Review,
        is_verified_reader: bool = False,
    ) -> ReviewResponse:
        """Format Review ORM model into ReviewResponse schema with author information"""
        author = ReviewAuthorResponse(
            id=review.user.id,
            username=review.user.username,
            is_verified_reader=is_verified_reader,
        )
        return ReviewResponse(
            id=review.id,
            user_id=review.user_id,
            book_id=review.book_id,
            rating=review.rating,
            title=review.title,
            content=review.content,
            contains_spoilers=review.contains_spoilers,
            likes_count=review.likes_count,
            author=author,
            created_at=review.created_at,
            updated_at=review.updated_at,
        )

    async def create_review(
        self,
        db: AsyncSession,
        current_user: User,
        review_in: ReviewCreate,
    ) -> ReviewResponse:
        """Create a new review for a book with duplicate prevention and verified reader checking"""
        clean_work_id = review_in.openlibrary_work_id.replace("/works/", "").strip()

        # Resolve book locally or via OpenLibrary
        book = await book_repository.get_by_openlibrary_id(db, clean_work_id)
        if not book:
            try:
                work_data = await openlibrary_service.get_work_details(clean_work_id)
                title = work_data.get("title", "Untitled Book") if work_data else clean_work_id
                description = None
                if work_data:
                    raw_desc = work_data.get("description")
                    if isinstance(raw_desc, str):
                        description = raw_desc.strip()
                    elif isinstance(raw_desc, dict) and "value" in raw_desc:
                        description = str(raw_desc["value"]).strip()

                covers = work_data.get("covers", []) if work_data else []
                cover_url = None
                if covers and isinstance(covers, list) and len(covers) > 0 and isinstance(covers[0], int) and covers[0] > 0:
                    cover_url = f"{openlibrary_service.covers_url}/b/id/{covers[0]}-L.jpg"

                subjects = work_data.get("subjects", []) if work_data else []
                if not isinstance(subjects, list):
                    subjects = []

                book_in = BookCreate(
                    openlibrary_work_id=clean_work_id,
                    title=title,
                    authors=["Unknown Author"],
                    first_publish_year=None,
                    cover_url=cover_url,
                    description=description,
                    edition_count=1,
                    subjects=subjects[:5],
                )
            except Exception:
                book_in = BookCreate(
                    openlibrary_work_id=clean_work_id,
                    title=clean_work_id,
                    authors=[],
                )
            book = await book_repository.upsert_by_openlibrary_id(db, book_in)

        # Enforce one review per user per book (idempotent upsert)
        existing_review = await review_repository.get_by_user_and_book(db, current_user.id, book.id)
        if existing_review:
            existing_review.rating = review_in.rating
            if review_in.title is not None:
                existing_review.title = review_in.title
            if review_in.content is not None:
                existing_review.content = review_in.content
            if review_in.contains_spoilers is not None:
                existing_review.contains_spoilers = review_in.contains_spoilers
            updated = await review_repository.update(db, existing_review)
            is_verified = await self.is_user_verified_reader(db, current_user.id, book.id)
            return self.to_review_response(updated, is_verified_reader=is_verified)

        # Persist review
        review = await review_repository.create(
            db=db,
            user_id=current_user.id,
            book_id=book.id,
            rating=review_in.rating,
            title=review_in.title,
            content=review_in.content,
            contains_spoilers=review_in.contains_spoilers,
        )

        is_verified = await self.is_user_verified_reader(db, current_user.id, book.id)
        return self.to_review_response(review, is_verified_reader=is_verified)

    async def get_book_reviews(
        self,
        db: AsyncSession,
        openlibrary_work_id: str,
        skip: int = 0,
        limit: int = 20,
    ) -> BookReviewSummaryResponse:
        """Fetch community reviews and aggregate star rating breakdown for a book"""
        clean_work_id = openlibrary_work_id.replace("/works/", "").strip()
        book = await book_repository.get_by_openlibrary_id(db, clean_work_id)

        if not book:
            return BookReviewSummaryResponse(
                book_id=uuid.uuid4(),
                openlibrary_work_id=clean_work_id,
                average_rating=0.0,
                total_reviews=0,
                rating_distribution=RatingDistribution(),
                reviews=[],
            )

        # Retrieve reviews and aggregate stats
        reviews_list = await review_repository.list_by_book(db, book.id, skip=skip, limit=limit)
        stats = await review_repository.get_book_rating_stats(db, book.id)

        # Format review items with verified reader badges
        formatted_reviews: List[ReviewResponse] = []
        for rev in reviews_list:
            is_verified = await self.is_user_verified_reader(db, rev.user_id, book.id)
            formatted_reviews.append(self.to_review_response(rev, is_verified_reader=is_verified))

        distribution = RatingDistribution(
            one_star=int(stats["one_star"]),
            two_star=int(stats["two_star"]),
            three_star=int(stats["three_star"]),
            four_star=int(stats["four_star"]),
            five_star=int(stats["five_star"]),
        )

        return BookReviewSummaryResponse(
            book_id=book.id,
            openlibrary_work_id=book.openlibrary_work_id,
            average_rating=float(stats["average_rating"]),
            total_reviews=int(stats["total_reviews"]),
            rating_distribution=distribution,
            reviews=formatted_reviews,
        )

    async def get_my_review(
        self,
        db: AsyncSession,
        current_user: User,
        openlibrary_work_id: str,
    ) -> Optional[ReviewResponse]:
        """Fetch the authenticated user's review for a specific book"""
        clean_work_id = openlibrary_work_id.replace("/works/", "").strip()
        book = await book_repository.get_by_openlibrary_id(db, clean_work_id)
        if not book:
            return None

        review = await review_repository.get_by_user_and_book(db, current_user.id, book.id)
        if not review:
            return None

        is_verified = await self.is_user_verified_reader(db, current_user.id, book.id)
        return self.to_review_response(review, is_verified_reader=is_verified)

    async def update_review(
        self,
        db: AsyncSession,
        review_id: uuid.UUID,
        current_user: User,
        update_in: ReviewUpdate,
    ) -> ReviewResponse:
        """Update an existing review with strict user ownership enforcement"""
        review = await review_repository.get_by_id(db, review_id)
        if not review or review.user_id != current_user.id:
            raise ReviewNotFoundError()

        if update_in.rating is not None:
            review.rating = update_in.rating
        if update_in.title is not None:
            review.title = update_in.title
        if update_in.content is not None:
            review.content = update_in.content
        if update_in.contains_spoilers is not None:
            review.contains_spoilers = update_in.contains_spoilers

        updated = await review_repository.update(db, review)
        is_verified = await self.is_user_verified_reader(db, current_user.id, updated.book_id)
        return self.to_review_response(updated, is_verified_reader=is_verified)

    async def delete_review(
        self,
        db: AsyncSession,
        review_id: uuid.UUID,
        current_user: User,
    ) -> None:
        """Delete a review (allowed for owner or users with ADMIN role)"""
        review = await review_repository.get_by_id(db, review_id)
        if not review:
            raise ReviewNotFoundError()

        # Admin moderation or owner deletion
        if review.user_id != current_user.id and current_user.role != "ADMIN":
            raise ReviewNotFoundError()

        await review_repository.delete(db, review)


review_service = ReviewService()
