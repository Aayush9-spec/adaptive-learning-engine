"""
Property-based tests for authentication and authorization.

Feature: adaptive-learning-decision-engine
Tests Properties 35-39: Authentication and authorization correctness
"""
import pytest
from hypothesis import given, settings as hyp_settings, strategies as st, HealthCheck
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from jose import jwt

from app.core.database import Base, get_db
from app.core.security import get_current_user, require_role, create_access_token
from app.core.config import settings as app_settings
from app.models.user import User, StudentProfile
from app.services.auth_service import AuthService


# Custom strategies for generating valid test data
_username_counter = 0

@st.composite
def valid_username(draw):
    """Generate valid usernames (3-50 characters, alphanumeric with _ and -)."""
    global _username_counter
    _username_counter += 1
    # Generate a simple username with a unique counter
    base = draw(st.text(
        alphabet=st.characters(whitelist_categories=('Lu', 'Ll')),
        min_size=3,
        max_size=20
    ))
    return f"{base}_{_username_counter}"


@st.composite
def valid_password(draw):
    """Generate valid passwords (8+ characters)."""
    return draw(st.text(
        alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd'), whitelist_characters='!@#$%^&*'),
        min_size=8,
        max_size=100
    ))


@st.composite
def valid_role(draw):
    """Generate valid user roles."""
    return draw(st.sampled_from(['student', 'teacher', 'admin']))


@st.composite
def valid_grade(draw):
    """Generate valid grade levels."""
    return draw(st.integers(min_value=1, max_value=12))


# Remove duplicate fixture definitions - use the ones from conftest.py


@pytest.fixture
def test_app(db_session):
    """Create a test FastAPI app with protected endpoints."""
    app = FastAPI()
    
    # Override database dependency
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    # Test endpoints
    @app.get("/public")
    def public_endpoint():
        return {"message": "public"}
    
    @app.get("/protected")
    def protected_endpoint(current_user: User = Depends(get_current_user)):
        return {"message": "protected", "user_id": current_user.id}
    
    @app.get("/student-only")
    def student_endpoint(current_user: User = Depends(require_role("student"))):
        return {"message": "student", "user_id": current_user.id}
    
    @app.get("/teacher-only")
    def teacher_endpoint(current_user: User = Depends(require_role("teacher"))):
        return {"message": "teacher", "user_id": current_user.id}
    
    return app


@pytest.fixture
def client(test_app):
    """Create a test client."""
    return TestClient(test_app)


