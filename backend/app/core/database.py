from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import os

# PostgreSQL engine for cloud storage
engine = create_engine(
    settings.DATABASE_URL, 
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

# SQLite engine for offline storage
sqlite_engine = create_engine(
    settings.SQLITE_DATABASE_URL,
    connect_args={"check_same_thread": False},  # Needed for SQLite
    pool_pre_ping=True
)

# Session factories
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
SQLiteSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sqlite_engine)

Base = declarative_base()

def get_db():
    """Get PostgreSQL database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_sqlite_db():
    """Get SQLite database session for offline storage"""
    db = SQLiteSessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    # Import all models to ensure they are registered with Base
    from app.models import user, performance, knowledge_graph
    
    # Create all tables in PostgreSQL
    Base.metadata.create_all(bind=engine)
    
    # Create all tables in SQLite for offline support
    Base.metadata.create_all(bind=sqlite_engine)
