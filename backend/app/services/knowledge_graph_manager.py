from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.knowledge_graph import Topic, Concept, TopicPrerequisite
from typing import List, Dict, Optional, Set
from collections import deque


class KnowledgeGraphManager:
    """Manage knowledge graph structure and dependencies"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_topic(
        self,
        name: str,
        exam_weightage: float,
        estimated_hours: float,
        prerequisite_ids: List[int] = None
    ) -> Topic:
        """
        Create a new topic with validation.
        
        Args:
            name: Topic name
            exam_weightage: Weightage in exam (0-100)
            estimated_hours: Estimated study time
            prerequisite_ids: List of prerequisite topic IDs
            
        Returns:
            Created Topic
            
        Raises:
            ValueError: If validation fails or circular dependency detected
        """
        # Validate weightage
        if not 0 <= exam_weightage <= 100:
            raise ValueError("Exam weightage must be between 0 and 100")
        
        # Validate estimated hours
        if estimated_hours <= 0:
            raise ValueError("Estimated hours must be positive")
        
        # Create topic
        topic = Topic(
            name=name,
            exam_weightage=exam_weightage,
            estimated_hours=estimated_hours
        )
        self.db.add(topic)
        self.db.flush()  # Get ID without committing
        
        # Add prerequisites
        if prerequisite_ids:
            for prereq_id in prerequisite_ids:
                # Check if prerequisite exists
                prereq = self.db.query(Topic).filter(Topic.id == prereq_id).first()
                if not prereq:
                    raise ValueError(f"Prerequisite topic {prereq_id} not found")
                
                # Check for circular dependency
                if self._would_create_cycle(topic.id, prereq_id):
                    raise ValueError(f"Adding prerequisite {prereq_id} would create circular dependency")
                
                prereq_rel = TopicPrerequisite(
                    topic_id=topic.id,
                    prerequisite_topic_id=prereq_id
                )
                self.db.add(prereq_rel)
        
        self.db.commit()
        self.db.refresh(topic)
        return topic
    
    def _would_create_cycle(self, topic_id: int, new_prereq_id: int) -> bool:
        """
        Check if adding a prerequisite would create a cycle using BFS.
        
        Args:
            topic_id: ID of the topic
            new_prereq_id: ID of the proposed prerequisite
            
        Returns:
            True if cycle would be created
        """
        # If new_prereq depends on topic_id (directly or transitively), it's a cycle
        visited = set()
        queue = deque([new_prereq_id])
        
        while queue:
            current = queue.popleft()
            if current in visited:
                continue
            visited.add(current)
            
            if current == topic_id:
                return True
            
            # Get prerequisites of current topic
            prereqs = self.db.query(TopicPrerequisite).filter(
                TopicPrerequisite.topic_id == current
            ).all()
            
            for prereq in prereqs:
                queue.append(prereq.prerequisite_topic_id)
        
        return False
    
    def get_topic_hierarchy(self) -> List[Dict]:
        """
        Get all topics with their prerequisite relationships.
        
        Returns:
            List of topics with prerequisite information
        """
        topics = self.db.query(Topic).all()
        result = []
        
        for topic in topics:
            prereqs = self.get_prerequisites(topic.id)
            result.append({
                "id": topic.id,
                "name": topic.name,
                "exam_weightage": topic.exam_weightage,
                "estimated_hours": topic.estimated_hours,
                "prerequisites": [p.id for p in prereqs]
            })
        
        return result
    
    def get_prerequisites(self, topic_id: int) -> List[Topic]:
        """
        Get direct prerequisites for a topic.
        
        Args:
            topic_id: ID of the topic
            
        Returns:
            List of prerequisite Topics
        """
        prereq_rels = self.db.query(TopicPrerequisite).filter(
            TopicPrerequisite.topic_id == topic_id
        ).all()
        
        prereqs = []
        for rel in prereq_rels:
            topic = self.db.query(Topic).filter(Topic.id == rel.prerequisite_topic_id).first()
            if topic:
                prereqs.append(topic)
        
        return prereqs
    
    def get_dependent_topics(self, topic_id: int) -> List[Topic]:
        """
        Get topics that depend on this topic.
        
        Args:
            topic_id: ID of the topic
            
        Returns:
            List of dependent Topics
        """
        dependent_rels = self.db.query(TopicPrerequisite).filter(
            TopicPrerequisite.prerequisite_topic_id == topic_id
        ).all()
        
        dependents = []
        for rel in dependent_rels:
            topic = self.db.query(Topic).filter(Topic.id == rel.topic_id).first()
            if topic:
                dependents.append(topic)
        
        return dependents
    
    def check_prerequisites_met(
        self,
        student_id: int,
        topic_id: int,
        mastery_threshold: float = 60.0
    ) -> bool:
        """
        Check if student has met prerequisites for a topic.
        
        Args:
            student_id: ID of the student
            topic_id: ID of the topic
            mastery_threshold: Minimum mastery score required
            
        Returns:
            True if all prerequisites are met
        """
        from app.models.performance import ConceptMastery
        
        prereqs = self.get_prerequisites(topic_id)
        
        for prereq in prereqs:
            # Get all concepts for prerequisite topic
            concepts = self.db.query(Concept).filter(Concept.topic_id == prereq.id).all()
            
            # Check if all concepts have sufficient mastery
            for concept in concepts:
                mastery = self.db.query(ConceptMastery).filter(
                    and_(
                        ConceptMastery.student_id == student_id,
                        ConceptMastery.concept_id == concept.id
                    )
                ).first()
                
                if not mastery or mastery.mastery_score < mastery_threshold:
                    return False
        
        return True
    
    def get_unlockable_topics(
        self,
        student_id: int,
        mastery_threshold: float = 60.0
    ) -> List[Dict]:
        """
        Get topics that student can now study (prerequisites met).
        
        Args:
            student_id: ID of the student
            mastery_threshold: Minimum mastery score for prerequisites
            
        Returns:
            List of unlockable topics with details
        """
        from app.models.performance import ConceptMastery
        
        all_topics = self.db.query(Topic).all()
        unlockable = []
        
        for topic in all_topics:
            # Check if student has already mastered this topic
            concepts = self.db.query(Concept).filter(Concept.topic_id == topic.id).all()
            
            if not concepts:
                continue
            
            # Check average mastery for this topic
            mastery_scores = []
            for concept in concepts:
                mastery = self.db.query(ConceptMastery).filter(
                    and_(
                        ConceptMastery.student_id == student_id,
                        ConceptMastery.concept_id == concept.id
                    )
                ).first()
                
                if mastery:
                    mastery_scores.append(mastery.mastery_score)
            
            # If topic is already mastered, skip
            if mastery_scores and sum(mastery_scores) / len(mastery_scores) >= mastery_threshold:
                continue
            
            # Check if prerequisites are met
            if self.check_prerequisites_met(student_id, topic.id, mastery_threshold):
                unlockable.append({
                    "id": topic.id,
                    "name": topic.name,
                    "exam_weightage": topic.exam_weightage,
                    "estimated_hours": topic.estimated_hours,
                    "current_mastery": sum(mastery_scores) / len(mastery_scores) if mastery_scores else 0
                })
        
        return unlockable
