import logging
import os
import sys
import traceback

# Setup basic logging FIRST before any imports that might fail
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout
)
logger = logging.getLogger("app.main")

try:
    from contextlib import asynccontextmanager
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from app.core.config import settings
    from app.database.mongodb import db_conn
    from app.routes.auth import router as auth_router
    from app.routes.chat import router as chat_router
    from app.routes.system import router as system_router
    logger.info("All imports successful.")
except Exception as e:
    logger.error(f"FATAL IMPORT ERROR: {e}")
    traceback.print_exc()
    sys.exit(1)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up...")
    try:
        await db_conn.connect()
        logger.info("Database connection complete.")
    except Exception as e:
        logger.error(f"Database startup error: {e}")
    yield
    # Shutdown
    try:
        await db_conn.disconnect()
    except Exception:
        pass

app = FastAPI(
    title="AI Nexus Chat API",
    description="Backend services for AI Nexus Chat SaaS Web Application",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    port = int(os.environ.get("PORT", getattr(settings, "PORT", 8000)))
    host = os.environ.get("HOST", "0.0.0.0")
    logger.info(f"Starting server on {host}:{port}")
    uvicorn.run("app.main:app", host=host, port=port, reload=False)
