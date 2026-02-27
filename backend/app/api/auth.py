"""
Authentication API Endpoints

Provides RESTful API endpoints for user authentication and authorization.
Implements registration, login, logout, and user profile retrieval.

Endpoints:
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login and get token
- POST /api/auth/logout - Logout and invalidate token
- GET /api/auth/me - Get current user info

Validates: Requirements 8.1, 8.2, 13.1, 13.2
"""

from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.security import get_current_user
from app.services.auth_service import AuthService
from app.models.user import User, StudentProfile

router = APIRouter()


# Request/Response Models

class UserRegisterRequest(BaseModel):
    """
    User registration request model.
    
    Validates: Requirements 8.1, 8.2
    """
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    password: str = Field(..., min_length=8, max_length=100, description="Password (min 8 characters)")
    role: str = Field(..., description="User role: student, teacher, or admin")
    grade: Optional[int] = Field(None, ge=1, le=12, description="Grade level (required for students)")
    target_exam: Optional[str] = Field(None, max_length=100, description="Target exam (required for students)")
    exam_date: Optional[datetime] = Field(None, description="Exam date (optional for students)")
    available_hours_per_day: Optional[float] = Field(3.0, ge=0.5, le=24.0, description="Available study hours per day")
    
    @validator('role')
    def validate_role(cls, v):
        """Validate role is one of the allowed values."""
        if v not in ['student', 'teacher', 'admin']:
            raise ValueError("Role must be 'student', 'teacher', or 'admin'")
        return v
    
    @validator('grade', always=True)
    def validate_student_grade(cls, v, values):
        """Validate grade is provided for student role."""
        if values.get('role') == 'student' and v is None:
            raise ValueError("Grade is required for student role")
        return v
    
    @validator('target_exam', always=True)
    def validate_student_exam(cls, v, values):
        """Validate target_exam is provided for student role."""
        if values.get('role') == 'student' and v is None:
            raise ValueError("Target exam is required for student role")
        return v


class TokenResponse(BaseModel):
    """
    Authentication token response model.
    
    Validates: Requirements 8.1, 8.6
    """
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type (always 'bearer')")
    user: dict = Field(..., description="User information")


class StudentProfileResponse(BaseModel):
    """Student profile information"""
    id: int
    grade: int
    target_exam: str
    exam_date: Optional[str] = None
    available_hours_per_day: float


class UserResponse(BaseModel):
    """
    User information response model.
    
    Validates: Requirements 8.2
    """
    id: int = Field(..., description="User ID")
    username: str = Field(..., description="Username")
    role: str = Field(..., description="User role")
    created_at: str = Field(..., description="Account creation timestamp")
    last_login: Optional[str] = Field(None, description="Last login timestamp")
    student_profile: Optional[StudentProfileResponse] = Field(None, description="Student profile if user is a student")


class LogoutResponse(BaseModel):
    """
    Logout response model.
    """
    message: str = Field(..., description="Logout status message")
    success: bool = Field(..., description="Whether logout was successful")


class ErrorResponse(BaseModel):
    """
    Standard error response model.
    
    Validates: Requirements 13.2, 13.4
    """
    error: dict = Field(..., description="Error details")


# API Endpoints

