# Database Schema Property Tests

This directory contains property-based tests for the Adaptive Learning Decision Engine database schema.

## Overview

The tests validate Properties 47-51 from the design document:
- **Property 47**: Student Profile Schema
- **Property 48**: Concept Mastery Schema
- **Property 49**: Topic Graph Schema
- **Property 50**: Attempt Schema
- **Property 51**: Referential Integrity

## Test Framework

- **Library**: Hypothesis (Python property-based testing)
- **Test Runner**: pytest
- **Database**: SQLite in-memory for testing
- **Iterations**: 100 examples per property (as specified in design)

## Running the Tests

### Option 1: Using Docker (Recommended)

```bash
# From the project root directory
docker-compose run --rm backend python -m pytest tests/test_database_schema_properties.py -v
```

### Option 2: Using Local Python Environment

```bash
# From the backend directory
# First, ensure dependencies are installed
pip install -r requirements.txt

# Run the tests
python -m pytest tests/test_database_schema_properties.py -v
```

### Option 3: Run specific test classes

```bash
# Test only Student Profile Schema (Property 47)
python -m pytest tests/test_database_schema_properties.py::TestProperty47StudentProfileSchema -v

# Test only Concept Mastery Schema (Property 48)
python -m pytest tests/test_database_schema_properties.py::TestProperty48ConceptMasterySchema -v

# Test only Topic Graph Schema (Property 49)
python -m pytest tests/test_database_schema_properties.py::TestProperty49TopicGraphSchema -v

# Test only Attempt Schema (Property 50)
python -m pytest tests/test_database_schema_properties.py::TestProperty50AttemptSchema -v

# Test only Referential Integrity (Property 51)
python -m pytest tests/test_database_schema_properties.py::TestProperty51ReferentialIntegrity -v
```

## Test Structure

Each property test class contains:

1. **Class docstring**: Describes the property being tested and which requirements it validates
2. **Test methods**: Use Hypothesis `@given` decorator with custom strategies
3. **Assertions**: Verify schema correctness, field presence, and data integrity

### Example Test Structure

```python
class TestProperty47StudentProfileSchema:
    """
    Property 47: Student Profile Schema
    Validates: Requirements 12.1
    """
    
    @settings(max_examples=100)
    @given(
        username=valid_username(),
        grade=valid_grade(),
        # ... other parameters
    )
    def test_student_profile_has_required_fields(self, db_session, ...):
        """
        Feature: adaptive-learning-decision-engine
        Property 47: Student Profile Schema
        """
        # Test implementation
```

## Custom Strategies

The tests use custom Hypothesis strategies to generate valid test data:

- `valid_username()`: Generates valid usernames (3-50 chars, alphanumeric + underscore/dash)
- `valid_role()`: Generates valid user roles (student, teacher, admin)
- `valid_grade()`: Generates valid grade levels (1-12)
- `valid_hours_per_day()`: Generates valid study hours (0.5-24.0)
- `valid_exam_weightage()`: Generates valid exam weightage (0-100)
- `valid_estimated_hours()`: Generates valid estimated study hours (0.1-100.0)
- `valid_mastery_score()`: Generates valid mastery scores (0-100)
- `valid_confidence()`: Generates valid confidence levels (1-5)
- `valid_time_taken()`: Generates valid time taken in seconds (0.1-3600.0)

## Test Coverage

### Property 47: Student Profile Schema
- ✓ Verifies all required fields exist (id, user_id, grade, target_exam, exam_date, available_hours_per_day)
- ✓ Validates field values are stored and retrieved correctly

### Property 48: Concept Mastery Schema
- ✓ Verifies all required fields exist (concept_id, attempts, accuracy, avg_time, mastery_score)
- ✓ Validates relationships to student and concept entities

### Property 49: Topic Graph Schema
- ✓ Verifies all required fields exist (topic_id, prerequisites, weightage, estimated_time)
- ✓ Validates prerequisites can be stored and accessed as an array
- ✓ Tests multiple prerequisite relationships

### Property 50: Attempt Schema
- ✓ Verifies all required fields exist (student_id, question_id, answer, is_correct, time_taken, confidence, timestamp)
- ✓ Validates all field values are stored correctly

### Property 51: Referential Integrity
- ✓ Verifies attempts require valid student_id and question_id
- ✓ Tests that invalid student_id is rejected (IntegrityError)
- ✓ Tests that invalid question_id is rejected (IntegrityError)
- ✓ Validates foreign key constraints are enforced

## Expected Output

When all tests pass, you should see output similar to:

```
tests/test_database_schema_properties.py::TestProperty47StudentProfileSchema::test_student_profile_has_required_fields PASSED
tests/test_database_schema_properties.py::TestProperty48ConceptMasterySchema::test_concept_mastery_has_required_fields PASSED
tests/test_database_schema_properties.py::TestProperty49TopicGraphSchema::test_topic_has_required_fields PASSED
tests/test_database_schema_properties.py::TestProperty49TopicGraphSchema::test_topic_prerequisites_array PASSED
tests/test_database_schema_properties.py::TestProperty50AttemptSchema::test_attempt_has_required_fields PASSED
tests/test_database_schema_properties.py::TestProperty51ReferentialIntegrity::test_attempt_requires_valid_student_and_question PASSED
tests/test_database_schema_properties.py::TestProperty51ReferentialIntegrity::test_attempt_rejects_invalid_student_id PASSED
tests/test_database_schema_properties.py::TestProperty51ReferentialIntegrity::test_attempt_rejects_invalid_question_id PASSED

========== 8 passed in X.XXs ==========
```

## Troubleshooting

### Import Errors
If you see import errors, ensure you're running from the backend directory and the app module is in your Python path:
```bash
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

### Database Connection Errors
The tests use an in-memory SQLite database, so no external database connection is required.

### Hypothesis Errors
If tests fail with Hypothesis errors, check:
1. The generated data meets all constraints
2. Foreign key relationships are properly set up
3. Database session is properly committed/rolled back

## Notes

- Each test runs 100 iterations with randomly generated data (as per design specification)
- Tests use SQLite in-memory database for speed and isolation
- All tests are independent and can be run in any order
- Database schema is created fresh for each test function
- Tests validate both positive cases (valid data) and negative cases (invalid foreign keys)
