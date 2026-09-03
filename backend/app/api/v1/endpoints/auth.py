from typing import Optional
from fastapi import APIRouter, Cookie, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, get_current_user
from app.core.config import settings
from app.core.exceptions import InvalidCredentialsError
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.user import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    GoogleAuthPayload,
    RegistrationResponse,
    ResendVerificationRequest,
    ResetPasswordRequest,
    ResetPasswordResponse,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
    VerifyEmailRequest,
)
from app.services.auth_service import auth_service

router = APIRouter()


def get_cookie_samesite() -> str:
    if settings.COOKIE_SAMESITE:
        return settings.COOKIE_SAMESITE.lower()
    return "none" if settings.ENVIRONMENT.lower() == "production" else "lax"


def get_cookie_secure() -> bool:
    if settings.COOKIE_SECURE is not None:
        return settings.COOKIE_SECURE
    return settings.ENVIRONMENT.lower() == "production"


def set_refresh_cookie(response: Response, refresh_token: str) -> None:
    """Attaches httpOnly refresh token cookie scoped to the auth route path"""
    max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    samesite = get_cookie_samesite()
    secure = get_cookie_secure() or (samesite == "none")
    response.set_cookie(
        key="refreshToken",
        value=refresh_token,
        httponly=True,
        max_age=max_age,
        expires=max_age,
        path=f"{settings.API_V1_STR}/auth",
        samesite=samesite,
        secure=secure,
    )


def clear_refresh_cookie(response: Response) -> None:
    """Clears the httpOnly refresh token cookie on logout"""
    samesite = get_cookie_samesite()
    secure = get_cookie_secure() or (samesite == "none")
    response.delete_cookie(
        key="refreshToken",
        path=f"{settings.API_V1_STR}/auth",
        samesite=samesite,
        secure=secure,
    )


@router.post(
    "/register",
    response_model=ApiResponse[TokenResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Registers a new user account with a Gmail address, establishes session via httpOnly refresh cookie, and returns access token.",
)
async def register(
    user_in: UserCreate,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[TokenResponse]:
    user, code = await auth_service.register_user(db, user_in)
    access_token, refresh_token = auth_service.generate_tokens_for_user(user)
    set_refresh_cookie(response, refresh_token)

    return ApiResponse(
        data=TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )
    )


@router.post(
    "/verify-email",
    response_model=ApiResponse[TokenResponse],
    status_code=status.HTTP_200_OK,
    summary="Verify email and activate session",
    description="Validates the 6-digit verification code, activates the account, and issues authenticated session tokens.",
)
async def verify_email(
    payload: VerifyEmailRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[TokenResponse]:
    user = await auth_service.verify_email(db, payload.email, payload.code)
    access_token, refresh_token = auth_service.generate_tokens_for_user(user)
    set_refresh_cookie(response, refresh_token)

    return ApiResponse(
        data=TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )
    )


@router.post(
    "/resend-verification",
    response_model=ApiResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Resend verification code",
    description="Generates a fresh 6-digit verification code and resends the activation email.",
)
async def resend_verification(
    payload: ResendVerificationRequest,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[dict]:
    msg = await auth_service.resend_verification_code(db, payload.email)
    return ApiResponse(data={"message": msg, "email": payload.email})


@router.post(
    "/login",
    response_model=ApiResponse[TokenResponse],
    status_code=status.HTTP_200_OK,
    summary="User login",
    description="Authenticates Gmail credentials, establishes session via httpOnly refresh cookie, and returns access token.",
)
async def login(
    user_in: UserLogin,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[TokenResponse]:
    user = await auth_service.authenticate_user(db, user_in.email, user_in.password)
    access_token, refresh_token = auth_service.generate_tokens_for_user(user)
    set_refresh_cookie(response, refresh_token)

    return ApiResponse(
        data=TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )
    )


@router.post(
    "/google",
    response_model=ApiResponse[TokenResponse],
    status_code=status.HTTP_200_OK,
    summary="Google OAuth Login / Register",
    description="Authenticates or creates a verified user via Google OAuth ID token, establishes session and returns access token.",
)
async def google_auth(
    payload: GoogleAuthPayload,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[TokenResponse]:
    user = await auth_service.authenticate_google_user(db, payload)
    access_token, refresh_token = auth_service.generate_tokens_for_user(user)
    set_refresh_cookie(response, refresh_token)

    return ApiResponse(
        data=TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )
    )


@router.post(
    "/forgot-password",
    response_model=ApiResponse[ForgotPasswordResponse],
    status_code=status.HTTP_200_OK,
    summary="Request password reset",
    description="Generates a password reset token for a registered account.",
)
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ForgotPasswordResponse]:
    message, reset_token = await auth_service.request_password_reset(db, payload.email)
    return ApiResponse(
        data=ForgotPasswordResponse(
            message=message,
            email=payload.email,
            reset_token=reset_token,
        )
    )


@router.post(
    "/reset-password",
    response_model=ApiResponse[ResetPasswordResponse],
    status_code=status.HTTP_200_OK,
    summary="Reset user password",
    description="Validates reset token and sets new password for the user.",
)
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[ResetPasswordResponse]:
    message = await auth_service.reset_password(
        db, payload.email, payload.reset_token, payload.new_password
    )
    return ApiResponse(
        data=ResetPasswordResponse(message=message)
    )


@router.post(
    "/refresh",
    response_model=ApiResponse[TokenResponse],
    status_code=status.HTTP_200_OK,
    summary="Refresh access token",
    description="Rotates refresh token and issues a new access token using httpOnly cookie.",
)
async def refresh(
    response: Response,
    refreshToken: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[TokenResponse]:
    if not refreshToken:
        raise InvalidCredentialsError("Missing refresh token cookie.")

    access_token, new_refresh_token, user = await auth_service.rotate_refresh_token(
        db,
        refreshToken,
    )
    set_refresh_cookie(response, new_refresh_token)

    return ApiResponse(
        data=TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )
    )


@router.post(
    "/logout",
    response_model=ApiResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Logout user",
    description="Revokes active user sessions in database and clears httpOnly auth cookie.",
)
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[dict]:
    await auth_service.revoke_user_sessions(db, current_user.id)
    clear_refresh_cookie(response)

    return ApiResponse(
        data={"message": "Logged out successfully."}
    )


@router.get(
    "/me",
    response_model=ApiResponse[UserResponse],
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description="Returns the profile information of the currently authenticated user.",
)
async def get_me(
    current_user: User = Depends(get_current_active_user),
) -> ApiResponse[UserResponse]:
    return ApiResponse(
        data=UserResponse.model_validate(current_user)
    )
