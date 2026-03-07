"""
Question API endpoints for the Adaptive Learning Decision Engine.
Provides endpoints for retrieving questions and validating answers.
"""

from typing import List, Dict, Any, Optional
from models import Question, QuestionAttempt
from datetime import datetime


class QuestionAPI:
    """
    API for managing questions and answer validation.
    """
    
    def __init__(self, questions_db: Dict[int, Question] = None, 
                 attempts_db: List[QuestionAttempt] = None):
        """
        Initialize the Question API.
        
        Args:
            questions_db: Dictionary mapping question IDs to Question objects
            attempts_db: List of QuestionAttempt objects
        """
        self.questions_db = questions_db or {}
        self.attempts_db = attempts_db or []
        self.next_attempt_id = 1
    
    def get_questions_by_concept(self, concept_id: int) -> List[Question]:
        """
        Get all questions for a specific concept.
        
        Args:
            concept_id: The concept ID to filter by
            
        Returns:
            List of Question objects for the concept
            
        Validates: Requirements 9.2, 9.6, 13.1, 13.2
        """
        return [q for q in self.questions_db.values() if q.concept_id == concept_id]
    
    def get_question_by_id(self, question_id: int) -> Optional[Question]:
        """
        Get a specific question by ID.
        
        Args:
            question_id: The question ID
            
        Returns:
            Question object or None if not found
            
        Validates: Requirements 13.1, 13.2
        """
        return self.questions_db.get(question_id)
    
    def validate_answer(self, question: Question, submitted_answer: str) -> bool:
        """
        Validate a submitted answer against the correct answer.
        
        Handles different question types:
        - MCQ: Exact match (case-insensitive)
        - True/False: Exact match (case-insensitive)
        - Numerical: Tolerance-based comparison (±0.01)
        
        Args:
            question: The Question object
            submitted_answer: The student's submitted answer
            
        Returns:
            True if answer is correct, False otherwise
            
        Validates: Requirements 9.2, 9.6
        """
        if not submitted_answer or not question.correct_answer:
            return False
        
        question_type = question.question_type.lower()
        
        if question_type in ['mcq', 'true_false']:
            # Case-insensitive exact match for MCQ and true/false
            return submitted_answer.strip().lower() == question.correct_answer.strip().lower()
        
        elif question_type == 'numerical':
            # Numerical comparison with tolerance
            try:
                submitted_value = float(submitted_answer.strip())
                correct_value = float(question.correct_answer.strip())
                tolerance = 0.01
                return abs(submitted_value - correct_value) <= tolerance
            except (ValueError, TypeError):
                return False
        
        else:
            # Default to exact match for unknown types
            return submitted_answer.strip() == question.correct_answer.strip()
    
    def record_attempt(self, student_id: int, question_id: int, 
                      submitted_answer: str, time_taken_seconds: float,
                      confidence: int = 3) -> Dict[str, Any]:
        """
        Record a student's attempt at answering a question.
        
        Args:
            student_id: The student's ID
            question_id: The question ID
            submitted_answer: The student's answer
            time_taken_seconds: Time taken to answer in seconds
            confidence: Confidence level (1-5), default 3
            
        Returns:
            Dictionary containing attempt details and validation result
            
        Validates: Requirements 9.2, 9.3, 9.4
        """
        question = self.get_question_by_id(question_id)
        
        if not question:
            return {
                "error": "Question not found",
                "question_id": question_id
            }
        
        # Validate the answer
        is_correct = self.validate_answer(question, submitted_answer)
        
        # Create attempt record
        attempt = QuestionAttempt(
            id=self.next_attempt_id,
            student_id=student_id,
            question_id=question_id,
            answer=submitted_answer,
            is_correct=is_correct,
            time_taken_seconds=time_taken_seconds,
            confidence=confidence,
            timestamp=datetime.utcnow(),
            synced=False
        )
        
        self.attempts_db.append(attempt)
        self.next_attempt_id += 1
        
        return {
            "attempt_id": attempt.id,
            "question_id": question_id,
            "is_correct": is_correct,
            "submitted_answer": submitted_answer,
            "correct_answer": question.correct_answer if not is_correct else None,
            "time_taken_seconds": time_taken_seconds,
            "confidence": confidence,
            "timestamp": attempt.timestamp.isoformat(),
            "can_retry": not is_correct  # Allow retry if incorrect
        }
    
    def get_student_attempts(self, student_id: int, 
                           question_id: Optional[int] = None) -> List[QuestionAttempt]:
        """
        Get all attempts for a student, optionally filtered by question.
        
        Args:
            student_id: The student's ID
            question_id: Optional question ID to filter by
            
        Returns:
            List of QuestionAttempt objects
        """
        attempts = [a for a in self.attempts_db if a.student_id == student_id]
        
        if question_id is not None:
            attempts = [a for a in attempts if a.question_id == question_id]
        
        return attempts
    
    def supports_question_type(self, question_type: str) -> bool:
        """
        Check if a question type is supported.
        
        Args:
            question_type: The question type to check
            
        Returns:
            True if supported, False otherwise
            
        Validates: Requirement 9.6
        """
        supported_types = ['mcq', 'numerical', 'true_false']
        return question_type.lower() in supported_types


def create_question_api_handler(question_api: QuestionAPI):
    """
    Create API endpoint handlers for question operations.
    
    Args:
        question_api: QuestionAPI instance
        
    Returns:
        Dictionary of endpoint handlers
    """
    
    def get_questions_by_concept_handler(concept_id: int) -> Dict[str, Any]:
        """GET /api/questions/concept/{concept_id}"""
        questions = question_api.get_questions_by_concept(concept_id)
        
        return {
            "concept_id": concept_id,
            "count": len(questions),
            "questions": [
                {
                    "id": q.id,
                    "concept_id": q.concept_id,
                    "question_text": q.question_text,
                    "question_type": q.question_type,
                    "options": q.options,
                    "difficulty": q.difficulty,
                    "expected_time_seconds": q.expected_time_seconds
                }
                for q in questions
            ]
        }
    
    def get_question_by_id_handler(question_id: int) -> Dict[str, Any]:
        """GET /api/questions/{question_id}"""
        question = question_api.get_question_by_id(question_id)
        
        if not question:
            return {
                "error": "Question not found",
                "question_id": question_id
            }
        
        return {
            "id": question.id,
            "concept_id": question.concept_id,
            "question_text": question.question_text,
            "question_type": question.question_type,
            "options": question.options,
            "difficulty": question.difficulty,
            "expected_time_seconds": question.expected_time_seconds
        }
    
    def submit_answer_handler(student_id: int, question_id: int,
                            answer: str, time_taken: float,
                            confidence: int = 3) -> Dict[str, Any]:
        """POST /api/questions/submit"""
        return question_api.record_attempt(
            student_id=student_id,
            question_id=question_id,
            submitted_answer=answer,
            time_taken_seconds=time_taken,
            confidence=confidence
        )
    
    return {
        "get_questions_by_concept": get_questions_by_concept_handler,
        "get_question_by_id": get_question_by_id_handler,
        "submit_answer": submit_answer_handler
    }
