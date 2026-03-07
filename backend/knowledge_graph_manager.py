"""
Knowledge Graph Manager for the Adaptive Learning Decision Engine.

This module manages the syllabus structure, prerequisites, and topic relationships.
It ensures the knowledge graph maintains a Directed Acyclic Graph (DAG) structure
to prevent circular dependencies.
"""

from typing import List, Optional, Dict, Set
from datetime import datetime
from models import Topic, TopicPrerequisite, TopicTree


class CircularDependencyError(Exception):
    """Raised when a circular dependency is detected in the knowledge graph."""
    pass


class InvalidWeightageError(Exception):
    """Raised when an invalid exam weightage value is provided."""
    pass


class InvalidStudyTimeError(Exception):
    """Raised when an invalid study time value is provided."""
    pass


class KnowledgeGraphManager:
    """
    Manages the knowledge graph of topics, prerequisites, and dependencies.
    
    The knowledge graph is represented as a Directed Acyclic Graph (DAG) where:
    - Nodes represent topics
    - Edges represent prerequisite relationships
    - Multiple levels of hierarchy are supported (Subject → Chapter → Topic → Concept)
    """
    
    def __init__(self, storage_backend=None):
        """
        Initialize the Knowledge Graph Manager.
        
        Args:
            storage_backend: Optional storage backend for persistence (DynamoDB, PostgreSQL, etc.)
        """
        self.storage = storage_backend
        self._topics: Dict[int, Topic] = {}
        self._prerequisites: Dict[int, List[int]] = {}  # topic_id -> list of prerequisite topic_ids
        self._dependents: Dict[int, List[int]] = {}  # topic_id -> list of dependent topic_ids
        self._prerequisite_thresholds: Dict[tuple, float] = {}  # (topic_id, prereq_id) -> threshold
    
    def create_topic(
        self,
        name: str,
        parent_id: Optional[int],
        prerequisites: List[int],
        weightage: float,
        estimated_hours: float,
        description: str = "",
        topic_id: Optional[int] = None
    ) -> Topic:
        """
        Create a new topic with validation.
        
        Args:
            name: Name of the topic
            parent_id: ID of the parent topic (None for root topics)
            prerequisites: List of prerequisite topic IDs
            weightage: Exam weightage as a percentage (0-100)
            estimated_hours: Estimated study time in hours
            description: Optional description of the topic
            topic_id: Optional topic ID (auto-generated if not provided)
        
        Returns:
            The created Topic object
        
        Raises:
            InvalidWeightageError: If weightage is not between 0 and 100
            InvalidStudyTimeError: If estimated_hours is not positive
            CircularDependencyError: If adding prerequisites would create a cycle
            ValueError: If parent_id or prerequisite IDs don't exist
        """
        # Validate weightage
        if not (0 <= weightage <= 100):
            raise InvalidWeightageError(
                f"Exam weightage must be between 0 and 100, got {weightage}"
            )
        
        # Validate study time
        if estimated_hours <= 0:
            raise InvalidStudyTimeError(
                f"Estimated study time must be positive, got {estimated_hours}"
            )
        
        # Validate parent exists if specified
        if parent_id is not None and parent_id not in self._topics:
            raise ValueError(f"Parent topic with ID {parent_id} does not exist")
        
        # Validate prerequisites exist
        for prereq_id in prerequisites:
            if prereq_id not in self._topics:
                raise ValueError(f"Prerequisite topic with ID {prereq_id} does not exist")
        
        # Generate topic ID if not provided
        if topic_id is None:
            topic_id = len(self._topics) + 1
        
        # Check for circular dependencies before creating
        if prerequisites:
            self._validate_no_cycles(topic_id, prerequisites)
        
        # Create the topic
        topic = Topic(
            id=topic_id,
            name=name,
            parent_id=parent_id,
            exam_weightage=weightage,
            estimated_hours=estimated_hours,
            description=description,
            created_at=datetime.utcnow()
        )
        
        # Store the topic
        self._topics[topic_id] = topic
        self._prerequisites[topic_id] = prerequisites.copy()
        
        # Update dependents mapping
        for prereq_id in prerequisites:
            if prereq_id not in self._dependents:
                self._dependents[prereq_id] = []
            self._dependents[prereq_id].append(topic_id)
        
        # Store prerequisite thresholds (default 60.0)
        for prereq_id in prerequisites:
            self._prerequisite_thresholds[(topic_id, prereq_id)] = 60.0
        
        # Persist to storage if available
        if self.storage:
            self.storage.save_topic(topic)
            for prereq_id in prerequisites:
                self.storage.save_prerequisite(topic_id, prereq_id, 60.0)
        
        return topic
    
    def _validate_no_cycles(self, topic_id: int, prerequisites: List[int]) -> None:
        """
        Validate that adding prerequisites won't create a cycle.
        
        Uses depth-first search to detect cycles.
        
        Args:
            topic_id: The topic that will have prerequisites
            prerequisites: List of prerequisite topic IDs
        
        Raises:
            CircularDependencyError: If a cycle would be created
        """
        # For each prerequisite, check if topic_id is reachable from it
        for prereq_id in prerequisites:
            if self._is_reachable(prereq_id, topic_id):
                raise CircularDependencyError(
                    f"Adding prerequisite {prereq_id} to topic {topic_id} would create a cycle"
                )
    
    def _is_reachable(self, start_id: int, target_id: int) -> bool:
        """
        Check if target_id is reachable from start_id following prerequisite edges.
        
        Args:
            start_id: Starting topic ID
            target_id: Target topic ID to reach
        
        Returns:
            True if target_id is reachable from start_id, False otherwise
        """
        # Don't consider a node reachable from itself at the start
        # We want to check if there's a path through dependencies
        if start_id == target_id:
            # Check if there's a cycle back to itself
            # by looking at dependents
            pass
        
        visited: Set[int] = set()
        stack = [start_id]
        
        while stack:
            current = stack.pop()
            if current in visited:
                continue
            visited.add(current)
            
            # Follow prerequisite edges (dependencies)
            if current in self._dependents:
                for dependent in self._dependents[current]:
                    if dependent == target_id:
                        return True
                    if dependent not in visited:
                        stack.append(dependent)
        
        return False
    
    def get_topic_hierarchy(self) -> TopicTree:
        """
        Get the complete topic hierarchy as a tree structure.
        
        Returns:
            TopicTree object containing root topics and topic map
        """
        root_topics = [
            topic for topic in self._topics.values()
            if topic.parent_id is None
        ]
        
        return TopicTree(
            root_topics=root_topics,
            topic_map=self._topics.copy()
        )
    
    def get_prerequisites(self, topic_id: int) -> List[Topic]:
        """
        Get all prerequisite topics for a given topic.
        
        Args:
            topic_id: ID of the topic
        
        Returns:
            List of prerequisite Topic objects
        
        Raises:
            ValueError: If topic_id doesn't exist
        """
        if topic_id not in self._topics:
            raise ValueError(f"Topic with ID {topic_id} does not exist")
        
        prereq_ids = self._prerequisites.get(topic_id, [])
        return [self._topics[prereq_id] for prereq_id in prereq_ids]
    
    def get_dependent_topics(self, topic_id: int) -> List[Topic]:
        """
        Get all topics that depend on the given topic (have it as a prerequisite).
        
        Args:
            topic_id: ID of the topic
        
        Returns:
            List of dependent Topic objects
        
        Raises:
            ValueError: If topic_id doesn't exist
        """
        if topic_id not in self._topics:
            raise ValueError(f"Topic with ID {topic_id} does not exist")
        
        dependent_ids = self._dependents.get(topic_id, [])
        return [self._topics[dep_id] for dep_id in dependent_ids]
    
    def check_prerequisites_met(
        self,
        student_id: int,
        topic_id: int,
        threshold: float = 60.0,
        mastery_lookup: Optional[Dict[int, float]] = None
    ) -> bool:
        """
        Check if a student has met all prerequisites for a topic.
        
        Args:
            student_id: ID of the student
            topic_id: ID of the topic
            threshold: Minimum mastery score required (default 60.0)
            mastery_lookup: Optional dict mapping topic_id to mastery score
        
        Returns:
            True if all prerequisites are met, False otherwise
        
        Raises:
            ValueError: If topic_id doesn't exist
        """
        if topic_id not in self._topics:
            raise ValueError(f"Topic with ID {topic_id} does not exist")
        
        prereq_ids = self._prerequisites.get(topic_id, [])
        
        # If no prerequisites, they're automatically met
        if not prereq_ids:
            return True
        
        # Get mastery scores
        if mastery_lookup is None:
            if self.storage:
                mastery_lookup = self.storage.get_student_mastery(student_id)
            else:
                # No storage and no mastery lookup provided
                return False
        
        # Check each prerequisite
        for prereq_id in prereq_ids:
            mastery = mastery_lookup.get(prereq_id, 0.0)
            prereq_threshold = self._prerequisite_thresholds.get(
                (topic_id, prereq_id), threshold
            )
            if mastery < prereq_threshold:
                return False
        
        return True
    
    def get_unlockable_topics(
        self,
        student_id: int,
        mastery_lookup: Optional[Dict[int, float]] = None
    ) -> List[Topic]:
        """
        Get all topics that are unlockable for a student.
        
        A topic is unlockable if:
        1. All its prerequisites are met (mastery >= threshold)
        2. The student hasn't already mastered it
        
        Args:
            student_id: ID of the student
            mastery_lookup: Optional dict mapping topic_id to mastery score
        
        Returns:
            List of unlockable Topic objects
        """
        # Get mastery scores
        if mastery_lookup is None:
            if self.storage:
                mastery_lookup = self.storage.get_student_mastery(student_id)
            else:
                mastery_lookup = {}
        
        unlockable = []
        
        for topic_id, topic in self._topics.items():
            # Skip if already mastered (>= 60%)
            if mastery_lookup.get(topic_id, 0.0) >= 60.0:
                continue
            
            # Check if prerequisites are met
            if self.check_prerequisites_met(student_id, topic_id, mastery_lookup=mastery_lookup):
                unlockable.append(topic)
        
        return unlockable
    
    def get_topic(self, topic_id: int) -> Optional[Topic]:
        """
        Get a topic by ID.
        
        Args:
            topic_id: ID of the topic
        
        Returns:
            Topic object or None if not found
        """
        return self._topics.get(topic_id)
    
    def get_all_topics(self) -> List[Topic]:
        """
        Get all topics in the knowledge graph.
        
        Returns:
            List of all Topic objects
        """
        return list(self._topics.values())
