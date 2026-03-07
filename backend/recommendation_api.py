"""
Recommendation API endpoints for Adaptive Learning System.

This module provides REST API endpoints for getting study recommendations
and explanations.
"""

import json
import os
from typing import Optional

import boto3

from decision_engine import DecisionEngine, Recommendation
from explanation_generator import ExplanationGenerator


# Initialize DynamoDB resources
dynamodb = boto3.resource("dynamodb")

CONCEPTS_TABLE = os.environ.get("CONCEPTS_TABLE", "SyllabusConcepts")
PROGRESS_TABLE = os.environ.get("PROGRESS_TABLE", "UserConceptProgress")
STUDENT_PROFILES_TABLE = os.environ.get("STUDENT_PROFILES_TABLE", "StudentProfiles")

concepts_table = dynamodb.Table(CONCEPTS_TABLE)
progress_table = dynamodb.Table(PROGRESS_TABLE)

# Try to get student profiles table if it exists
try:
    student_profiles_table = dynamodb.Table(STUDENT_PROFILES_TABLE)
except Exception:
    student_profiles_table = None

# Initialize decision engine and explanation generator
decision_engine = DecisionEngine(
    concepts_table=concepts_table,
    progress_table=progress_table,
    student_profiles_table=student_profiles_table
)
explanation_generator = ExplanationGenerator(decision_engine=decision_engine)


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


def get_next_recommendation(event: dict, context: dict) -> dict:
    """
    GET /api/recommendations/next/{student_id}
    
    Get the highest priority topic recommendation for a student.
    
    Args:
        event: API Gateway event
        context: Lambda context
        
    Returns:
        API Gateway response with recommendation
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
    
    try:
        # Get next recommendation
        recommendation = decision_engine.get_next_recommendation(student_id)
        
        if not recommendation:
            return json_response(200, {
                "message": "No eligible topics found. Complete prerequisites first.",
                "recommendation": None
            })
        
        # Convert recommendation to dict
        response_data = {
            "topic_id": recommendation.topic_id,
            "topic_name": recommendation.topic_name,
            "priority_score": recommendation.priority_score,
            "expected_marks_gain": recommendation.expected_marks_gain,
            "estimated_study_hours": recommendation.estimated_study_hours,
            "explanation": recommendation.explanation
        }
        
        return json_response(200, {"recommendation": response_data})
    
    except Exception as e:
        return json_response(500, {
            "error": "Failed to generate recommendation",
            "message": str(e)
        })


def get_top_recommendations(event: dict, context: dict) -> dict:
    """
    GET /api/recommendations/top/{student_id}?n=5
    
    Get top N topic recommendations for a student.
    
    Args:
        event: API Gateway event
        context: Lambda context
        
    Returns:
        API Gateway response with list of recommendations
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
    
    # Extract n from query parameters (default 5)
    query_params = event.get("queryStringParameters") or {}
    n = int(query_params.get("n", 5))
    
    # Validate n
    if n < 1 or n > 20:
        return json_response(400, {"error": "n must be between 1 and 20"})
    
    try:
        # Get top N recommendations
        recommendations = decision_engine.get_top_n_recommendations(student_id, n=n)
        
        if not recommendations:
            return json_response(200, {
                "message": "No eligible topics found. Complete prerequisites first.",
                "recommendations": []
            })
        
        # Convert recommendations to list of dicts
        response_data = [
            {
                "topic_id": rec.topic_id,
                "topic_name": rec.topic_name,
                "priority_score": rec.priority_score,
                "expected_marks_gain": rec.expected_marks_gain,
                "estimated_study_hours": rec.estimated_study_hours,
                "explanation": rec.explanation
            }
            for rec in recommendations
        ]
        
        return json_response(200, {
            "count": len(response_data),
            "recommendations": response_data
        })
    
    except Exception as e:
        return json_response(500, {
            "error": "Failed to generate recommendations",
            "message": str(e)
        })


def get_recommendation_explanation(event: dict, context: dict) -> dict:
    """
    GET /api/recommendations/explain/{student_id}/{topic_id}
    
    Get detailed explanation for why a topic is recommended.
    
    Args:
        event: API Gateway event
        context: Lambda context
        
    Returns:
        API Gateway response with explanation
    """
    # Handle OPTIONS request
    method = event.get("requestContext", {}).get("http", {}).get("method", "")
    if method == "OPTIONS":
        return json_response(200, {"ok": True})
    
    # Extract parameters from path
    path_params = event.get("pathParameters", {})
    student_id = path_params.get("student_id")
    topic_id = path_params.get("topic_id")
    
    if not student_id:
        return json_response(400, {"error": "student_id is required"})
    
    if not topic_id:
        return json_response(400, {"error": "topic_id is required"})
    
    try:
        # Get explanation from decision engine
        explanation_obj = decision_engine.explain_recommendation(student_id, topic_id)
        
        if not explanation_obj:
            return json_response(404, {
                "error": "Topic not found or not accessible"
            })
        
        # Compute priority score for this topic
        priority_score = decision_engine.compute_priority_score(student_id, topic_id)
        
        # Get concept data for additional info
        concept = decision_engine._get_concept_data(topic_id)
        topic_name = concept.get("topic", topic_id)
        estimated_hours = float(concept.get("estimated_hours", 2.0))
        
        # Calculate expected marks gain
        improvement_potential = (100 - explanation_obj.mastery_score) * 0.1
        expected_marks_gain = (explanation_obj.exam_weightage / 100.0) * improvement_potential
        
        # Generate structured explanation
        explanation_dict = explanation_generator.generate_explanation_dict(
            student_id=student_id,
            topic_id=topic_id,
            priority_score=priority_score,
            topic_name=topic_name,
            exam_weightage=explanation_obj.exam_weightage,
            current_accuracy=explanation_obj.current_accuracy,
            mastery_score=explanation_obj.mastery_score,
            dependencies_unlocked=explanation_obj.dependencies_unlocked,
            estimated_hours=estimated_hours,
            expected_marks_gain=expected_marks_gain,
            weakness_score=explanation_obj.weakness_score
        )
        
        return json_response(200, {"explanation": explanation_dict})
    
    except Exception as e:
        return json_response(500, {
            "error": "Failed to generate explanation",
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
    if "/recommendations/next/" in path:
        return get_next_recommendation(event, context)
    elif "/recommendations/top/" in path:
        return get_top_recommendations(event, context)
    elif "/recommendations/explain/" in path:
        return get_recommendation_explanation(event, context)
    else:
        return json_response(404, {"error": "Endpoint not found"})
