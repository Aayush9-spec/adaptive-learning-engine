"""
Property-based tests for database schema validation.

Feature: adaptive-learning-decision-engine
Tests Properties 47-51: Database schema correctness
"""
import pytest
from hypothesis import given, settings, strategies as st
from datetime import datetime, timedelta
from sqlalchemy.exc import IntegrityError
from app.models.user import User, StudentProfile
from app.models.performance import QuestionAttempt, ConceptMastery
from app.models.knowledge_graph import Topic, TopicPrerequisite, Concept, Question


# Custom strategies for generating valid test data
@st.composite
def valid_username(draw):
    """Generate valid usernames."""
    return draw(st.text(
        alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd'), whitelist_characters='_-'),
        min_size=3,
        max_size=50
    ))


@st.composite
def valid_role(draw):
    """Generate valid user roles."""
    return draw(st.sampled_from(['student', 'teacher', 'admin']))


@st.composite
def valid_grade(draw):
    """Generate valid grade levels."""
    return draw(st.integers(min_value=1, max_value=12))


@st.composite
def valid_hours_per_day(draw):
    """Generate valid available hours per day."""
    return draw(st.floats(min_value=0.5, max_value=24.0, allow_nan=False, allow_infinity=False))


@st.composite
def valid_exam_weightage(draw):
    """Generate valid exam weightage (0-100)."""
    return draw(st.floats(min_value=0.0, max_value=100.0, allow_nan=False, allow_infinity=False))


@st.composite
def valid_estimated_hours(draw):
    """Generate valid estimated study hours."""
    return draw(st.floats(min_value=0.1, max_value=100.0, allow_nan=False, allow_infinity=False))


@st.composite
def valid_mastery_score(draw):
    """Generate valid mastery scores (0-100)."""
    return draw(st.floats(min_value=0.0, max_value=100.0, allow_nan=False, allow_infinity=False))


@st.composite
def valid_confidence(draw):
    """Generate valid confidence levels (1-5)."""
    return draw(st.integers(min_value=1, max_value=5))


@st.composite
def valid_time_taken(draw):
    """Generate valid time taken in seconds."""
    return draw(st.floats(min_value=0.1, max_value=3600.0, allow_nan=False, allow_infinity=False))


class TestProperty47StudentProfileSchema:
    """
    Property 47: Student Profile Schema
    Validates: Requirements 12.1
    
    For any stored student profile, it must contain fields: 
    id, user_id, grade, target_exam, exam_date, and available_hours_per_day.
    """
    
    @settings(max_examples=100)
    @given(
        username=valid_username(),
        role=valid_role(),
        grade=valid_grade(),
        target_exam=st.text(min_size=1, max_size=100),
        hours_per_day=valid_hours_per_day()
    )
    def test_student_profile_has_required_fields(
        self, db_session, username, role, grade, target_exam, hours_per_day
    ):
        """
        Feature: adaptive-learning-decision-engine
        Property 47: Student Profile Schema
        """
        # Create user first
        user = User(
            username=username,
            password_hash="hashed_password",
            role=role
        )
        db_session.add(user)
        db_session.flush()
        
        # Create student profile
        exam_date = datetime.utcnow() + timedelta(days=90)
        profile = StudentProfile(
            user_id=user.id,
            grade=grade,
            target_exam=target_exam,
            exam_date=exam_date,
            available_hours_per_day=hours_per_day
        )
        db_session.add(profile)
        db_session.commit()
        
        # Verify all required fields are present
        retrieved = db_session.query(StudentProfile).filter_by(id=profile.id).first()
        assert retrieved is not None
        assert hasattr(retrieved, 'id')
        assert hasattr(retrieved, 'user_id')
        assert hasattr(retrieved, 'grade')
        assert hasattr(retrieved, 'target_exam')
        assert hasattr(retrieved, 'exam_date')
        assert hasattr(retrieved, 'available_hours_per_day')
        
        # Verify values match
        assert retrieved.id == profile.id
        assert retrieved.user_id == user.id
        assert retrieved.grade == grade
        assert retrieved.target_exam == target_exam
        assert retrieved.available_hours_per_day == hours_per_day


