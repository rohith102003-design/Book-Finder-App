from typing import List, Optional, Set, Tuple

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.book import Book
from app.models.recommendation_profile import RecommendationProfile
from app.models.user import User
from app.repositories.book_repository import book_repository
from app.repositories.bookshelf_repository import bookshelf_repository
from app.repositories.recommendation_profile_repository import (
    recommendation_profile_repository,
)
from app.repositories.review_repository import review_repository
from app.schemas.book import BookCreate
from app.schemas.recommendation import (
    BookRecommendationItem,
    BookRecommendationResponse,
)


CURATED_SEED_BOOKS = [
    {
        "openlibrary_work_id": "OL82563W",
        "title": "Harry Potter and the Philosopher's Stone",
        "authors": ["J.K. Rowling"],
        "first_publish_year": 1997,
        "cover_url": "https://covers.openlibrary.org/b/id/10521270-L.jpg",
        "description": "The story of Harry Potter, an orphaned boy who discovers on his eleventh birthday that he is a wizard.",
        "edition_count": 45,
        "subjects": ["Fantasy", "Magic", "Wizards", "Young Adult", "Adventure"],
    },
    {
        "openlibrary_work_id": "OL893415W",
        "title": "Dune",
        "authors": ["Frank Herbert"],
        "first_publish_year": 1965,
        "cover_url": "https://covers.openlibrary.org/b/id/8739161-L.jpg",
        "description": "Set on the desert planet Arrakis, Dune tells the story of Paul Atreides and the battle for the spice melange.",
        "edition_count": 30,
        "subjects": ["Science Fiction", "Space", "Sci-Fi", "Epic", "Planetary Romance"],
    },
    {
        "openlibrary_work_id": "OL1168007W",
        "title": "1984",
        "authors": ["George Orwell"],
        "first_publish_year": 1949,
        "cover_url": "https://covers.openlibrary.org/b/id/12818862-L.jpg",
        "description": "A chilling dystopian prophecy about totalitarianism, mass surveillance, and thought control.",
        "edition_count": 80,
        "subjects": [
            "Dystopian",
            "Classics",
            "Political Fiction",
            "Totalitarianism",
            "Literature",
        ],
    },
    {
        "openlibrary_work_id": "OL27479W",
        "title": "The Hobbit",
        "authors": ["J.R.R. Tolkien"],
        "first_publish_year": 1937,
        "cover_url": "https://covers.openlibrary.org/b/id/12003423-L.jpg",
        "description": "Bilbo Baggins embarks on an unexpected journey to reclaim the lost Dwarf Kingdom of Erebor.",
        "edition_count": 60,
        "subjects": ["Fantasy", "Adventure", "Classics", "Dragons", "Epic"],
    },
    {
        "openlibrary_work_id": "OL20150375W",
        "title": "Atomic Habits",
        "authors": ["James Clear"],
        "first_publish_year": 2018,
        "cover_url": "https://covers.openlibrary.org/b/id/12739343-L.jpg",
        "description": "An easy and proven framework for improving every day through tiny behavioral changes.",
        "edition_count": 15,
        "subjects": [
            "Self-Help",
            "Productivity",
            "Habits",
            "Psychology",
            "Personal Development",
        ],
    },
    {
        "openlibrary_work_id": "OL15367683W",
        "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
        "authors": ["Robert C. Martin"],
        "first_publish_year": 2008,
        "cover_url": "https://covers.openlibrary.org/b/id/12845624-L.jpg",
        "description": "A guide to software craftsmanship, principles of clean architecture, and readable code.",
        "edition_count": 12,
        "subjects": [
            "Programming",
            "Software Engineering",
            "Computer Science",
            "Technology",
            "Clean Code",
        ],
    },
    {
        "openlibrary_work_id": "OL1063162W",
        "title": "Pride and Prejudice",
        "authors": ["Jane Austen"],
        "first_publish_year": 1813,
        "cover_url": "https://covers.openlibrary.org/b/id/12847564-L.jpg",
        "description": "Elizabeth Bennet navigates manners, upbringing, morality, and marriage in Georgian England.",
        "edition_count": 95,
        "subjects": [
            "Classics",
            "Romance",
            "Literature",
            "Historical Fiction",
            "British",
        ],
    },
    {
        "openlibrary_work_id": "OL27448W",
        "title": "The Lord of the Rings",
        "authors": ["J.R.R. Tolkien"],
        "first_publish_year": 1954,
        "cover_url": "https://covers.openlibrary.org/b/id/12003435-L.jpg",
        "description": "The legendary journey across Middle-earth to destroy the One Ring in the fires of Mount Doom.",
        "edition_count": 70,
        "subjects": [
            "Epic Fantasy",
            "Fantasy",
            "Adventure",
            "Classics",
            "Mythology",
        ],
    },
    {
        "openlibrary_work_id": "OL12345W",
        "title": "Neuromancer",
        "authors": ["William Gibson"],
        "first_publish_year": 1984,
        "cover_url": "https://covers.openlibrary.org/b/id/10543210-L.jpg",
        "description": "The seminal cyberpunk novel following Case, a washed-up computer hacker hired for one last job in cyberspace.",
        "edition_count": 22,
        "subjects": [
            "Cyberpunk",
            "Science Fiction",
            "AI",
            "Technology",
            "Sci-Fi",
        ],
    },
    {
        "openlibrary_work_id": "OL45678W",
        "title": "Foundation",
        "authors": ["Isaac Asimov"],
        "first_publish_year": 1951,
        "cover_url": "https://covers.openlibrary.org/b/id/10654321-L.jpg",
        "description": "Hari Seldon uses psychohistory to preserve human knowledge and shorten the dark age of a galactic empire.",
        "edition_count": 35,
        "subjects": [
            "Science Fiction",
            "Space Opera",
            "Classics",
            "Sci-Fi",
            "Galactic Empire",
        ],
    },
    {
        "openlibrary_work_id": "OL98765W",
        "title": "Brave New World",
        "authors": ["Aldous Huxley"],
        "first_publish_year": 1932,
        "cover_url": "https://covers.openlibrary.org/b/id/10876543-L.jpg",
        "description": "A prophetic vision of a dystopian future shaped by genetic engineering, consumerism, and state conditioning.",
        "edition_count": 55,
        "subjects": [
            "Dystopian",
            "Classics",
            "Science Fiction",
            "Philosophy",
            "Literature",
        ],
    },
]


