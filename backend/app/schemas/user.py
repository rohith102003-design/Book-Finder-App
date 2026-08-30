import re
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserRole(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        clean = v.strip()
        if not re.match(r"^[a-zA-Z0-9_-]+$", clean):
            raise ValueError("Username may only contain letters, numbers, underscores, and hyphens.")
        return clean


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=64, description="User password")

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if len(v) > 64:
            raise ValueError("Password cannot exceed 64 characters.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number.")
        if not re.search(r"[!@#$%^&*()_+\-=]", v):
            raise ValueError("Password must contain at least one special character (!@#$%^&*()_+-=).")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class GoogleAuthPayload(BaseModel):
    credential: str = Field(..., description="Google OAuth ID Token credential or OAuth access token")
    client_id: Optional[str] = Field(None, description="Google OAuth Client ID")


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=4, max_length=10, description="6-digit email verification code")


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str
    email: str
    reset_token: Optional[str] = None


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    reset_token: str = Field(..., min_length=4, description="Password reset verification code or token")
    new_password: str = Field(..., min_length=8, max_length=64, description="New user password")

    @field_validator("new_password")
    @classmethod
    def validate_new_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if len(v) > 64:
            raise ValueError("Password cannot exceed 64 characters.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number.")
        if not re.search(r"[!@#$%^&*()_+\-=]", v):
            raise ValueError("Password must contain at least one special character (!@#$%^&*()_+-=).")
        return v


class ResetPasswordResponse(BaseModel):
    message: str


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    auth_provider: str = "LOCAL"
    email_verified: bool = False
    avatar_url: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RegistrationResponse(BaseModel):
    message: str
    email: str
    email_verified: bool = False
    user: UserResponse


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
