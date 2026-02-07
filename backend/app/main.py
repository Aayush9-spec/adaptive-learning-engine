from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, attempts, recommendations, plans, topics, analytics

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

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(attempts.router, prefix="/api/attempts", tags=["performance"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])
app.include_router(plans.router, prefix="/api/plans", tags=["study-plans"])
app.include_router(topics.router, prefix="/api/topics", tags=["knowledge-graph"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])

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