class RecommendationService:
    """Deterministic recommendation engine based on user preference profiles, bookshelf history, and community rating stats"""

    async def ensure_seed_books(self, db: AsyncSession) -> None:
        """Populate seed library books if catalog is sparse"""
        for seed in CURATED_SEED_BOOKS:
            await book_repository.upsert_by_openlibrary_id(
                db,
                BookCreate(
                    openlibrary_work_id=seed["openlibrary_work_id"],
                    title=seed["title"],
                    authors=seed["authors"],
                    first_publish_year=seed["first_publish_year"],
                    cover_url=seed["cover_url"],
                    description=seed["description"],
                    edition_count=seed["edition_count"],
                    subjects=seed["subjects"],
                ),
            )

    def score_book_for_user(
        self,
        book: Book,
        profile: Optional[RecommendationProfile],
        user_favorite_genres: Set[str],
        user_favorite_authors: Set[str],
        average_rating: float = 0.0,
        total_reviews: int = 0,
    ) -> Tuple[float, List[str]]:
        """Calculate a deterministic recommendation score and match explanations for a book"""
        score = 5.0
        reasons: List[str] = []

        # 1. Preferred Genre Matching
        preferred_genres = (
            [g.strip().lower() for g in profile.preferred_genres if g]
            if profile and profile.preferred_genres
            else []
        )

        book_subjects = [
            s.strip().lower() for s in (book.subjects or []) if s
        ]

        matched_profile_genres = [
            g
            for g in preferred_genres
            if any(g in s or s in g for s in book_subjects)
        ]

        if matched_profile_genres:
            score += len(matched_profile_genres) * 20.0
            reasons.append(
                f"Matches your preferred topics: "
                f"{', '.join(matched_profile_genres[:3]).title()}"
            )

        # 2. Reading History Genre Similarity
        matched_history_genres = [
            g
            for g in user_favorite_genres
            if any(g in s or s in g for s in book_subjects)
        ]

        if matched_history_genres and not matched_profile_genres:
            score += len(matched_history_genres) * 12.0
            reasons.append(
                f"Similar to books you completed: "
                f"{', '.join(matched_history_genres[:2]).title()}"
            )

        # 3. Preferred Author Matching
        preferred_authors = (
            [a.strip().lower() for a in profile.preferred_authors if a]
            if profile and profile.preferred_authors
            else []
        )

        book_authors = [
            a.strip().lower() for a in (book.authors or []) if a
        ]

        matched_profile_authors = [
            a
            for a in preferred_authors
            if any(a in ba or ba in a for ba in book_authors)
        ]

        if matched_profile_authors:
            score += 30.0
            reasons.append(
                f"Written by your preferred author: "
                f"{', '.join(book.authors)}"
            )

        matched_history_authors = [
            a
            for a in user_favorite_authors
            if any(a in ba or ba in a for ba in book_authors)
        ]

        if matched_history_authors and not matched_profile_authors:
            score += 15.0
            reasons.append(
                f"By an author you enjoyed: {', '.join(book.authors)}"
            )

        # 4. Rating Constraints & Community Rating Bonus
        if profile and profile.min_rating is not None and average_rating > 0:
            if average_rating < profile.min_rating:
                return -100.0, []

        if profile and profile.max_rating is not None and average_rating > 0:
            if average_rating > profile.max_rating:
                return -100.0, []

        if average_rating > 0:
            score += average_rating * 4.0

            if average_rating >= 4.0 and total_reviews > 0:
                reasons.append(
                    f"Highly rated by readers ({average_rating:.1f} ★)"
                )

        # 5. Base Popularity / Edition Bonus
        if book.edition_count and book.edition_count > 1:
            score += min(book.edition_count, 10) * 1.0

        # Fallback reason
        if not reasons:
            reasons.append("Curated Master Guide recommendation")

        return score, reasons

    async def get_recommendations(
        self,
        db: AsyncSession,
        current_user: User,
        limit: int = 12,
    ) -> BookRecommendationResponse:
        """Generate personalized book recommendations for the authenticated user"""

        # Ensure seed books exist
        await self.ensure_seed_books(db)

        # 1. Fetch user preference profile
        profile = await recommendation_profile_repository.get_by_user_id(
            db,
            current_user.id,
        )

        # 2. Fetch user's existing bookshelf items
        user_bookshelf = await bookshelf_repository.list_by_user(
            db,
            current_user.id,
        )

        excluded_book_ids = {
            item.book_id for item in user_bookshelf
        }

        # 3. Derive favorite genres/authors from COMPLETED reads
        user_favorite_genres: Set[str] = set()
        user_favorite_authors: Set[str] = set()

        for item in user_bookshelf:
            if item.status == "COMPLETED" and item.book:
                for subj in item.book.subjects or []:
                    user_favorite_genres.add(
                        subj.strip().lower()
                    )

                for auth in item.book.authors or []:
                    user_favorite_authors.add(
                        auth.strip().lower()
                    )

        # 4. Query candidate books
        stmt = select(Book)

        if excluded_book_ids:
            stmt = stmt.where(
                Book.id.notin_(excluded_book_ids)
            )

        stmt = stmt.limit(100)

        result = await db.execute(stmt)
        candidate_books = list(result.scalars().all())

        # If candidates are empty, query all books
        if not candidate_books:
            stmt_all = select(Book).limit(50)
            res_all = await db.execute(stmt_all)
            candidate_books = list(res_all.scalars().all())

        # 5. Remove duplicate logical books.
        #
        # A curated seed book and an existing catalog book may have
        # different OpenLibrary IDs while representing the same book.
        # Prefer the non-seed/catalog record.
        seed_work_ids = {
            seed["openlibrary_work_id"]
            for seed in CURATED_SEED_BOOKS
        }

        unique_books = {}

        for book in candidate_books:
            normalized_title = (
                (book.title or "").strip().lower()
            )

            normalized_authors = tuple(
                sorted(
                    (author or "").strip().lower()
                    for author in (book.authors or [])
                    if author
                )
            )

            logical_key = (
                normalized_title,
                normalized_authors,
            )

            existing_book = unique_books.get(logical_key)

            if existing_book is None:
                unique_books[logical_key] = book
                continue

            existing_is_seed = (
                existing_book.openlibrary_work_id
                in seed_work_ids
            )

            current_is_seed = (
                book.openlibrary_work_id
                in seed_work_ids
            )

            # Prefer the real/catalog book over the curated seed copy
            if existing_is_seed and not current_is_seed:
                unique_books[logical_key] = book

        candidate_books = list(unique_books.values())

        # 6. Score and rank candidates
        scored_items: List[BookRecommendationItem] = []

        for book in candidate_books:
            stats = await review_repository.get_book_rating_stats(
                db,
                book.id,
            )

            avg_rating = float(
                stats["average_rating"]
            )

            total_reviews = int(
                stats["total_reviews"]
            )

            score, reasons = self.score_book_for_user(
                book=book,
                profile=profile,
                user_favorite_genres=user_favorite_genres,
                user_favorite_authors=user_favorite_authors,
                average_rating=avg_rating,
                total_reviews=total_reviews,
            )

            if score > 0:
                scored_items.append(
                    BookRecommendationItem(
                        book_id=book.id,
                        openlibrary_work_id=book.openlibrary_work_id,
                        title=book.title,
                        authors=book.authors or [],
                        cover_url=book.cover_url,
                        first_publish_year=book.first_publish_year,
                        subjects=book.subjects or [],
                        score=round(score, 1),
                        match_reasons=reasons,
                        average_rating=avg_rating,
                    )
                )

        # Sort descending by score,
        # then average rating, then title
        scored_items.sort(
            key=lambda x: (
                x.score,
                x.average_rating,
                x.title,
            ),
            reverse=True,
        )

        top_recommendations = scored_items[:limit]

        return BookRecommendationResponse(
            recommendations=top_recommendations,
            total_count=len(top_recommendations),
        )


recommendation_service = RecommendationService()