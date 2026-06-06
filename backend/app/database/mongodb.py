import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

logger = logging.getLogger("app.database")
logging.basicConfig(level=logging.INFO)

class DatabaseConnector:
    def __init__(self):
        self.client = None
        self.db = None
        self.is_mock = True

    async def connect(self):
        if not settings.MONGODB_URL:
            logger.warning("MONGODB_URL is empty. Falling back to IN-MEMORY MOCK DATABASE.")
            self.is_mock = True
            return

        try:
            logger.info("Connecting to MongoDB...")
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=5000,
                tls=True,
                tlsAllowInvalidCertificates=True
            )
            # Try to ping admin database to verify connection
            await self.client.admin.command('ping')
            
            # Determine DB name from connection string
            # Format is typically mongodb+srv://.../dbname?retryWrites=true...
            # or mongodb://localhost:27017/dbname
            db_name = "ai_nexus_chat"
            parts = settings.MONGODB_URL.split("/")
            if len(parts) > 3:
                last_part = parts[-1].split("?")[0]
                if last_part:
                    db_name = last_part
            
            self.db = self.client[db_name]
            self.is_mock = False
            logger.info(f"Successfully connected to MongoDB: database name '{db_name}'")
        except Exception as e:
            logger.error(f"Could not connect to MongoDB: {e}. Falling back to IN-MEMORY MOCK DATABASE.")
            self.client = None
            self.db = None
            self.is_mock = True

    async def disconnect(self):
        if self.client:
            self.client.close()
            logger.info("Disconnected from MongoDB.")

db_conn = DatabaseConnector()
