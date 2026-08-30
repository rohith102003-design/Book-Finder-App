from typing import Any, Generic, Optional, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    data: T
    meta: Optional[dict] = None


class HealthResponse(BaseModel):
    status: str
    environment: str
    version: str
    database: str


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail
