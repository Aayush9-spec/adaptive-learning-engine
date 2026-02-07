from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.decision_engine import DecisionEngine

router = APIRouter()

@router.get("/next/{student_id}")
def get_next_recommendation(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    engine = DecisionEngine(db)
    recommendation = engine.get_next_recommendation(student_id)
    
    if not recommendation:
        raise HTTPException(status_code=404, detail="No recommendations available")
    
    return recommendation

@router.get("/top/{student_id}")
def get_top_recommendations(
    student_id: int,
    n: int = 5,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    engine = DecisionEngine(db)
    recommendations = engine.get_top_n_recommendations(student_id, n)
    
    return recommendations

@router.get("/explain/{student_id}/{topic_id}")
def explain_recommendation(
    student_id: int,
    topic_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    engine = DecisionEngine(db)
    score = engine.compute_priority_score(student_id, topic_id)
    
    from app.models.knowledge_graph import Topic
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    explanation = engine._generate_explanation(student_id, topic, score)
    
    return {
        "topic_id": topic_id,
        "topic_name": topic.name,
        "priority_score": score,
        "explanation": explanation
    }