class TestProperty35AuthenticationRequirement:
    """
    Property 35: Authentication Requirement
    Validates: Requirements 8.1
    
    For any protected API endpoint, requests without valid authentication tokens 
    should be rejected with 401 Unauthorized status.
    """
    
    @hyp_settings(
        max_examples=10,
        suppress_health_check=[HealthCheck.function_scoped_fixture],
        deadline=None
    )
    @given(
        username=valid_username(),
        password=valid_password(),
        role=valid_role()
    )
    def test_protected_endpoint_requires_authentication(
        self, client, db_session, username, password, role
    ):
        """
        Feature: adaptive-learning-decision-engine
        Property 35: Authentication Requirement
        """
        # Attempt to access protected endpoint without token
        response = client.get("/protected")
        
        # Should be rejected with 401 Unauthorized
        assert response.status_code == 401
        assert "detail" in response.json()
    
    @hyp_settings(
        max_examples=10,
        suppress_health_check=[HealthCheck.function_scoped_fixture],
        deadline=None
    )
    @given(
        invalid_token=st.text(
            alphabet=st.characters(min_codepoint=33, max_codepoint=126),  # ASCII printable
            min_size=10,
            max_size=100
        )
    )
    def test_protected_endpoint_rejects_invalid_token(
        self, client, invalid_token
    ):
        """
        Feature: adaptive-learning-decision-engine
        Property 35: Authentication Requirement - Invalid Token
        """
        # Attempt to access protected endpoint with invalid token
        response = client.get(
            "/protected",
            headers={"Authorization": f"Bearer {invalid_token}"}
        )
        
        # Should be rejected with 401 Unauthorized
        assert response.status_code == 401
    
    @hyp_settings(
        max_examples=10,
        suppress_health_check=[HealthCheck.function_scoped_fixture],
        deadline=None
    )
    @given(
        username=valid_username(),
        password=valid_password(),
        role=valid_role()
    )
    def test_protected_endpoint_accepts_valid_token(
        self, client, db_session, username, password, role
    ):
        """
        Feature: adaptive-learning-decision-engine
        Property 35: Authentication Requirement - Valid Token
        """
        # Create user
        grade = 10 if role == 'student' else None
        target_exam = "Board Exam" if role == 'student' else None
        
        try:
            user = AuthService.register_user(
                db=db_session,
                username=username,
                password=password,
                role=role,
                grade=grade,
                target_exam=target_exam
            )
        except ValueError:
            # Skip if username validation fails
            pytest.skip("Invalid username generated")
            return
        
        # Create valid token
        token = AuthService.create_access_token({"sub": username, "role": role})
        
        # Access protected endpoint with valid token
        response = client.get(
            "/protected",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        # Should succeed with 200 OK
        assert response.status_code == 200
        assert response.json()["user_id"] == user.id


class TestProperty36RoleAssignment:
    """
    Property 36: Role Assignment
    Validates: Requirements 8.2
    
    For any successful login, the returned session must include a role field 
    with value in {'student', 'teacher', 'admin'}.
    """
    
    @hyp_settings(max_examples=10, suppress_health_check=[HealthCheck.function_scoped_fixture], deadline=None)
    @given(
        username=valid_username(),
        password=valid_password(),
        role=valid_role()
    )
    def test_login_returns_role(
        self, db_session, username, password, role
    ):
        """
        Feature: adaptive-learning-decision-engine
        Property 36: Role Assignment
        """
        # Register user
        grade = 10 if role == 'student' else None
        target_exam = "Board Exam" if role == 'student' else None
        
        try:
            user = AuthService.register_user(
                db=db_session,
                username=username,
                password=password,
                role=role,
                grade=grade,
                target_exam=target_exam
            )
        except ValueError:
            # Skip if validation fails
            pytest.skip("Invalid input generated")
            return
        
        # Login
        result = AuthService.login(db_session, username, password)
        
        # Verify result contains role
        assert result is not None
        assert "user" in result
        assert "role" in result["user"]
        
        # Verify role is one of the valid values
        assert result["user"]["role"] in ['student', 'teacher', 'admin']
        
        # Verify role matches what was registered
        assert result["user"]["role"] == role
    
    @hyp_settings(max_examples=10, suppress_health_check=[HealthCheck.function_scoped_fixture], deadline=None)
    @given(
        username=valid_username(),
        password=valid_password(),
        role=valid_role()
    )
    def test_token_contains_role(
        self, db_session, username, password, role
    ):
        """
        Feature: adaptive-learning-decision-engine
        Property 36: Role Assignment - Token Contains Role
        """
        # Register user
        grade = 10 if role == 'student' else None
        target_exam = "Board Exam" if role == 'student' else None
        
        try:
            AuthService.register_user(
                db=db_session,
                username=username,
                password=password,
                role=role,
                grade=grade,
                target_exam=target_exam
            )
        except ValueError:
            pytest.skip("Invalid input generated")
            return
        
        # Login and get token
        result = AuthService.login(db_session, username, password)
        assert result is not None
        
        token = result["access_token"]
        
        # Decode token and verify role is present
        payload = jwt.decode(token, app_settings.SECRET_KEY, algorithms=[app_settings.ALGORITHM])
        assert "role" in payload
        assert payload["role"] in ['student', 'teacher', 'admin']
        assert payload["role"] == role


class TestProperty37AuthorizationEnforcement:
    """
    Property 37: Authorization Enforcement
    Validates: Requirements 8.3
    
    For any teacher-only endpoint, requests from users with role='student' 
    should be rejected with 403 Forbidden status.
    """
    
    @hyp_settings(max_examples=10, suppress_health_check=[HealthCheck.function_scoped_fixture], deadline=None)
    @given(
        student_username=valid_username(),
        password=valid_password()
    )
    def test_student_cannot_access_teacher_endpoint(
        self, client, db_session, student_username, password
    ):
        """
        Feature: adaptive-learning-decision-engine
        Property 37: Authorization Enforcement
        """
        # Create student user
        try:
            student = AuthService.register_user(
                db=db_session,
                username=student_username,
                password=password,
                role='student',
                grade=10,
                target_exam="Board Exam"
            )
        except ValueError:
            pytest.skip("Invalid input generated")
            return
        
        # Create token for student
        token = AuthService.create_access_token({"sub": student_username, "role": "student"})
        
        # Attempt to access teacher-only endpoint
        response = client.get(
            "/teacher-only",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        # Should be rejected with 403 Forbidden
        assert response.status_code == 403
        assert "detail" in response.json()
        assert "permissions" in response.json()["detail"].lower() or "forbidden" in response.json()["detail"].lower()
    
    @hyp_settings(max_examples=10, suppress_health_check=[HealthCheck.function_scoped_fixture], deadline=None)
    @given(
        teacher_username=valid_username(),
        password=valid_password()
    )
    def test_teacher_can_access_teacher_endpoint(
        self, client, db_session, teacher_username, password
    ):
        """
        Feature: adaptive-learning-decision-engine
        Property 37: Authorization Enforcement - Teacher Access
        """
        # Create teacher user
        try:
            teacher = AuthService.register_user(
                db=db_session,
                username=teacher_username,
                password=password,
                role='teacher'
            )
        except ValueError:
            pytest.skip("Invalid input generated")
            return
        
        # Create token for teacher
        token = AuthService.create_access_token({"sub": teacher_username, "role": "teacher"})
        
        # Access teacher-only endpoint
        response = client.get(
            "/teacher-only",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        # Should succeed with 200 OK
        assert response.status_code == 200
        assert response.json()["user_id"] == teacher.id
    
    @hyp_settings(max_examples=10, suppress_health_check=[HealthCheck.function_scoped_fixture], deadline=None)
    @given(
        admin_username=valid_username(),
        password=valid_password()
    )
    def test_admin_can_access_all_endpoints(
        self, client, db_session, admin_username, password
    ):
        """
        Feature: adaptive-learning-decision-engine
        Property 37: Authorization Enforcement - Admin Access
        """
        # Create admin user
        try:
            admin = AuthService.register_user(
                db=db_session,
                username=admin_username,
                password=password,
                role='admin'
            )
        except ValueError:
            pytest.skip("Invalid input generated")
            return
        
        # Create token for admin
        token = AuthService.create_access_token({"sub": admin_username, "role": "admin"})
        
        # Admin should access student-only endpoint
        response = client.get(
            "/student-only",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        
        # Admin should access teacher-only endpoint
        response = client.get(
            "/teacher-only",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200


class TestProperty38PasswordHashing:
    """
    Property 38: Password Hashing
    Validates: Requirements 8.5
    
    For any stored user password, the stored value must not equal the plaintext password 
    (must be hashed).
    """
    
    @hyp_settings(max_examples=10, suppress_health_check=[HealthCheck.function_scoped_fixture], deadline=None)
    @given(
        username=valid_username(),
        password=valid_password(),
        role=valid_role()
    )
    def test_password_is_hashed(
        self, db_session, username, password, role
    ):
        """
        Feature: adaptive-learning-decision-engine
        Property 38: Password Hashing
        """
        # Register user
        grade = 10 if role == 'student' else None
        target_exam = "Board Exam" if role == 'student' else None
        
        try:
            user = AuthService.register_user(
                db=db_session,
                username=username,
                password=password,
                role=role,
                grade=grade,
                target_exam=target_exam
            )
        except ValueError:
            pytest.skip("Invalid input generated")
            return
        
        # Verify stored password is not the plaintext password
        assert user.password_hash != password
        
        # Verify stored password is a hash (should be longer and contain hash characters)
        assert len(user.password_hash) > len(password)
        assert user.password_hash.startswith('$2b$')  # bcrypt hash prefix
    
    @hyp_settings(max_examples=10, suppress_health_check=[HealthCheck.function_scoped_fixture], deadline=None)
    @given(
        password=valid_password()
    )
    def test_hash_password_produces_different_hashes(
        self, password
    ):
        """
        Feature: adaptive-learning-decision-engine
        Property 38: Password Hashing - Salt Randomness
        """
        # Hash the same password twice
        hash1 = AuthService.hash_password(password)
        hash2 = AuthService.hash_password(password)
        
        # Hashes should be different due to random salt
        assert hash1 != hash2
        
        # But both should verify correctly
        assert AuthService.verify_password(password, hash1)
        assert AuthService.verify_password(password, hash2)
    
    @hyp_settings(max_examples=10, suppress_health_check=[HealthCheck.function_scoped_fixture], deadline=None)
    @given(
        password=valid_password(),
        wrong_password=valid_password()
    )
    def test_wrong_password_fails_verification(
        self, password, wrong_password
    ):
        """
        Feature: adaptive-learning-decision-engine
        Property 38: Password Hashing - Verification
        """
        # Ensure passwords are different
        if password == wrong_password:
            pytest.skip("Same password generated")
            return
        
        # Hash password
        hashed = AuthService.hash_password(password)
        
        # Correct password should verify
        assert AuthService.verify_password(password, hashed) is True
        
        # Wrong password should not verify
        assert AuthService.verify_password(wrong_password, hashed) is False


class TestProperty39TokenValidation:
    """
    Property 39: Token Validation
    Validates: Requirements 8.6
    
    For any valid authentication token, requests to protected endpoints using that token 
    should succeed (not return 401).
    """
    
    @hyp_settings(max_examples=10, suppress_health_check=[HealthCheck.function_scoped_fixture], deadline=None)
    @given(
        username=valid_username(),
        password=valid_password(),
        role=valid_role()
    )
    def test_valid_token_grants_access(
        self, client, db_session, username, password, role
    ):
        """
        Feature: adaptive-learning-decision-engine
        Property 39: Token Validation
        """
        # Register user
        grade = 10 if role == 'student' else None
        target_exam = "Board Exam" if role == 'student' else None
        
        try:
            user = AuthService.register_user(
                db=db_session,
                username=username,
                password=password,
                role=role,
                grade=grade,
                target_exam=target_exam
            )
        except ValueError:
            pytest.skip("Invalid input generated")
            return
        
        # Login to get valid token
        result = AuthService.login(db_session, username, password)
        assert result is not None
        
        token = result["access_token"]
        
        # Use token to access protected endpoint
        response = client.get(
            "/protected",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        # Should succeed (not return 401)
        assert response.status_code != 401
        assert response.status_code == 200
        assert response.json()["user_id"] == user.id
    
    @hyp_settings(max_examples=10, suppress_health_check=[HealthCheck.function_scoped_fixture], deadline=None)
    @given(
        username=valid_username(),
        role=valid_role()
    )
    def test_token_verification_returns_user(
        self, db_session, username, role
    ):
        """
        Feature: adaptive-learning-decision-engine
        Property 39: Token Validation - User Retrieval
        """
        # Create user
        password = "password123"
        grade = 10 if role == 'student' else None
        target_exam = "Board Exam" if role == 'student' else None
        
        try:
            user = AuthService.register_user(
                db=db_session,
                username=username,
                password=password,
                role=role,
                grade=grade,
                target_exam=target_exam
            )
        except ValueError:
            pytest.skip("Invalid input generated")
            return
        
        # Create valid token
        token = AuthService.create_access_token({"sub": username, "role": role})
        
        # Verify token returns the correct user
        verified_user = AuthService.verify_token(token, db_session)
        
        assert verified_user is not None
        assert verified_user.id == user.id
        assert verified_user.username == username
        assert verified_user.role == role
    
    @hyp_settings(max_examples=10, suppress_health_check=[HealthCheck.function_scoped_fixture], deadline=None)
    @given(
        username=valid_username(),
        role=valid_role()
    )
    def test_expired_token_rejected(
        self, db_session, username, role
    ):
        """
        Feature: adaptive-learning-decision-engine
        Property 39: Token Validation - Expiration
        """
        # Create user
        password = "password123"
        grade = 10 if role == 'student' else None
        target_exam = "Board Exam" if role == 'student' else None
        
        try:
            AuthService.register_user(
                db=db_session,
                username=username,
                password=password,
                role=role,
                grade=grade,
                target_exam=target_exam
            )
        except ValueError:
            pytest.skip("Invalid input generated")
            return
        
        # Create expired token (expired 1 hour ago)
        token = AuthService.create_access_token(
            data={"sub": username, "role": role},
            expires_delta=timedelta(hours=-1)
        )
        
        # Verify token should return None for expired token
        verified_user = AuthService.verify_token(token, db_session)
        
        assert verified_user is None
