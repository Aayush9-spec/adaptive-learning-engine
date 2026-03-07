"""
Data models for the Adaptive Learning Decision Engine.
These models represent the database schema for topics, prerequisites, and related entities.
"""

from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime


@dataclass
class Topic:
    """
    Represents a topic in the knowledge graph.
    
    Attributes:
        id: Unique identifier for the topic
        name: Name of the topic
        parent_id: ID of the parent topic (nullable for root topics)
        exam_weightage: Percentage of exam questions from this topic (0-100)
        estimated_hours: Estimated study time in hours
        description: Detailed description of the topic
        created_at: Timestamp when the topic was created
    """
    id: int
    name: str
    parent_id: Optional[int]
    exam_weightage: float
    estimated_hours: float
    description: str = ""
    created_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class TopicPrerequisite:
    """
    Represents a prerequisite relationship between topics.
    
    Attributes:
        id: Unique identifier for the prerequisite relationship
        topic_id: ID of the topic that has prerequisites
        prerequisite_topic_id: ID of the prerequisite topic
        minimum_mastery: Minimum mastery score required (default 60.0)
    """
    id: int
    topic_id: int
    prerequisite_topic_id: int
    minimum_mastery: float = 60.0


@dataclass
class TopicTree:
    """
    Represents a hierarchical tree structure of topics.
    
    Attributes:
        root_topics: List of root-level topics
        topic_map: Dictionary mapping topic IDs to Topic objects
    """
    root_topics: List[Topic]
    topic_map: dict = field(default_factory=dict)


@dataclass
class Concept:
    """
    Represents a concept within a topic.
    
    Attributes:
        id: Unique identifier for the concept
        topic_id: ID of the parent topic
        name: Name of the concept
        description: Detailed description of the concept
    """
    id: int
    topic_id: int
    name: str
    description: str = ""


@dataclass
class Question:
    """
    Represents a question for a specific concept.
    
    Attributes:
        id: Unique identifier for the question
        concept_id: ID of the concept this question tests
        question_text: The question text
        question_type: Type of question ('mcq', 'numerical', 'true_false')
        options: JSON object containing options for MCQ questions
        correct_answer: The correct answer
        difficulty: Difficulty level ('easy', 'medium', 'hard')
        expected_time_seconds: Expected time to solve in seconds
    """
    id: int
    concept_id: int
    question_text: str
    question_type: str  # 'mcq', 'numerical', 'true_false'
    options: Optional[dict]  # For MCQ: {"A": "option1", "B": "option2", ...}
    correct_answer: str
    difficulty: str  # 'easy', 'medium', 'hard'
    expected_time_seconds: int


@dataclass
class QuestionAttempt:
    """
    Represents a student's attempt at answering a question.
    
    Attributes:
        id: Unique identifier for the attempt
        student_id: ID of the student
        question_id: ID of the question
        answer: The student's answer
        is_correct: Whether the answer was correct
        time_taken_seconds: Time taken to answer in seconds
        confidence: Confidence level (1-5)
        timestamp: When the attempt was made
        synced: Whether this attempt has been synced to cloud
    """
    id: int
    student_id: int
    question_id: int
    answer: str
    is_correct: bool
    time_taken_seconds: float
    confidence: int  # 1-5
    timestamp: datetime = field(default_factory=datetime.utcnow)
    synced: bool = False
