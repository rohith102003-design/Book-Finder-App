import uuid
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.reading_goal import ReadingGoal


class ReadingGoalRepository:
    """Repository handling all database operations for ReadingGoal entities"""

    async def get_by_user_and_year(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        year: int,
    ) -> Optional[ReadingGoal]:
        """Fetch a user's reading goal for a specific year"""
        statement = select(ReadingGoal).where(
            ReadingGoal.user_id == user_id,
            ReadingGoal.year == year,
        )
        result = await db.execute(statement)
        return result.scalar_one_or_none()

    async def create(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        year: int,
        target_books: int,
    ) -> ReadingGoal:
        """Create and persist a new annual reading challenge goal"""
        goal = ReadingGoal(
            user_id=user_id,
            year=year,
            target_books=target_books,
        )
        db.add(goal)
        await db.commit()
        await db.refresh(goal)
        return goal

    async def update(
        self,
        db: AsyncSession,
        goal: ReadingGoal,
        target_books: int,
    ) -> ReadingGoal:
        """Update target books for an existing goal"""
        goal.target_books = target_books
        await db.commit()
        await db.refresh(goal)
        return goal

    async def delete(
        self,
        db: AsyncSession,
        goal: ReadingGoal,
    ) -> None:
        """Remove a reading goal from the database"""
        await db.delete(goal)
        await db.commit()


reading_goal_repository = ReadingGoalRepository()
