from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api import auth, attempts, recommendations, topics

app = FastAPI(
    title="Adaptive Learning Decision Engine",
    description="AI-powered study recommendations based on performance and exam weightage",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    try:
        init_db()
        print("✓ Database initialized successfully")
    except Exception as e:
        print(f"Warning: Database initialization failed: {e}")
        print("This is expected if using Alembic migrations")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(attempts.router, prefix="/api/attempts", tags=["performance"])
app.include_router(recommendations.router)  # Has its own prefix
app.include_router(topics.router)  # Has its own prefix
# Note: plans and analytics routers are not yet implemented
# app.include_router(plans.router, prefix="/api/plans", tags=["study-plans"])
# app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])

@app.get("/")
def root():
    return {
        "message": "Adaptive Learning Decision Engine API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
