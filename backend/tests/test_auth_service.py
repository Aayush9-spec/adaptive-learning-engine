"""
Unit tests for AuthService

Tests password hashing, user registration, login, token generation and verification.
"""

import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.user import User, StudentProfile
from app.services.auth_service import AuthService
from jose import jwt
from app.core.config import settings


@pytest.fixture
def db_session():
    """Create a test database session"""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    yield session
    session.close()


class TestPasswordHashing:
    """Test password hashing and verification"""
    
    def test_hash_password_returns_different_hash(self):
        """Hashed password should not equal plain password"""
        password = "test_password_123"
        hashed = AuthService.hash_password(password)
        
        assert hashed != password
        assert len(hashed) > 0
    
    def test_hash_password_is_deterministic_with_salt(self):
        """Same password should produce different hashes due to salt"""
        password = "test_password_123"
        hash1 = AuthService.hash_password(password)
        hash2 = AuthService.hash_password(password)
        
        # Bcrypt uses random salt, so hashes should be different
        assert hash1 != hash2
    
    def test_verify_password_correct(self):
        """Correct password should verify successfully"""
        password = "test_password_123"
        hashed = AuthService.hash_password(password)
        
        assert AuthService.verify_password(password, hashed) is True
    
    def test_verify_password_incorrect(self):
        """Incorrect password should fail verification"""
        password = "test_password_123"
        wrong_password = "wrong_password"
        hashed = AuthService.hash_password(password)
        
        assert AuthService.verify_password(wrong_password, hashed) is False


class TestUserRegistration:
    """Test user registration functionality"""
    
    def test_register_student_success(self, db_session):
        """Successfully register a student user"""
        user = AuthService.register_user(
            db=db_session,
            username="student1",
            password="password123",
            role="student",
            grade=10,
            target_exam="Board Exam 2024"
        )
        
        assert user.id is not None
        assert user.username == "student1"
        assert user.role == "student"
        assert user.password_hash != "password123"
        assert user.created_at is not None
        
        # Check student profile was created
        profile = db_session.query(StudentProfile).filter(
            StudentProfile.user_id == user.id
        ).first()
        
        assert profile is not None
        assert profile.grade == 10
        assert profile.target_exam == "Board Exam 2024"
        assert profile.available_hours_per_day == 3.0
    
    def test_register_teacher_success(self, db_session):
        """Successfully register a teacher user"""
        user = AuthService.register_user(
            db=db_session,
            username="teacher1",
            password="password123",
            role="teacher"
        )
        
        assert user.id is not None
        assert user.username == "teacher1"
        assert user.role == "teacher"
        
        # No student profile should be created
        profile = db_session.query(StudentProfile).filter(
            StudentProfile.user_id == user.id
        ).first()
        
        assert profile is None
    
    def test_register_admin_success(self, db_session):
        """Successfully register an admin user"""
        user = AuthService.register_user(
            db=db_session,
            username="admin1",
            password="password123",
            role="admin"
        )
        
        assert user.id is not None
        assert user.username == "admin1"
        assert user.role == "admin"
    
    def test_register_duplicate_username_fails(self, db_session):
        """Registering duplicate username should fail"""
        AuthService.register_user(
            db=db_session,
            username="student1",
            password="password123",
            role="student",
            grade=10,
            target_exam="Board Exam"
        )
        
        with pytest.raises(ValueError, match="already exists"):
            AuthService.register_user(
                db=db_session,
                username="student1",
                password="different_password",
                role="student",
                grade=11,
                target_exam="Board Exam"
            )
    
    def test_register_invalid_role_fails(self, db_session):
        """Registering with invalid role should fail"""
        with pytest.raises(ValueError, match="Invalid role"):
            AuthService.register_user(
                db=db_session,
                username="user1",
                password="password123",
                role="invalid_role"
            )
    
    def test_register_student_without_grade_fails(self, db_session):
        """Registering student without grade should fail"""
        with pytest.raises(ValueError, match="Grade and target_exam are required"):
            AuthService.register_user(
                db=db_session,
                username="student1",
                password="password123",
                role="student"
            )
    
    def test_register_short_password_fails(self, db_session):
        """Registering with password < 8 characters should fail"""
        with pytest.raises(ValueError, match="at least 8 characters"):
            AuthService.register_user(
                db=db_session,
                username="student1",
                password="short",
                role="student",
                grade=10,
                target_exam="Board Exam"
            )
    
    def test_register_student_with_custom_hours(self, db_session):
        """Register student with custom available hours"""
        user = AuthService.register_user(
            db=db_session,
            username="student1",
            password="password123",
            role="student",
            grade=10,
            target_exam="Board Exam",
            available_hours_per_day=5.0
        )
        
        profile = db_session.query(StudentProfile).filter(
            StudentProfile.user_id == user.id
        ).first()
        
        assert profile.available_hours_per_day == 5.0


