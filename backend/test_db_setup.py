"""
Test script to verify database setup and migrations
"""
import sys
import os

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import inspect, text
from app.core.database import engine, sqlite_engine
from app.models import (
    User, StudentProfile, Class,
    QuestionAttempt, ConceptMastery, StudyPlan, SyncOperation,
    Topic, TopicPrerequisite, Concept, Question
)

def test_postgresql_connection():
    """Test PostgreSQL connection"""
    print("\n=== Testing PostgreSQL Connection ===")
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✓ PostgreSQL connected: {version[:50]}...")
            return True
    except Exception as e:
        print(f"✗ PostgreSQL connection failed: {e}")
        return False

def test_sqlite_connection():
    """Test SQLite connection"""
    print("\n=== Testing SQLite Connection ===")
    try:
        with sqlite_engine.connect() as conn:
            result = conn.execute(text("SELECT sqlite_version()"))
            version = result.fetchone()[0]
            print(f"✓ SQLite connected: version {version}")
            return True
    except Exception as e:
        print(f"✗ SQLite connection failed: {e}")
        return False

def test_tables_exist(engine_to_test, db_name):
    """Test if all required tables exist"""
    print(f"\n=== Testing {db_name} Tables ===")
    
    expected_tables = [
        'users',
        'student_profiles',
        'classes',
        'topics',
        'topic_prerequisites',
        'concepts',
        'questions',
        'question_attempts',
        'concept_mastery',
        'study_plans',
        'sync_operations'
    ]
    
    inspector = inspect(engine_to_test)
    existing_tables = inspector.get_table_names()
    
    all_exist = True
    for table in expected_tables:
        if table in existing_tables:
            print(f"✓ Table '{table}' exists")
        else:
            print(f"✗ Table '{table}' missing")
            all_exist = False
    
    return all_exist

def test_indexes_exist(engine_to_test, db_name):
    """Test if critical indexes exist"""
    print(f"\n=== Testing {db_name} Indexes ===")
    
    inspector = inspect(engine_to_test)
    
    # Check indexes on question_attempts
    indexes = inspector.get_indexes('question_attempts')
    index_names = [idx['name'] for idx in indexes]
    
    critical_indexes = [
        'ix_question_attempts_student_id',
        'ix_question_attempts_question_id',
        'ix_question_attempts_timestamp',
        'idx_attempts_student_timestamp'
    ]
    
    all_exist = True
    for idx_name in critical_indexes:
        if idx_name in index_names:
            print(f"✓ Index '{idx_name}' exists")
        else:
            print(f"✗ Index '{idx_name}' missing")
            all_exist = False
    
    return all_exist

def test_foreign_keys(engine_to_test, db_name):
    """Test if foreign key relationships exist"""
    print(f"\n=== Testing {db_name} Foreign Keys ===")
    
    inspector = inspect(engine_to_test)
    
    # Check foreign keys on student_profiles
    fks = inspector.get_foreign_keys('student_profiles')
    
    if len(fks) >= 2:  # Should have FK to users and classes
        print(f"✓ Foreign keys on 'student_profiles': {len(fks)} found")
    else:
        print(f"✗ Foreign keys on 'student_profiles': Expected 2, found {len(fks)}")
        return False
    
    # Check foreign keys on question_attempts
    fks = inspector.get_foreign_keys('question_attempts')
    
    if len(fks) >= 2:  # Should have FK to student_profiles and questions
        print(f"✓ Foreign keys on 'question_attempts': {len(fks)} found")
    else:
        print(f"✗ Foreign keys on 'question_attempts': Expected 2, found {len(fks)}")
        return False
    
    return True

def test_model_imports():
    """Test if all models can be imported"""
    print("\n=== Testing Model Imports ===")
    
    models = [
        ('User', User),
        ('StudentProfile', StudentProfile),
        ('Class', Class),
        ('QuestionAttempt', QuestionAttempt),
        ('ConceptMastery', ConceptMastery),
        ('StudyPlan', StudyPlan),
        ('SyncOperation', SyncOperation),
        ('Topic', Topic),
        ('TopicPrerequisite', TopicPrerequisite),
        ('Concept', Concept),
        ('Question', Question),
    ]
    
    all_imported = True
    for name, model in models:
        if model is not None:
            print(f"✓ Model '{name}' imported successfully")
        else:
            print(f"✗ Model '{name}' import failed")
            all_imported = False
    
    return all_imported

def run_all_tests():
    """Run all database tests"""
    print("=" * 60)
    print("Database Setup Verification")
    print("=" * 60)
    
    results = {
        'Model Imports': test_model_imports(),
        'PostgreSQL Connection': test_postgresql_connection(),
        'SQLite Connection': test_sqlite_connection(),
    }
    
    # Only test tables if connections work
    if results['PostgreSQL Connection']:
        results['PostgreSQL Tables'] = test_tables_exist(engine, 'PostgreSQL')
        results['PostgreSQL Indexes'] = test_indexes_exist(engine, 'PostgreSQL')
        results['PostgreSQL Foreign Keys'] = test_foreign_keys(engine, 'PostgreSQL')
    
    if results['SQLite Connection']:
        results['SQLite Tables'] = test_tables_exist(sqlite_engine, 'SQLite')
    
    # Print summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {test_name}")
    
    all_passed = all(results.values())
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✓ All tests passed! Database setup is correct.")
    else:
        print("✗ Some tests failed. Please check the output above.")
    print("=" * 60)
    
    return all_passed

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
