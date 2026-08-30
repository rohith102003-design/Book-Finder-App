import uuid
from collections import Counter
from datetime import datetime, timezone
from typing import Dict, List, Optional
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import AppException, ReadingGoalNotFoundError
from app.models.bookshelf import BookshelfItem
from app.models.reading_goal import ReadingGoal
from app.models.review import Review
from app.models.user import User
from app.repositories.reading_goal_repository import reading_goal_repository
from app.schemas.analytics import (
    GenreStat,
    MonthlyReadingStat,
    ReadingAnalyticsResponse,
    ReadingGoalCreate,
    ReadingGoalResponse,
    ReadingGoalUpdate,
)


class ReadingAnalyticsService:
    """Service calculating user reading velocity, annual goals, genre distributions, and personal metrics"""

    def calculate_goal_progress(
        self,
        completed_books: int,
        target_books: int,
    ) -> float:
        """Safely compute goal completion percentage clamped to [0.0, 100.0]"""
        if target_books <= 0:
            return 0.0
        pct = (completed_books / target_books) * 100.0
        return min(100.0, max(0.0, round(pct, 2)))

    async def get_completed_books_count_in_year(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        year: int,
    ) -> int:
        """Count bookshelf items completed within the specified calendar year"""
        start_date = datetime(year, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
        end_date = datetime(year, 12, 31, 23, 59, 59, tzinfo=timezone.utc)

        statement = select(func.count(BookshelfItem.id)).where(
            BookshelfItem.user_id == user_id,
            BookshelfItem.status == "COMPLETED",
            BookshelfItem.completed_at >= start_date,
            BookshelfItem.completed_at <= end_date,
        )
        result = await db.execute(statement)
        return int(result.scalar_one() or 0)

    async def get_reading_goal(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        year: int,
    ) -> Optional[ReadingGoalResponse]:
        """Fetch a user's reading goal and dynamically compute progress and completion status"""
        goal = await reading_goal_repository.get_by_user_and_year(db, user_id, year)
        if not goal:
            return None

        completed_books = await self.get_completed_books_count_in_year(db, user_id, year)
        progress_percentage = self.calculate_goal_progress(completed_books, goal.target_books)
        is_completed = completed_books >= goal.target_books

        return ReadingGoalResponse(
            id=goal.id,
            user_id=goal.user_id,
            year=goal.year,
            target_books=goal.target_books,
            completed_books=completed_books,
            progress_percentage=progress_percentage,
            is_completed=is_completed,
        )

    async def create_reading_goal(
        self,
        db: AsyncSession,
        current_user: User,
        goal_in: ReadingGoalCreate,
    ) -> ReadingGoalResponse:
        """Create a new annual reading challenge goal"""
        existing = await reading_goal_repository.get_by_user_and_year(
            db, current_user.id, goal_in.year
        )
        if existing:
            raise AppException(
                message=f"A reading goal already exists for the year {goal_in.year}.",
                status_code=409,
                code="DUPLICATE_READING_GOAL",
            )

        goal = await reading_goal_repository.create(
            db=db,
            user_id=current_user.id,
            year=goal_in.year,
            target_books=goal_in.target_books,
        )

        completed_books = await self.get_completed_books_count_in_year(
            db, current_user.id, goal_in.year
        )
        progress_percentage = self.calculate_goal_progress(completed_books, goal.target_books)
        is_completed = completed_books >= goal.target_books

        return ReadingGoalResponse(
            id=goal.id,
            user_id=goal.user_id,
            year=goal.year,
            target_books=goal.target_books,
            completed_books=completed_books,
            progress_percentage=progress_percentage,
            is_completed=is_completed,
        )

    async def update_reading_goal(
        self,
        db: AsyncSession,
        current_user: User,
        year: int,
        update_in: ReadingGoalUpdate,
    ) -> ReadingGoalResponse:
        """Update target books for an existing annual reading goal"""
        goal = await reading_goal_repository.get_by_user_and_year(db, current_user.id, year)
        if not goal:
            raise ReadingGoalNotFoundError()

        updated_goal = await reading_goal_repository.update(
            db=db,
            goal=goal,
            target_books=update_in.target_books,
        )

        completed_books = await self.get_completed_books_count_in_year(db, current_user.id, year)
        progress_percentage = self.calculate_goal_progress(
            completed_books, updated_goal.target_books
        )
        is_completed = completed_books >= updated_goal.target_books

        return ReadingGoalResponse(
            id=updated_goal.id,
            user_id=updated_goal.user_id,
            year=updated_goal.year,
            target_books=updated_goal.target_books,
            completed_books=completed_books,
            progress_percentage=progress_percentage,
            is_completed=is_completed,
        )

    async def delete_reading_goal(
        self,
        db: AsyncSession,
        current_user: User,
        year: int,
    ) -> None:
        """Remove a reading goal for a specific year"""
        goal = await reading_goal_repository.get_by_user_and_year(db, current_user.id, year)
        if not goal:
            raise ReadingGoalNotFoundError()

        await reading_goal_repository.delete(db, goal)

    async def get_analytics_overview(
        self,
        db: AsyncSession,
        current_user: User,
        year: Optional[int] = None,
    ) -> ReadingAnalyticsResponse:
        """Generate comprehensive personal reading statistics strictly scoped to the authenticated user"""
        target_year = year or datetime.now(timezone.utc).year
        start_date = datetime(target_year, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
        end_date = datetime(target_year, 12, 31, 23, 59, 59, tzinfo=timezone.utc)

        # 1. Total Completed Books Overall
        total_completed_query = select(func.count(BookshelfItem.id)).where(
            BookshelfItem.user_id == current_user.id,
            BookshelfItem.status == "COMPLETED",
        )
        total_completed_res = await db.execute(total_completed_query)
        total_books_completed = int(total_completed_res.scalar_one() or 0)

        # 2. Total Pages Read Overall
        total_pages_query = select(
            func.coalesce(
                func.sum(
                    case(
                        (BookshelfItem.total_pages > 0, BookshelfItem.total_pages),
                        else_=BookshelfItem.current_page,
                    )
                ),
                0,
            )
        ).where(
            BookshelfItem.user_id == current_user.id,
            BookshelfItem.status == "COMPLETED",
        )
        total_pages_res = await db.execute(total_pages_query)
        total_pages_read = int(total_pages_res.scalar_one() or 0)

        # 3. Personal Average Rating (from user's own Reviews)
        avg_rating_query = select(
            func.coalesce(func.avg(Review.rating), 0.0)
        ).where(Review.user_id == current_user.id)
        avg_rating_res = await db.execute(avg_rating_query)
        average_personal_rating = round(float(avg_rating_res.scalar_one() or 0.0), 2)

        # 4. Active Reading Goal for Target Year
        active_goal = await self.get_reading_goal(db, current_user.id, target_year)

        # 5. Monthly Breakdown for Target Year (Months 1 to 12)
        monthly_items_query = (
            select(BookshelfItem)
            .where(
                BookshelfItem.user_id == current_user.id,
                BookshelfItem.status == "COMPLETED",
                BookshelfItem.completed_at >= start_date,
                BookshelfItem.completed_at <= end_date,
            )
        )
        monthly_items_res = await db.execute(monthly_items_query)
        yearly_completed_items = list(monthly_items_res.scalars().all())

        # Group by month
        monthly_stats_dict: Dict[int, Dict[str, int]] = {
            m: {"books": 0, "pages": 0} for m in range(1, 13)
        }
        for item in yearly_completed_items:
            if item.completed_at:
                month_num = item.completed_at.month
                pages = item.total_pages if item.total_pages > 0 else item.current_page
                monthly_stats_dict[month_num]["books"] += 1
                monthly_stats_dict[month_num]["pages"] += pages

        monthly_breakdown = [
            MonthlyReadingStat(
                month=m,
                books_completed=monthly_stats_dict[m]["books"],
                pages_read=monthly_stats_dict[m]["pages"],
            )
            for m in range(1, 13)
        ]

        # 6. Top Genres / Subjects from completed books
        all_completed_with_books_query = (
            select(BookshelfItem)
            .options(selectinload(BookshelfItem.book))
            .where(
                BookshelfItem.user_id == current_user.id,
                BookshelfItem.status == "COMPLETED",
            )
        )
        all_completed_res = await db.execute(all_completed_with_books_query)
        completed_records = list(all_completed_res.scalars().all())

        genre_counter: Counter = Counter()
        for record in completed_records:
            if record.book and record.book.subjects:
                for subj in record.book.subjects:
                    clean_subj = str(subj).strip()
                    if clean_subj:
                        genre_counter[clean_subj] += 1

        top_genres = [
            GenreStat(genre=g, count=c) for g, c in genre_counter.most_common(10)
        ]

        return ReadingAnalyticsResponse(
            total_books_completed=total_books_completed,
            total_pages_read=total_pages_read,
            average_personal_rating=average_personal_rating,
            active_goal=active_goal,
            monthly_breakdown=monthly_breakdown,
            top_genres=top_genres,
        )


reading_analytics_service = ReadingAnalyticsService()
