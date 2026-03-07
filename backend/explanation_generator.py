"""
Explanation Generator for Adaptive Learning System.

This module generates human-readable explanations for study recommendations,
ensuring students understand why each topic is recommended.
"""

from typing import Dict, Any, Optional


class ExplanationGenerator:
    """
    Generates human-readable explanations for study recommendations.
    
    Ensures all formula components are visible and explanations follow
    a consistent template format.
    """
    
    def __init__(self, decision_engine=None):
        """
        Initialize the explanation generator.
        
        Args:
            decision_engine: Optional DecisionEngine instance for accessing data
        """
        self.decision_engine = decision_engine
    
    def generate_explanation(
        self,
        student_id: str,
        topic_id: str,
        priority_score: float,
        topic_name: str = None,
        exam_weightage: float = None,
        current_accuracy: float = None,
        mastery_score: float = None,
        dependencies_unlocked: int = None,
        estimated_hours: float = None,
        expected_marks_gain: float = None
    ) -> str:
        """
        Generate a complete explanation for a recommendation.
        
        Args:
            student_id: Student identifier
            topic_id: Topic identifier
            priority_score: Computed priority score
            topic_name: Name of the topic (optional, will fetch if not provided)
            exam_weightage: Exam weightage percentage (optional)
            current_accuracy: Current accuracy percentage (optional)
            mastery_score: Mastery score 0-100 (optional)
            dependencies_unlocked: Number of topics unlocked (optional)
            estimated_hours: Estimated study time (optional)
            expected_marks_gain: Expected marks improvement (optional)
            
        Returns:
            Human-readable explanation string
        """
        # If decision engine is available and data not provided, fetch it
        if self.decision_engine:
            explanation_obj = self.decision_engine.explain_recommendation(
                student_id, topic_id
            )
            if explanation_obj:
                # Use provided values or fall back to fetched values
                topic_name = topic_name or topic_id
                exam_weightage = exam_weightage if exam_weightage is not None else explanation_obj.exam_weightage
                current_accuracy = current_accuracy if current_accuracy is not None else explanation_obj.current_accuracy
                mastery_score = mastery_score if mastery_score is not None else explanation_obj.mastery_score
                dependencies_unlocked = dependencies_unlocked if dependencies_unlocked is not None else explanation_obj.dependencies_unlocked
                
                # Calculate expected marks gain if not provided
                if expected_marks_gain is None:
                    improvement_potential = (100 - mastery_score) * 0.1
                    expected_marks_gain = (exam_weightage / 100.0) * improvement_potential
        
        # Use defaults if still not available
        topic_name = topic_name or topic_id
        exam_weightage = exam_weightage if exam_weightage is not None else 5.0
        current_accuracy = current_accuracy if current_accuracy is not None else 0.0
        mastery_score = mastery_score if mastery_score is not None else 0.0
        dependencies_unlocked = dependencies_unlocked if dependencies_unlocked is not None else 0
        estimated_hours = estimated_hours if estimated_hours is not None else 2.0
        expected_marks_gain = expected_marks_gain if expected_marks_gain is not None else 0.0
        
        # Generate explanation using template
        explanation = self.format_reasoning(
            topic_name=topic_name,
            exam_weightage=exam_weightage,
            accuracy=current_accuracy,
            dependencies=dependencies_unlocked,
            marks_gain=expected_marks_gain,
            hours=estimated_hours
        )
        
        return explanation
    
    def format_reasoning(
        self,
        topic_name: str,
        exam_weightage: float,
        accuracy: float,
        dependencies: int,
        marks_gain: float,
        hours: float
    ) -> str:
        """
        Format reasoning using the standard template.
        
        Template:
        "Study {topic_name} because:
        • {exam_weightage}% of exam questions come from this topic
        • Your current accuracy is {accuracy}% (needs improvement)
        • Mastering this unlocks {dependencies} future chapters
        • Expected improvement: +{marks_gain} marks
        • Estimated study time: {hours} hours"
        
        Args:
            topic_name: Name of the topic
            exam_weightage: Percentage of exam from this topic
            accuracy: Current accuracy percentage
            dependencies: Number of topics unlocked
            marks_gain: Expected marks improvement
            hours: Estimated study time in hours
            
        Returns:
            Formatted explanation string
        """
        # Determine if accuracy needs improvement
        accuracy_note = "needs improvement" if accuracy < 70 else "can be improved"
        
        explanation = (
            f"Study {topic_name} because:\n"
            f"• {exam_weightage:.1f}% of exam questions come from this topic\n"
            f"• Your current accuracy is {accuracy:.1f}% ({accuracy_note})\n"
            f"• Mastering this unlocks {dependencies} future chapters\n"
            f"• Expected improvement: +{marks_gain:.1f} marks\n"
            f"• Estimated study time: {hours:.1f} hours"
        )
        
        return explanation
    
    def generate_explanation_dict(
        self,
        student_id: str,
        topic_id: str,
        priority_score: float,
        topic_name: str = None,
        exam_weightage: float = None,
        current_accuracy: float = None,
        mastery_score: float = None,
        dependencies_unlocked: int = None,
        estimated_hours: float = None,
        expected_marks_gain: float = None,
        weakness_score: float = None
    ) -> Dict[str, Any]:
        """
        Generate explanation as a structured dictionary.
        
        This includes all formula components for transparency.
        
        Args:
            student_id: Student identifier
            topic_id: Topic identifier
            priority_score: Computed priority score
            topic_name: Name of the topic (optional)
            exam_weightage: Exam weightage percentage (optional)
            current_accuracy: Current accuracy percentage (optional)
            mastery_score: Mastery score 0-100 (optional)
            dependencies_unlocked: Number of topics unlocked (optional)
            estimated_hours: Estimated study time (optional)
            expected_marks_gain: Expected marks improvement (optional)
            weakness_score: Computed weakness score (optional)
            
        Returns:
            Dictionary with all explanation components
        """
        # Generate text explanation
        text_explanation = self.generate_explanation(
            student_id=student_id,
            topic_id=topic_id,
            priority_score=priority_score,
            topic_name=topic_name,
            exam_weightage=exam_weightage,
            current_accuracy=current_accuracy,
            mastery_score=mastery_score,
            dependencies_unlocked=dependencies_unlocked,
            estimated_hours=estimated_hours,
            expected_marks_gain=expected_marks_gain
        )
        
        # If decision engine available, get full explanation object
        if self.decision_engine:
            explanation_obj = self.decision_engine.explain_recommendation(
                student_id, topic_id
            )
            if explanation_obj:
                exam_weightage = exam_weightage if exam_weightage is not None else explanation_obj.exam_weightage
                current_accuracy = current_accuracy if current_accuracy is not None else explanation_obj.current_accuracy
                mastery_score = mastery_score if mastery_score is not None else explanation_obj.mastery_score
                dependencies_unlocked = dependencies_unlocked if dependencies_unlocked is not None else explanation_obj.dependencies_unlocked
                weakness_score = weakness_score if weakness_score is not None else explanation_obj.weakness_score
        
        # Build structured explanation
        return {
            "topic_id": topic_id,
            "topic_name": topic_name or topic_id,
            "priority_score": round(priority_score, 2),
            "formula_components": {
                "exam_weightage": round(exam_weightage or 0, 2),
                "current_accuracy": round(current_accuracy or 0, 2),
                "mastery_score": round(mastery_score or 0, 2),
                "dependencies_unlocked": dependencies_unlocked or 0,
                "weakness_score": round(weakness_score or 0, 2),
                "estimated_hours": round(estimated_hours or 0, 2),
                "expected_marks_gain": round(expected_marks_gain or 0, 2)
            },
            "reasoning_text": text_explanation
        }
