from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.knowledge_graph import Topic, Concept
from app.models.performance import ConceptMastery
from app.models.user import StudentProfile
from app.services.knowledge_graph_manager import KnowledgeGraphManager
from typing import Dict, List, Optional, Tuple
from functools import lru_cache
from datetime import datetime, timedelta, date


class DecisionEngine:
    """Core recommendation algorithm"""
    
    def __init__(self, db: Session):
        self.db = db
        self.kg_manager = KnowledgeGraphManager(db)
    
    def compute_priority_score(
        self,
        student_id: int,
        topic_id: int,
        current_mastery: float,
        exam_weightage: float,
        time_to_exam_days: int,
        estimated_hours: float
    ) -> float:
        """
        Compute priority score using the formula:
        
        priority_score = (
            0.4 * (100 - current_mastery) +
            0.3 * exam_weightage +
            0.2 * urgency_factor +
            0.1 * efficiency_factor
        )
        
        where:
        - urgency_factor = 100 * (1 - days_to_exam / 365)
        - efficiency_factor = 100 * (1 / estimated_hours)
        
        Args:
            student_id: ID of the student
            topic_id: ID of the topic
            current_mastery: Current mastery score (0-100)
            exam_weightage: Exam weightage (0-100)
            time_to_exam_days: Days until exam
            estimated_hours: Estimated study time
            
        Returns:
            Priority score (0-100)
        """
        # Mastery gap (higher gap = higher priority)
        mastery_gap = 100 - current_mastery
        
        # Urgency factor (closer to exam = higher urgency)
        urgency_factor = 100 * (1 - min(time_to_exam_days, 365) / 365)
        
        # Efficiency factor (less time needed = higher efficiency)
        efficiency_factor = 100 * (1 / max(estimated_hours, 0.5))
        efficiency_factor = min(efficiency_factor, 100)  # Cap at 100
        
        # Compute weighted priority score
        priority_score = (
            0.4 * mastery_gap +
            0.3 * exam_weightage +
            0.2 * urgency_factor +
            0.1 * efficiency_factor
        )
        
        return priority_score
    
    def get_next_recommendation(
        self,
        student_id: int,
        mastery_threshold: float = 60.0
    ) -> Optional[Dict]:
        """
        Get the highest priority topic recommendation.
        
        Args:
            student_id: ID of the student
            mastery_threshold: Minimum mastery for prerequisites
            
        Returns:
            Recommended topic with details, or None if no topics available
        """
        recommendations = self.get_top_n_recommendations(student_id, n=1, mastery_threshold=mastery_threshold)
        return recommendations[0] if recommendations else None
    
    def get_top_n_recommendations(
        self,
        student_id: int,
        n: int = 5,
        mastery_threshold: float = 60.0
    ) -> List[Dict]:
        """
        Get top N topic recommendations sorted by priority.
        
        Args:
            student_id: ID of the student
            n: Number of recommendations
            mastery_threshold: Minimum mastery for prerequisites
            
        Returns:
            List of recommended topics with priority scores
        """
        # Get student profile
        student = self.db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
        if not student:
            return []
        
        # Calculate days to exam
        if student.exam_date:
            # Convert to date if it's a datetime
            if hasattr(student.exam_date, 'date'):
                exam_date = student.exam_date.date()
            else:
                exam_date = student.exam_date
            time_to_exam_days = (exam_date - datetime.utcnow().date()).days
        else:
            time_to_exam_days = 180  # Default 6 months
        
        # Get unlockable topics
        unlockable = self.kg_manager.get_unlockable_topics(student_id, mastery_threshold)
        
        # Compute priority scores
        scored_topics = []
        for topic_data in unlockable:
            priority_score = self.compute_priority_score(
                student_id=student_id,
                topic_id=topic_data["id"],
                current_mastery=topic_data["current_mastery"],
                exam_weightage=topic_data["exam_weightage"],
                time_to_exam_days=time_to_exam_days,
                estimated_hours=topic_data["estimated_hours"]
            )
            
            scored_topics.append({
                "topic_id": topic_data["id"],
                "topic_name": topic_data["name"],
                "priority_score": priority_score,
                "current_mastery": topic_data["current_mastery"],
                "exam_weightage": topic_data["exam_weightage"],
                "estimated_hours": topic_data["estimated_hours"],
                "expected_marks_gain": (100 - topic_data["current_mastery"]) * topic_data["exam_weightage"] / 100
            })
        
        # Sort by priority score (descending) - deterministic
        scored_topics.sort(key=lambda x: (-x["priority_score"], x["topic_id"]))
        
        return scored_topics[:n]
    
    def get_concept_recommendations(
        self,
        student_id: int,
        topic_id: int,
        n: int = 5
    ) -> List[Dict]:
        """
        Get concept-level recommendations within a topic.
        
        Args:
            student_id: ID of the student
            topic_id: ID of the topic
            n: Number of concepts to recommend
            
        Returns:
            List of recommended concepts
        """
        # Get all concepts for the topic
        concepts = self.db.query(Concept).filter(Concept.topic_id == topic_id).all()
        
        scored_concepts = []
        for concept in concepts:
            # Get mastery score
            mastery = self.db.query(ConceptMastery).filter(
                and_(
                    ConceptMastery.student_id == student_id,
                    ConceptMastery.concept_id == concept.id
                )
            ).first()
            
            current_mastery = mastery.mastery_score if mastery else 0.0
            
            # Simple priority: focus on concepts with lowest mastery
            priority = 100 - current_mastery
            
            scored_concepts.append({
                "concept_id": concept.id,
                "concept_name": concept.name,
                "current_mastery": current_mastery,
                "priority": priority
            })
        
        # Sort by priority (descending)
        scored_concepts.sort(key=lambda x: (-x["priority"], x["concept_id"]))
        
        return scored_concepts[:n]


