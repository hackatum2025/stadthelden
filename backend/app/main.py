from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.api.routes import chat, foundations

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    debug=settings.DEBUG,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup/Shutdown events
@app.on_event("startup")
async def startup_db_client():
    """Connect to MongoDB on startup."""
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close MongoDB connection on shutdown."""
    await close_mongo_connection()

# Include routers
app.include_router(
    chat.router,
    prefix=f"{settings.API_V1_PREFIX}/chat",
    tags=["chat"]
)

app.include_router(
    foundations.router,
    prefix=f"{settings.API_V1_PREFIX}/foundations",
    tags=["foundations"]
)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "City Hero API",
        "version": "1.0.0",
        "docs": "/docs",
        "database": settings.MONGODB_DB_NAME
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}

