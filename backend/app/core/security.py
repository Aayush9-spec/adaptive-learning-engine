"""
Security Module

Provides authentication and authorization utilities for the Adaptive Learning Decision Engine.
Implements JWT token validation, password hashing, and role-based access control (RBAC).

Features:
- JWT token validation middleware
- Role-based access control decorators
- Password hashing with bcrypt
- OAuth2 password bearer authentication
"""

from datetime import datetime, timedelta
from typing import Optional, List, Callable
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

# Password hashing context with bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.
    
    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to compare against
        
    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Args:
        password: Plain text password to hash
        
    Returns:
        Hashed password string
    """
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Dictionary of data to encode in the token
        expires_delta: Optional custom expiration time
        
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> User:
    """
    Token validation middleware that extracts and validates JWT tokens.
    
    This dependency validates the JWT token from the Authorization header,
    decodes it, and retrieves the associated user from the database.
    
    Args:
        token: JWT token from Authorization header (extracted by oauth2_scheme)
        db: Database session
        
    Returns:
        User object if token is valid
        
    Raises:
        HTTPException: 401 Unauthorized if token is invalid or user not found
        
    Validates: Requirements 8.1, 8.6
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode JWT token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        
        if username is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # Retrieve user from database with student_profile relationship
    from sqlalchemy.orm import joinedload
    user = db.query(User).options(joinedload(User.student_profile)).filter(User.username == username).first()
    
    if user is None:
        raise credentials_exception
        
    return user


def require_role(required_role: str) -> Callable:
    """
    Role-based access control decorator for protecting endpoints.
    
    Creates a dependency that checks if the current user has the required role.
    Admin users have access to all endpoints regardless of required role.
    
    Args:
        required_role: The role required to access the endpoint ('student', 'teacher', or 'admin')
        
    Returns:
        Dependency function that validates user role
        
    Example:
        @router.get("/teacher/dashboard")
        def get_dashboard(current_user: User = Depends(require_role("teacher"))):
            return {"message": "Teacher dashboard"}
            
    Validates: Requirements 8.3
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        """
        Check if current user has the required role.
        
        Args:
            current_user: User object from get_current_user dependency
            
        Returns:
            User object if authorized
            
        Raises:
            HTTPException: 403 Forbidden if user lacks required role
        """
        # Admin users have access to all endpoints
        if current_user.role == "admin":
            return current_user
            
        # Check if user has the required role
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required role: {required_role}"
            )
            
        return current_user
    
    return role_checker


def require_any_role(allowed_roles: List[str]) -> Callable:
    """
    Role-based access control decorator that allows multiple roles.
    
    Creates a dependency that checks if the current user has any of the allowed roles.
    Useful for endpoints that should be accessible to multiple role types.
    
    Args:
        allowed_roles: List of roles that can access the endpoint
        
    Returns:
        Dependency function that validates user role
        
    Example:
        @router.get("/analytics")
        def get_analytics(current_user: User = Depends(require_any_role(["teacher", "admin"]))):
            return {"message": "Analytics data"}
            
    Validates: Requirements 8.3
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        """
        Check if current user has any of the allowed roles.
        
        Args:
            current_user: User object from get_current_user dependency
            
        Returns:
            User object if authorized
            
        Raises:
            HTTPException: 403 Forbidden if user lacks any allowed role
        """
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Allowed roles: {', '.join(allowed_roles)}"
            )
            
        return current_user
    
    return role_checker


def require_teacher_or_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Convenience dependency for teacher/admin-only endpoints.
    
    This is a pre-configured dependency for the common case of endpoints
    that should be accessible to teachers and admins but not students.
    
    Args:
        current_user: User object from get_current_user dependency
        
    Returns:
        User object if user is teacher or admin
        
    Raises:
        HTTPException: 403 Forbidden if user is not teacher or admin
        
    Example:
        @router.get("/class/performance")
        def get_class_performance(current_user: User = Depends(require_teacher_or_admin)):
            return {"message": "Class performance data"}
            
    Validates: Requirements 8.3
    """
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is only accessible to teachers and administrators"
        )
    return current_user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency that ensures the user account is active.
    
    This can be extended in the future to check for account suspension,
    email verification, or other activation requirements.
    
    Args:
        current_user: User object from get_current_user dependency
        
    Returns:
        User object if account is active
        
    Raises:
        HTTPException: 403 Forbidden if account is inactive
    """
    # Future: Add account status checks here
    # For now, all authenticated users are considered active
    return current_user


def verify_token_payload(token: str) -> dict:
    """
    Verify and decode a JWT token without database lookup.
    
    Useful for token validation in contexts where database access is not needed.
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload dictionary
        
    Raises:
        HTTPException: 401 Unauthorized if token is invalid
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
