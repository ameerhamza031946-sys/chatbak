from fastapi import APIRouter
from app.database.mongodb import db_conn
from app.services.ai_service import ai_service

router = APIRouter(tags=["System & Config"])

@router.get("/health")
async def health_check():
    """Returns application status and database configurations."""
    return {
        "status": "healthy",
        "database": "mock_in_memory" if db_conn.is_mock else "mongodb",
        "openai_configured": ai_service.openai_configured,
        "gemini_configured": ai_service.gemini_configured
    }

@router.get("/models")
async def list_models():
    """Retrieve available AI models and their provider categories."""
    return ai_service.get_available_models()
