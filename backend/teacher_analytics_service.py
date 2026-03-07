"""
Teacher Analytics Service for Adaptive Learning System.

This module provides class-wide analytics, identifies at-risk students,
predicts exam results, and generates performance comparisons.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
from datetime import datetime


@dataclass
class ClassPerformance:
    """
    Represents class-wide performance metrics.
    
    Attributes:
        class_id: Unique identifier for the class
        avg_mastery_by_topic: Dictionary mapping topic_id to average mastery score
        total_students: Total number of students in the class
        active_students: Number of students with recent activity
        total_attempts: Total question attempts by all students
    """
    class_id: str
    avg_mastery_by_topic: Dict[str, float]
    total_students: int
    active_students: int
    total_attempts: int


@dataclass
class TopicAnalysis:
    """
    Represents analysis of a specific topic's performance.
    
    Attributes:
        topic_id: Unique identifier for the topic
        topic_name: Name of the topic
        avg_mastery: Average mastery score for this topic
        students_below_threshold: Number of students below mastery threshold
        total_attempts: Total attempts on this topic
    """
    topic_id: str
    topic_name: str
    avg_mastery: float
    students_below_threshold: int
    total_attempts: int


@dataclass
class StudentRisk:
    """
    Represents a student's risk level based on performance.
    
    Attributes:
        student_id: Unique identifier for the student
        student_name: Name of the student
        risk_level: Risk level ('high', 'medium', 'low')
        weak_topics: List of topic IDs where student is weak
        avg_mastery: Average mastery score across all topics
    """
    student_id: str
    student_name: str
    risk_level: str
    weak_topics: List[str]
    avg_mastery: float


@dataclass
class ExamPrediction:
    """
    Represents predicted exam results for a class.
    
    Attributes:
        class_id: Unique identifier for the class
        predicted_avg_score: Predicted average exam score (0-100)
        student_predictions: Dictionary mapping student_id to predicted score
        confidence_level: Confidence level of prediction ('high', 'medium', 'low')
    """
    class_id: str
    predicted_avg_score: float
    student_predictions: Dict[str, float]
    confidence_level: str


@dataclass
class Comparison:
    """
    Represents comparison of a student with class average.
    
    Attributes:
        student_id: Unique identifier for the student
        class_id: Unique identifier for the class
        student_avg_mastery: Student's average mastery score
        class_avg_mastery: Class average mastery score
        topics_above_average: List of topic IDs where student is above average
        topics_below_average: List of topic IDs where student is below average
    """
    student_id: str
    class_id: str
    student_avg_mastery: float
    class_avg_mastery: float
    topics_above_average: List[str]
    topics_below_average: List[str]


class TeacherAnalyticsService:
    """
    Provides analytics and insights for teachers to monitor class performance.
    
    This service aggregates student data to provide class-wide metrics,
    identify struggling students, predict exam outcomes, and enable comparisons.
    """
    
    def __init__(self, progress_table=None, student_profiles_table=None, 
                 concepts_table=None, users_table=None):
        """
        Initialize the teacher analytics service.
        
        Args:
            progress_table: DynamoDB table for student progress (UserConceptProgress)
            student_profiles_table: DynamoDB table for student profiles
            concepts_table: DynamoDB table for syllabus concepts
            users_table: DynamoDB table for user information
        """
        self.progress_table = progress_table
        self.student_profiles_table = student_profiles_table
        self.concepts_table = concepts_table
        self.users_table = users_table
    
    def get_class_performance(self, class_id: str) -> ClassPerformance:
        """
        Get overall performance metrics for a class.
        
        Args:
            class_id: Unique identifier for the class
            
        Returns:
            ClassPerformance object with aggregated metrics
            
        Validates: Requirements 7.1
        """
        # Get all students in the class
        students = self._get_class_students(class_id)
        total_students = len(students)
        
        if total_students == 0:
            return ClassPerformance(
                class_id=class_id,
                avg_mastery_by_topic={},
                total_students=0,
                active_students=0,
                total_attempts=0
            )
        
        # Aggregate mastery scores by topic
        topic_mastery_sums: Dict[str, List[float]] = {}
        total_attempts = 0
        active_students = 0
        
        for student_id in students:
            student_progress = self._get_student_progress(student_id)
            
            if student_progress:
                active_students += 1
            
            for progress in student_progress:
                concept_id = progress.get("concept_id", "")
                mastery_score = float(progress.get("mastery_score", 0))
                attempts = int(progress.get("total_attempts", 0))
                
                total_attempts += attempts
                
                # Get topic_id from concept
                topic_id = self._get_topic_from_concept(concept_id)
                
                if topic_id not in topic_mastery_sums:
                    topic_mastery_sums[topic_id] = []
                
                topic_mastery_sums[topic_id].append(mastery_score)
        
        # Calculate averages
        avg_mastery_by_topic = {}
        for topic_id, scores in topic_mastery_sums.items():
            if scores:
                avg_mastery_by_topic[topic_id] = sum(scores) / len(scores)
        
        return ClassPerformance(
            class_id=class_id,
            avg_mastery_by_topic=avg_mastery_by_topic,
            total_students=total_students,
            active_students=active_students,
            total_attempts=total_attempts
        )
    
    def get_weak_topics(self, class_id: str, threshold: float = 40.0) -> List[TopicAnalysis]:
        """
        Identify topics where the class is performing poorly.
        
        Args:
            class_id: Unique identifier for the class
            threshold: Mastery score threshold (default 40.0)
            
        Returns:
            List of TopicAnalysis objects, sorted by ascending mastery (weakest first)
            
        Validates: Requirements 7.4
        """
        class_performance = self.get_class_performance(class_id)
        students = self._get_class_students(class_id)
        
        weak_topics = []
        
        for topic_id, avg_mastery in class_performance.avg_mastery_by_topic.items():
            if avg_mastery < threshold:
                # Count students below threshold for this topic
                students_below = 0
                total_topic_attempts = 0
                
                for student_id in students:
                    student_topic_mastery = self._get_student_topic_mastery(student_id, topic_id)
                    if student_topic_mastery < threshold:
                        students_below += 1
                    
                    # Count attempts for this topic
                    student_progress = self._get_student_progress(student_id)
                    for progress in student_progress:
                        concept_id = progress.get("concept_id", "")
                        if self._get_topic_from_concept(concept_id) == topic_id:
                            total_topic_attempts += int(progress.get("total_attempts", 0))
                
                topic_name = self._get_topic_name(topic_id)
                
                weak_topics.append(TopicAnalysis(
                    topic_id=topic_id,
                    topic_name=topic_name,
                    avg_mastery=avg_mastery,
                    students_below_threshold=students_below,
                    total_attempts=total_topic_attempts
                ))
        
        # Sort by ascending mastery (weakest first)
        weak_topics.sort(key=lambda x: x.avg_mastery)
        
        return weak_topics
    
    def identify_at_risk_students(self, class_id: str) -> List[StudentRisk]:
        """
        Identify students who are at risk of poor performance.
        
        Risk levels:
        - 'high': avg_mastery < 40
        - 'medium': 40 <= avg_mastery < 60
        - 'low': avg_mastery >= 60
        
        Args:
            class_id: Unique identifier for the class
            
        Returns:
            List of StudentRisk objects for at-risk students
            
        Validates: Requirements 7.2
        """
        students = self._get_class_students(class_id)
        at_risk_students = []
        
        for student_id in students:
            student_progress = self._get_student_progress(student_id)
            
            if not student_progress:
                continue
            
            # Calculate average mastery across all concepts
            mastery_scores = [float(p.get("mastery_score", 0)) for p in student_progress]
            avg_mastery = sum(mastery_scores) / len(mastery_scores) if mastery_scores else 0
            
            # Determine risk level
            if avg_mastery < 40:
                risk_level = "high"
            elif avg_mastery < 60:
                risk_level = "medium"
            else:
                risk_level = "low"
            
            # Only include students with medium or high risk
            if risk_level in ["high", "medium"]:
                # Identify weak topics (mastery < 40)
                weak_topics = []
                topic_mastery: Dict[str, List[float]] = {}
                
                for progress in student_progress:
                    concept_id = progress.get("concept_id", "")
                    mastery_score = float(progress.get("mastery_score", 0))
                    topic_id = self._get_topic_from_concept(concept_id)
                    
                    if topic_id not in topic_mastery:
                        topic_mastery[topic_id] = []
                    topic_mastery[topic_id].append(mastery_score)
                
                for topic_id, scores in topic_mastery.items():
                    topic_avg = sum(scores) / len(scores) if scores else 0
                    if topic_avg < 40:
                        weak_topics.append(topic_id)
                
                student_name = self._get_student_name(student_id)
                
                at_risk_students.append(StudentRisk(
                    student_id=student_id,
                    student_name=student_name,
                    risk_level=risk_level,
                    weak_topics=weak_topics,
                    avg_mastery=avg_mastery
                ))
        
        return at_risk_students
    
    def predict_exam_results(self, class_id: str) -> ExamPrediction:
        """
        Predict exam results based on current class performance.
        
        Prediction formula:
        predicted_score = sum(topic_weightage * min(100, mastery_score * 1.1))
                         for all topics in syllabus
        
        Args:
            class_id: Unique identifier for the class
            
        Returns:
            ExamPrediction object with predicted scores
            
        Validates: Requirements 7.3
        """
        students = self._get_class_students(class_id)
        student_predictions: Dict[str, float] = {}
        
        # Get all topics with their weightages
        topics_weightages = self._get_all_topics_weightages()
        
        for student_id in students:
            predicted_score = 0.0
            
            for topic_id, weightage in topics_weightages.items():
                # Get student's mastery for this topic
                topic_mastery = self._get_student_topic_mastery(student_id, topic_id)
                
                # Apply prediction formula
                adjusted_mastery = min(100, topic_mastery * 1.1)
                predicted_score += (weightage / 100.0) * adjusted_mastery
            
            student_predictions[student_id] = predicted_score
        
        # Calculate class average
        if student_predictions:
            predicted_avg_score = sum(student_predictions.values()) / len(student_predictions)
        else:
            predicted_avg_score = 0.0
        
        # Determine confidence level based on data availability
        total_progress_records = sum(
            len(self._get_student_progress(sid)) for sid in students
        )
        
        if total_progress_records > 100:
            confidence_level = "high"
        elif total_progress_records > 30:
            confidence_level = "medium"
        else:
            confidence_level = "low"
        
        return ExamPrediction(
            class_id=class_id,
            predicted_avg_score=predicted_avg_score,
            student_predictions=student_predictions,
            confidence_level=confidence_level
        )
    
    def get_student_comparison(self, student_id: str, class_id: str) -> Comparison:
        """
        Compare a student's performance with class average.
        
        Args:
            student_id: Unique identifier for the student
            class_id: Unique identifier for the class
            
        Returns:
            Comparison object with student vs class metrics
            
        Validates: Requirements 7.5
        """
        # Get class performance
        class_performance = self.get_class_performance(class_id)
        
        # Calculate class average mastery
        if class_performance.avg_mastery_by_topic:
            class_avg_mastery = sum(class_performance.avg_mastery_by_topic.values()) / \
                               len(class_performance.avg_mastery_by_topic)
        else:
            class_avg_mastery = 0.0
        
        # Get student's progress
        student_progress = self._get_student_progress(student_id)
        
        # Calculate student's topic mastery
        student_topic_mastery: Dict[str, float] = {}
        for progress in student_progress:
            concept_id = progress.get("concept_id", "")
            mastery_score = float(progress.get("mastery_score", 0))
            topic_id = self._get_topic_from_concept(concept_id)
            
            if topic_id not in student_topic_mastery:
                student_topic_mastery[topic_id] = []
            student_topic_mastery[topic_id].append(mastery_score)
        
        # Average mastery per topic for student
        student_topic_avg: Dict[str, float] = {}
        for topic_id, scores in student_topic_mastery.items():
            student_topic_avg[topic_id] = sum(scores) / len(scores) if scores else 0
        
        # Calculate student's overall average
        if student_topic_avg:
            student_avg_mastery = sum(student_topic_avg.values()) / len(student_topic_avg)
        else:
            student_avg_mastery = 0.0
        
        # Compare with class averages
        topics_above_average = []
        topics_below_average = []
        
        for topic_id, student_avg in student_topic_avg.items():
            class_topic_avg = class_performance.avg_mastery_by_topic.get(topic_id, 0)
            
            if student_avg > class_topic_avg:
                topics_above_average.append(topic_id)
            elif student_avg < class_topic_avg:
                topics_below_average.append(topic_id)
        
        return Comparison(
            student_id=student_id,
            class_id=class_id,
            student_avg_mastery=student_avg_mastery,
            class_avg_mastery=class_avg_mastery,
            topics_above_average=topics_above_average,
            topics_below_average=topics_below_average
        )
    
    # Helper methods
    
    def _get_class_students(self, class_id: str) -> List[str]:
        """Get list of student IDs in a class."""
        if not self.student_profiles_table:
            return []
        
        try:
            # Query student profiles by class_id
            response = self.student_profiles_table.query(
                IndexName="ClassIndex",
                KeyConditionExpression="class_id = :cid",
                ExpressionAttributeValues={":cid": class_id}
            )
            return [item["user_id"] for item in response.get("Items", [])]
        except Exception:
            # Fallback: scan all profiles and filter
            try:
                response = self.student_profiles_table.scan()
                return [
                    item["user_id"] for item in response.get("Items", [])
                    if item.get("class_id") == class_id
                ]
            except Exception:
                return []
    
    def _get_student_progress(self, student_id: str) -> List[Dict[str, Any]]:
        """Get all progress records for a student."""
        if not self.progress_table:
            return []
        
        try:
            response = self.progress_table.query(
                KeyConditionExpression="user_id = :uid",
                ExpressionAttributeValues={":uid": student_id}
            )
            return response.get("Items", [])
        except Exception:
            return []
    
    def _get_topic_from_concept(self, concept_id: str) -> str:
        """Get topic_id from concept_id."""
        if not self.concepts_table:
            # Fallback: extract topic from concept_id pattern
            # Assuming concept_id format like "topic_id-concept_name"
            return concept_id.split("-")[0] if "-" in concept_id else concept_id
        
        try:
            response = self.concepts_table.get_item(Key={"concept_id": concept_id})
            item = response.get("Item", {})
            return item.get("topic_id", concept_id.split("-")[0] if "-" in concept_id else concept_id)
        except Exception:
            return concept_id.split("-")[0] if "-" in concept_id else concept_id
    
    def _get_topic_name(self, topic_id: str) -> str:
        """Get topic name from topic_id."""
        if not self.concepts_table:
            return topic_id
        
        try:
            # Query concepts by topic_id to get topic name
            response = self.concepts_table.query(
                IndexName="TopicIndex",
                KeyConditionExpression="topic_id = :tid",
                Limit=1,
                ExpressionAttributeValues={":tid": topic_id}
            )
            items = response.get("Items", [])
            if items:
                return items[0].get("topic_name", topic_id)
            return topic_id
        except Exception:
            return topic_id
    
    def _get_student_name(self, student_id: str) -> str:
        """Get student name from student_id."""
        if not self.users_table:
            return student_id
        
        try:
            response = self.users_table.get_item(Key={"user_id": student_id})
            item = response.get("Item", {})
            return item.get("name", student_id)
        except Exception:
            return student_id
    
    def _get_student_topic_mastery(self, student_id: str, topic_id: str) -> float:
        """Get average mastery score for a student on a specific topic."""
        student_progress = self._get_student_progress(student_id)
        
        topic_scores = []
        for progress in student_progress:
            concept_id = progress.get("concept_id", "")
            if self._get_topic_from_concept(concept_id) == topic_id:
                topic_scores.append(float(progress.get("mastery_score", 0)))
        
        return sum(topic_scores) / len(topic_scores) if topic_scores else 0.0
    
    def _get_all_topics_weightages(self) -> Dict[str, float]:
        """Get all topics with their exam weightages."""
        if not self.concepts_table:
            return {}
        
        try:
            response = self.concepts_table.scan()
            items = response.get("Items", [])
            
            # Aggregate weightages by topic
            topic_weightages: Dict[str, float] = {}
            for item in items:
                topic_id = item.get("topic_id", "")
                weightage = float(item.get("weightage", 0))
                
                if topic_id and topic_id not in topic_weightages:
                    topic_weightages[topic_id] = weightage
            
            return topic_weightages
        except Exception:
            return {}