class TestLogin:
    """Test login functionality"""
    
    def test_login_success(self, db_session):
        """Successful login should return token and user info"""
        # Register user first
        AuthService.register_user(
            db=db_session,
            username="student1",
            password="password123",
            role="student",
            grade=10,
            target_exam="Board Exam"
        )
        
        # Login
        result = AuthService.login(db_session, "student1", "password123")
        
        assert result is not None
        assert "access_token" in result
        assert result["token_type"] == "bearer"
        assert result["user"]["username"] == "student1"
        assert result["user"]["role"] == "student"
    
    def test_login_wrong_password(self, db_session):
        """Login with wrong password should fail"""
        AuthService.register_user(
            db=db_session,
            username="student1",
            password="password123",
            role="student",
            grade=10,
            target_exam="Board Exam"
        )
        
        result = AuthService.login(db_session, "student1", "wrong_password")
        
        assert result is None
    
    def test_login_nonexistent_user(self, db_session):
        """Login with nonexistent username should fail"""
        result = AuthService.login(db_session, "nonexistent", "password123")
        
        assert result is None
    
    def test_login_updates_last_login(self, db_session):
        """Login should update last_login timestamp"""
        user = AuthService.register_user(
            db=db_session,
            username="student1",
            password="password123",
            role="student",
            grade=10,
            target_exam="Board Exam"
        )
        
        original_last_login = user.last_login
        
        # Login
        AuthService.login(db_session, "student1", "password123")
        
        # Refresh user
        db_session.refresh(user)
        
        assert user.last_login is not None
        assert user.last_login != original_last_login


class TestTokenOperations:
    """Test JWT token creation and verification"""
    
    def test_create_access_token(self):
        """Create access token with default expiration"""
        data = {"sub": "student1", "role": "student"}
        token = AuthService.create_access_token(data)
        
        assert token is not None
        assert len(token) > 0
        
        # Decode and verify
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert payload["sub"] == "student1"
        assert payload["role"] == "student"
        assert "exp" in payload
    
    def test_create_access_token_custom_expiration(self):
        """Create access token with custom expiration"""
        data = {"sub": "student1"}
        expires_delta = timedelta(minutes=30)
        token = AuthService.create_access_token(data, expires_delta)
        
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        # Check expiration is approximately 30 minutes from now
        exp_time = datetime.utcfromtimestamp(payload["exp"])
        expected_time = datetime.utcnow() + expires_delta
        
        # Allow 5 second tolerance
        assert abs((exp_time - expected_time).total_seconds()) < 5
    
    def test_verify_token_valid(self, db_session):
        """Verify valid token returns user"""
        user = AuthService.register_user(
            db=db_session,
            username="student1",
            password="password123",
            role="student",
            grade=10,
            target_exam="Board Exam"
        )
        
        token = AuthService.create_access_token({"sub": "student1"})
        verified_user = AuthService.verify_token(token, db_session)
        
        assert verified_user is not None
        assert verified_user.id == user.id
        assert verified_user.username == "student1"
    
    def test_verify_token_invalid(self, db_session):
        """Verify invalid token returns None"""
        invalid_token = "invalid.token.string"
        verified_user = AuthService.verify_token(invalid_token, db_session)
        
        assert verified_user is None
    
    def test_verify_token_nonexistent_user(self, db_session):
        """Verify token for nonexistent user returns None"""
        token = AuthService.create_access_token({"sub": "nonexistent_user"})
        verified_user = AuthService.verify_token(token, db_session)
        
        assert verified_user is None


class TestLogout:
    """Test logout functionality"""
    
    def test_logout_valid_token(self, db_session):
        """Logout with valid token should succeed"""
        user = AuthService.register_user(
            db=db_session,
            username="student1",
            password="password123",
            role="student",
            grade=10,
            target_exam="Board Exam"
        )
        
        token = AuthService.create_access_token({"sub": "student1"})
        result = AuthService.logout(token, db_session)
        
        assert result is True
    
    def test_logout_invalid_token(self, db_session):
        """Logout with invalid token should fail"""
        invalid_token = "invalid.token.string"
        result = AuthService.logout(invalid_token, db_session)
        
        assert result is False
