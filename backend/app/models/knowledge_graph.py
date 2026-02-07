from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Topic(Base):
    __tablename__ = "topics"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    parent_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    exam_weightage = Column(Float, nullable=False)  # 0-100
    estimated_hours = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    prerequisites = relationship(
        "TopicPrerequisite",
        foreign_keys="TopicPrerequisite.topic_id",
        back_populates="topic"
    )
    concepts = relationship("Concept", back_populates="topic")

class TopicPrerequisite(Base):
    __tablename__ = "topic_prerequisites"
    
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    prerequisite_topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    minimum_mastery = Column(Float, default=60.0)
    
    # Relationships
    topic = relationship("Topic", foreign_keys=[topic_id])
    prerequisite = relationship("Topic", foreign_keys=[prerequisite_topic_id])

class Concept(Base):
    __tablename__ = "concepts"
    
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # Relationships
    topic = relationship("Topic", back_populates="concepts")
    questions = relationship("Question", back_populates="concept")
    mastery_scores = relationship("ConceptMastery", back_populates="concept")

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    concept_id = Column(Integer, ForeignKey("concepts.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String, nullable=False)  # 'mcq', 'numerical', 'true_false'
    options = Column(JSON, nullable=True)  # For MCQ
    correct_answer = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)  # 'easy', 'medium', 'hard'
    expected_time_seconds = Column(Integer, default=120)
    
    # Relationships
    concept = relationship("Concept", back_populates="questions")
    attempts = relationship("QuestionAttempt", back_populates="question")
