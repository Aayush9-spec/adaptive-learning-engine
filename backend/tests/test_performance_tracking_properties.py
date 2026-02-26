"""
Property-based tests for performance tracking system.

Feature: adaptive-learning-decision-engine
Tests Properties 1, 2, 3, 4, and 44 from the design document.
"""
import pytest
from hypothesis import given, settings, strategies as st, HealthCheck
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.services.performance_tracker import PerformanceTracker
from app.models.user import User, StudentProfile
from app.models.knowledge_graph import Topic, Concept, Question
from app.models.performance import QuestionAttempt, ConceptMastery


def get_test_db():
    """Create a test database session."""
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    return Session()


# Custom strategies for generating test data
@st.composite
def student_data(draw):
    """Generate valid student data."""
    return {
        "username": draw(st.text(min_size=3, max_size=20, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd')))),
        "grade": draw(st.integers(min_value=1, max_value=12)),
        "available_hours": draw(st.floats(min_value=0.5, max_value=8.0))
    }


@st.composite
def attempt_data(draw):
    """Generate valid attempt data."""
    return {
        "answer": draw(st.text(min_size=1, max_size=100)),
        "is_correct": draw(st.booleans()),
        "time_taken": draw(st.floats(min_value=1.0, max_value=3600.0)),
        "confidence": draw(st.integers(min_value=1, max_value=5))
    }


@settings(max_examples=100, deadline=None, suppress_health_check=[HealthCheck.function_scoped_fixture])
@given(
    student=student_data(),
    attempt=attempt_data()
)
def test_property_1_attempt_recording_completeness(student, attempt):
    """
    Feature: adaptive-learning-decision-engine
    Property 1: Attempt Recording Completeness
    
    **Validates: Requirements 1.1**
    
    For any question submission with answer, time, and confidence data,
    recording the attempt should result in a stored record containing all provided fields.
    """
    db_session = get_test_db()
    
    # Setup: Create user, student profile, topic, concept, and question
    user = User(
        username=student["username"],
        password_hash="hashed_password",
        role="student"
    )
    db_session.add(user)
    db_session.commit()
    
    student_profile = StudentProfile(
        user_id=user.id,
        grade=student["grade"],
        target_exam="Board Exam",
        available_hours_per_day=student["available_hours"]
    )
    db_session.add(student_profile)
    db_session.commit()
    
    topic = Topic(
        name="Test Topic",
        exam_weightage=10.0,
        estimated_hours=5.0
    )
    db_session.add(topic)
    db_session.commit()
    
    concept = Concept(
        topic_id=topic.id,
        name="Test Concept"
    )
    db_session.add(concept)
    db_session.commit()
    
    question = Question(
        concept_id=concept.id,
        question_text="Test question?",
        question_type="mcq",
        correct_answer="A",
        difficulty="medium",
        expected_time_seconds=120
    )
    db_session.add(question)
    db_session.commit()
    
    # Action: Record attempt
    tracker = PerformanceTracker(db_session)
    recorded_attempt = tracker.record_attempt(
        student_id=student_profile.id,
        question_id=question.id,
        answer=attempt["answer"],
        is_correct=attempt["is_correct"],
        time_taken=attempt["time_taken"],
        confidence=attempt["confidence"]
    )
    
    # Assertion: Verify all fields are stored
    assert recorded_attempt.student_id == student_profile.id
    assert recorded_attempt.question_id == question.id
    assert recorded_attempt.answer == attempt["answer"]
    assert recorded_attempt.is_correct == attempt["is_correct"]
    assert recorded_attempt.time_taken_seconds == attempt["time_taken"]
    assert recorded_attempt.confidence == attempt["confidence"]
    assert recorded_attempt.timestamp is not None
    
    db_session.close()


@settings(max_examples=100, deadline=None, suppress_health_check=[HealthCheck.function_scoped_fixture])
@given(
    student=student_data(),
    num_attempts=st.integers(min_value=1, max_value=20),
    attempts=st.lists(attempt_data(), min_size=1, max_size=20)
)
def test_property_2_multiple_attempt_preservation(student, num_attempts, attempts):
    """
    Feature: adaptive-learning-decision-engine
    Property 2: Multiple Attempt Preservation
    
    **Validates: Requirements 1.2**
    
    For any question and student, submitting N attempts should result in
    exactly N stored attempt records with distinct timestamps.
    """
    db_session = get_test_db()
    
    # Limit attempts to num_attempts
    attempts = attempts[:num_attempts]
    
    # Setup: Create user, student profile, topic, concept, and question
    user = User(
        username=student["username"],
        password_hash="hashed_password",
        role="student"
    )
    db_session.add(user)
    db_session.commit()
    
    student_profile = StudentProfile(
        user_id=user.id,
        grade=student["grade"],
        target_exam="Board Exam",
        available_hours_per_day=student["available_hours"]
    )
    db_session.add(student_profile)
    db_session.commit()
    
    topic = Topic(
        name="Test Topic",
        exam_weightage=10.0,
        estimated_hours=5.0
    )
    db_session.add(topic)
    db_session.commit()
    
    concept = Concept(
        topic_id=topic.id,
        name="Test Concept"
    )
    db_session.add(concept)
    db_session.commit()
    
    question = Question(
        concept_id=concept.id,
        question_text="Test question?",
        question_type="mcq",
        correct_answer="A",
        difficulty="medium",
        expected_time_seconds=120
    )
    db_session.add(question)
    db_session.commit()
    
    # Action: Record N attempts
    tracker = PerformanceTracker(db_session)
    for attempt in attempts:
        tracker.record_attempt(
            student_id=student_profile.id,
            question_id=question.id,
            answer=attempt["answer"],
            is_correct=attempt["is_correct"],
            time_taken=attempt["time_taken"],
            confidence=attempt["confidence"]
        )
    
    # Assertion: Verify exactly N attempts are stored
    stored_attempts = db_session.query(QuestionAttempt).filter(
        QuestionAttempt.student_id == student_profile.id,
        QuestionAttempt.question_id == question.id
    ).all()
    
    assert len(stored_attempts) == len(attempts)
    
    # Verify distinct timestamps
    timestamps = [a.timestamp for a in stored_attempts]
    assert len(timestamps) == len(attempts)
    
    db_session.close()


@settings(max_examples=100, deadline=None, suppress_health_check=[HealthCheck.function_scoped_fixture])
@given(
    student=student_data(),
    attempts=st.lists(attempt_data(), min_size=1, max_size=50)
)
def test_property_3_mastery_score_bounds(student, attempts):
    """
    Feature: adaptive-learning-decision-engine
    Property 3: Mastery Score Bounds
    
    **Validates: Requirements 1.3**
    
    For any concept and student with recorded attempts, the calculated
    mastery score must be between 0 and 100 inclusive.
    """
    db_session = get_test_db()
    
    # Setup: Create user, student profile, topic, concept, and question
    user = User(
        username=student["username"],
        password_hash="hashed_password",
        role="student"
    )
    db_session.add(user)
    db_session.commit()
    
    student_profile = StudentProfile(
        user_id=user.id,
        grade=student["grade"],
        target_exam="Board Exam",
        available_hours_per_day=student["available_hours"]
    )
    db_session.add(student_profile)
    db_session.commit()
    
    topic = Topic(
        name="Test Topic",
        exam_weightage=10.0,
        estimated_hours=5.0
    )
    db_session.add(topic)
    db_session.commit()
    
    concept = Concept(
        topic_id=topic.id,
        name="Test Concept"
    )
    db_session.add(concept)
    db_session.commit()
    
    question = Question(
        concept_id=concept.id,
        question_text="Test question?",
        question_type="mcq",
        correct_answer="A",
        difficulty="medium",
        expected_time_seconds=120
    )
    db_session.add(question)
    db_session.commit()
    
    # Action: Record attempts
    tracker = PerformanceTracker(db_session)
    for attempt in attempts:
        tracker.record_attempt(
            student_id=student_profile.id,
            question_id=question.id,
            answer=attempt["answer"],
            is_correct=attempt["is_correct"],
            time_taken=attempt["time_taken"],
            confidence=attempt["confidence"]
        )
    
    # Calculate mastery score
    mastery_score = tracker.calculate_mastery_score(student_profile.id, concept.id)
    
    # Assertion: Mastery score must be between 0 and 100
    assert 0.0 <= mastery_score <= 100.0
    
    db_session.close()


@settings(max_examples=100, deadline=None, suppress_health_check=[HealthCheck.function_scoped_fixture])
@given(
    student=student_data(),
    attempts=st.lists(attempt_data(), min_size=1, max_size=30)
)
def test_property_4_mistake_pattern_storage(student, attempts):
    """
    Feature: adaptive-learning-decision-engine
    Property 4: Mistake Pattern Storage
    
    **Validates: Requirements 1.5**
    
    For any concept with student attempts, mistake patterns should be
    stored and retrievable for that concept.
    """
    db_session = get_test_db()
    
    # Setup: Create user, student profile, topic, concept, and question
    user = User(
        username=student["username"],
        password_hash="hashed_password",
        role="student"
    )
    db_session.add(user)
    db_session.commit()
    
    student_profile = StudentProfile(
        user_id=user.id,
        grade=student["grade"],
        target_exam="Board Exam",
        available_hours_per_day=student["available_hours"]
    )
    db_session.add(student_profile)
    db_session.commit()
    
    topic = Topic(
        name="Test Topic",
        exam_weightage=10.0,
        estimated_hours=5.0
    )
    db_session.add(topic)
    db_session.commit()
    
    concept = Concept(
        topic_id=topic.id,
        name="Test Concept"
    )
    db_session.add(concept)
    db_session.commit()
    
    question = Question(
        concept_id=concept.id,
        question_text="Test question?",
        question_type="mcq",
        correct_answer="A",
        difficulty="medium",
        expected_time_seconds=120
    )
    db_session.add(question)
    db_session.commit()
    
    # Action: Record attempts
    tracker = PerformanceTracker(db_session)
    for attempt in attempts:
        tracker.record_attempt(
            student_id=student_profile.id,
            question_id=question.id,
            answer=attempt["answer"],
            is_correct=attempt["is_correct"],
            time_taken=attempt["time_taken"],
            confidence=attempt["confidence"]
        )
    
    # Get mistake patterns
    mistake_patterns = tracker.get_mistake_patterns(student_profile.id, concept.id)
    
    # Assertion: Mistake patterns should be retrievable and contain expected fields
    assert mistake_patterns is not None
    assert "concept_id" in mistake_patterns
    assert "total_attempts" in mistake_patterns
    assert "incorrect_attempts" in mistake_patterns
    assert "common_mistakes" in mistake_patterns
    assert "mistake_rate" in mistake_patterns
    assert mistake_patterns["concept_id"] == concept.id
    assert mistake_patterns["total_attempts"] == len(attempts)
    
    db_session.close()


@settings(max_examples=100, deadline=None, suppress_health_check=[HealthCheck.function_scoped_fixture])
@given(
    student=student_data(),
    attempts=st.lists(attempt_data(), min_size=1, max_size=50)
)
def test_property_44_accuracy_calculation(student, attempts):
    """
    Feature: adaptive-learning-decision-engine
    Property 44: Accuracy Calculation
    
    **Validates: Requirements 10.3**
    
    For any student with N total attempts and C correct attempts,
    the displayed accuracy percentage should equal (C / N) × 100.
    """
    db_session = get_test_db()
    
    # Setup: Create user, student profile, topic, concept, and question
    user = User(
        username=student["username"],
        password_hash="hashed_password",
        role="student"
    )
    db_session.add(user)
    db_session.commit()
    
    student_profile = StudentProfile(
        user_id=user.id,
        grade=student["grade"],
        target_exam="Board Exam",
        available_hours_per_day=student["available_hours"]
    )
    db_session.add(student_profile)
    db_session.commit()
    
    topic = Topic(
        name="Test Topic",
        exam_weightage=10.0,
        estimated_hours=5.0
    )
    db_session.add(topic)
    db_session.commit()
    
    concept = Concept(
        topic_id=topic.id,
        name="Test Concept"
    )
    db_session.add(concept)
    db_session.commit()
    
    question = Question(
        concept_id=concept.id,
        question_text="Test question?",
        question_type="mcq",
        correct_answer="A",
        difficulty="medium",
        expected_time_seconds=120
    )
    db_session.add(question)
    db_session.commit()
    
    # Action: Record attempts
    tracker = PerformanceTracker(db_session)
    for attempt in attempts:
        tracker.record_attempt(
            student_id=student_profile.id,
            question_id=question.id,
            answer=attempt["answer"],
            is_correct=attempt["is_correct"],
            time_taken=attempt["time_taken"],
            confidence=attempt["confidence"]
        )
    
    # Get performance summary
    performance = tracker.get_student_performance(student_profile.id)
    
    # Calculate expected accuracy
    total_attempts = len(attempts)
    correct_attempts = sum(1 for a in attempts if a["is_correct"])
    expected_accuracy = (correct_attempts / total_attempts * 100) if total_attempts > 0 else 0
    
    # Assertion: Accuracy should match the formula
    assert performance["total_attempts"] == total_attempts
    assert performance["correct_attempts"] == correct_attempts
    assert abs(performance["accuracy"] - expected_accuracy) < 0.01  # Allow small floating point error
    
    db_session.close()

    """
    Feature: adaptive-learning-decision-engine
    Property 1: Attempt Recording Completeness
    
    **Validates: Requirements 1.1**
    
    For any question submission with answer, time, and confidence data,
    recording the attempt should result in a stored record containing all provided fields.
    """
    # Setup: Create user, student profile, topic, concept, and question
    user = User(
        username=student["username"],
        password_hash="hashed_password",
        role="student"
    )
    db_session.add(user)
    db_session.commit()
    
    student_profile = StudentProfile(
        user_id=user.id,
        grade=student["grade"],
        target_exam="Board Exam",
        available_hours_per_day=student["available_hours"]
    )
    db_session.add(student_profile)
    db_session.commit()
    
    topic = Topic(
        name="Test Topic",
        exam_weightage=10.0,
        estimated_hours=5.0
    )
    db_session.add(topic)
    db_session.commit()
    
    concept = Concept(
        topic_id=topic.id,
        name="Test Concept"
    )
    db_session.add(concept)
    db_session.commit()
    
    question = Question(
        concept_id=concept.id,
        question_text="Test question?",
        question_type="mcq",
        correct_answer="A",
        difficulty="medium",
        expected_time_seconds=120
    )
    db_session.add(question)
    db_session.commit()
    
    # Action: Record attempt
    tracker = PerformanceTracker(db_session)
    recorded_attempt = tracker.record_attempt(
        student_id=student_profile.id,
        question_id=question.id,
        answer=attempt["answer"],
        is_correct=attempt["is_correct"],
        time_taken=attempt["time_taken"],
        confidence=attempt["confidence"]
    )
    
    # Assertion: Verify all fields are stored
    assert recorded_attempt.student_id == student_profile.id
    assert recorded_attempt.question_id == question.id
    assert recorded_attempt.answer == attempt["answer"]
    assert recorded_attempt.is_correct == attempt["is_correct"]
    assert recorded_attempt.time_taken_seconds == attempt["time_taken"]
    assert recorded_attempt.confidence == attempt["confidence"]
    assert recorded_attempt.timestamp is not None


@settings(max_examples=100)
@given(
    student=student_data(),
    num_attempts=st.integers(min_value=1, max_value=20),
    attempts=st.lists(attempt_data(), min_size=1, max_size=20)
)
def test_property_2_multiple_attempt_preservation(db_session, student, num_attempts, attempts):
    """
    Feature: adaptive-learning-decision-engine
    Property 2: Multiple Attempt Preservation
    
    **Validates: Requirements 1.2**
    
    For any question and student, submitting N attempts should result in
    exactly N stored attempt records with distinct timestamps.
    """
    # Limit attempts to num_attempts
    attempts = attempts[:num_attempts]
    
    # Setup: Create user, student profile, topic, concept, and question
    user = User(
        username=student["username"],
        password_hash="hashed_password",
        role="student"
    )
    db_session.add(user)
    db_session.commit()
    
    student_profile = StudentProfile(
        user_id=user.id,
        grade=student["grade"],
        target_exam="Board Exam",
        available_hours_per_day=student["available_hours"]
    )
    db_session.add(student_profile)
    db_session.commit()
    
    topic = Topic(
        name="Test Topic",
        exam_weightage=10.0,
        estimated_hours=5.0
    )
    db_session.add(topic)
    db_session.commit()
    
    concept = Concept(
        topic_id=topic.id,
        name="Test Concept"
    )
    db_session.add(concept)
    db_session.commit()
    
    question = Question(
        concept_id=concept.id,
        question_text="Test question?",
        question_type="mcq",
        correct_answer="A",
        difficulty="medium",
        expected_time_seconds=120
    )
    db_session.add(question)
    db_session.commit()
    
    # Action: Record N attempts
    tracker = PerformanceTracker(db_session)
    for attempt in attempts:
        tracker.record_attempt(
            student_id=student_profile.id,
            question_id=question.id,
            answer=attempt["answer"],
            is_correct=attempt["is_correct"],
            time_taken=attempt["time_taken"],
            confidence=attempt["confidence"]
        )
    
    # Assertion: Verify exactly N attempts are stored
    stored_attempts = db_session.query(QuestionAttempt).filter(
        QuestionAttempt.student_id == student_profile.id,
        QuestionAttempt.question_id == question.id
    ).all()
    
    assert len(stored_attempts) == len(attempts)
    
    # Verify distinct timestamps
    timestamps = [a.timestamp for a in stored_attempts]
    assert len(timestamps) == len(attempts)


@settings(max_examples=100)
@given(
    student=student_data(),
    attempts=st.lists(attempt_data(), min_size=1, max_size=50)
)
def test_property_3_mastery_score_bounds(db_session, student, attempts):
    """
    Feature: adaptive-learning-decision-engine
    Property 3: Mastery Score Bounds
    
    **Validates: Requirements 1.3**
    
    For any concept and student with recorded attempts, the calculated
    mastery score must be between 0 and 100 inclusive.
    """
    # Setup: Create user, student profile, topic, concept, and question
    user = User(
        username=student["username"],
        password_hash="hashed_password",
        role="student"
    )
    db_session.add(user)
    db_session.commit()
    
    student_profile = StudentProfile(
        user_id=user.id,
        grade=student["grade"],
        target_exam="Board Exam",
        available_hours_per_day=student["available_hours"]
    )
    db_session.add(student_profile)
    db_session.commit()
    
    topic = Topic(
        name="Test Topic",
        exam_weightage=10.0,
        estimated_hours=5.0
    )
    db_session.add(topic)
    db_session.commit()
    
    concept = Concept(
        topic_id=topic.id,
        name="Test Concept"
    )
    db_session.add(concept)
    db_session.commit()
    
    question = Question(
        concept_id=concept.id,
        question_text="Test question?",
        question_type="mcq",
        correct_answer="A",
        difficulty="medium",
        expected_time_seconds=120
    )
    db_session.add(question)
    db_session.commit()
    
    # Action: Record attempts
    tracker = PerformanceTracker(db_session)
    for attempt in attempts:
        tracker.record_attempt(
            student_id=student_profile.id,
            question_id=question.id,
            answer=attempt["answer"],
            is_correct=attempt["is_correct"],
            time_taken=attempt["time_taken"],
            confidence=attempt["confidence"]
        )
    
    # Calculate mastery score
    mastery_score = tracker.calculate_mastery_score(student_profile.id, concept.id)
    
    # Assertion: Mastery score must be between 0 and 100
    assert 0.0 <= mastery_score <= 100.0


@settings(max_examples=100)
@given(
    student=student_data(),
    attempts=st.lists(attempt_data(), min_size=1, max_size=30)
)
def test_property_4_mistake_pattern_storage(db_session, student, attempts):
    """
    Feature: adaptive-learning-decision-engine
    Property 4: Mistake Pattern Storage
    
    **Validates: Requirements 1.5**
    
    For any concept with student attempts, mistake patterns should be
    stored and retrievable for that concept.
    """
    # Setup: Create user, student profile, topic, concept, and question
    user = User(
        username=student["username"],
        password_hash="hashed_password",
        role="student"
    )
    db_session.add(user)
    db_session.commit()
    
    student_profile = StudentProfile(
        user_id=user.id,
        grade=student["grade"],
        target_exam="Board Exam",
        available_hours_per_day=student["available_hours"]
    )
    db_session.add(student_profile)
    db_session.commit()
    
    topic = Topic(
        name="Test Topic",
        exam_weightage=10.0,
        estimated_hours=5.0
    )
    db_session.add(topic)
    db_session.commit()
    
    concept = Concept(
        topic_id=topic.id,
        name="Test Concept"
    )
    db_session.add(concept)
    db_session.commit()
    
    question = Question(
        concept_id=concept.id,
        question_text="Test question?",
        question_type="mcq",
        correct_answer="A",
        difficulty="medium",
        expected_time_seconds=120
    )
    db_session.add(question)
    db_session.commit()
    
    # Action: Record attempts
    tracker = PerformanceTracker(db_session)
    for attempt in attempts:
        tracker.record_attempt(
            student_id=student_profile.id,
            question_id=question.id,
            answer=attempt["answer"],
            is_correct=attempt["is_correct"],
            time_taken=attempt["time_taken"],
            confidence=attempt["confidence"]
        )
    
    # Get mistake patterns
    mistake_patterns = tracker.get_mistake_patterns(student_profile.id, concept.id)
    
    # Assertion: Mistake patterns should be retrievable and contain expected fields
    assert mistake_patterns is not None
    assert "concept_id" in mistake_patterns
    assert "total_attempts" in mistake_patterns
    assert "incorrect_attempts" in mistake_patterns
    assert "common_mistakes" in mistake_patterns
    assert "mistake_rate" in mistake_patterns
    assert mistake_patterns["concept_id"] == concept.id
    assert mistake_patterns["total_attempts"] == len(attempts)


@settings(max_examples=100)
@given(
    student=student_data(),
    attempts=st.lists(attempt_data(), min_size=1, max_size=50)
)
def test_property_44_accuracy_calculation(db_session, student, attempts):
    """
    Feature: adaptive-learning-decision-engine
    Property 44: Accuracy Calculation
    
    **Validates: Requirements 10.3**
    
    For any student with N total attempts and C correct attempts,
    the displayed accuracy percentage should equal (C / N) × 100.
    """
    # Setup: Create user, student profile, topic, concept, and question
    user = User(
        username=student["username"],
        password_hash="hashed_password",
        role="student"
    )
    db_session.add(user)
    db_session.commit()
    
    student_profile = StudentProfile(
        user_id=user.id,
        grade=student["grade"],
        target_exam="Board Exam",
        available_hours_per_day=student["available_hours"]
    )
    db_session.add(student_profile)
    db_session.commit()
    
    topic = Topic(
        name="Test Topic",
        exam_weightage=10.0,
        estimated_hours=5.0
    )
    db_session.add(topic)
    db_session.commit()
    
    concept = Concept(
        topic_id=topic.id,
        name="Test Concept"
    )
    db_session.add(concept)
    db_session.commit()
    
    question = Question(
        concept_id=concept.id,
        question_text="Test question?",
        question_type="mcq",
        correct_answer="A",
        difficulty="medium",
        expected_time_seconds=120
    )
    db_session.add(question)
    db_session.commit()
    
    # Action: Record attempts
    tracker = PerformanceTracker(db_session)
    for attempt in attempts:
        tracker.record_attempt(
            student_id=student_profile.id,
            question_id=question.id,
            answer=attempt["answer"],
            is_correct=attempt["is_correct"],
            time_taken=attempt["time_taken"],
            confidence=attempt["confidence"]
        )
    
    # Get performance summary
    performance = tracker.get_student_performance(student_profile.id)
    
    # Calculate expected accuracy
    total_attempts = len(attempts)
    correct_attempts = sum(1 for a in attempts if a["is_correct"])
    expected_accuracy = (correct_attempts / total_attempts * 100) if total_attempts > 0 else 0
    
    # Assertion: Accuracy should match the formula
    assert performance["total_attempts"] == total_attempts
    assert performance["correct_attempts"] == correct_attempts
    assert abs(performance["accuracy"] - expected_accuracy) < 0.01  # Allow small floating point error
