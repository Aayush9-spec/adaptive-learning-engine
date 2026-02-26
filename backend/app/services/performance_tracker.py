from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.performance import QuestionAttempt, ConceptMastery
from app.models.knowledge_graph import Question
from typing import Dict, List, Optional
from datetime import datetime
import statistics

class PerformanceTracker:
    """Track and analyze student performance"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def record_attempt(
        self,
        student_id: int,
        question_id: int,
        answer: str,
        is_correct: bool,
        time_taken: float,
        confidence: int
    ) -> QuestionAttempt:
        """
        Record a question attempt with all provided fields.
        
        Args:
            student_id: ID of the student
            question_id: ID of the question
            answer: Student's answer
            is_correct: Whether the answer is correct
            time_taken: Time taken in seconds
            confidence: Confidence level (1-5)
            
        Returns:
            The created QuestionAttempt record
        """
        attempt = QuestionAttempt(
            student_id=student_id,
            question_id=question_id,
            answer=answer,
            is_correct=is_correct,
            time_taken_seconds=time_taken,
            confidence=confidence,
            timestamp=datetime.utcnow()
        )
        self.db.add(attempt)
        self.db.commit()
        self.db.refresh(attempt)
        return attempt
    
    def calculate_mastery_score(self, student_id: int, concept_id: int) -> float:
        """
        Calculate mastery score using the formula:
        mastery_score = (
            0.5 * accuracy_rate +
            0.2 * speed_factor +
            0.2 * confidence_factor +
            0.1 * consistency_factor
        ) * 100
        """
        # Get all attempts for this concept
        attempts = self.db.query(QuestionAttempt).join(Question).filter(
            QuestionAttempt.student_id == student_id,
            Question.concept_id == concept_id
        ).all()
        
        if not attempts:
            return 0.0
        
        # Calculate accuracy rate
        correct_attempts = sum(1 for a in attempts if a.is_correct)
        accuracy_rate = correct_attempts / len(attempts)
        
        # Calculate speed factor
        avg_time = sum(a.time_taken_seconds for a in attempts) / len(attempts)
        expected_time = self.db.query(func.avg(Question.expected_time_seconds)).join(
            QuestionAttempt
        ).filter(
            QuestionAttempt.student_id == student_id,
            Question.concept_id == concept_id
        ).scalar() or 120
        
        speed_factor = min(1.0, expected_time / avg_time) if avg_time > 0 else 0.5
        
        # Calculate confidence factor
        avg_confidence = sum(a.confidence for a in attempts) / len(attempts)
        confidence_factor = avg_confidence / 5.0
        
        # Calculate consistency factor
        recent_attempts = attempts[-10:]  # Last 10 attempts
        if len(recent_attempts) >= 3:
            scores = [1.0 if a.is_correct else 0.0 for a in recent_attempts]
            mean_score = statistics.mean(scores)
            std_dev = statistics.stdev(scores) if len(scores) > 1 else 0
            consistency_factor = 1.0 - (std_dev / mean_score if mean_score > 0 else 1.0)
        else:
            consistency_factor = 0.5
        
        # Compute final mastery score
        mastery_score = (
            0.5 * accuracy_rate +
            0.2 * speed_factor +
            0.2 * confidence_factor +
            0.1 * consistency_factor
        ) * 100
        
        # Update or create mastery record
        mastery = self.db.query(ConceptMastery).filter(
            ConceptMastery.student_id == student_id,
            ConceptMastery.concept_id == concept_id
        ).first()
        
        if mastery:
            mastery.total_attempts = len(attempts)
            mastery.correct_attempts = correct_attempts
            mastery.avg_time_seconds = avg_time
            mastery.avg_confidence = avg_confidence
            mastery.mastery_score = mastery_score
        else:
            mastery = ConceptMastery(
                student_id=student_id,
                concept_id=concept_id,
                total_attempts=len(attempts),
                correct_attempts=correct_attempts,
                avg_time_seconds=avg_time,
                avg_confidence=avg_confidence,
                mastery_score=mastery_score
            )
            self.db.add(mastery)
        
        self.db.commit()
        
        return mastery_score
    
    def get_student_performance(self, student_id: int) -> Dict:
        """Get overall performance summary"""
        total_attempts = self.db.query(QuestionAttempt).filter(
            QuestionAttempt.student_id == student_id
        ).count()
        
        correct_attempts = self.db.query(QuestionAttempt).filter(
            QuestionAttempt.student_id == student_id,
            QuestionAttempt.is_correct == True
        ).count()
        
        accuracy = (correct_attempts / total_attempts * 100) if total_attempts > 0 else 0
        
        avg_mastery = self.db.query(func.avg(ConceptMastery.mastery_score)).filter(
            ConceptMastery.student_id == student_id
        ).scalar() or 0
        
        return {
            "total_attempts": total_attempts,
            "correct_attempts": correct_attempts,
            "accuracy": accuracy,
            "average_mastery": avg_mastery
        }
    
    def get_concept_attempts(self, student_id: int, concept_id: int) -> List[QuestionAttempt]:
        """
        Get all attempts for a specific concept by a student.
        
        Args:
            student_id: ID of the student
            concept_id: ID of the concept
            
        Returns:
            List of QuestionAttempt records
        """
        attempts = self.db.query(QuestionAttempt).join(Question).filter(
            QuestionAttempt.student_id == student_id,
            Question.concept_id == concept_id
        ).order_by(QuestionAttempt.timestamp).all()
        
        return attempts
    
    def get_mistake_patterns(self, student_id: int, concept_id: int) -> Dict:
        """
        Analyze mistake patterns for a concept.
        
        Args:
            student_id: ID of the student
            concept_id: ID of the concept
            
        Returns:
            Dictionary containing mistake analysis
        """
        attempts = self.get_concept_attempts(student_id, concept_id)
        
        if not attempts:
            return {
                "concept_id": concept_id,
                "total_attempts": 0,
                "incorrect_attempts": 0,
                "common_mistakes": [],
                "mistake_rate": 0.0
            }
        
        incorrect_attempts = [a for a in attempts if not a.is_correct]
        
        # Group incorrect answers
        mistake_counts: Dict[str, int] = {}
        for attempt in incorrect_attempts:
            answer = attempt.answer.strip().lower()
            mistake_counts[answer] = mistake_counts.get(answer, 0) + 1
        
        # Sort by frequency
        common_mistakes = sorted(
            [{"answer": ans, "count": cnt} for ans, cnt in mistake_counts.items()],
            key=lambda x: x["count"],
            reverse=True
        )[:5]  # Top 5 common mistakes
        
        return {
            "concept_id": concept_id,
            "total_attempts": len(attempts),
            "incorrect_attempts": len(incorrect_attempts),
            "common_mistakes": common_mistakes,
            "mistake_rate": len(incorrect_attempts) / len(attempts) if attempts else 0.0
        }
    
    def detect_learning_gaps(self, student_id: int, threshold: float = 40.0) -> List[Dict]:
        """Detect concepts where student is struggling"""
        weak_concepts = self.db.query(ConceptMastery).filter(
            ConceptMastery.student_id == student_id,
            ConceptMastery.mastery_score < threshold
        ).all()
        
        return [
            {
                "concept_id": c.concept_id,
                "mastery_score": c.mastery_score,
                "attempts": c.total_attempts
            }
            for c in weak_concepts
        ]
