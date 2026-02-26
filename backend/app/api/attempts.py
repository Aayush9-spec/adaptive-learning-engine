from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.performance import QuestionAttempt, ConceptMastery
from app.models.knowledge_graph import Question, Concept
from app.services.performance_tracker import PerformanceTracker

router = APIRouter()

class AttemptCreate(BaseModel):
    question_id: int
    answer: str
    time_taken_seconds: float
    confidence: int  # 1-5

class AttemptResponse(BaseModel):
    id: int
    question_id: int
    is_correct: bool
    mastery_score: float
    
    class Config:
        from_attributes = True

@router.post("/", response_model=AttemptResponse)
def record_attempt(
    attempt_data: AttemptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get student profile
    if not current_user.student_profile:
        raise HTTPException(status_code=400, detail="User is not a student")
    
    student_id = current_user.student_profile.id
    
    # Get question
    question = db.query(Question).filter(Question.id == attempt_data.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Check if answer is correct
    is_correct = attempt_data.answer.strip().lower() == question.correct_answer.strip().lower()
    
    # Create attempt record
    attempt = QuestionAttempt(
        student_id=student_id,
        question_id=attempt_data.question_id,
        answer=attempt_data.answer,
        is_correct=is_correct,
        time_taken_seconds=attempt_data.time_taken_seconds,
        confidence=attempt_data.confidence,
        timestamp=datetime.utcnow()
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    
    # Update mastery score
    tracker = PerformanceTracker(db)
    mastery_score = tracker.calculate_mastery_score(student_id, question.concept_id)
    
    return {
        "id": attempt.id,
        "question_id": attempt.question_id,
        "is_correct": is_correct,
        "mastery_score": mastery_score
    }

@router.get("/student/{student_id}")
def get_student_attempts(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attempts = db.query(QuestionAttempt).filter(
        QuestionAttempt.student_id == student_id
    ).order_by(QuestionAttempt.timestamp.desc()).limit(100).all()
    
    return [
        {
            "id": a.id,
            "question_id": a.question_id,
            "is_correct": a.is_correct,
            "time_taken": a.time_taken_seconds,
            "confidence": a.confidence,
            "timestamp": a.timestamp
        }
        for a in attempts
    ]

@router.get("/mastery/student/{student_id}")
def get_mastery_scores(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    mastery_records = db.query(ConceptMastery).filter(
        ConceptMastery.student_id == student_id
    ).all()
    
    return [
        {
            "concept_id": m.concept_id,
            "mastery_score": m.mastery_score,
            "total_attempts": m.total_attempts,
            "accuracy": (m.correct_attempts / m.total_attempts * 100) if m.total_attempts > 0 else 0
        }
        for m in mastery_records
    ]

@router.get("/mastery/student/{student_id}/concept/{concept_id}")
def get_concept_mastery(
    student_id: int,
    concept_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get mastery score for a specific concept"""
    mastery = db.query(ConceptMastery).filter(
        ConceptMastery.student_id == student_id,
        ConceptMastery.concept_id == concept_id
    ).first()
    
    if not mastery:
        # Calculate mastery if not exists
        tracker = PerformanceTracker(db)
        mastery_score = tracker.calculate_mastery_score(student_id, concept_id)
        
        # Fetch the newly created record
        mastery = db.query(ConceptMastery).filter(
            ConceptMastery.student_id == student_id,
            ConceptMastery.concept_id == concept_id
        ).first()
        
        if not mastery:
            return {
                "concept_id": concept_id,
                "mastery_score": 0.0,
                "total_attempts": 0,
                "accuracy": 0.0
            }
    
    return {
        "concept_id": mastery.concept_id,
        "mastery_score": mastery.mastery_score,
        "total_attempts": mastery.total_attempts,
        "correct_attempts": mastery.correct_attempts,
        "accuracy": (mastery.correct_attempts / mastery.total_attempts * 100) if mastery.total_attempts > 0 else 0,
        "avg_time_seconds": mastery.avg_time_seconds,
        "avg_confidence": mastery.avg_confidence,
        "last_updated": mastery.last_updated
    }
