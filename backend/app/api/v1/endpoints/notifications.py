import uuid
from typing import Dict
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.notification import (
    NotificationListResponse,
    NotificationResponse,
)
from app.services.notification_service import notification_service

router = APIRouter()


@router.get(
    "",
    response_model=ApiResponse[NotificationListResponse],
    status_code=status.HTTP_200_OK,
    summary="Get user notifications",
    description="Returns paginated list of notifications for the authenticated user along with total unread count.",
)
async def get_notifications(
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(20, ge=1, le=100, description="Notifications per page"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[NotificationListResponse]:
    result = await notification_service.get_my_notifications(
        db, current_user, skip=skip, limit=limit
    )
    return ApiResponse(data=result)


@router.get(
    "/unread-count",
    response_model=ApiResponse[Dict[str, int]],
    status_code=status.HTTP_200_OK,
    summary="Get unread notification count",
    description="Returns the total count of unread notifications for the authenticated user.",
)
async def get_unread_count(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[Dict[str, int]]:
    count = await notification_service.get_unread_count(db, current_user)
    return ApiResponse(data={"unread_count": count})


@router.patch(
    "/{notification_id}/read",
    response_model=ApiResponse[NotificationResponse],
    status_code=status.HTTP_200_OK,
    summary="Mark notification as read",
    description="Marks a single notification as read with ownership isolation.",
)
async def mark_notification_as_read(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[NotificationResponse]:
    notification = await notification_service.mark_notification_as_read(
        db, current_user, notification_id
    )
    return ApiResponse(data=notification)


@router.post(
    "/read-all",
    response_model=ApiResponse[Dict[str, int]],
    status_code=status.HTTP_200_OK,
    summary="Mark all notifications as read",
    description="Marks all unread notifications for the authenticated user as read.",
)
async def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[Dict[str, int]]:
    updated_count = await notification_service.mark_all_notifications_as_read(
        db, current_user
    )
    return ApiResponse(data={"updated_count": updated_count})
