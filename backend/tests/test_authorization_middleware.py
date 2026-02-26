"""
Tests for Authorization Middleware

Tests the role-based access control (RBAC) system including:
- Token validation middleware
- Role checking decorators
- Authorization enforcement for protected endpoints
"""

import pytest
from fastapi import FastAPI, Depends, HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from datetime import timedelta

from app.core.security import (
    get_current_user,
    require_role,
    require_any_role,
    require_teacher_or_admin,
    create_access_token,
    get_password_hash
)
from app.core.database import Base, get_db
from app.models.user import User, StudentProfile


# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_auth.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_app(db):
    """Create a test FastAPI app with authorization endpoints."""
    app = FastAPI()
    
    # Override database dependency
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    # Test endpoints with different authorization requirements
    @app.get("/public")
    def public_endpoint():
        return {"message": "public"}
    
    @app.get("/protected")
    def protected_endpoint(current_user: User = Depends(get_current_user)):
        return {"message": "protected", "user": current_user.username}
    
    @app.get("/student-only")
    def student_endpoint(current_user: User = Depends(require_role("student"))):
        return {"message": "student", "user": current_user.username}
    
    @app.get("/teacher-only")
    def teacher_endpoint(current_user: User = Depends(require_role("teacher"))):
        return {"message": "teacher", "user": current_user.username}
    
    @app.get("/admin-only")
    def admin_endpoint(current_user: User = Depends(require_role("admin"))):
        return {"message": "admin", "user": current_user.username}
    
    @app.get("/teacher-or-admin")
    def teacher_admin_endpoint(current_user: User = Depends(require_teacher_or_admin)):
        return {"message": "teacher_or_admin", "user": current_user.username}
    
    @app.get("/multi-role")
    def multi_role_endpoint(current_user: User = Depends(require_any_role(["teacher", "admin"]))):
        return {"message": "multi_role", "user": current_user.username}
    
    return app


@pytest.fixture
def client(test_app):
    """Create a test client."""
    return TestClient(test_app)


@pytest.fixture
def student_user(db):
    """Create a student user."""
    user = User(
        username="student1",
        password_hash=get_password_hash("password123"),
        role="student"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    profile = StudentProfile(
        user_id=user.id,
        grade=12,
        target_exam="CBSE",
        available_hours_per_day=3.0
    )
    db.add(profile)
    db.commit()
    
    return user


@pytest.fixture
def teacher_user(db):
    """Create a teacher user."""
    user = User(
        username="teacher1",
        password_hash=get_password_hash("password123"),
        role="teacher"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def admin_user(db):
    """Create an admin user."""
    user = User(
        username="admin1",
        password_hash=get_password_hash("password123"),
        role="admin"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_token_for_user(username: str, role: str) -> str:
    """Helper to create a JWT token for testing."""
    return create_access_token(
        data={"sub": username, "role": role},
        expires_delta=timedelta(minutes=30)
    )


class TestTokenValidation:
    """Test JWT token validation middleware."""
    
    def test_public_endpoint_no_auth_required(self, client):
        """Public endpoints should be accessible without authentication."""
        response = client.get("/public")
        assert response.status_code == 200
        assert response.json() == {"message": "public"}
    
    def test_protected_endpoint_requires_token(self, client):
        """Protected endpoints should reject requests without tokens."""
        response = client.get("/protected")
        assert response.status_code == 401
        assert "detail" in response.json()
    
    def test_protected_endpoint_with_invalid_token(self, client):
        """Protected endpoints should reject invalid tokens."""
        response = client.get(
            "/protected",
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401
    
    def test_protected_endpoint_with_valid_token(self, client, student_user):
        """Protected endpoints should accept valid tokens."""
        token = create_token_for_user(student_user.username, student_user.role)
        response = client.get(
            "/protected",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["user"] == student_user.username
    
    def test_expired_token_rejected(self, client, student_user):
        """Expired tokens should be rejected."""
        # Create token that expired 1 hour ago
        token = create_access_token(
            data={"sub": student_user.username},
            expires_delta=timedelta(hours=-1)
        )
        response = client.get(
            "/protected",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 401


class TestRoleBasedAccessControl:
    """Test role-based access control (RBAC) enforcement."""
    
    def test_student_can_access_student_endpoint(self, client, student_user):
        """Students should access student-only endpoints."""
        token = create_token_for_user(student_user.username, student_user.role)
        response = client.get(
            "/student-only",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["message"] == "student"
    
    def test_student_cannot_access_teacher_endpoint(self, client, student_user):
        """Students should be denied access to teacher-only endpoints."""
        token = create_token_for_user(student_user.username, student_user.role)
        response = client.get(
            "/teacher-only",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403
        assert "Insufficient permissions" in response.json()["detail"]
    
    def test_teacher_can_access_teacher_endpoint(self, client, teacher_user):
        """Teachers should access teacher-only endpoints."""
        token = create_token_for_user(teacher_user.username, teacher_user.role)
        response = client.get(
            "/teacher-only",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["message"] == "teacher"
    
    def test_teacher_cannot_access_student_endpoint(self, client, teacher_user):
        """Teachers should be denied access to student-only endpoints."""
        token = create_token_for_user(teacher_user.username, teacher_user.role)
        response = client.get(
            "/student-only",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403
    
    def test_admin_can_access_all_endpoints(self, client, admin_user):
        """Admins should have access to all role-specific endpoints."""
        token = create_token_for_user(admin_user.username, admin_user.role)
        
        # Admin can access student endpoint
        response = client.get(
            "/student-only",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        
        # Admin can access teacher endpoint
        response = client.get(
            "/teacher-only",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        
        # Admin can access admin endpoint
        response = client.get(
            "/admin-only",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200


class TestMultiRoleAuthorization:
    """Test endpoints that allow multiple roles."""
    
    def test_teacher_can_access_teacher_or_admin_endpoint(self, client, teacher_user):
        """Teachers should access teacher-or-admin endpoints."""
        token = create_token_for_user(teacher_user.username, teacher_user.role)
        response = client.get(
            "/teacher-or-admin",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
    
    def test_admin_can_access_teacher_or_admin_endpoint(self, client, admin_user):
        """Admins should access teacher-or-admin endpoints."""
        token = create_token_for_user(admin_user.username, admin_user.role)
        response = client.get(
            "/teacher-or-admin",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
    
    def test_student_cannot_access_teacher_or_admin_endpoint(self, client, student_user):
        """Students should be denied access to teacher-or-admin endpoints."""
        token = create_token_for_user(student_user.username, student_user.role)
        response = client.get(
            "/teacher-or-admin",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403
    
    def test_require_any_role_allows_specified_roles(self, client, teacher_user, admin_user):
        """require_any_role should allow any of the specified roles."""
        # Teacher can access
        token = create_token_for_user(teacher_user.username, teacher_user.role)
        response = client.get(
            "/multi-role",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        
        # Admin can access
        token = create_token_for_user(admin_user.username, admin_user.role)
        response = client.get(
            "/multi-role",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
    
    def test_require_any_role_denies_other_roles(self, client, student_user):
        """require_any_role should deny roles not in the allowed list."""
        token = create_token_for_user(student_user.username, student_user.role)
        response = client.get(
            "/multi-role",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403


class TestAuthorizationErrorMessages:
    """Test that authorization errors return appropriate messages."""
    
    def test_unauthorized_error_message(self, client):
        """401 errors should have clear error messages."""
        response = client.get("/protected")
        assert response.status_code == 401
        assert "detail" in response.json()
        # Check for either "credentials" or "authenticated" in error message
        detail = response.json()["detail"].lower()
        assert "credentials" in detail or "authenticated" in detail
    
    def test_forbidden_error_message(self, client, student_user):
        """403 errors should indicate insufficient permissions."""
        token = create_token_for_user(student_user.username, student_user.role)
        response = client.get(
            "/teacher-only",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403
        assert "detail" in response.json()
        assert "permissions" in response.json()["detail"].lower()
    
    def test_forbidden_error_includes_required_role(self, client, student_user):
        """403 errors should mention the required role."""
        token = create_token_for_user(student_user.username, student_user.role)
        response = client.get(
            "/teacher-only",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403
        assert "teacher" in response.json()["detail"].lower()


class TestEdgeCases:
    """Test edge cases and error conditions."""
    
    def test_malformed_authorization_header(self, client):
        """Malformed Authorization headers should be rejected."""
        response = client.get(
            "/protected",
            headers={"Authorization": "InvalidFormat"}
        )
        assert response.status_code == 401
    
    def test_token_without_bearer_prefix(self, client, student_user):
        """Tokens without 'Bearer' prefix should be rejected."""
        token = create_token_for_user(student_user.username, student_user.role)
        response = client.get(
            "/protected",
            headers={"Authorization": token}
        )
        assert response.status_code == 401
    
    def test_token_for_nonexistent_user(self, client):
        """Tokens for users that don't exist should be rejected."""
        token = create_token_for_user("nonexistent", "student")
        response = client.get(
            "/protected",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 401
    
    def test_empty_authorization_header(self, client):
        """Empty Authorization headers should be rejected."""
        response = client.get(
            "/protected",
            headers={"Authorization": ""}
        )
        assert response.status_code == 401


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
