"""
Pytest configuration and fixtures for database schema property tests.
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.user import User, StudentProfile, Class
from app.models.performance import QuestionAttempt, ConceptMastery, StudyPlan, SyncOperation
from app.models.knowledge_graph import Topic, TopicPrerequisite, Concept, Question


@pytest.fixture(scope="function")
def db_engine():
    """Create an in-memory SQLite database engine for testing."""
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(engine)
    yield engine
    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture(scope="function")
def db_session(db_engine):
    """Create a new database session for a test."""
    Session = sessionmaker(bind=db_engine)
    session = Session()
    yield session
    session.close()
