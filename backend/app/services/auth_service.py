"""
Authentication Service

Handles user authentication, authorization, and session management.
Implements password hashing with bcrypt and JWT token generation.
"""

from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.models.user import User, StudentProfile
from app.core.config import settings

# Password hashing context with bcrypt (salt rounds = 12)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


class AuthService:
    """
    Authentication service for user management and JWT token handling.
    
    Features:
    - Password hashing with bcrypt (12 salt rounds)
    - JWT token generation with 24-hour expiration
    - Role-based access control (student, teacher, admin)
    - User registration with role assignment
    """
    
    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hash a password using bcrypt with 12 salt rounds.
        
        Args:
            password: Plain text password to hash
            
        Returns:
            Hashed password string
        """
        return pwd_context.hash(password)
    
    @staticmethod
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
    
    @staticmethod
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
            # Default: 24 hours expiration
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str, db: Session) -> Optional[User]:
        """
        Verify a JWT token and return the associated user.
        
        Args:
            token: JWT token string to verify
            db: Database session
            
        Returns:
            User object if token is valid, None otherwise
        """
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            username: str = payload.get("sub")
            
            if username is None:
                return None
            
            user = db.query(User).filter(User.username == username).first()
            return user
            
        except JWTError:
            return None
    
    @staticmethod
    def register_user(
        db: Session,
        username: str,
        password: str,
        role: str,
        grade: Optional[int] = None,
        target_exam: Optional[str] = None,
        exam_date: Optional[datetime] = None,
        available_hours_per_day: Optional[float] = 3.0
    ) -> User:
        """
        Register a new user with role assignment.
        
        Args:
            db: Database session
            username: Unique username
            password: Plain text password (will be hashed)
            role: User role ('student', 'teacher', or 'admin')
            grade: Student grade (required for students)
            target_exam: Target exam name (required for students)
            exam_date: Exam date (optional for students)
            available_hours_per_day: Available study hours per day (for students)
            
        Returns:
            Created User object
            
        Raises:
            ValueError: If username already exists or validation fails
        """
        # Validate role
        if role not in ['student', 'teacher', 'admin']:
            raise ValueError(f"Invalid role: {role}. Must be 'student', 'teacher', or 'admin'")
        
        # Check if username already exists
        existing_user = db.query(User).filter(User.username == username).first()
        if existing_user:
            raise ValueError(f"Username '{username}' already exists")
        
        # Validate password
        if not password or len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")
        
        # Hash password
        password_hash = AuthService.hash_password(password)
        
        # Create user
        user = User(
            username=username,
            password_hash=password_hash,
            role=role,
            created_at=datetime.utcnow()
        )
        
        db.add(user)
        db.flush()  # Flush to get user.id
        
        # Create student profile if role is student
        if role == 'student':
            if grade is None or target_exam is None:
                raise ValueError("Grade and target_exam are required for student role")
            
            student_profile = StudentProfile(
                user_id=user.id,
                grade=grade,
                target_exam=target_exam,
                exam_date=exam_date,
                available_hours_per_day=available_hours_per_day
            )
            db.add(student_profile)
        
        db.commit()
        db.refresh(user)
        
        return user
    
    @staticmethod
    def login(db: Session, username: str, password: str) -> Optional[dict]:
        """
        Authenticate a user and generate JWT token.
        
        Args:
            db: Database session
            username: Username
            password: Plain text password
            
        Returns:
            Dictionary with access_token, token_type, and user info if successful,
            None if authentication fails
        """
        # Find user
        user = db.query(User).filter(User.username == username).first()
        
        if not user:
            return None
        
        # Verify password
        if not AuthService.verify_password(password, user.password_hash):
            return None
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        
        # Create access token
        access_token = AuthService.create_access_token(
            data={"sub": user.username, "role": user.role}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role
            }
        }
    
    @staticmethod
    def logout(token: str, db: Session) -> bool:
        """
        Logout a user by invalidating their token.
        
        Note: In a stateless JWT system, logout is typically handled client-side
        by removing the token. This method is provided for consistency but
        doesn't actually invalidate the token server-side unless a token
        blacklist is implemented.
        
        Args:
            token: JWT token to invalidate
            db: Database session
            
        Returns:
            True if logout successful, False otherwise
        """
        # Verify token is valid
        user = AuthService.verify_token(token, db)
        
        if user is None:
            return False
        
        # In a production system, you might want to:
        # 1. Add token to a blacklist in Redis
        # 2. Store token revocation in database
        # 3. Use shorter token expiration times
        
        # For now, we just verify the token exists and return True
        # The client should remove the token from storage
        return True
