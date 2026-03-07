"""
Teacher Analytics API endpoints for Adaptive Learning System.

This module provides REST API endpoints for teacher analytics including
class performance, weak topics, at-risk students, and exam predictions.
"""

import json
import os
from typing import Optional, Dict, Any

import boto3

from teacher_analytics_service import (
    TeacherAnalyticsService,
    ClassPerformance,
    TopicAnalysis,
    StudentRisk,
    ExamPrediction,
    Comparison
)


# Initialize DynamoDB resources
dynamodb = boto3.resource("dynamodb")

CONCEPTS_TABLE = os.environ.get("CONCEPTS_TABLE", "SyllabusConcepts")
PROGRESS_TABLE = os.environ.get("PROGRESS_TABLE", "UserConceptProgress")
STUDENT_PROFILES_TABLE = os.environ.get("STUDENT_PROFILES_TABLE", "StudentProfiles")
USERS_TABLE = os.environ.get("USERS_TABLE", "Users")

concepts_table = dynamodb.Table(CONCEPTS_TABLE)
progress_table = dynamodb.Table(PROGRESS_TABLE)

# Try to get optional tables
try:
    student_profiles_table = dynamodb.Table(STUDENT_PROFILES_TABLE)
except Exception:
    student_profiles_table = None

try:
    users_table = dynamodb.Table(USERS_TABLE)
except Exception:
    users_table = None

# Initialize teacher analytics service
analytics_service = TeacherAnalyticsService(
    progress_table=progress_table,
    student_profiles_table=student_profiles_table,
    concepts_table=concepts_table,
    users_table=users_table
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
            "Access-Control-Allow-Methods": "OPTIONS,GET",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
        "body": json.dumps(body, default=str),
    }


def _check_authorization(event: dict) -> Optional[Dict[str, Any]]:
    """
    Check if the user has teacher or admin role.
    
    Args:
        event: API Gateway event
        
    Returns:
        Error response dict if unauthorized, None if authorized
        
    Note: This is a placeholder implementation. In production, this should:
    1. Extract JWT token from Authorization header
    2. Verify token signature
    3. Extract user role from token claims
    4. Check if role is 'teacher' or 'admin'
    
    Validates: Requirements 13.1, 13.2
    """
    # Placeholder: In production, implement proper JWT validation
    # For now, we'll allow all requests
    # TODO: Implement JWT token validation and role checking
    
    headers = event.get("headers", {})
    auth_header = headers.get("Authorization") or headers.get("authorization")
    
    if not auth_header:
        return {
            "error": {
                "code": "UNAUTHORIZED",
                "message": "Missing authorization token",
                "details": {"field": "Authorization", "reason": "Authorization header is required"}
            }
        }
    
    # TODO: Validate JWT token and extract role
    # For now, assume authorized if token is present
    return None


def _class_performance_to_dict(performance: ClassPerformance) -> Dict[str, Any]:
    """Convert ClassPerformance to dictionary."""
    return {
        "class_id": performance.class_id,
        "avg_mastery_by_topic": performance.avg_mastery_by_topic,
        "total_students": performance.total_students,
        "active_students": performance.active_students,
        "total_attempts": performance.total_attempts
    }


def _topic_analysis_to_dict(analysis: TopicAnalysis) -> Dict[str, Any]:
    """Convert TopicAnalysis to dictionary."""
    return {
        "topic_id": analysis.topic_id,
        "topic_name": analysis.topic_name,
        "avg_mastery": analysis.avg_mastery,
        "students_below_threshold": analysis.students_below_threshold,
        "total_attempts": analysis.total_attempts
    }


def _student_risk_to_dict(risk: StudentRisk) -> Dict[str, Any]:
    """Convert StudentRisk to dictionary."""
    return {
        "student_id": risk.student_id,
        "student_name": risk.student_name,
        "risk_level": risk.risk_level,
        "weak_topics": risk.weak_topics,
        "avg_mastery": risk.avg_mastery
    }


def _exam_prediction_to_dict(prediction: ExamPrediction) -> Dict[str, Any]:
    """Convert ExamPrediction to dictionary."""
    return {
        "class_id": prediction.class_id,
        "predicted_avg_score": prediction.predicted_avg_score,
        "student_predictions": prediction.student_predictions,
        "confidence_level": prediction.confidence_level
    }


