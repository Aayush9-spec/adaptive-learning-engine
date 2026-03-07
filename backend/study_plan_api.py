"""
Study Plan API endpoints for Adaptive Learning System.

This module provides REST API endpoints for generating and managing
personalized study plans.
"""

import json
import os
from typing import Optional, Dict, Any
from datetime import datetime

import boto3

from decision_engine import DecisionEngine
from study_plan_generator import (
    StudyPlanGenerator,
    DailyPlan,
    WeeklyPlan,
    ExamPlan,
    TopicAllocation
)


# Initialize DynamoDB resources
dynamodb = boto3.resource("dynamodb")

CONCEPTS_TABLE = os.environ.get("CONCEPTS_TABLE", "SyllabusConcepts")
PROGRESS_TABLE = os.environ.get("PROGRESS_TABLE", "UserConceptProgress")
STUDENT_PROFILES_TABLE = os.environ.get("STUDENT_PROFILES_TABLE", "StudentProfiles")
STUDY_PLANS_TABLE = os.environ.get("STUDY_PLANS_TABLE", "StudyPlans")

concepts_table = dynamodb.Table(CONCEPTS_TABLE)
progress_table = dynamodb.Table(PROGRESS_TABLE)

# Try to get optional tables
try:
    student_profiles_table = dynamodb.Table(STUDENT_PROFILES_TABLE)
except Exception:
    student_profiles_table = None

try:
    study_plans_table = dynamodb.Table(STUDY_PLANS_TABLE)
except Exception:
    study_plans_table = None

# Initialize decision engine and study plan generator
decision_engine = DecisionEngine(
    concepts_table=concepts_table,
    progress_table=progress_table,
    student_profiles_table=student_profiles_table
)

study_plan_generator = StudyPlanGenerator(
    decision_engine=decision_engine,
    progress_table=progress_table,
    student_profiles_table=student_profiles_table
)


def json_response(status_code: int, body: dict) -> dict:
    """
    Create a JSON response with CORS headers.
    
    Args:
        status_code: HTTP status code
        body: Response body dictionary
        
    Returns:
        API Gateway response dictionary
    """
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
        "body": json.dumps(body, default=str),
    }


def _topic_allocation_to_dict(allocation: TopicAllocation) -> Dict[str, Any]:
    """Convert TopicAllocation to dictionary."""
    return {
        "topic_id": allocation.topic_id,
        "topic_name": allocation.topic_name,
        "allocated_hours": allocation.allocated_hours,
        "priority_score": allocation.priority_score,
        "goals": allocation.goals
    }


def _daily_plan_to_dict(plan: DailyPlan) -> Dict[str, Any]:
    """Convert DailyPlan to dictionary."""
    return {
        "date": plan.date.isoformat(),
        "topics": [_topic_allocation_to_dict(t) for t in plan.topics],
        "total_hours": plan.total_hours,
        "revision_topics": plan.revision_topics
    }


def _save_plan_to_db(student_id: str, plan_type: str, plan_data: Dict[str, Any]) -> Optional[str]:
    """
    Save a study plan to the database.
    
    Returns:
        Plan ID if successful, None otherwise
    """
    if not study_plans_table:
        return None
    
    try:
        plan_id = f"{student_id}_{plan_type}_{datetime.now().isoformat()}"
        
        item = {
            "plan_id": plan_id,
            "student_id": student_id,
            "plan_type": plan_type,
            "plan_data": json.dumps(plan_data),
            "created_at": datetime.now().isoformat(),
            "is_active": True
        }
        
        study_plans_table.put_item(Item=item)
        return plan_id
    except Exception:
        return None


