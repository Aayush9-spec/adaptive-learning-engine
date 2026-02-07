from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User

router = APIRouter()

@router.get("/class/{class_id}")
def get_class_analytics(
    class_id: int,
    current_user: User = Depends(require_role("teacher")),
    db: Session = Depends(get_db)
):
    return {"message": "Class analytics - to be implemented"}
