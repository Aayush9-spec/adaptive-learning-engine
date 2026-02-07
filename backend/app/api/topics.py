from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.knowledge_graph import Topic

router = APIRouter()

@router.get("/")
def get_all_topics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    topics = db.query(Topic).all()
    return [
        {
            "id": t.id,
            "name": t.name,
            "weightage": t.exam_weightage,
            "estimated_hours": t.estimated_hours
        }
        for t in topics
    ]

@router.get("/{topic_id}")
def get_topic(
    topic_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        return {"error": "Topic not found"}
    
    return {
        "id": topic.id,
        "name": topic.name,
        "weightage": topic.exam_weightage,
        "estimated_hours": topic.estimated_hours,
        "description": topic.description
    }