def generate_daily_plan(event: dict, context: dict) -> dict:
    """
    POST /api/plans/daily/{student_id}
    
    Generate a daily study plan for a student.
    
    Request body (optional):
        {
            "date": "2024-01-15T00:00:00Z"  # Optional, defaults to today
        }
    
    Args:
        event: API Gateway event
        context: Lambda context
        
    Returns:
        API Gateway response with daily plan
    """
    # Handle OPTIONS request
    method = event.get("requestContext", {}).get("http", {}).get("method", "")
    if method == "OPTIONS":
        return json_response(200, {"ok": True})
    
    # Extract student_id from path parameters
    path_params = event.get("pathParameters", {})
    student_id = path_params.get("student_id")
    
    if not student_id:
        return json_response(400, {"error": "student_id is required"})
    
    # Parse request body
    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except json.JSONDecodeError:
            return json_response(400, {"error": "Invalid JSON in request body"})
    
    # Get date from body or use today
    date_str = body.get("date")
    if date_str:
        try:
            plan_date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        except ValueError:
            return json_response(400, {"error": "Invalid date format. Use ISO 8601 format."})
    else:
        plan_date = datetime.now()
    
    try:
        # Generate daily plan
        daily_plan = study_plan_generator.generate_daily_plan(student_id, plan_date)
        
        # Convert to dict
        plan_dict = _daily_plan_to_dict(daily_plan)
        
        # Save to database
        plan_id = _save_plan_to_db(student_id, "daily", plan_dict)
        
        response_data = {
            "plan_id": plan_id,
            "plan": plan_dict
        }
        
        return json_response(200, response_data)
    
    except Exception as e:
        return json_response(500, {
            "error": "Failed to generate daily plan",
            "message": str(e)
        })


def generate_weekly_plan(event: dict, context: dict) -> dict:
    """
    POST /api/plans/weekly/{student_id}
    
    Generate a weekly study plan with spaced repetition.
    
    Request body (optional):
        {
            "start_date": "2024-01-15T00:00:00Z"  # Optional, defaults to today
        }
    
    Args:
        event: API Gateway event
        context: Lambda context
        
    Returns:
        API Gateway response with weekly plan
    """
    # Handle OPTIONS request
    method = event.get("requestContext", {}).get("http", {}).get("method", "")
    if method == "OPTIONS":
        return json_response(200, {"ok": True})
    
    # Extract student_id from path parameters
    path_params = event.get("pathParameters", {})
    student_id = path_params.get("student_id")
    
    if not student_id:
        return json_response(400, {"error": "student_id is required"})
    
    # Parse request body
    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except json.JSONDecodeError:
            return json_response(400, {"error": "Invalid JSON in request body"})
    
    # Get start_date from body or use today
    date_str = body.get("start_date")
    if date_str:
        try:
            start_date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        except ValueError:
            return json_response(400, {"error": "Invalid date format. Use ISO 8601 format."})
    else:
        start_date = datetime.now()
    
    try:
        # Generate weekly plan
        weekly_plan = study_plan_generator.generate_weekly_plan(student_id, start_date)
        
        # Convert to dict
        plan_dict = {
            "start_date": weekly_plan.start_date.isoformat(),
            "end_date": weekly_plan.end_date.isoformat(),
            "daily_plans": [_daily_plan_to_dict(dp) for dp in weekly_plan.daily_plans],
            "total_hours": weekly_plan.total_hours
        }
        
        # Save to database
        plan_id = _save_plan_to_db(student_id, "weekly", plan_dict)
        
        response_data = {
            "plan_id": plan_id,
            "plan": plan_dict
        }
        
        return json_response(200, response_data)
    
    except Exception as e:
        return json_response(500, {
            "error": "Failed to generate weekly plan",
            "message": str(e)
        })


def generate_exam_plan(event: dict, context: dict) -> dict:
    """
    POST /api/plans/exam/{student_id}
    
    Generate an exam countdown study plan.
    
    Request body:
        {
            "exam_date": "2024-03-15T00:00:00Z"  # Required
        }
    
    Args:
        event: API Gateway event
        context: Lambda context
        
    Returns:
        API Gateway response with exam countdown plan
    """
    # Handle OPTIONS request
    method = event.get("requestContext", {}).get("http", {}).get("method", "")
    if method == "OPTIONS":
        return json_response(200, {"ok": True})
    
    # Extract student_id from path parameters
    path_params = event.get("pathParameters", {})
    student_id = path_params.get("student_id")
    
    if not student_id:
        return json_response(400, {"error": "student_id is required"})
    
    # Parse request body
    if not event.get("body"):
        return json_response(400, {"error": "Request body is required"})
    
    try:
        body = json.loads(event["body"])
    except json.JSONDecodeError:
        return json_response(400, {"error": "Invalid JSON in request body"})
    
    # Get exam_date from body (required)
    exam_date_str = body.get("exam_date")
    if not exam_date_str:
        return json_response(400, {"error": "exam_date is required in request body"})
    
    try:
        exam_date = datetime.fromisoformat(exam_date_str.replace("Z", "+00:00"))
    except ValueError:
        return json_response(400, {"error": "Invalid date format. Use ISO 8601 format."})
    
    # Validate exam date is in the future
    if exam_date <= datetime.now():
        return json_response(400, {"error": "Exam date must be in the future"})
    
    try:
        # Generate exam countdown plan
        exam_plan = study_plan_generator.generate_exam_countdown_plan(student_id, exam_date)
        
        # Convert to dict
        plan_dict = {
            "exam_date": exam_plan.exam_date.isoformat(),
            "start_date": exam_plan.start_date.isoformat(),
            "daily_plans": [_daily_plan_to_dict(dp) for dp in exam_plan.daily_plans],
            "total_hours": exam_plan.total_hours,
            "high_priority_topics": exam_plan.high_priority_topics
        }
        
        # Save to database
        plan_id = _save_plan_to_db(student_id, "exam_countdown", plan_dict)
        
        response_data = {
            "plan_id": plan_id,
            "plan": plan_dict
        }
        
        return json_response(200, response_data)
    
    except Exception as e:
        return json_response(500, {
            "error": "Failed to generate exam countdown plan",
            "message": str(e)
        })


