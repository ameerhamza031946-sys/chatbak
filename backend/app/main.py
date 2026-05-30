import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.mongodb import db_conn
from app.routes.auth import router as auth_router
from app.routes.chat import router as chat_router
from app.routes.system import router as system_router

# Setup logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("app.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to Database
    await db_conn.connect()
    yield
    # Shutdown: Disconnect Database
    await db_conn.disconnect()

app = FastAPI(
    title="AI Nexus Chat API",
    description="Backend services for AI Nexus Chat SaaS Web Application",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Routers
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(system_router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to AI Nexus Chat API. For documentation go to /docs",
        "status": "online"
    }

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting server on {settings.HOST}:{settings.PORT}")
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