class ExplanationGenerator:
    """Generate human-readable explanations for recommendations"""
    
    def __init__(self, db: Session):
        self.db = db
        self.decision_engine = DecisionEngine(db)
    
    def generate_explanation(
        self,
        student_id: int,
        topic_id: int
    ) -> Dict:
        """
        Generate detailed explanation for why a topic is recommended.
        
        Args:
            student_id: ID of the student
            topic_id: ID of the topic
            
        Returns:
            Explanation with all formula components
        """
        # Get topic
        topic = self.db.query(Topic).filter(Topic.id == topic_id).first()
        if not topic:
            return {"error": "Topic not found"}
        
        # Get student
        student = self.db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
        if not student:
            return {"error": "Student not found"}
        
        # Get current mastery
        concepts = self.db.query(Concept).filter(Concept.topic_id == topic_id).all()
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
        
        current_mastery = sum(mastery_scores) / len(mastery_scores) if mastery_scores else 0.0
        
        # Calculate time to exam
        if student.exam_date:
            # Convert to date if it's a datetime
            if hasattr(student.exam_date, 'date'):
                exam_date = student.exam_date.date()
            else:
                exam_date = student.exam_date
            time_to_exam_days = (exam_date - datetime.utcnow().date()).days
        else:
            time_to_exam_days = 180
        
        # Compute priority score and components
        mastery_gap = 100 - current_mastery
        urgency_factor = 100 * (1 - min(time_to_exam_days, 365) / 365)
        efficiency_factor = 100 * (1 / max(topic.estimated_hours, 0.5))
        efficiency_factor = min(efficiency_factor, 100)
        
        priority_score = self.decision_engine.compute_priority_score(
            student_id=student_id,
            topic_id=topic_id,
            current_mastery=current_mastery,
            exam_weightage=topic.exam_weightage,
            time_to_exam_days=time_to_exam_days,
            estimated_hours=topic.estimated_hours
        )
        
        # Generate explanation
        explanation = self.format_reasoning(
            topic_name=topic.name,
            priority_score=priority_score,
            mastery_gap=mastery_gap,
            current_mastery=current_mastery,
            exam_weightage=topic.exam_weightage,
            urgency_factor=urgency_factor,
            time_to_exam_days=time_to_exam_days,
            efficiency_factor=efficiency_factor,
            estimated_hours=topic.estimated_hours
        )
        
        return {
            "topic_id": topic_id,
            "topic_name": topic.name,
            "priority_score": round(priority_score, 2),
            "explanation": explanation,
            "components": {
                "mastery_gap": round(mastery_gap, 2),
                "current_mastery": round(current_mastery, 2),
                "exam_weightage": topic.exam_weightage,
                "urgency_factor": round(urgency_factor, 2),
                "time_to_exam_days": time_to_exam_days,
                "efficiency_factor": round(efficiency_factor, 2),
                "estimated_hours": topic.estimated_hours
            }
        }
    
    def format_reasoning(
        self,
        topic_name: str,
        priority_score: float,
        mastery_gap: float,
        current_mastery: float,
        exam_weightage: float,
        urgency_factor: float,
        time_to_exam_days: int,
        efficiency_factor: float,
        estimated_hours: float
    ) -> str:
        """
        Format explanation using template.
        
        Returns:
            Human-readable explanation string
        """
        explanation = f"""
**Why study {topic_name} now?**

**Priority Score: {priority_score:.1f}/100**

This topic is recommended based on:

1. **Mastery Gap (40% weight)**: You currently have {current_mastery:.1f}% mastery, leaving a gap of {mastery_gap:.1f}%. Improving this will significantly boost your overall performance.

2. **Exam Importance (30% weight)**: This topic carries {exam_weightage:.1f}% weightage in your exam, making it crucial for your final score.

3. **Urgency (20% weight)**: With {time_to_exam_days} days until your exam, the urgency factor is {urgency_factor:.1f}/100. {
    "Time is running out - prioritize this now!" if urgency_factor > 70 else
    "You have moderate time to prepare." if urgency_factor > 40 else
    "You have ample time to master this topic."
}

4. **Efficiency (10% weight)**: This topic requires approximately {estimated_hours:.1f} hours of study (efficiency factor: {efficiency_factor:.1f}/100). {
    "Quick to master!" if estimated_hours < 3 else
    "Moderate time investment needed." if estimated_hours < 8 else
    "Requires significant time commitment."
}

**Expected Impact**: Mastering this topic could improve your exam score by approximately {(mastery_gap * exam_weightage / 100):.1f} marks.
        """.strip()
        
        return explanation
