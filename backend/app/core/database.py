from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None
    
database = Database()

async def connect_to_mongo():
    """Connect to MongoDB."""
    database.client = AsyncIOMotorClient(settings.MONGODB_URL)
    print(f"Connected to MongoDB: {settings.MONGODB_DB_NAME}")

async def close_mongo_connection():
    """Close MongoDB connection."""
    database.client.close()
    print("Closed MongoDB connection")

def get_database():
    """Get database instance."""
    return database.client[settings.MONGODB_DB_NAME]

