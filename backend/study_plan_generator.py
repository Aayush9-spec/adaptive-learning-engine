"""
Study Plan Generator for Adaptive Learning System.

This module generates personalized daily, weekly, and exam countdown study plans
based on student performance, available time, and exam proximity.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from decision_engine import DecisionEngine, Recommendation


@dataclass
class TopicAllocation:
    """
    Represents time allocation for a specific topic in a study plan.
    
    Attributes:
        topic_id: Unique identifier for the topic
        topic_name: Name of the topic
        allocated_hours: Time allocated for this topic
        priority_score: Priority score from decision engine
        goals: List of learning goals for this topic
    """
    topic_id: str
    topic_name: str
    allocated_hours: float
    priority_score: float
    goals: List[str] = field(default_factory=list)


@dataclass
class DailyPlan:
    """
    Represents a daily study plan.
    
    Attributes:
        date: Date for this plan
        topics: List of topic allocations
        total_hours: Total study hours for the day
        revision_topics: List of topic IDs for revision
    """
    date: datetime
    topics: List[TopicAllocation]
    total_hours: float
    revision_topics: List[str] = field(default_factory=list)


@dataclass
class WeeklyPlan:
    """
    Represents a weekly study plan with spaced repetition.
    
    Attributes:
        start_date: Start date of the week
        end_date: End date of the week
        daily_plans: List of daily plans for each day
        total_hours: Total study hours for the week
    """
    start_date: datetime
    end_date: datetime
    daily_plans: List[DailyPlan]
    total_hours: float


@dataclass
class ExamPlan:
    """
    Represents an exam countdown study plan.
    
    Attributes:
        exam_date: Date of the exam
        start_date: Start date of the plan
        daily_plans: List of daily plans until exam
        total_hours: Total study hours until exam
        high_priority_topics: Topics prioritized due to exam proximity
    """
    exam_date: datetime
    start_date: datetime
    daily_plans: List[DailyPlan]
    total_hours: float
    high_priority_topics: List[str] = field(default_factory=list)


class StudyPlanGenerator:
    """
    Generates personalized study plans based on student performance and constraints.
    
    The generator uses the DecisionEngine to get topic recommendations and allocates
    time based on priority scores, available hours, and revision cycles.
    """
    
    def __init__(self, decision_engine: DecisionEngine, progress_table=None, 
                 student_profiles_table=None):
        """
        Initialize the study plan generator.
        
        Args:
            decision_engine: DecisionEngine instance for recommendations
            progress_table: DynamoDB table for student progress
            student_profiles_table: DynamoDB table for student profiles
        """
        self.decision_engine = decision_engine
        self.progress_table = progress_table
        self.student_profiles_table = student_profiles_table
        
        # Spaced repetition intervals (in days)
        self.revision_intervals = [1, 3, 7, 14]
        
        # Revision session duration (minutes)
        self.revision_duration_minutes = 15
    
    def _get_student_profile(self, student_id: str) -> Dict[str, Any]:
        """Get student profile data."""
        if not self.student_profiles_table:
            return {"available_hours_per_day": 4.0, "exam_date": None}
        
        try:
            response = self.student_profiles_table.get_item(Key={"user_id": student_id})
            return response.get("Item", {"available_hours_per_day": 4.0, "exam_date": None})
        except Exception:
            return {"available_hours_per_day": 4.0, "exam_date": None}
    
    def _get_previously_studied_topics(self, student_id: str, 
                                       days_back: int = 30) -> List[Dict[str, Any]]:
        """
        Get topics studied by the student in the past N days.
        
        Returns list of dicts with: topic_id, last_studied_date, mastery_score
        """
        if not self.progress_table:
            return []
        
        try:
            # Query progress table for recent activity
            cutoff_date = datetime.now() - timedelta(days=days_back)
            response = self.progress_table.query(
                KeyConditionExpression="user_id = :uid",
                FilterExpression="last_updated >= :cutoff",
                ExpressionAttributeValues={
                    ":uid": student_id,
                    ":cutoff": cutoff_date.isoformat()
                }
            )
            
            items = response.get("Items", [])
            studied_topics = []
            
            for item in items:
                studied_topics.append({
                    "topic_id": item.get("concept_id"),
                    "last_studied_date": item.get("last_updated"),
                    "mastery_score": float(item.get("mastery_score", 0))
                })
            
            return studied_topics
        except Exception:
            return []
    
    def _get_topics_for_revision(self, student_id: str, 
                                 current_date: datetime) -> List[str]:
        """
        Get topics that need revision based on spaced repetition schedule.
        
        Returns list of topic IDs that should be revised.
        """
        studied_topics = self._get_previously_studied_topics(student_id)
        revision_topics = []
        
        for topic_info in studied_topics:
            last_studied_str = topic_info.get("last_studied_date")
            if not last_studied_str:
                continue
            
            try:
                last_studied = datetime.fromisoformat(last_studied_str.replace("Z", "+00:00"))
                days_since = (current_date - last_studied).days
                
                # Check if it matches any revision interval
                if days_since in self.revision_intervals:
                    # Prioritize topics with declining mastery
                    mastery = topic_info.get("mastery_score", 0)
                    if mastery < 80:  # Only revise if not fully mastered
                        revision_topics.append(topic_info["topic_id"])
            except (ValueError, AttributeError):
                continue
        
        return revision_topics
    
    def _allocate_time_proportionally(self, recommendations: List[Recommendation],
                                     available_hours: float,
                                     reserve_revision: bool = True) -> List[TopicAllocation]:
        """
        Allocate time to topics proportionally based on priority scores.
        
        Args:
            recommendations: List of recommendations from decision engine
            available_hours: Total hours available
            reserve_revision: Whether to reserve 20% for revision
        
        Returns:
            List of TopicAllocation objects
        """
        if not recommendations:
            return []
        
        # Reserve 20% for revision if requested
        study_hours = available_hours * 0.8 if reserve_revision else available_hours
        
        # Calculate total priority score
        total_priority = sum(rec.priority_score for rec in recommendations)
        
        if total_priority == 0:
            return []
        
        allocations = []
        
        # Calculate max allocation per topic (50% of daily time)
        max_allocation = available_hours * 0.5
        
        for rec in recommendations:
            # Allocate time proportional to priority score
            proportion = rec.priority_score / total_priority
            allocated = study_hours * proportion
            
            # Ensure no single topic gets > 50% of daily time
            # Use floor to ensure we never exceed the limit due to rounding
            allocated = min(allocated, max_allocation)
            
            # Round down to 2 decimal places to ensure constraint adherence
            # Use a small epsilon to handle floating point precision
            allocated = round(allocated, 2)
            
            # Final check: if rounding caused us to exceed, reduce slightly
            if allocated > max_allocation:
                allocated = max_allocation
            
            allocation = TopicAllocation(
                topic_id=rec.topic_id,
                topic_name=rec.topic_name,
                allocated_hours=allocated,
                priority_score=rec.priority_score,
                goals=[
                    f"Improve mastery by {rec.expected_marks_gain:.1f} marks",
                    f"Complete in {rec.estimated_study_hours} hours"
                ]
            )
            allocations.append(allocation)
        
        return allocations
    
    def generate_daily_plan(self, student_id: str, date: datetime) -> DailyPlan:
        """
        Generate a daily study plan for a student.
        
        Args:
            student_id: Student identifier
            date: Date for the plan
        
        Returns:
            DailyPlan object with topic allocations
        """
        # Get student profile
        profile = self._get_student_profile(student_id)
        available_hours = float(profile.get("available_hours_per_day", 4.0))
        
        # Get top recommendations
        avg_topic_time = 2.0  # Average hours per topic
        num_topics = max(1, int(available_hours / avg_topic_time))
        recommendations = self.decision_engine.get_top_n_recommendations(
            student_id, n=num_topics
        )
        
        # Allocate time proportionally
        allocations = self._allocate_time_proportionally(
            recommendations, available_hours, reserve_revision=True
        )
        
        # Get revision topics
        revision_topics = self._get_topics_for_revision(student_id, date)
        
        # Calculate total hours
        total_hours = sum(alloc.allocated_hours for alloc in allocations)
        
        # Add revision time (20% of available hours or 15-20 min per topic)
        revision_hours = min(
            available_hours * 0.2,
            len(revision_topics) * (self.revision_duration_minutes / 60.0)
        )
        total_hours += revision_hours
        
        # Ensure we don't exceed available hours
        total_hours = min(total_hours, available_hours)
        
        return DailyPlan(
            date=date,
            topics=allocations,
            total_hours=round(total_hours, 2),
            revision_topics=revision_topics
        )
    
    def generate_weekly_plan(self, student_id: str, 
                            start_date: datetime) -> WeeklyPlan:
        """
        Generate a weekly study plan with spaced repetition.
        
        Args:
            student_id: Student identifier
            start_date: Start date of the week
        
        Returns:
            WeeklyPlan object with daily plans for 7 days
        """
        daily_plans = []
        total_hours = 0.0
        
        # Generate daily plans for 7 days
        for day_offset in range(7):
            current_date = start_date + timedelta(days=day_offset)
            daily_plan = self.generate_daily_plan(student_id, current_date)
            daily_plans.append(daily_plan)
            total_hours += daily_plan.total_hours
        
        end_date = start_date + timedelta(days=6)
        
        return WeeklyPlan(
            start_date=start_date,
            end_date=end_date,
            daily_plans=daily_plans,
            total_hours=round(total_hours, 2)
        )
    
    def generate_exam_countdown_plan(self, student_id: str, 
                                    exam_date: datetime) -> ExamPlan:
        """
        Generate an exam countdown plan prioritizing high-weightage topics.
        
        Args:
            student_id: Student identifier
            exam_date: Date of the exam
        
        Returns:
            ExamPlan object with daily plans until exam
        """
        start_date = datetime.now()
        days_until_exam = (exam_date - start_date).days
        
        # Limit to reasonable planning horizon (max 60 days)
        days_until_exam = min(days_until_exam, 60)
        
        if days_until_exam <= 0:
            # Exam is today or in the past
            days_until_exam = 1
        
        # Get all recommendations (sorted by priority)
        all_recommendations = self.decision_engine.get_top_n_recommendations(
            student_id, n=20
        )
        
        # Identify high-priority topics (top 30% by weightage)
        high_priority_topics = []
        if all_recommendations:
            sorted_by_weightage = sorted(
                all_recommendations,
                key=lambda r: r.explanation.get("exam_weightage", 0),
                reverse=True
            )
            top_count = max(1, len(sorted_by_weightage) // 3)
            high_priority_topics = [
                rec.topic_id for rec in sorted_by_weightage[:top_count]
            ]
        
        # Generate daily plans
        daily_plans = []
        total_hours = 0.0
        
        for day_offset in range(days_until_exam):
            current_date = start_date + timedelta(days=day_offset)
            
            # As exam approaches, focus more on high-priority topics
            days_remaining = days_until_exam - day_offset
            if days_remaining <= 7:
                # Last week: focus on high-priority topics
                priority_recs = [
                    rec for rec in all_recommendations
                    if rec.topic_id in high_priority_topics
                ]
                if priority_recs:
                    daily_plan = self._generate_focused_daily_plan(
                        student_id, current_date, priority_recs
                    )
                else:
                    daily_plan = self.generate_daily_plan(student_id, current_date)
            else:
                # Regular daily plan
                daily_plan = self.generate_daily_plan(student_id, current_date)
            
            daily_plans.append(daily_plan)
            total_hours += daily_plan.total_hours
        
        return ExamPlan(
            exam_date=exam_date,
            start_date=start_date,
            daily_plans=daily_plans,
            total_hours=round(total_hours, 2),
            high_priority_topics=high_priority_topics
        )
    
    def _generate_focused_daily_plan(self, student_id: str, date: datetime,
                                    priority_recommendations: List[Recommendation]) -> DailyPlan:
        """Generate a daily plan focused on specific high-priority topics."""
        profile = self._get_student_profile(student_id)
        available_hours = float(profile.get("available_hours_per_day", 4.0))
        
        # Allocate time to priority topics
        allocations = self._allocate_time_proportionally(
            priority_recommendations, available_hours, reserve_revision=False
        )
        
        # Get revision topics
        revision_topics = self._get_topics_for_revision(student_id, date)
        
        # Calculate total hours
        total_hours = sum(alloc.allocated_hours for alloc in allocations)
        total_hours = min(total_hours, available_hours)
        
        return DailyPlan(
            date=date,
            topics=allocations,
            total_hours=round(total_hours, 2),
            revision_topics=revision_topics
        )
    
    def adjust_plan_for_progress(self, student_id: str, 
                                 original_plan: DailyPlan) -> DailyPlan:
        """
        Adjust a study plan based on student's progress changes.
        
        If mastery scores have changed significantly (>15%), regenerate the plan.
        
        Args:
            student_id: Student identifier
            original_plan: Original daily plan
        
        Returns:
            Adjusted DailyPlan (may be same as original if no significant changes)
        """
        # Get current recommendations
        num_topics = max(1, len(original_plan.topics))
        current_recs = self.decision_engine.get_top_n_recommendations(
            student_id, n=num_topics
        )
        
        # Check if priority scores have changed significantly
        significant_change = False
        
        # Build a map of original topic priorities
        original_priorities = {
            topic.topic_id: topic.priority_score 
            for topic in original_plan.topics
        }
        
        # Check each current recommendation
        for current_rec in current_recs:
            original_priority = original_priorities.get(current_rec.topic_id)
            
            if original_priority is not None and original_priority > 0:
                # Check if priority score changed by more than 15%
                change_percent = abs(
                    (current_rec.priority_score - original_priority) 
                    / original_priority
                )
                if change_percent > 0.15:
                    significant_change = True
                    break
        
        # If significant change, regenerate the plan
        if significant_change:
            return self.generate_daily_plan(student_id, original_plan.date)
        
        # Otherwise, return original plan
        return original_plan
