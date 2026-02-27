from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.services.knowledge_graph_manager import KnowledgeGraphManager
from app.models.user import User
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/topics", tags=["topics"])


class TopicCreate(BaseModel):
    name: str
    exam_weightage: float
    estimated_hours: float
    prerequisite_ids: Optional[List[int]] = None


@router.get("")
async def get_all_topics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all topics with hierarchy"""
    manager = KnowledgeGraphManager(db)
    return manager.get_topic_hierarchy()


@router.get("/{topic_id}")
async def get_topic(
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific topic details"""
    from app.models.knowledge_graph import Topic
    
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    manager = KnowledgeGraphManager(db)
    prereqs = manager.get_prerequisites(topic_id)
    dependents = manager.get_dependent_topics(topic_id)
    
    return {
        "id": topic.id,
        "name": topic.name,
        "exam_weightage": topic.exam_weightage,
        "estimated_hours": topic.estimated_hours,
        "prerequisites": [{"id": p.id, "name": p.name} for p in prereqs],
        "dependents": [{"id": d.id, "name": d.name} for d in dependents]
    }


@router.get("/{topic_id}/prerequisites")
async def get_topic_prerequisites(
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get prerequisites for a topic"""
    manager = KnowledgeGraphManager(db)
    prereqs = manager.get_prerequisites(topic_id)
    
    return [
        {
            "id": p.id,
            "name": p.name,
            "exam_weightage": p.exam_weightage,
            "estimated_hours": p.estimated_hours
        }
        for p in prereqs
    ]


@router.get("/unlockable/{student_id}")
async def get_unlockable_topics(
    student_id: int,
    mastery_threshold: float = 60.0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get topics that student can now study"""
    # Verify student exists and user has permission
    from app.models.user import StudentProfile
    
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Students can only view their own data, teachers/admins can view any
    if current_user.role == "student" and student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    manager = KnowledgeGraphManager(db)
    return manager.get_unlockable_topics(student_id, mastery_threshold)


@router.post("")
async def create_topic(
    topic_data: TopicCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["teacher", "admin"]))
):
    """Create a new topic (teacher/admin only)"""
    manager = KnowledgeGraphManager(db)
    
    try:
        topic = manager.create_topic(
            name=topic_data.name,
            exam_weightage=topic_data.exam_weightage,
            estimated_hours=topic_data.estimated_hours,
            prerequisite_ids=topic_data.prerequisite_ids
        )
        
        return {
            "id": topic.id,
            "name": topic.name,
            "exam_weightage": topic.exam_weightage,
            "estimated_hours": topic.estimated_hours
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