def _comparison_to_dict(comparison: Comparison) -> Dict[str, Any]:
    """Convert Comparison to dictionary."""
    return {
        "student_id": comparison.student_id,
        "class_id": comparison.class_id,
        "student_avg_mastery": comparison.student_avg_mastery,
        "class_avg_mastery": comparison.class_avg_mastery,
        "topics_above_average": comparison.topics_above_average,
        "topics_below_average": comparison.topics_below_average
    }


def get_class_performance(event: dict, context: dict) -> dict:
    """
    GET /api/analytics/class/{class_id}
    
    Get overall performance metrics for a class.
    
    Args:
        event: API Gateway event with class_id in path parameters
        context: Lambda context
        
    Returns:
        JSON response with class performance data
        
    Validates: Requirements 7.1, 13.1, 13.2
    """
    try:
        # Check authorization
        auth_error = _check_authorization(event)
        if auth_error:
            return json_response(401, auth_error)
        
        # Extract class_id from path parameters
        path_params = event.get("pathParameters", {})
        class_id = path_params.get("class_id")
        
        if not class_id:
            return json_response(400, {
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Missing required parameter: class_id",
                    "details": {"field": "class_id", "reason": "class_id is required in path"}
                }
            })
        
        # Get class performance
        performance = analytics_service.get_class_performance(class_id)
        
        return json_response(200, {
            "success": True,
            "data": _class_performance_to_dict(performance)
        })
        
    except Exception as e:
        return json_response(500, {
            "error": {
                "code": "INTERNAL_ERROR",
                "message": f"Failed to get class performance: {str(e)}",
                "details": {}
            }
        })


def get_weak_topics(event: dict, context: dict) -> dict:
    """
    GET /api/analytics/class/{class_id}/weak-topics
    
    Get topics where the class is performing poorly.
    
    Args:
        event: API Gateway event with class_id in path parameters
        context: Lambda context
        
    Returns:
        JSON response with weak topics list
        
    Validates: Requirements 7.4, 13.1, 13.2
    """
    try:
        # Check authorization
        auth_error = _check_authorization(event)
        if auth_error:
            return json_response(401, auth_error)
        
        # Extract class_id from path parameters
        path_params = event.get("pathParameters", {})
        class_id = path_params.get("class_id")
        
        if not class_id:
            return json_response(400, {
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Missing required parameter: class_id",
                    "details": {"field": "class_id", "reason": "class_id is required in path"}
                }
            })
        
        # Get threshold from query parameters (default 40.0)
        query_params = event.get("queryStringParameters") or {}
        threshold = float(query_params.get("threshold", 40.0))
        
        # Get weak topics
        weak_topics = analytics_service.get_weak_topics(class_id, threshold)
        
        return json_response(200, {
            "success": True,
            "data": {
                "weak_topics": [_topic_analysis_to_dict(t) for t in weak_topics],
                "threshold": threshold
            }
        })
        
    except ValueError as e:
        return json_response(400, {
            "error": {
                "code": "VALIDATION_ERROR",
                "message": f"Invalid threshold value: {str(e)}",
                "details": {"field": "threshold", "reason": "threshold must be a number"}
            }
        })
    except Exception as e:
        return json_response(500, {
            "error": {
                "code": "INTERNAL_ERROR",
                "message": f"Failed to get weak topics: {str(e)}",
                "details": {}
            }
        })


def get_at_risk_students(event: dict, context: dict) -> dict:
    """
    GET /api/analytics/class/{class_id}/at-risk
    
    Get students who are at risk of poor performance.
    
    Args:
        event: API Gateway event with class_id in path parameters
        context: Lambda context
        
    Returns:
        JSON response with at-risk students list
        
    Validates: Requirements 7.2, 13.1, 13.2
    """
    try:
        # Check authorization
        auth_error = _check_authorization(event)
        if auth_error:
            return json_response(401, auth_error)
        
        # Extract class_id from path parameters
        path_params = event.get("pathParameters", {})
        class_id = path_params.get("class_id")
        
        if not class_id:
            return json_response(400, {
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Missing required parameter: class_id",
                    "details": {"field": "class_id", "reason": "class_id is required in path"}
                }
            })
        
        # Get at-risk students
        at_risk_students = analytics_service.identify_at_risk_students(class_id)
        
        return json_response(200, {
            "success": True,
            "data": {
                "at_risk_students": [_student_risk_to_dict(s) for s in at_risk_students],
                "total_at_risk": len(at_risk_students)
            }
        })
        
    except Exception as e:
        return json_response(500, {
            "error": {
                "code": "INTERNAL_ERROR",
                "message": f"Failed to get at-risk students: {str(e)}",
                "details": {}
            }
        })