class TestProperty48ConceptMasterySchema:
    """
    Property 48: Concept Mastery Schema
    Validates: Requirements 12.2
    
    For any stored concept mastery record, it must contain fields: 
    concept_id, attempts, accuracy, avg_time, and mastery_score.
    """
    
    @settings(max_examples=100)
    @given(
        total_attempts=st.integers(min_value=0, max_value=1000),
        correct_attempts=st.integers(min_value=0, max_value=1000),
        avg_time=valid_time_taken(),
        avg_confidence=st.floats(min_value=1.0, max_value=5.0, allow_nan=False, allow_infinity=False),
        mastery_score=valid_mastery_score()
    )
    def test_concept_mastery_has_required_fields(
        self, db_session, total_attempts, correct_attempts, avg_time, avg_confidence, mastery_score
    ):
        """
        Feature: adaptive-learning-decision-engine
        Property 48: Concept Mastery Schema
        """
        # Ensure correct_attempts <= total_attempts
        if correct_attempts > total_attempts:
            correct_attempts = total_attempts
        
        # Create necessary parent records
        user = User(username=f"user_{datetime.utcnow().timestamp()}", password_hash="hash", role="student")
        db_session.add(user)
        db_session.flush()
        
        profile = StudentProfile(
            user_id=user.id,
            grade=10,
            target_exam="Board Exam",
            available_hours_per_day=3.0
        )
        db_session.add(profile)
        db_session.flush()
        
        topic = Topic(
            name="Test Topic",
            exam_weightage=10.0,
            estimated_hours=5.0
        )
        db_session.add(topic)
        db_session.flush()
        
        concept = Concept(
            topic_id=topic.id,
            name="Test Concept"
        )
        db_session.add(concept)
        db_session.flush()
        
        # Create concept mastery record
        mastery = ConceptMastery(
            student_id=profile.id,
            concept_id=concept.id,
            total_attempts=total_attempts,
            correct_attempts=correct_attempts,
            avg_time_seconds=avg_time,
            avg_confidence=avg_confidence,
            mastery_score=mastery_score
        )
        db_session.add(mastery)
        db_session.commit()
        
        # Verify all required fields are present
        retrieved = db_session.query(ConceptMastery).filter_by(id=mastery.id).first()
        assert retrieved is not None
        assert hasattr(retrieved, 'concept_id')
        assert hasattr(retrieved, 'total_attempts')
        assert hasattr(retrieved, 'correct_attempts')
        assert hasattr(retrieved, 'avg_time_seconds')
        assert hasattr(retrieved, 'mastery_score')
        
        # Verify values match
        assert retrieved.concept_id == concept.id
        assert retrieved.total_attempts == total_attempts
        assert retrieved.correct_attempts == correct_attempts
        assert retrieved.avg_time_seconds == avg_time
        assert retrieved.mastery_score == mastery_score


class TestProperty49TopicGraphSchema:
    """
    Property 49: Topic Graph Schema
    Validates: Requirements 12.3
    
    For any stored topic, it must contain fields: 
    topic_id, prerequisites (array), weightage, and estimated_time.
    """
    
    @settings(max_examples=100)
    @given(
        topic_name=st.text(min_size=1, max_size=100),
        weightage=valid_exam_weightage(),
        estimated_hours=valid_estimated_hours()
    )
    def test_topic_has_required_fields(
        self, db_session, topic_name, weightage, estimated_hours
    ):
        """
        Feature: adaptive-learning-decision-engine
        Property 49: Topic Graph Schema
        """
        # Create topic
        topic = Topic(
            name=topic_name,
            exam_weightage=weightage,
            estimated_hours=estimated_hours
        )
        db_session.add(topic)
        db_session.commit()
        
        # Verify all required fields are present
        retrieved = db_session.query(Topic).filter_by(id=topic.id).first()
        assert retrieved is not None
        assert hasattr(retrieved, 'id')  # topic_id
        assert hasattr(retrieved, 'prerequisites')  # relationship to prerequisites
        assert hasattr(retrieved, 'exam_weightage')  # weightage
        assert hasattr(retrieved, 'estimated_hours')  # estimated_time
        
        # Verify values match
        assert retrieved.id == topic.id
        assert retrieved.exam_weightage == weightage
        assert retrieved.estimated_hours == estimated_hours
        assert retrieved.name == topic_name
    
    @settings(max_examples=100)
    @given(
        num_prerequisites=st.integers(min_value=1, max_value=5),
        weightage=valid_exam_weightage(),
        estimated_hours=valid_estimated_hours()
    )
    def test_topic_prerequisites_array(
        self, db_session, num_prerequisites, weightage, estimated_hours
    ):
        """
        Feature: adaptive-learning-decision-engine
        Property 49: Topic Graph Schema - Prerequisites Array
        """
        # Create prerequisite topics
        prereq_topics = []
        for i in range(num_prerequisites):
            prereq = Topic(
                name=f"Prerequisite {i}",
                exam_weightage=10.0,
                estimated_hours=2.0
            )
            db_session.add(prereq)
            prereq_topics.append(prereq)
        db_session.flush()
        
        # Create main topic
        main_topic = Topic(
            name="Main Topic",
            exam_weightage=weightage,
            estimated_hours=estimated_hours
        )
        db_session.add(main_topic)
        db_session.flush()
        
        # Add prerequisites
        for prereq in prereq_topics:
            prereq_rel = TopicPrerequisite(
                topic_id=main_topic.id,
                prerequisite_topic_id=prereq.id
            )
            db_session.add(prereq_rel)
        db_session.commit()
        
        # Verify prerequisites can be accessed as an array
        retrieved = db_session.query(Topic).filter_by(id=main_topic.id).first()
        assert retrieved is not None
        assert hasattr(retrieved, 'prerequisites')
        assert len(retrieved.prerequisites) == num_prerequisites


