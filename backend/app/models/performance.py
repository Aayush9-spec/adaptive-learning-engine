from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class QuestionAttempt(Base):
    __tablename__ = "question_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False, index=True)
    answer = Column(String, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    time_taken_seconds = Column(Float, nullable=False)
    confidence = Column(Integer, nullable=False)  # 1-5
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    synced = Column(Boolean, default=False)
    
    # Relationships
    student = relationship("StudentProfile", back_populates="attempts")
    question = relationship("Question", back_populates="attempts")
    
    __table_args__ = (
        Index('idx_attempts_student_timestamp', 'student_id', 'timestamp'),
    )

class ConceptMastery(Base):
    __tablename__ = "concept_mastery"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False, index=True)
    concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=False, index=True)
    total_attempts = Column(Integer, default=0)
    correct_attempts = Column(Integer, default=0)
    avg_time_seconds = Column(Float, default=0.0)
    avg_confidence = Column(Float, default=0.0)
    mastery_score = Column(Float, default=0.0)  # 0-100
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    student = relationship("StudentProfile", back_populates="mastery_scores")
    concept = relationship("Concept", back_populates="mastery_scores")
    
    __table_args__ = (
        Index('idx_mastery_student_concept', 'student_id', 'concept_id', unique=True),
    )

class StudyPlan(Base):
    __tablename__ = "study_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    plan_type = Column(String, nullable=False)  # 'daily', 'weekly', 'exam_countdown'
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    topics = Column(String, nullable=False)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    student = relationship("StudentProfile", back_populates="study_plans")

class SyncOperation(Base):
    __tablename__ = "sync_operations"
    
    id = Column(Integer, primary_key=True, index=True)
    operation_type = Column(String, nullable=False)  # 'create', 'update', 'delete'
    table_name = Column(String, nullable=False)
    record_id = Column(Integer, nullable=False)
    data = Column(String, nullable=False)  # JSON string
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    synced = Column(Boolean, default=False, index=True)
    retry_count = Column(Integer, default=0)
    last_error = Column(String, nullable=True)
    
    __table_args__ = (
        Index('idx_sync_pending', 'synced', 'timestamp'),
    )
