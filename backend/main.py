"""
Main FastAPI application for Adaptive Learning Decision Engine
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Import API routers
from recommendation_api import router as recommendation_router
from knowledge_graph_api import router as knowledge_graph_router
from study_plan_api import router as study_plan_router
from teacher_analytics_api import router as teacher_analytics_router
from question_api import router as question_router
from sync_api import router as sync_router

# Import middleware
from error_handler import add_error_handlers
from rate_limiter import RateLimitMiddleware
from health_check import router as health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup
    print("Starting Adaptive Learning Decision Engine...")
    yield
    # Shutdown
    print("Shutting down Adaptive Learning Decision Engine...")


# Create FastAPI application
app = FastAPI(
    title="Adaptive Learning Decision Engine API",
    description="Intelligent study recommendation system with offline-first capabilities",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting middleware
app.add_middleware(RateLimitMiddleware)

# Add error handlers
add_error_handlers(app)

# Include routers
app.include_router(health_router, tags=["Health"])
app.include_router(recommendation_router, prefix="/api", tags=["Recommendations"])
app.include_router(knowledge_graph_router, prefix="/api", tags=["Knowledge Graph"])
app.include_router(study_plan_router, prefix="/api", tags=["Study Plans"])
app.include_router(teacher_analytics_router, prefix="/api", tags=["Analytics"])
app.include_router(question_router, prefix="/api", tags=["Questions"])
app.include_router(sync_router, prefix="/api", tags=["Sync"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Adaptive Learning Decision Engine API",
        "version": "1.0.0",
        "status": "operational"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
