from fastapi import APIRouter
from app.core.config import settings
from app.db.session import check_db_health
from app.schemas.common import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint probing application status and database readiness"""
    db_connected = await check_db_health()
    return HealthResponse(
        status="ok",
        environment=settings.ENVIRONMENT,
        version=settings.VERSION,
        database="connected" if db_connected else "disconnected",
    )
