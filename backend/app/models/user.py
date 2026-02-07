from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'student', 'teacher', 'admin'
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False)

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    grade = Column(Integer, nullable=False)
    target_exam = Column(String, nullable=False)
    exam_date = Column(DateTime, nullable=True)
    available_hours_per_day = Column(Float, default=3.0)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="student_profile")
    attempts = relationship("QuestionAttempt", back_populates="student")
    mastery_scores = relationship("ConceptMastery", back_populates="student")
    study_plans = relationship("StudyPlan", back_populates="student")

class Class(Base):
    __tablename__ = "classes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    grade = Column(Integer, nullable=False)
    
    students = relationship("StudentProfile", backref="class_obj")