@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "User successfully registered"},
        400: {"description": "Validation error or username already exists", "model": ErrorResponse},
        409: {"description": "Username conflict", "model": ErrorResponse},
    },
    summary="Register a new user",
    description="Register a new user with role assignment. Students require grade and target_exam. Returns JWT token upon successful registration."
)
def register(user_data: UserRegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user account.
    
    Creates a new user with the specified role (student, teacher, or admin).
    For student role, also creates a StudentProfile with grade and exam information.
    Returns a JWT token for immediate authentication.
    
    Args:
        user_data: User registration data
        db: Database session
        
    Returns:
        TokenResponse with access token and user information
        
    Raises:
        HTTPException 400: Invalid input data or validation error
        HTTPException 409: Username already exists
        
    Validates: Requirements 8.1, 8.2, 13.1, 13.2
    """
    try:
        # Register user using AuthService
        user = AuthService.register_user(
            db=db,
            username=user_data.username,
            password=user_data.password,
            role=user_data.role,
            grade=user_data.grade,
            target_exam=user_data.target_exam,
            exam_date=user_data.exam_date,
            available_hours_per_day=user_data.available_hours_per_day
        )
        
        # Generate access token
        access_token = AuthService.create_access_token(
            data={"sub": user.username, "role": user.role}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role,
                "created_at": user.created_at
            }
        }
        
    except ValueError as e:
        # Handle validation errors and username conflicts
        error_message = str(e)
        if "already exists" in error_message:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=error_message
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_message
            )


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Login successful"},
        401: {"description": "Invalid credentials", "model": ErrorResponse},
    },
    summary="Login user",
    description="Authenticate user with username and password. Returns JWT token upon successful authentication."
)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Authenticate user and generate JWT token.
    
    Validates username and password, updates last_login timestamp,
    and returns a JWT token for subsequent authenticated requests.
    
    Args:
        form_data: OAuth2 password form with username and password
        db: Database session
        
    Returns:
        TokenResponse with access token and user information
        
    Raises:
        HTTPException 401: Invalid username or password
        
    Validates: Requirements 8.1, 8.6, 13.1, 13.2
    """
    try:
        # Authenticate using AuthService
        auth_result = AuthService.login(
            db=db,
            username=form_data.username,
            password=form_data.password
        )
        
        if auth_result is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return {
            "access_token": auth_result["access_token"],
            "token_type": auth_result["token_type"],
            "user": auth_result["user"]
        }
        
    except HTTPException:
        raise


@router.post(
    "/logout",
    response_model=LogoutResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Logout successful"},
        401: {"description": "Invalid or missing token", "model": ErrorResponse},
    },
    summary="Logout user",
    description="Logout user by invalidating their JWT token. Client should remove token from storage."
)
def logout(
    current_user: User = Depends(get_current_user),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Logout user and invalidate token.
    
    In a stateless JWT system, logout is primarily handled client-side
    by removing the token. This endpoint validates the token and provides
    a confirmation response. Future implementations may add token blacklisting.
    
    Args:
        current_user: Current authenticated user (from token)
        authorization: Authorization header with Bearer token
        db: Database session
        
    Returns:
        LogoutResponse with success status
        
    Raises:
        HTTPException 401: Invalid or missing token
        
    Validates: Requirements 8.1, 13.1, 13.2
    """
    try:
        # Extract token from Authorization header
        if authorization and authorization.startswith("Bearer "):
            token = authorization.replace("Bearer ", "")
            
            # Logout using AuthService
            success = AuthService.logout(token, db)
            
            if success:
                return {
                    "message": "Successfully logged out. Please remove token from client storage.",
                    "success": True
                }
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired token"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authorization header missing or invalid"
            )
            
    except HTTPException:
        raise


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "User information retrieved successfully"},
        401: {"description": "Invalid or missing token", "model": ErrorResponse},
    },
    summary="Get current user information",
    description="Retrieve information about the currently authenticated user."
)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user information.
    
    Returns profile information for the currently authenticated user
    based on the JWT token provided in the Authorization header.
    
    Args:
        current_user: Current authenticated user (from token)
        
    Returns:
        UserResponse with user profile information
        
    Raises:
        HTTPException 401: Invalid or missing token
        
    Validates: Requirements 8.1, 8.2, 13.1, 13.2
    """
    try:
        response = {
            "id": current_user.id,
            "username": current_user.username,
            "role": current_user.role,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
            "last_login": current_user.last_login.isoformat() if current_user.last_login else None
        }
        
        # Add student_profile if user is a student
        if current_user.role == "student" and current_user.student_profile:
            response["student_profile"] = {
                "id": current_user.student_profile.id,
                "grade": current_user.student_profile.grade,
                "target_exam": current_user.student_profile.target_exam,
                "exam_date": current_user.student_profile.exam_date.isoformat() if current_user.student_profile.exam_date else None,
                "available_hours_per_day": current_user.student_profile.available_hours_per_day
            }
        
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while retrieving user information"
        )