class TestProperty50AttemptSchema:
    """
    Property 50: Attempt Schema
    Validates: Requirements 12.4
    
    For any stored question attempt, it must contain fields: 
    student_id, question_id, answer, is_correct, time_taken, confidence, and timestamp.
    """
    
    @settings(max_examples=100)
    @given(
        answer=st.text(min_size=1, max_size=500),
        is_correct=st.booleans(),
        time_taken=valid_time_taken(),
        confidence=valid_confidence()
    )
    def test_attempt_has_required_fields(
        self, db_session, answer, is_correct, time_taken, confidence
    ):
        """
        Feature: adaptive-learning-decision-engine
        Property 50: Attempt Schema
        """
        # Create necessary parent records
        user = User(username=f"user_{datetime.utcnow().timestamp()}", password_hash="hash", role="student")
        db_session.add(user)
        db_session.flush()
        
        profile = StudentProfile(
            user_id=user.id,
            grade=10,
            target_exam="Board Exam",
            available_hours_per_day=3.0
        )
        db_session.add(profile)
        db_session.flush()
        
        topic = Topic(name="Test Topic", exam_weightage=10.0, estimated_hours=5.0)
        db_session.add(topic)
        db_session.flush()
        
        concept = Concept(topic_id=topic.id, name="Test Concept")
        db_session.add(concept)
        db_session.flush()
        
        question = Question(
            concept_id=concept.id,
            question_text="Test question?",
            question_type="mcq",
            correct_answer="A",
            difficulty="medium"
        )
        db_session.add(question)
        db_session.flush()
        
        # Create attempt
        timestamp = datetime.utcnow()
        attempt = QuestionAttempt(
            student_id=profile.id,
            question_id=question.id,
            answer=answer,
            is_correct=is_correct,
            time_taken_seconds=time_taken,
            confidence=confidence,
            timestamp=timestamp
        )
        db_session.add(attempt)
        db_session.commit()
        
        # Verify all required fields are present
        retrieved = db_session.query(QuestionAttempt).filter_by(id=attempt.id).first()
        assert retrieved is not None
        assert hasattr(retrieved, 'student_id')
        assert hasattr(retrieved, 'question_id')
        assert hasattr(retrieved, 'answer')
        assert hasattr(retrieved, 'is_correct')
        assert hasattr(retrieved, 'time_taken_seconds')
        assert hasattr(retrieved, 'confidence')
        assert hasattr(retrieved, 'timestamp')
        
        # Verify values match
        assert retrieved.student_id == profile.id
        assert retrieved.question_id == question.id
        assert retrieved.answer == answer
        assert retrieved.is_correct == is_correct
        assert retrieved.time_taken_seconds == time_taken
        assert retrieved.confidence == confidence
        assert retrieved.timestamp is not None


