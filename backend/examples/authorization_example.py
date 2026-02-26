"""
Authorization Middleware Example

This example demonstrates how to use the authorization middleware
in FastAPI endpoints for the Adaptive Learning Decision Engine.

Run this example:
    uvicorn examples.authorization_example:app --reload
"""

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    get_current_user,
    require_role,
    require_any_role,
    require_teacher_or_admin,
    create_access_token
)
from app.models.user import User
from datetime import timedelta

app = FastAPI(title="Authorization Example")


# ============================================================================
# PUBLIC ENDPOINTS (No authentication required)
# ============================================================================

@app.get("/")
def root():
    """Public endpoint - accessible to everyone."""
    return {
        "message": "Welcome to the Adaptive Learning Decision Engine",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint - no authentication required."""
    return {"status": "healthy"}


# ============================================================================
# AUTHENTICATED ENDPOINTS (Any logged-in user)
# ============================================================================

@app.get("/api/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current user information.
    
    Requires: Any authenticated user
    """
    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role
    }


@app.get("/api/profile")
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user profile with additional details.
    
    Requires: Any authenticated user
    """
    profile_data = {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
        "created_at": current_user.created_at,
        "last_login": current_user.last_login
    }
    
    # Add student-specific data if user is a student
    if current_user.role == "student" and current_user.student_profile:
        profile_data["student_info"] = {
            "grade": current_user.student_profile.grade,
            "target_exam": current_user.student_profile.target_exam,
            "available_hours_per_day": current_user.student_profile.available_hours_per_day
        }
    
    return profile_data


# ============================================================================
# STUDENT-ONLY ENDPOINTS
# ============================================================================

@app.get("/api/student/dashboard")
def student_dashboard(current_user: User = Depends(require_role("student"))):
    """
    Student dashboard with personalized recommendations.
    
    Requires: student role (or admin)
    """
    return {
        "message": "Student Dashboard",
        "user": current_user.username,
        "recommendations": "Your personalized study recommendations will appear here"
    }


@app.get("/api/student/{student_id}/recommendations")
def get_student_recommendations(
    student_id: int,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    """
    Get recommendations for a specific student.
    
    Requires: student role (or admin)
    Additional check: Students can only access their own recommendations
    """
    # Verify student can only access their own data (unless admin)
    if current_user.role != "admin":
        if not current_user.student_profile or current_user.student_profile.id != student_id:
            raise HTTPException(
                status_code=403,
                detail="You can only access your own recommendations"
            )
    
    return {
        "student_id": student_id,
        "recommendations": [
            {"topic": "Algebra", "priority": 0.85},
            {"topic": "Trigonometry", "priority": 0.72}
        ]
    }


@app.post("/api/student/attempts")
def record_attempt(
    attempt_data: dict,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    """
    Record a question attempt.
    
    Requires: student role (or admin)
    """
    return {
        "message": "Attempt recorded",
        "student": current_user.username,
        "attempt": attempt_data
    }


# ============================================================================
# TEACHER-ONLY ENDPOINTS
# ============================================================================

@app.get("/api/teacher/dashboard")
def teacher_dashboard(current_user: User = Depends(require_role("teacher"))):
    """
    Teacher dashboard with class analytics.
    
    Requires: teacher role (or admin)
    """
    return {
        "message": "Teacher Dashboard",
        "user": current_user.username,
        "classes": ["Class 10A", "Class 10B", "Class 12A"]
    }


@app.get("/api/teacher/class/{class_id}/performance")
def get_class_performance(
    class_id: int,
    current_user: User = Depends(require_role("teacher")),
    db: Session = Depends(get_db)
):
    """
    Get performance analytics for a class.
    
    Requires: teacher role (or admin)
    """
    return {
        "class_id": class_id,
        "teacher": current_user.username,
        "average_mastery": 72.5,
        "at_risk_students": 3,
        "weak_topics": ["Calculus", "Probability"]
    }


# ============================================================================
# TEACHER OR ADMIN ENDPOINTS (Using convenience dependency)
# ============================================================================

@app.get("/api/analytics/class/{class_id}")
def get_class_analytics(
    class_id: int,
    current_user: User = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db)
):
    """
    Get detailed class analytics.
    
    Requires: teacher or admin role
    """
    return {
        "class_id": class_id,
        "analytics": {
            "total_students": 30,
            "average_score": 75.2,
            "completion_rate": 0.85
        }
    }


@app.get("/api/reports/performance")
def get_performance_report(
    current_user: User = Depends(require_teacher_or_admin)
):
    """
    Generate performance reports.
    
    Requires: teacher or admin role
    """
    return {
        "report_type": "performance",
        "generated_by": current_user.username,
        "data": "Performance report data..."
    }


# ============================================================================
# MULTIPLE ROLES ALLOWED (Using require_any_role)
# ============================================================================

@app.get("/api/shared/resources")
def get_shared_resources(
    current_user: User = Depends(require_any_role(["student", "teacher"]))
):
    """
    Get shared learning resources.
    
    Requires: student or teacher role (admins also have access)
    """
    return {
        "resources": [
            {"title": "Study Guide", "type": "pdf"},
            {"title": "Practice Questions", "type": "quiz"}
        ],
        "accessed_by": current_user.username
    }


# ============================================================================
# ADMIN-ONLY ENDPOINTS
# ============================================================================

@app.get("/api/admin/dashboard")
def admin_dashboard(current_user: User = Depends(require_role("admin"))):
    """
    Admin dashboard with system-wide statistics.
    
    Requires: admin role
    """
    return {
        "message": "Admin Dashboard",
        "user": current_user.username,
        "system_stats": {
            "total_users": 1000,
            "total_students": 850,
            "total_teachers": 50,
            "total_admins": 5
        }
    }


@app.post("/api/admin/users")
def create_user(
    user_data: dict,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """
    Create a new user (admin only).
    
    Requires: admin role
    """
    return {
        "message": "User created",
        "created_by": current_user.username,
        "new_user": user_data
    }


@app.delete("/api/admin/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """
    Delete a user (admin only).
    
    Requires: admin role
    """
    return {
        "message": f"User {user_id} deleted",
        "deleted_by": current_user.username
    }


# ============================================================================
# UTILITY ENDPOINT FOR TESTING
# ============================================================================

@app.post("/api/test/create-token")
def create_test_token(username: str, role: str):
    """
    Create a test JWT token (for development/testing only).
    
    WARNING: Remove this endpoint in production!
    """
    token = create_access_token(
        data={"sub": username, "role": role},
        expires_delta=timedelta(hours=1)
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": username,
        "role": role,
        "usage": f"Authorization: Bearer {token}"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
