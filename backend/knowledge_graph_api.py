"""
API endpoints for Knowledge Graph Management.

This module provides REST API endpoints for managing topics, prerequisites,
and the knowledge graph structure.
"""

import json
from typing import Dict, Any, Optional
from knowledge_graph_manager import (
    KnowledgeGraphManager,
    CircularDependencyError,
    InvalidWeightageError,
    InvalidStudyTimeError
)


class KnowledgeGraphAPI:
    """
    API handler for knowledge graph endpoints.
    """
    
    def __init__(self, manager: KnowledgeGraphManager):
        """
        Initialize the API handler.
        
        Args:
            manager: KnowledgeGraphManager instance
        """
        self.manager = manager
    
    def handle_get_topics(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        GET /api/topics - Get all topics.
        
        Returns:
            Response with list of all topics
        """
        try:
            topics = self.manager.get_all_topics()
            
            topics_data = [
                {
                    "id": topic.id,
                    "name": topic.name,
                    "parent_id": topic.parent_id,
                    "exam_weightage": topic.exam_weightage,
                    "estimated_hours": topic.estimated_hours,
                    "description": topic.description,
                    "created_at": topic.created_at.isoformat()
                }
                for topic in topics
            ]
            
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({
                    "topics": topics_data,
                    "count": len(topics_data)
                })
            }
        except Exception as e:
            return self._error_response(500, f"Failed to retrieve topics: {str(e)}")
    
    def handle_get_topic(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        GET /api/topics/{topic_id} - Get a specific topic.
        
        Args:
            event: API Gateway event with topic_id in path parameters
        
        Returns:
            Response with topic details
        """
        try:
            # Extract topic_id from path parameters
            path_params = event.get("pathParameters", {})
            topic_id = path_params.get("topic_id")
            
            if not topic_id:
                return self._error_response(400, "topic_id is required")
            
            try:
                topic_id = int(topic_id)
            except ValueError:
                return self._error_response(400, "topic_id must be an integer")
            
            topic = self.manager.get_topic(topic_id)
            
            if not topic:
                return self._error_response(404, f"Topic with ID {topic_id} not found")
            
            # Get prerequisites and dependents
            prerequisites = self.manager.get_prerequisites(topic_id)
            dependents = self.manager.get_dependent_topics(topic_id)
            
            topic_data = {
                "id": topic.id,
                "name": topic.name,
                "parent_id": topic.parent_id,
                "exam_weightage": topic.exam_weightage,
                "estimated_hours": topic.estimated_hours,
                "description": topic.description,
                "created_at": topic.created_at.isoformat(),
                "prerequisites": [
                    {"id": p.id, "name": p.name} for p in prerequisites
                ],
                "dependents": [
                    {"id": d.id, "name": d.name} for d in dependents
                ]
            }
            
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps(topic_data)
            }
        except ValueError as e:
            return self._error_response(404, str(e))
        except Exception as e:
            return self._error_response(500, f"Failed to retrieve topic: {str(e)}")
    
    def handle_get_prerequisites(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        GET /api/topics/{topic_id}/prerequisites - Get prerequisites for a topic.
        
        Args:
            event: API Gateway event with topic_id in path parameters
        
        Returns:
            Response with list of prerequisite topics
        """
        try:
            # Extract topic_id from path parameters
            path_params = event.get("pathParameters", {})
            topic_id = path_params.get("topic_id")
            
            if not topic_id:
                return self._error_response(400, "topic_id is required")
            
            try:
                topic_id = int(topic_id)
            except ValueError:
                return self._error_response(400, "topic_id must be an integer")
            
            prerequisites = self.manager.get_prerequisites(topic_id)
            
            prereq_data = [
                {
                    "id": prereq.id,
                    "name": prereq.name,
                    "exam_weightage": prereq.exam_weightage,
                    "estimated_hours": prereq.estimated_hours
                }
                for prereq in prerequisites
            ]
            
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({
                    "topic_id": topic_id,
                    "prerequisites": prereq_data,
                    "count": len(prereq_data)
                })
            }
        except ValueError as e:
            return self._error_response(404, str(e))
        except Exception as e:
            return self._error_response(500, f"Failed to retrieve prerequisites: {str(e)}")
    
    def handle_get_unlockable_topics(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        GET /api/topics/unlockable/{student_id} - Get unlockable topics for a student.
        
        Args:
            event: API Gateway event with student_id in path parameters
        
        Returns:
            Response with list of unlockable topics
        """
        try:
            # Extract student_id from path parameters
            path_params = event.get("pathParameters", {})
            student_id = path_params.get("student_id")
            
            if not student_id:
                return self._error_response(400, "student_id is required")
            
            try:
                student_id = int(student_id)
            except ValueError:
                return self._error_response(400, "student_id must be an integer")
            
            # Get unlockable topics
            unlockable = self.manager.get_unlockable_topics(student_id)
            
            unlockable_data = [
                {
                    "id": topic.id,
                    "name": topic.name,
                    "parent_id": topic.parent_id,
                    "exam_weightage": topic.exam_weightage,
                    "estimated_hours": topic.estimated_hours,
                    "description": topic.description
                }
                for topic in unlockable
            ]
            
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({
                    "student_id": student_id,
                    "unlockable_topics": unlockable_data,
                    "count": len(unlockable_data)
                })
            }
        except Exception as e:
            return self._error_response(500, f"Failed to retrieve unlockable topics: {str(e)}")
    
    def handle_create_topic(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        POST /api/topics - Create a new topic.
        
        Args:
            event: API Gateway event with topic data in body
        
        Returns:
            Response with created topic
        """
        try:
            # Parse request body
            body = event.get("body", "{}")
            if isinstance(body, str):
                body = json.loads(body)
            
            # Extract required fields
            name = body.get("name")
            if not name:
                return self._error_response(400, "name is required")
            
            parent_id = body.get("parent_id")
            prerequisites = body.get("prerequisites", [])
            weightage = body.get("exam_weightage")
            estimated_hours = body.get("estimated_hours")
            description = body.get("description", "")
            
            if weightage is None:
                return self._error_response(400, "exam_weightage is required")
            
            if estimated_hours is None:
                return self._error_response(400, "estimated_hours is required")
            
            # Create the topic
            topic = self.manager.create_topic(
                name=name,
                parent_id=parent_id,
                prerequisites=prerequisites,
                weightage=float(weightage),
                estimated_hours=float(estimated_hours),
                description=description
            )
            
            return {
                "statusCode": 201,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({
                    "id": topic.id,
                    "name": topic.name,
                    "parent_id": topic.parent_id,
                    "exam_weightage": topic.exam_weightage,
                    "estimated_hours": topic.estimated_hours,
                    "description": topic.description,
                    "created_at": topic.created_at.isoformat()
                })
            }
        except InvalidWeightageError as e:
            return self._error_response(400, str(e))
        except InvalidStudyTimeError as e:
            return self._error_response(400, str(e))
        except CircularDependencyError as e:
            return self._error_response(400, str(e))
        except ValueError as e:
            return self._error_response(400, str(e))
        except json.JSONDecodeError:
            return self._error_response(400, "Invalid JSON in request body")
        except Exception as e:
            return self._error_response(500, f"Failed to create topic: {str(e)}")
    
    def _error_response(self, status_code: int, message: str) -> Dict[str, Any]:
        """
        Create an error response.
        
        Args:
            status_code: HTTP status code
            message: Error message
        
        Returns:
            Error response dict
        """
        return {
            "statusCode": status_code,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "error": message
            })
        }


def create_knowledge_graph_handler(manager: KnowledgeGraphManager):
    """
    Create a handler function for knowledge graph API endpoints.
    
    Args:
        manager: KnowledgeGraphManager instance
    
    Returns:
        Handler function for API Gateway events
    """
    api = KnowledgeGraphAPI(manager)
    
    def handler(event, context):
        """
        Main handler for knowledge graph API endpoints.
        
        Routes requests to appropriate handlers based on path and method.
        """
        path = event.get("rawPath", event.get("path", ""))
        method = event.get("requestContext", {}).get("http", {}).get("method", 
                 event.get("httpMethod", "GET"))
        
        # Route to appropriate handler
        if path == "/api/topics" and method == "GET":
            return api.handle_get_topics(event)
        elif path == "/api/topics" and method == "POST":
            return api.handle_create_topic(event)
        elif path.startswith("/api/topics/") and "/prerequisites" in path and method == "GET":
            return api.handle_get_prerequisites(event)
        elif path.startswith("/api/topics/unlockable/") and method == "GET":
            return api.handle_get_unlockable_topics(event)
        elif path.startswith("/api/topics/") and method == "GET":
            return api.handle_get_topic(event)
        else:
            return api._error_response(404, "Endpoint not found")
    
    return handler