def get_student_plans(event: dict, context: dict) -> dict:
    """
    GET /api/plans/student/{student_id}
    
    Get all active study plans for a student.
    
    Query parameters:
        - plan_type: Optional filter by plan type (daily, weekly, exam_countdown)
        - limit: Maximum number of plans to return (default 10)
    
    Args:
        event: API Gateway event
        context: Lambda context
        
    Returns:
        API Gateway response with list of plans
    """
    # Handle OPTIONS request
    method = event.get("requestContext", {}).get("http", {}).get("method", "")
    if method == "OPTIONS":
        return json_response(200, {"ok": True})
    
    # Extract student_id from path parameters
    path_params = event.get("pathParameters", {})
    student_id = path_params.get("student_id")
    
    if not student_id:
        return json_response(400, {"error": "student_id is required"})
    
    # Get query parameters
    query_params = event.get("queryStringParameters") or {}
    plan_type = query_params.get("plan_type")
    limit = int(query_params.get("limit", 10))
    
    # Validate limit
    if limit < 1 or limit > 100:
        return json_response(400, {"error": "limit must be between 1 and 100"})
    
    if not study_plans_table:
        return json_response(200, {
            "message": "Study plans storage not configured",
            "plans": []
        })
    
    try:
        # Query plans for student
        query_kwargs = {
            "IndexName": "StudentIdIndex",
            "KeyConditionExpression": "student_id = :sid",
            "ExpressionAttributeValues": {":sid": student_id},
            "Limit": limit,
            "ScanIndexForward": False  # Most recent first
        }
        
        # Add filter for plan_type if specified
        if plan_type:
            query_kwargs["FilterExpression"] = "plan_type = :ptype AND is_active = :active"
            query_kwargs["ExpressionAttributeValues"][":ptype"] = plan_type
            query_kwargs["ExpressionAttributeValues"][":active"] = True
        else:
            query_kwargs["FilterExpression"] = "is_active = :active"
            query_kwargs["ExpressionAttributeValues"][":active"] = True
        
        response = study_plans_table.query(**query_kwargs)
        items = response.get("Items", [])
        
        # Parse plan data
        plans = []
        for item in items:
            plan_data = json.loads(item.get("plan_data", "{}"))
            plans.append({
                "plan_id": item.get("plan_id"),
                "plan_type": item.get("plan_type"),
                "created_at": item.get("created_at"),
                "is_active": item.get("is_active"),
                "plan": plan_data
            })
        
        return json_response(200, {
            "count": len(plans),
            "plans": plans
        })
    
    except Exception as e:
        return json_response(500, {
            "error": "Failed to retrieve study plans",
            "message": str(e)
        })


def lambda_handler(event: dict, context: dict) -> dict:
    """
    Main Lambda handler that routes requests to appropriate functions.
    
    Args:
        event: API Gateway event
        context: Lambda context
        
    Returns:
        API Gateway response
    """
    # Get the path
    path = event.get("rawPath", "")
    
    # Route to appropriate handler
    if "/plans/daily/" in path:
        return generate_daily_plan(event, context)
    elif "/plans/weekly/" in path:
        return generate_weekly_plan(event, context)
    elif "/plans/exam/" in path:
        return generate_exam_plan(event, context)
    elif "/plans/student/" in path:
        return get_student_plans(event, context)
    else:
        return json_response(404, {"error": "Endpoint not found"})
