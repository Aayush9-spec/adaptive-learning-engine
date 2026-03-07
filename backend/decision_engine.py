"""
Decision Engine for Adaptive Learning System.

This module implements the core recommendation algorithm that determines
the optimal next topic for a student to study based on exam weightage,
student weakness, dependency unlocking potential, and time cost.
"""

from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from datetime import datetime
from functools import lru_cache
import time


@dataclass
class Recommendation:
    """
    Represents a study recommendation for a student.
    
    Attributes:
        topic_id: Unique identifier for the recommended topic
        topic_name: Name of the topic
        priority_score: Computed priority score
        expected_marks_gain: Expected improvement in marks
        estimated_study_hours: Time required to master the topic
        explanation: Detailed explanation of why this topic was recommended
    """
    topic_id: str
    topic_name: str
    priority_score: float
    expected_marks_gain: float
    estimated_study_hours: float
    explanation: Dict[str, Any]


@dataclass
class Explanation:
    """
    Detailed explanation for a recommendation.
    
    Attributes:
        exam_weightage: Percentage of exam from this topic
        current_accuracy: Student's current accuracy percentage
        mastery_score: Student's mastery score (0-100)
        dependencies_unlocked: Number of topics unlocked by mastering this
        weakness_score: Computed weakness score
        reasoning_text: Human-readable explanation
    """
    exam_weightage: float
    current_accuracy: float
    mastery_score: float
    dependencies_unlocked: int
    weakness_score: float
    reasoning_text: str


