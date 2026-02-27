from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.services.decision_engine import DecisionEngine, ExplanationGenerator
from app.models.user import User, StudentProfile

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.get("/next/{student_id}")
async def get_next_recommendation(
    student_id: int,
    mastery_threshold: float = Query(60.0, ge=0, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the next recommended topic for a student"""
    # Verify student exists and user has permission
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Students can only view their own data, teachers/admins can view any
    if current_user.role == "student" and student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    engine = DecisionEngine(db)
    recommendation = engine.get_next_recommendation(student_id, mastery_threshold)
    
    if not recommendation:
        return {"message": "No topics available for recommendation"}
    
    return recommendation


@router.get("/top/{student_id}")
async def get_top_recommendations(
    student_id: int,
    n: int = Query(5, ge=1, le=20),
    mastery_threshold: float = Query(60.0, ge=0, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get top N recommended topics for a student"""
    # Verify student exists and user has permission
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Students can only view their own data, teachers/admins can view any
    if current_user.role == "student" and student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    engine = DecisionEngine(db)
    recommendations = engine.get_top_n_recommendations(student_id, n, mastery_threshold)
    
    return {
        "student_id": student_id,
        "count": len(recommendations),
        "recommendations": recommendations
    }


@router.get("/explain/{student_id}/{topic_id}")
async def explain_recommendation(
    student_id: int,
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed explanation for why a topic is recommended"""
    # Verify student exists and user has permission
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Students can only view their own data, teachers/admins can view any
    if current_user.role == "student" and student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    generator = ExplanationGenerator(db)
    explanation = generator.generate_explanation(student_id, topic_id)
    
    if "error" in explanation:
        raise HTTPException(status_code=404, detail=explanation["error"])
    
    return explanation


@router.get("/concepts/{student_id}/{topic_id}")
async def get_concept_recommendations(
    student_id: int,
    topic_id: int,
    n: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get concept-level recommendations within a topic"""
    # Verify student exists and user has permission
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Students can only view their own data, teachers/admins can view any
    if current_user.role == "student" and student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    engine = DecisionEngine(db)
    concepts = engine.get_concept_recommendations(student_id, topic_id, n)
    
    return {
        "student_id": student_id,
        "topic_id": topic_id,
        "count": len(concepts),
        "concepts": concepts
    }
