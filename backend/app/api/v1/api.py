from fastapi import APIRouter
from app.api.v1.endpoints import (
    analytics,
    auth,
    bookmarks,
    books,
    bookshelf,
    favorites,
    follows,
    health,
    notifications,
    reading_progress,
    recommendations,
    review_likes,
    reviews,
    social_feed,
)

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(books.router, prefix="/books", tags=["Books"])
api_router.include_router(reviews.book_reviews_router, prefix="/books", tags=["Reviews"])
api_router.include_router(bookshelf.router, prefix="/bookshelf", tags=["Bookshelf"])
api_router.include_router(favorites.router, prefix="/favorites", tags=["Favorites"])
api_router.include_router(reading_progress.router, prefix="/reading-progress", tags=["Reading Progress"])
api_router.include_router(bookmarks.router, prefix="/bookmarks", tags=["Bookmarks"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
api_router.include_router(review_likes.router, prefix="/reviews", tags=["Review Likes"])
api_router.include_router(follows.router, prefix="/users", tags=["Social Follows"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
api_router.include_router(social_feed.router, prefix="/social", tags=["Social Feed"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