class DecisionEngine:
    """
    Core decision engine that computes study recommendations.
    
    The engine uses a priority score formula to rank topics:
    Priority_Score = (Exam_Weightage × Importance_Factor) / 
                     (Weakness_Score × Dependency_Factor × Mastery_Level × Time_Cost)
    """
    
    def __init__(self, concepts_table, progress_table, student_profiles_table=None):
        """
        Initialize the decision engine.
        
        Args:
            concepts_table: DynamoDB table for concept/topic data
            progress_table: DynamoDB table for student progress
            student_profiles_table: Optional DynamoDB table for student profiles
        """
        self.concepts_table = concepts_table
        self.progress_table = progress_table
        self.student_profiles_table = student_profiles_table
        self._cache = {}
        self._cache_ttl = 300  # 5 minutes in seconds
    
    def _get_cached(self, key: str) -> Optional[Any]:
        """Get cached value if not expired."""
        if key in self._cache:
            value, timestamp = self._cache[key]
            if time.time() - timestamp < self._cache_ttl:
                return value
            else:
                del self._cache[key]
        return None
    
    def _set_cached(self, key: str, value: Any) -> None:
        """Set cached value with current timestamp."""
        self._cache[key] = (value, time.time())
    
    def _get_student_mastery(self, student_id: str, concept_id: str) -> float:
        """
        Get mastery score for a student-concept pair with caching.
        
        Args:
            student_id: Student identifier
            concept_id: Concept/topic identifier
            
        Returns:
            Mastery score (0-100)
        """
        cache_key = f"mastery:{student_id}:{concept_id}"
        cached = self._get_cached(cache_key)
        if cached is not None:
            return cached
        
        try:
            response = self.progress_table.get_item(
                Key={"user_id": student_id, "concept_id": concept_id}
            )
            item = response.get("Item", {})
            mastery = float(item.get("mastery_score", 0))
            self._set_cached(cache_key, mastery)
            return mastery
        except Exception:
            return 0.0
    
    def _get_concept_data(self, concept_id: str) -> Dict[str, Any]:
        """
        Get concept/topic data with caching.
        
        Args:
            concept_id: Concept identifier
            
        Returns:
            Dictionary with concept data
        """
        cache_key = f"concept:{concept_id}"
        cached = self._get_cached(cache_key)
        if cached is not None:
            return cached
        
        try:
            response = self.concepts_table.get_item(Key={"concept_id": concept_id})
            item = response.get("Item", {})
            self._set_cached(cache_key, item)
            return item
        except Exception:
            return {}
    
    def _get_student_profile(self, student_id: str) -> Dict[str, Any]:
        """
        Get student profile data.
        
        Args:
            student_id: Student identifier
            
        Returns:
            Dictionary with student profile data
        """
        if not self.student_profiles_table:
            return {"available_hours_per_day": 4.0, "exam_date": None}
        
        cache_key = f"profile:{student_id}"
        cached = self._get_cached(cache_key)
        if cached is not None:
            return cached
        
        try:
            response = self.student_profiles_table.get_item(Key={"user_id": student_id})
            item = response.get("Item", {})
            self._set_cached(cache_key, item)
            return item
        except Exception:
            return {"available_hours_per_day": 4.0, "exam_date": None}
    
    def _check_prerequisites_met(
        self, student_id: str, prerequisites: List[str], threshold: float = 60.0
    ) -> bool:
        """
        Check if all prerequisites meet the mastery threshold.
        
        Args:
            student_id: Student identifier
            prerequisites: List of prerequisite concept IDs
            threshold: Minimum mastery score required (default 60%)
            
        Returns:
            True if all prerequisites are met, False otherwise
        """
        if not prerequisites:
            return True
        
        for prereq_id in prerequisites:
            mastery = self._get_student_mastery(student_id, prereq_id)
            if mastery < threshold:
                return False
        return True
    
    def _count_dependencies(self, concept_id: str, all_concepts: List[Dict]) -> int:
        """
        Count how many topics would be unlocked by mastering this concept.
        
        Args:
            concept_id: Concept identifier
            all_concepts: List of all concept data
            
        Returns:
            Number of dependent topics
        """
        count = 0
        for concept in all_concepts:
            prerequisites = concept.get("prerequisites", [])
            if concept_id in prerequisites:
                count += 1
        return count
    
    def _get_days_until_exam(self, student_id: str) -> Optional[int]:
        """
        Calculate days until exam.
        
        Args:
            student_id: Student identifier
            
        Returns:
            Number of days until exam, or None if no exam date set
        """
        profile = self._get_student_profile(student_id)
        exam_date_str = profile.get("exam_date")
        
        if not exam_date_str:
            return None
        
        try:
            exam_date = datetime.fromisoformat(exam_date_str.replace("Z", "+00:00"))
            days = (exam_date - datetime.now()).days
            return max(0, days)
        except (ValueError, AttributeError):
            return None
    
    def compute_priority_score(self, student_id: str, topic_id: str) -> float:
        """
        Compute priority score for a topic using the decision engine formula.
        
        Formula:
        Priority_Score = (Exam_Weightage × Importance_Factor) / 
                         (Weakness_Score × Dependency_Factor × Mastery_Level × Time_Cost)
        
        where:
        - Exam_Weightage: percentage of exam from this topic (0-100)
        - Importance_Factor: 1.0 + (days_until_exam < 30 ? 0.5 : 0.0)
        - Weakness_Score: max(0.1, 1.0 - mastery_score/100)
        - Dependency_Factor: 1.0 / (1.0 + num_topics_unlocked)
        - Mastery_Level: max(0.1, mastery_score/100)
        - Time_Cost: estimated_hours / available_hours_per_day
        
        Args:
            student_id: Student identifier
            topic_id: Topic identifier
            
        Returns:
            Priority score (higher is better)
        """
        # Get concept data
        concept = self._get_concept_data(topic_id)
        if not concept:
            return 0.0
        
        # Get mastery score
        mastery_score = self._get_student_mastery(student_id, topic_id)
        
        # Get exam weightage (0-100)
        exam_weightage = float(concept.get("exam_weight", 5))
        
        # Calculate importance factor based on exam proximity
        days_until_exam = self._get_days_until_exam(student_id)
        importance_factor = 1.0
        if days_until_exam is not None and days_until_exam < 30:
            importance_factor = 1.5
        
        # Calculate weakness score: max(0.1, 1.0 - mastery_score/100)
        weakness_score = max(0.1, 1.0 - (mastery_score / 100.0))
        
        # Calculate dependency factor
        # First, get all concepts to count dependencies
        try:
            all_concepts_response = self.concepts_table.scan()
            all_concepts = all_concepts_response.get("Items", [])
        except Exception:
            all_concepts = []
        
        num_topics_unlocked = self._count_dependencies(topic_id, all_concepts)
        dependency_factor = 1.0 / (1.0 + num_topics_unlocked)
        
        # Calculate mastery level: max(0.1, mastery_score/100)
        mastery_level = max(0.1, mastery_score / 100.0)
        
        # Calculate time cost
        estimated_hours = float(concept.get("estimated_hours", 2.0))
        profile = self._get_student_profile(student_id)
        available_hours_per_day = float(profile.get("available_hours_per_day", 4.0))
        time_cost = estimated_hours / max(0.1, available_hours_per_day)
        
        # Compute priority score
        numerator = exam_weightage * importance_factor
        denominator = weakness_score * dependency_factor * mastery_level * time_cost
        
        priority_score = numerator / max(0.001, denominator)
        
        return round(priority_score, 2)
    
    def get_next_recommendation(self, student_id: str) -> Optional[Recommendation]:
        """
        Get the highest priority topic recommendation for a student.
        
        Args:
            student_id: Student identifier
            
        Returns:
            Recommendation object or None if no eligible topics
        """
        recommendations = self.get_top_n_recommendations(student_id, n=1)
        return recommendations[0] if recommendations else None
    
    def get_top_n_recommendations(
        self, student_id: str, n: int = 5
    ) -> List[Recommendation]:
        """
        Get top N topic recommendations sorted by priority score.
        
        Args:
            student_id: Student identifier
            n: Number of recommendations to return
            
        Returns:
            List of Recommendation objects sorted by priority (descending)
        """
        # Get all concepts
        try:
            response = self.concepts_table.scan()
            all_concepts = response.get("Items", [])
        except Exception:
            return []
        
        # Filter to eligible topics (prerequisites met)
        eligible_topics = []
        for concept in all_concepts:
            concept_id = concept.get("concept_id")
            if not concept_id:
                continue
            
            prerequisites = concept.get("prerequisites", [])
            if self._check_prerequisites_met(student_id, prerequisites):
                eligible_topics.append(concept)
        
        # Compute priority scores
        scored_topics = []
        for concept in eligible_topics:
            concept_id = concept.get("concept_id")
            priority_score = self.compute_priority_score(student_id, concept_id)
            
            if priority_score > 0:
                scored_topics.append((concept, priority_score))
        
        # Sort by priority score (descending)
        scored_topics.sort(key=lambda x: x[1], reverse=True)
        
        # Build recommendations
        recommendations = []
        for concept, priority_score in scored_topics[:n]:
            concept_id = concept.get("concept_id")
            concept_name = concept.get("topic", concept_id)
            
            # Calculate expected marks gain
            exam_weightage = float(concept.get("exam_weight", 5))
            mastery_score = self._get_student_mastery(student_id, concept_id)
            # Assume 10% improvement potential, scaled by current weakness
            improvement_potential = (100 - mastery_score) * 0.1
            expected_marks_gain = (exam_weightage / 100.0) * improvement_potential
            
            estimated_hours = float(concept.get("estimated_hours", 2.0))
            
            # Generate explanation
            explanation = self.explain_recommendation(student_id, concept_id)
            
            recommendation = Recommendation(
                topic_id=concept_id,
                topic_name=concept_name,
                priority_score=priority_score,
                expected_marks_gain=round(expected_marks_gain, 2),
                estimated_study_hours=estimated_hours,
                explanation=explanation.__dict__ if explanation else {}
            )
            recommendations.append(recommendation)
        
        return recommendations
    
    def explain_recommendation(
        self, student_id: str, topic_id: str
    ) -> Optional[Explanation]:
        """
        Generate detailed explanation for why a topic is recommended.
        
        Args:
            student_id: Student identifier
            topic_id: Topic identifier
            
        Returns:
            Explanation object with all formula components
        """
        concept = self._get_concept_data(topic_id)
        if not concept:
            return None
        
        # Get all data needed for explanation
        mastery_score = self._get_student_mastery(student_id, topic_id)
        exam_weightage = float(concept.get("exam_weight", 5))
        
        # Calculate current accuracy (simplified as mastery score)
        current_accuracy = mastery_score
        
        # Count dependencies
        try:
            all_concepts_response = self.concepts_table.scan()
            all_concepts = all_concepts_response.get("Items", [])
        except Exception:
            all_concepts = []
        
        dependencies_unlocked = self._count_dependencies(topic_id, all_concepts)
        
        # Calculate weakness score
        weakness_score = max(0.1, 1.0 - (mastery_score / 100.0))
        
        # Generate reasoning text
        concept_name = concept.get("topic", topic_id)
        estimated_hours = float(concept.get("estimated_hours", 2.0))
        
        # Calculate expected improvement
        improvement_potential = (100 - mastery_score) * 0.1
        expected_marks_gain = (exam_weightage / 100.0) * improvement_potential
        
        reasoning_text = (
            f"Study {concept_name} because:\n"
            f"• {exam_weightage}% of exam questions come from this topic\n"
            f"• Your current accuracy is {current_accuracy:.1f}% (needs improvement)\n"
            f"• Mastering this unlocks {dependencies_unlocked} future chapters\n"
            f"• Expected improvement: +{expected_marks_gain:.1f} marks\n"
            f"• Estimated study time: {estimated_hours} hours"
        )
        
        return Explanation(
            exam_weightage=exam_weightage,
            current_accuracy=current_accuracy,
            mastery_score=mastery_score,
            dependencies_unlocked=dependencies_unlocked,
            weakness_score=weakness_score,
            reasoning_text=reasoning_text
        )