class TestProperty51ReferentialIntegrity:
    """
    Property 51: Referential Integrity
    Validates: Requirements 12.5
    
    For any attempt record with student_id=S and question_id=Q, 
    there must exist a student with id=S and a question with id=Q in the database.
    """
    
    @settings(max_examples=100)
    @given(
        answer=st.text(min_size=1, max_size=500),
        is_correct=st.booleans(),
        time_taken=valid_time_taken(),
        confidence=valid_confidence()
    )
    def test_attempt_requires_valid_student_and_question(
        self, db_session, answer, is_correct, time_taken, confidence
    ):
        """
        Feature: adaptive-learning-decision-engine
        Property 51: Referential Integrity
        """
        # Create necessary parent records
        user = User(username=f"user_{datetime.utcnow().timestamp()}", password_hash="hash", role="student")
        db_session.add(user)
        db_session.flush()
        
        profile = StudentProfile(
            user_id=user.id,
            grade=10,
            target_exam="Board Exam",
            available_hours_per_day=3.0
        )
        db_session.add(profile)
        db_session.flush()
        
        topic = Topic(name="Test Topic", exam_weightage=10.0, estimated_hours=5.0)
        db_session.add(topic)
        db_session.flush()
        
        concept = Concept(topic_id=topic.id, name="Test Concept")
        db_session.add(concept)
        db_session.flush()
        
        question = Question(
            concept_id=concept.id,
            question_text="Test question?",
            question_type="mcq",
            correct_answer="A",
            difficulty="medium"
        )
        db_session.add(question)
        db_session.flush()
        
        # Create attempt with valid foreign keys
        attempt = QuestionAttempt(
            student_id=profile.id,
            question_id=question.id,
            answer=answer,
            is_correct=is_correct,
            time_taken_seconds=time_taken,
            confidence=confidence
        )
        db_session.add(attempt)
        db_session.commit()
        
        # Verify referential integrity: student exists
        student_exists = db_session.query(StudentProfile).filter_by(id=attempt.student_id).first()
        assert student_exists is not None
        assert student_exists.id == profile.id
        
        # Verify referential integrity: question exists
        question_exists = db_session.query(Question).filter_by(id=attempt.question_id).first()
        assert question_exists is not None
        assert question_exists.id == question.id
    
    @settings(max_examples=100)
    @given(
        invalid_student_id=st.integers(min_value=99999, max_value=999999),
        answer=st.text(min_size=1, max_size=500),
        is_correct=st.booleans(),
        time_taken=valid_time_taken(),
        confidence=valid_confidence()
    )
    def test_attempt_rejects_invalid_student_id(
        self, db_session, invalid_student_id, answer, is_correct, time_taken, confidence
    ):
        """
        Feature: adaptive-learning-decision-engine
        Property 51: Referential Integrity - Invalid Student
        """
        # Create question without student
        topic = Topic(name="Test Topic", exam_weightage=10.0, estimated_hours=5.0)
        db_session.add(topic)
        db_session.flush()
        
        concept = Concept(topic_id=topic.id, name="Test Concept")
        db_session.add(concept)
        db_session.flush()
        
        question = Question(
            concept_id=concept.id,
            question_text="Test question?",
            question_type="mcq",
            correct_answer="A",
            difficulty="medium"
        )
        db_session.add(question)
        db_session.flush()
        
        # Attempt to create attempt with non-existent student_id
        attempt = QuestionAttempt(
            student_id=invalid_student_id,
            question_id=question.id,
            answer=answer,
            is_correct=is_correct,
            time_taken_seconds=time_taken,
            confidence=confidence
        )
        db_session.add(attempt)
        
        # Should raise IntegrityError due to foreign key constraint
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    @settings(max_examples=100)
    @given(
        invalid_question_id=st.integers(min_value=99999, max_value=999999),
        answer=st.text(min_size=1, max_size=500),
        is_correct=st.booleans(),
        time_taken=valid_time_taken(),
        confidence=valid_confidence()
    )
    def test_attempt_rejects_invalid_question_id(
        self, db_session, invalid_question_id, answer, is_correct, time_taken, confidence
    ):
        """
        Feature: adaptive-learning-decision-engine
        Property 51: Referential Integrity - Invalid Question
        """
        # Create student without question
        user = User(username=f"user_{datetime.utcnow().timestamp()}", password_hash="hash", role="student")
        db_session.add(user)
        db_session.flush()
        
        profile = StudentProfile(
            user_id=user.id,
            grade=10,
            target_exam="Board Exam",
            available_hours_per_day=3.0
        )
        db_session.add(profile)
        db_session.flush()
        
        # Attempt to create attempt with non-existent question_id
        attempt = QuestionAttempt(
            student_id=profile.id,
            question_id=invalid_question_id,
            answer=answer,
            is_correct=is_correct,
            time_taken_seconds=time_taken,
            confidence=confidence
        )
        db_session.add(attempt)
        
        # Should raise IntegrityError due to foreign key constraint
        with pytest.raises(IntegrityError):
            db_session.commit()
