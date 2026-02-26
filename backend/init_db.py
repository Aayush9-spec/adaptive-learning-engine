"""
Database initialization script
Initializes both PostgreSQL and SQLite databases with the schema
"""
import sys
import os

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import Base, engine, sqlite_engine
from app.models.user import User, StudentProfile, Class
from app.models.performance import QuestionAttempt, ConceptMastery, StudyPlan, SyncOperation
from app.models.knowledge_graph import Topic, TopicPrerequisite, Concept, Question

def init_databases():
    """Initialize both PostgreSQL and SQLite databases"""
    print("Initializing databases...")
    
    # Create all tables in PostgreSQL
    print("Creating PostgreSQL tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ PostgreSQL tables created")
    
    # Create all tables in SQLite
    print("Creating SQLite tables...")
    Base.metadata.create_all(bind=sqlite_engine)
    print("✓ SQLite tables created")
    
    print("\n✓ Database initialization complete!")
    print("\nTables created:")
    print("  - users")
    print("  - student_profiles")
    print("  - classes")
    print("  - topics")
    print("  - topic_prerequisites")
    print("  - concepts")
    print("  - questions")
    print("  - question_attempts")
    print("  - concept_mastery")
    print("  - study_plans")
    print("  - sync_operations")

if __name__ == "__main__":
    init_databases()
