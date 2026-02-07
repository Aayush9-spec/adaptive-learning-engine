from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.knowledge_graph import Topic, TopicPrerequisite, Concept
from app.models.performance import ConceptMastery
from app.models.user import StudentProfile
import math

class DecisionEngine:
    """Core decision intelligence algorithm"""
    
    def __init__(self, db: Session):
        self.db = db
        self._cache = {}
        self._cache_ttl = 300  # 5 minutes
    
    def compute_priority_score(
        self,
        student_id: int,
        topic_id: int,
        exam_date: Optional[datetime] = None
    ) -> float:
        """
        Compute priority score using the formula:
        Priority_Score = (Exam_Weightage × Importance_Factor) / 
                         (Weakness_Score × Dependency_Factor × Mastery_Level × Time_Cost)
        """
        # Get topic
        topic = self.db.query(Topic).filter(Topic.id == topic_id).first()
        if not topic:
            return 0.0
        
        # Get student profile
        student = self.db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
        if not student:
            return 0.0
        
        # Calculate components
        exam_weightage = topic.exam_weightage
        importance_factor = self._calculate_importance_factor(exam_date)
        weakness_score = self._calculate_weakness_score(student_id, topic_id)
        dependency_factor = self._calculate_dependency_factor(topic_id)
        mastery_level = self._get_topic_mastery(student_id, topic_id)
        time_cost = self._calculate_time_cost(topic, student)
        
        # Compute priority score
        numerator = exam_weightage * importance_factor
        denominator = weakness_score * dependency_factor * mastery_level * time_cost
        
        priority_score = numerator / max(denominator, 0.01)  # Avoid division by zero
        
        return priority_score
    
    def get_next_recommendation(self, student_id: int) -> Optional[Dict]:
        """Get the highest priority topic recommendation"""
        # Get all topics where prerequisites are met
        eligible_topics = self._get_eligible_topics(student_id)
        
        if not eligible_topics:
            return None
        
        # Get student for exam date
        student = self.db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
        exam_date = student.exam_date if student else None
        
        # Compute priority scores
        topic_scores = []
        for topic in eligible_topics:
            score = self.compute_priority_score(student_id, topic.id, exam_date)
            topic_scores.append((topic, score))
        
        # Sort by priority score (descending)
        topic_scores.sort(key=lambda x: x[1], reverse=True)
        
        if not topic_scores:
            return None
        
        best_topic, best_score = topic_scores[0]
        
        # Generate explanation
        explanation = self._generate_explanation(student_id, best_topic, best_score)
        
        return {
            "topic_id": best_topic.id,
            "topic_name": best_topic.name,
            "priority_score": best_score,
            "expected_marks_gain": self._estimate_marks_gain(best_topic),
            "estimated_study_hours": best_topic.estimated_hours,
            "explanation": explanation
        }
    
    def get_top_n_recommendations(self, student_id: int, n: int = 5) -> List[Dict]:
        """Get top N recommendations"""
        eligible_topics = self._get_eligible_topics(student_id)
        
        if not eligible_topics:
            return []
        
        student = self.db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
        exam_date = student.exam_date if student else None
        
        topic_scores = []
        for topic in eligible_topics:
            score = self.compute_priority_score(student_id, topic.id, exam_date)
            explanation = self._generate_explanation(student_id, topic, score)
            topic_scores.append({
                "topic_id": topic.id,
                "topic_name": topic.name,
                "priority_score": score,
                "expected_marks_gain": self._estimate_marks_gain(topic),
                "estimated_study_hours": topic.estimated_hours,
                "explanation": explanation
            })
        
        topic_scores.sort(key=lambda x: x["priority_score"], reverse=True)
        return topic_scores[:n]
    
    def _get_eligible_topics(self, student_id: int) -> List[Topic]:
        """Get topics where prerequisites are met"""
        all_topics = self.db.query(Topic).all()
        eligible = []
        
        for topic in all_topics:
            if self._check_prerequisites_met(student_id, topic.id):
                eligible.append(topic)
        
        return eligible
    
    def _check_prerequisites_met(self, student_id: int, topic_id: int, threshold: float = 60.0) -> bool:
        """Check if all prerequisites for a topic are met"""
        prerequisites = self.db.query(TopicPrerequisite).filter(
            TopicPrerequisite.topic_id == topic_id
        ).all()
        
        for prereq in prerequisites:
            mastery = self._get_topic_mastery(student_id, prereq.prerequisite_topic_id)
            if mastery < prereq.minimum_mastery:
                return False
        
        return True
    
    def _get_topic_mastery(self, student_id: int, topic_id: int) -> float:
        """Get average mastery score for all concepts in a topic"""
        concepts = self.db.query(Concept).filter(Concept.topic_id == topic_id).all()
        
        if not concepts:
            return 0.0
        
        total_mastery = 0.0
        count = 0
        
        for concept in concepts:
            mastery = self.db.query(ConceptMastery).filter(
                ConceptMastery.student_id == student_id,
                ConceptMastery.concept_id == concept.id
            ).first()
            
            if mastery:
                total_mastery += mastery.mastery_score
                count += 1
        
        return total_mastery / count if count > 0 else 0.0
    
    def _calculate_importance_factor(self, exam_date: Optional[datetime]) -> float:
        """Calculate importance based on proximity to exam"""
        if not exam_date:
            return 1.0
        
        days_until_exam = (exam_date - datetime.utcnow()).days
        
        if days_until_exam < 30:
            return 1.5  # Boost importance if exam is soon
        
        return 1.0
    
    def _calculate_weakness_score(self, student_id: int, topic_id: int) -> float:
        """Calculate weakness score (inverse of mastery)"""
        mastery = self._get_topic_mastery(student_id, topic_id)
        weakness = max(0.1, 1.0 - mastery / 100.0)
        return weakness
    
    def _calculate_dependency_factor(self, topic_id: int) -> float:
        """Calculate how many topics this unlocks"""
        # Count topics that have this as a prerequisite
        dependent_count = self.db.query(TopicPrerequisite).filter(
            TopicPrerequisite.prerequisite_topic_id == topic_id
        ).count()
        
        return 1.0 / (1.0 + dependent_count)
    
    def _calculate_time_cost(self, topic: Topic, student: StudentProfile) -> float:
        """Calculate time cost relative to available time"""
        if student.available_hours_per_day <= 0:
            return 1.0
        
        time_cost = topic.estimated_hours / student.available_hours_per_day
        return max(0.1, time_cost)
    
    def _estimate_marks_gain(self, topic: Topic) -> float:
        """Estimate potential marks improvement"""
        # Simple estimation: weightage * improvement potential
        return topic.exam_weightage * 0.7  # Assume 70% improvement potential
    
    def _generate_explanation(self, student_id: int, topic: Topic, priority_score: float) -> str:
        """Generate human-readable explanation"""
        mastery = self._get_topic_mastery(student_id, topic.id)
        dependent_count = self.db.query(TopicPrerequisite).filter(
            TopicPrerequisite.prerequisite_topic_id == topic.id
        ).count()
        marks_gain = self._estimate_marks_gain(topic)
        
        explanation = f"""Study {topic.name} because:
• {topic.exam_weightage:.1f}% of exam questions come from this topic
• Your current mastery is {mastery:.1f}% (needs improvement)
• Mastering this unlocks {dependent_count} future chapters
• Expected improvement: +{marks_gain:.1f} marks
• Estimated study time: {topic.estimated_hours:.1f} hours
• Priority score: {priority_score:.2f}"""
        
        return explanation
