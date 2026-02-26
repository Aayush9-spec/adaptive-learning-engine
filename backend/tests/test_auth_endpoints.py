"""
Unit tests for authentication API endpoints.

Tests the REST API endpoints for user authentication including:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

Validates: Requirements 8.1, 8.2, 13.1, 13.2
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
from app.main import app
from app.core.database import Base, get_db
from app.models.user import User, StudentProfile
from app.services.auth_service import AuthService


# Test database setup
@pytest.fixture(scope="function")
def test_engine():
    """Create a test database engine."""
    engine = create_engine(
        "sqlite:///:memory:",
        echo=False,
        connect_args={"check_same_thread": False}  # Allow SQLite to work across threads
    )
    Base.metadata.create_all(engine)
    yield engine
    Base.metadata.drop_all(engine)
    engine.dispose()


@pytest.fixture(scope="function")
def test_db(test_engine):
    """Create a test database session."""
    TestingSessionLocal = sessionmaker(bind=test_engine, autocommit=False, autoflush=False)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.rollback()
        db.close()


@pytest.fixture(scope="function")
def client(test_db):
    """Create a test client with database override."""
    def override_get_db():
        try:
            yield test_db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_student_data():
    """Sample student registration data."""
    return {
        "username": "student1",
        "password": "password123",
        "role": "student",
        "grade": 10,
        "target_exam": "CBSE Board",
        "available_hours_per_day": 4.0
    }


@pytest.fixture
def sample_teacher_data():
    """Sample teacher registration data."""
    return {
        "username": "teacher1",
        "password": "password123",
        "role": "teacher"
    }


# Registration Tests

def test_register_student_success(client, sample_student_data):
    """Test successful student registration."""
    response = client.post("/api/auth/register", json=sample_student_data)
    
    assert response.status_code == 201
    data = response.json()
    
    # Verify response structure
    assert "access_token" in data
    assert "token_type" in data
    assert data["token_type"] == "bearer"
    assert "user" in data
    
    # Verify user data
    user = data["user"]
    assert user["username"] == sample_student_data["username"]
    assert user["role"] == "student"
    assert "id" in user
    assert "created_at" in user


def test_register_teacher_success(client, sample_teacher_data):
    """Test successful teacher registration."""
    response = client.post("/api/auth/register", json=sample_teacher_data)
    
    assert response.status_code == 201
    data = response.json()
    
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["role"] == "teacher"


def test_register_duplicate_username(client, sample_student_data):
    """Test registration with duplicate username returns 409 Conflict."""
    # Register first user
    client.post("/api/auth/register", json=sample_student_data)
    
    # Try to register with same username
    response = client.post("/api/auth/register", json=sample_student_data)
    
    assert response.status_code == 409
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "USERNAME_CONFLICT"


def test_register_invalid_role(client):
    """Test registration with invalid role returns 400."""
    data = {
        "username": "user1",
        "password": "password123",
        "role": "invalid_role"
    }
    
    response = client.post("/api/auth/register", json=data)
    
    assert response.status_code == 422  # Pydantic validation error


def test_register_student_missing_grade(client):
    """Test student registration without grade returns 422."""
    data = {
        "username": "student1",
        "password": "password123",
        "role": "student",
        "target_exam": "CBSE"
    }
    
    response = client.post("/api/auth/register", json=data)
    
    assert response.status_code == 422


def test_register_student_missing_target_exam(client):
    """Test student registration without target_exam returns 422."""
    data = {
        "username": "student1",
        "password": "password123",
        "role": "student",
        "grade": 10
    }
    
    response = client.post("/api/auth/register", json=data)
    
    assert response.status_code == 422


def test_register_short_password(client):
    """Test registration with password < 8 characters returns 422."""
    data = {
        "username": "user1",
        "password": "short",
        "role": "teacher"
    }
    
    response = client.post("/api/auth/register", json=data)
    
    assert response.status_code == 422


def test_register_short_username(client):
    """Test registration with username < 3 characters returns 422."""
    data = {
        "username": "ab",
        "password": "password123",
        "role": "teacher"
    }
    
    response = client.post("/api/auth/register", json=data)
    
    assert response.status_code == 422


def test_register_creates_student_profile(client, sample_student_data, test_db):
    """Test that student registration creates a StudentProfile."""
    response = client.post("/api/auth/register", json=sample_student_data)
    
    assert response.status_code == 201
    user_id = response.json()["user"]["id"]
    
    # Verify StudentProfile was created
    profile = test_db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    assert profile is not None
    assert profile.grade == sample_student_data["grade"]
    assert profile.target_exam == sample_student_data["target_exam"]
    assert profile.available_hours_per_day == sample_student_data["available_hours_per_day"]


# Login Tests

def test_login_success(client, sample_student_data):
    """Test successful login."""
    # Register user first
    client.post("/api/auth/register", json=sample_student_data)
    
    # Login
    response = client.post(
        "/api/auth/login",
        data={
            "username": sample_student_data["username"],
            "password": sample_student_data["password"]
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert "access_token" in data
    assert "token_type" in data
    assert data["token_type"] == "bearer"
    assert "user" in data
    assert data["user"]["username"] == sample_student_data["username"]


def test_login_invalid_username(client):
    """Test login with non-existent username returns 401."""
    response = client.post(
        "/api/auth/login",
        data={
            "username": "nonexistent",
            "password": "password123"
        }
    )
    
    assert response.status_code == 401
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "AUTHENTICATION_FAILED"


def test_login_invalid_password(client, sample_student_data):
    """Test login with wrong password returns 401."""
    # Register user first
    client.post("/api/auth/register", json=sample_student_data)
    
    # Try to login with wrong password
    response = client.post(
        "/api/auth/login",
        data={
            "username": sample_student_data["username"],
            "password": "wrongpassword"
        }
    )
    
    assert response.status_code == 401
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "AUTHENTICATION_FAILED"


def test_login_updates_last_login(client, sample_student_data, test_db):
    """Test that login updates the last_login timestamp."""
    # Register user
    client.post("/api/auth/register", json=sample_student_data)
    
    # Get user before login
    user_before = test_db.query(User).filter(User.username == sample_student_data["username"]).first()
    last_login_before = user_before.last_login
    
    # Login
    client.post(
        "/api/auth/login",
        data={
            "username": sample_student_data["username"],
            "password": sample_student_data["password"]
        }
    )
    
    # Get user after login
    test_db.refresh(user_before)
    last_login_after = user_before.last_login
    
    # Verify last_login was updated
    assert last_login_after is not None
    if last_login_before is not None:
        assert last_login_after > last_login_before


# Get Me Tests

def test_get_me_success(client, sample_student_data):
    """Test successful retrieval of current user info."""
    # Register and get token
    register_response = client.post("/api/auth/register", json=sample_student_data)
    token = register_response.json()["access_token"]
    
    # Get current user info
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["username"] == sample_student_data["username"]
    assert data["role"] == sample_student_data["role"]
    assert "id" in data
    assert "created_at" in data


def test_get_me_without_token(client):
    """Test /me endpoint without token returns 401."""
    response = client.get("/api/auth/me")
    
    assert response.status_code == 401


def test_get_me_with_invalid_token(client):
    """Test /me endpoint with invalid token returns 401."""
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid_token"}
    )
    
    assert response.status_code == 401


# Logout Tests

def test_logout_success(client, sample_student_data):
    """Test successful logout."""
    # Register and get token
    register_response = client.post("/api/auth/register", json=sample_student_data)
    token = register_response.json()["access_token"]
    
    # Logout
    response = client.post(
        "/api/auth/logout",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["success"] is True
    assert "message" in data


def test_logout_without_token(client):
    """Test logout without token returns 401."""
    response = client.post("/api/auth/logout")
    
    assert response.status_code == 401


def test_logout_with_invalid_token(client):
    """Test logout with invalid token returns 401."""
    response = client.post(
        "/api/auth/logout",
        headers={"Authorization": "Bearer invalid_token"}
    )
    
    assert response.status_code == 401


def test_logout_without_bearer_prefix(client, sample_student_data):
    """Test logout without 'Bearer' prefix returns 401."""
    # Register and get token
    register_response = client.post("/api/auth/register", json=sample_student_data)
    token = register_response.json()["access_token"]
    
    # Logout without Bearer prefix
    response = client.post(
        "/api/auth/logout",
        headers={"Authorization": token}
    )
    
    assert response.status_code == 401


# JSON Response Format Tests

def test_all_responses_are_json(client, sample_student_data):
    """Test that all endpoints return JSON responses."""
    # Register
    response = client.post("/api/auth/register", json=sample_student_data)
    assert response.headers["content-type"] == "application/json"
    
    # Login
    response = client.post(
        "/api/auth/login",
        data={
            "username": sample_student_data["username"],
            "password": sample_student_data["password"]
        }
    )
    assert response.headers["content-type"] == "application/json"
    
    # Get token for authenticated requests
    token = response.json()["access_token"]
    
    # Get me
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.headers["content-type"] == "application/json"
    
    # Logout
    response = client.post(
        "/api/auth/logout",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.headers["content-type"] == "application/json"


# Error Response Format Tests

def test_error_response_format(client):
    """Test that error responses follow a standard format."""
    # Try to login with invalid credentials
    response = client.post(
        "/api/auth/login",
        data={
            "username": "nonexistent",
            "password": "password123"
        }
    )
    
    assert response.status_code == 401
    data = response.json()
    
    # Verify error structure (FastAPI default format)
    assert "detail" in data


# Integration Tests

def test_full_auth_flow(client, sample_student_data):
    """Test complete authentication flow: register -> login -> get me -> logout."""
    # 1. Register
    register_response = client.post("/api/auth/register", json=sample_student_data)
    assert register_response.status_code == 201
    register_token = register_response.json()["access_token"]
    
    # 2. Verify can access protected endpoint with registration token
    me_response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {register_token}"}
    )
    assert me_response.status_code == 200
    
    # 3. Login
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": sample_student_data["username"],
            "password": sample_student_data["password"]
        }
    )
    assert login_response.status_code == 200
    login_token = login_response.json()["access_token"]
    
    # 4. Verify can access protected endpoint with login token
    me_response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {login_token}"}
    )
    assert me_response.status_code == 200
    assert me_response.json()["username"] == sample_student_data["username"]
    
    # 5. Logout
    logout_response = client.post(
        "/api/auth/logout",
        headers={"Authorization": f"Bearer {login_token}"}
    )
    assert logout_response.status_code == 200
    assert logout_response.json()["success"] is True


def test_multiple_users_independent_sessions(client):
    """Test that multiple users can have independent sessions."""
    # Register two users
    user1_data = {
        "username": "student1",
        "password": "password123",
        "role": "student",
        "grade": 10,
        "target_exam": "CBSE"
    }
    user2_data = {
        "username": "teacher1",
        "password": "password456",
        "role": "teacher"
    }
    
    response1 = client.post("/api/auth/register", json=user1_data)
    response2 = client.post("/api/auth/register", json=user2_data)
    
    token1 = response1.json()["access_token"]
    token2 = response2.json()["access_token"]
    
    # Verify each token returns correct user
    me1 = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token1}"})
    me2 = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token2}"})
    
    assert me1.json()["username"] == "student1"
    assert me1.json()["role"] == "student"
    assert me2.json()["username"] == "teacher1"
    assert me2.json()["role"] == "teacher"
