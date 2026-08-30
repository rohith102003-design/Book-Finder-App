from typing import Any, Dict, Optional
from fastapi import Request, status
from fastapi.responses import JSONResponse


class AppException(Exception):
    """Base application exception with structured error envelope"""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        code: str = "INTERNAL_ERROR",
        details: Optional[Any] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.code = code
        self.details = details
        super().__init__(self.message)


class NotFoundError(AppException):
    def __init__(self, message: str = "Requested resource was not found."):
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            code="NOT_FOUND",
        )


class BookNotFoundError(AppException):
    def __init__(self, work_id: str):
        super().__init__(
            message=f"Book with work ID '{work_id}' was not found.",
            status_code=status.HTTP_404_NOT_FOUND,
            code="BOOK_NOT_FOUND",
            details={"work_id": work_id},
        )


class ExternalApiError(AppException):
    def __init__(self, service_name: str, message: str, status_code: int = status.HTTP_502_BAD_GATEWAY):
        super().__init__(
            message=f"External service '{service_name}' error: {message}",
            status_code=status_code,
            code="EXTERNAL_API_ERROR",
            details={"service": service_name},
        )


class ExternalApiTimeoutError(AppException):
    def __init__(self, service_name: str):
        super().__init__(
            message=f"Request to external service '{service_name}' timed out.",
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            code="EXTERNAL_API_TIMEOUT",
            details={"service": service_name},
        )


class DatabaseConnectionError(AppException):
    def __init__(self, message: str = "Database service is currently unreachable."):
        super().__init__(
            message=message,
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            code="DATABASE_UNAVAILABLE",
        )


# Authentication & Authorization Exceptions
class InvalidCredentialsError(AppException):
    def __init__(self, message: str = "Invalid email or password."):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="INVALID_CREDENTIALS",
        )


class TokenExpiredError(AppException):
    def __init__(self, message: str = "Token has expired."):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="TOKEN_EXPIRED",
        )


class InvalidTokenError(AppException):
    def __init__(self, message: str = "Invalid or malformed token."):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="INVALID_TOKEN",
        )


class UserAlreadyExistsError(AppException):
    def __init__(self, message: str = "An account with this email or username already exists."):
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            code="USER_ALREADY_EXISTS",
        )


class EmailNotVerifiedError(AppException):
    def __init__(self, message: str = "Email is not verified. Please verify your email address before signing in."):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            code="EMAIL_NOT_VERIFIED",
        )


class InvalidVerificationCodeError(AppException):
    def __init__(self, message: str = "Invalid or expired verification code."):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="INVALID_VERIFICATION_CODE",
        )


class ForbiddenError(AppException):
    def __init__(self, message: str = "You do not have permission to perform this action."):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            code="FORBIDDEN",
        )


# Bookshelf Exceptions
class BookshelfItemNotFoundError(AppException):
    def __init__(self, message: str = "Bookshelf item was not found."):
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            code="BOOKSHELF_ITEM_NOT_FOUND",
        )


class DuplicateBookshelfItemError(AppException):
    def __init__(self, message: str = "This book is already present in your bookshelf."):
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            code="DUPLICATE_BOOKSHELF_ITEM",
        )


class InvalidReadingProgressError(AppException):
    def __init__(self, message: str = "Current page cannot exceed total pages."):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="INVALID_READING_PROGRESS",
        )


# Review & Analytics Exceptions
class ReviewNotFoundError(AppException):
    def __init__(self, message: str = "Review was not found."):
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            code="REVIEW_NOT_FOUND",
        )


class DuplicateReviewError(AppException):
    def __init__(self, message: str = "You have already reviewed this book."):
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            code="DUPLICATE_REVIEW",
        )


class ReadingGoalNotFoundError(AppException):
    def __init__(self, message: str = "Reading goal was not found."):
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            code="READING_GOAL_NOT_FOUND",
        )


# Phase 6 Social & Recommendation Exceptions
class UserNotFoundError(AppException):
    def __init__(self, message: str = "User was not found."):
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            code="USER_NOT_FOUND",
        )


class DuplicateReviewLikeError(AppException):
    def __init__(self, message: str = "You have already liked this review."):
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            code="DUPLICATE_REVIEW_LIKE",
        )


class ReviewLikeNotFoundError(AppException):
    def __init__(self, message: str = "Review like was not found."):
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            code="REVIEW_LIKE_NOT_FOUND",
        )


class DuplicateUserFollowError(AppException):
    def __init__(self, message: str = "You are already following this user."):
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            code="DUPLICATE_USER_FOLLOW",
        )


class UserFollowNotFoundError(AppException):
    def __init__(self, message: str = "Follow relationship was not found."):
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            code="USER_FOLLOW_NOT_FOUND",
        )


class SelfFollowError(AppException):
    def __init__(self, message: str = "You cannot follow yourself."):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="SELF_FOLLOW_ERROR",
        )


class NotificationNotFoundError(AppException):
    def __init__(self, message: str = "Notification was not found."):
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            code="NOTIFICATION_NOT_FOUND",
        )


class RecommendationProfileNotFoundError(AppException):
    def __init__(self, message: str = "Recommendation profile was not found."):
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            code="RECOMMENDATION_PROFILE_NOT_FOUND",
        )


class DuplicateRecommendationProfileError(AppException):
    def __init__(self, message: str = "Recommendation profile already exists for this user."):
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            code="DUPLICATE_RECOMMENDATION_PROFILE",
        )


class InvalidRecommendationPreferencesError(AppException):
    def __init__(self, message: str = "Minimum rating cannot exceed maximum rating."):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            code="INVALID_RECOMMENDATION_PREFERENCES",
        )


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Standardized JSON envelope for application exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            },
        },
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Fallback handler to prevent leaking stack traces or credentials"""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected internal server error occurred.",
            },
        },
    )
