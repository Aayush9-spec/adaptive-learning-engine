# Authorization Middleware Guide

This guide explains how to use the authorization middleware in the Adaptive Learning Decision Engine.

## Overview

The authorization system provides:
- **JWT Token Validation**: Validates tokens from the Authorization header
- **Role-Based Access Control (RBAC)**: Restricts endpoints based on user roles
- **Multiple Authorization Patterns**: Single role, multiple roles, or custom logic

## Available Roles

- `student`: Regular students using the learning platform
- `teacher`: Teachers who can view class analytics
- `admin`: Administrators with full access to all endpoints

## Authorization Dependencies

### 1. `get_current_user`

Validates JWT token and returns the authenticated user. Use for endpoints that require authentication but no specific role.

```python
from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    """Any authenticated user can access this endpoint."""
    return {
        "username": current_user.username,
        "role": current_user.role
    }
```

### 2. `require_role(role: str)`

Restricts endpoint to a specific role. Admin users can access all endpoints.

```python
from app.core.security import require_role

@router.get("/student/dashboard")
def student_dashboard(current_user: User = Depends(require_role("student"))):
    """Only students (and admins) can access this endpoint."""
    return {"message": "Student dashboard"}

@router.get("/teacher/analytics")
def teacher_analytics(current_user: User = Depends(require_role("teacher"))):
    """Only teachers (and admins) can access this endpoint."""
    return {"message": "Teacher analytics"}
```

### 3. `require_any_role(roles: List[str])`

Allows multiple roles to access an endpoint.

```python
from app.core.security import require_any_role

@router.get("/reports")
def get_reports(current_user: User = Depends(require_any_role(["teacher", "admin"]))):
    """Teachers and admins can access this endpoint."""
    return {"message": "Reports"}
```

### 4. `require_teacher_or_admin`

Convenience dependency for the common case of teacher/admin-only endpoints.

```python
from app.core.security import require_teacher_or_admin

@router.get("/class/{class_id}/performance")
def class_performance(
    class_id: int,
    current_user: User = Depends(require_teacher_or_admin)
):
    """Teachers and admins can view class performance."""
    return {"class_id": class_id, "performance": "..."}
```

## Complete Example

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    get_current_user,
    require_role,
    require_teacher_or_admin
)
from app.models.user import User

router = APIRouter()

# Public endpoint - no authentication required
@router.get("/public/info")
def public_info():
    return {"message": "Public information"}

# Authenticated endpoint - any logged-in user
@router.get("/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role
    }

# Student-only endpoint
@router.get("/recommendations/{student_id}")
def get_recommendations(
    student_id: int,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    # Additional authorization: students can only access their own data
    if current_user.student_profile.id != student_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Cannot access other students' data")
    
    return {"student_id": student_id, "recommendations": "..."}

# Teacher/Admin endpoint
@router.get("/analytics/class/{class_id}")
def get_class_analytics(
    class_id: int,
    current_user: User = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db)
):
    return {"class_id": class_id, "analytics": "..."}

# Admin-only endpoint
@router.post("/admin/users")
def create_user(
    user_data: dict,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    return {"message": "User created"}
```

## Error Responses

### 401 Unauthorized

Returned when:
- No token is provided
- Token is invalid or expired
- Token signature is invalid

```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden

Returned when:
- User is authenticated but lacks required role
- User tries to access resources they don't own

```json
{
  "detail": "Insufficient permissions. Required role: teacher"
}
```

## Testing Authorization

Use the test utilities to create tokens for testing:

```python
from app.core.security import create_access_token
from datetime import timedelta

# Create a test token
token = create_access_token(
    data={"sub": "testuser", "role": "student"},
    expires_delta=timedelta(minutes=30)
)

# Use in test requests
response = client.get(
    "/protected-endpoint",
    headers={"Authorization": f"Bearer {token}"}
)
```

## Best Practices

1. **Use the most specific dependency**: If an endpoint is teacher-only, use `require_role("teacher")` rather than `get_current_user` with manual checks.

2. **Admin bypass**: The `require_role` decorator automatically allows admin access. Don't add separate admin checks.

3. **Resource ownership**: For endpoints where users should only access their own data, add additional checks after role validation:

```python
@router.get("/student/{student_id}/data")
def get_student_data(
    student_id: int,
    current_user: User = Depends(require_role("student"))
):
    # Verify student can only access their own data
    if current_user.student_profile.id != student_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return {"data": "..."}
```

4. **Combine with database queries**: Use the `current_user` to filter database queries:

```python
@router.get("/my-attempts")
def get_my_attempts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attempts = db.query(QuestionAttempt).filter(
        QuestionAttempt.student_id == current_user.student_profile.id
    ).all()
    return attempts
```

## Security Considerations

1. **Token Storage**: Tokens should be stored in HTTP-only cookies or secure storage on the client side.

2. **Token Expiration**: Tokens expire after 24 hours (configurable in `settings.ACCESS_TOKEN_EXPIRE_MINUTES`).

3. **HTTPS Only**: In production, always use HTTPS to prevent token interception.

4. **Token Refresh**: Implement token refresh logic for long-lived sessions.

5. **Rate Limiting**: Apply rate limiting to authentication endpoints to prevent brute force attacks.

## Validation Against Requirements

This authorization middleware validates:

- **Requirement 8.1**: All protected endpoints require authentication
- **Requirement 8.2**: Users are assigned roles (student, teacher, admin)
- **Requirement 8.3**: Teacher dashboard access is restricted to teacher/admin roles
- **Requirement 8.6**: Sessions are maintained with secure token-based authentication