def get_exam_predictions(event: dict, context: dict) -> dict:
    """
    GET /api/analytics/class/{class_id}/predictions
    
    Get predicted exam results for a class.
    
    Args:
        event: API Gateway event with class_id in path parameters
        context: Lambda context
        
    Returns:
        JSON response with exam predictions
        
    Validates: Requirements 7.3, 13.1, 13.2
    """
    try:
        # Check authorization
        auth_error = _check_authorization(event)
        if auth_error:
            return json_response(401, auth_error)
        
        # Extract class_id from path parameters
        path_params = event.get("pathParameters", {})
        class_id = path_params.get("class_id")
        
        if not class_id:
            return json_response(400, {
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Missing required parameter: class_id",
                    "details": {"field": "class_id", "reason": "class_id is required in path"}
                }
            })
        
        # Get exam predictions
        predictions = analytics_service.predict_exam_results(class_id)
        
        return json_response(200, {
            "success": True,
            "data": _exam_prediction_to_dict(predictions)
        })
        
    except Exception as e:
        return json_response(500, {
            "error": {
                "code": "INTERNAL_ERROR",
                "message": f"Failed to get exam predictions: {str(e)}",
                "details": {}
            }
        })


def get_student_comparison(event: dict, context: dict) -> dict:
    """
    GET /api/analytics/student/{student_id}/comparison?class_id={class_id}
    
    Compare a student's performance with class average.
    
    Args:
        event: API Gateway event with student_id in path and class_id in query
        context: Lambda context
        
    Returns:
        JSON response with comparison data
        
    Validates: Requirements 7.5, 13.1, 13.2
    """
    try:
        # Check authorization
        auth_error = _check_authorization(event)
        if auth_error:
            return json_response(401, auth_error)
        
        # Extract student_id from path parameters
        path_params = event.get("pathParameters", {})
        student_id = path_params.get("student_id")
        
        if not student_id:
            return json_response(400, {
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Missing required parameter: student_id",
                    "details": {"field": "student_id", "reason": "student_id is required in path"}
                }
            })
        
        # Extract class_id from query parameters
        query_params = event.get("queryStringParameters") or {}
        class_id = query_params.get("class_id")
        
        if not class_id:
            return json_response(400, {
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Missing required parameter: class_id",
                    "details": {"field": "class_id", "reason": "class_id is required in query"}
                }
            })
        
        # Get student comparison
        comparison = analytics_service.get_student_comparison(student_id, class_id)
        
        return json_response(200, {
            "success": True,
            "data": _comparison_to_dict(comparison)
        })
        
    except Exception as e:
        return json_response(500, {
            "error": {
                "code": "INTERNAL_ERROR",
                "message": f"Failed to get student comparison: {str(e)}",
                "details": {}
            }
        })


def lambda_handler(event: dict, context: dict) -> dict:
    """
    Main Lambda handler for teacher analytics API.
    
    Routes requests to appropriate handler based on path and method.
    
    Args:
        event: API Gateway event
        context: Lambda context
        
    Returns:
        JSON response
    """
    try:
        http_method = event.get("httpMethod", "")
        path = event.get("path", "")
        
        # Handle CORS preflight
        if http_method == "OPTIONS":
            return json_response(200, {"message": "OK"})
        
        # Route to appropriate handler
        if http_method == "GET":
            if "/weak-topics" in path:
                return get_weak_topics(event, context)
            elif "/at-risk" in path:
                return get_at_risk_students(event, context)
            elif "/predictions" in path:
                return get_exam_predictions(event, context)
            elif "/comparison" in path:
                return get_student_comparison(event, context)
            elif "/analytics/class/" in path:
                return get_class_performance(event, context)
        
        # Unknown route
        return json_response(404, {
            "error": {
                "code": "NOT_FOUND",
                "message": f"Route not found: {http_method} {path}",
                "details": {}
            }
        })
        
    except Exception as e:
        return json_response(500, {
            "error": {
                "code": "INTERNAL_ERROR",
                "message": f"Unexpected error: {str(e)}",
                "details": {}
            }
        })
