"""
Global error handling middleware for the Adaptive Learning Decision Engine.
Provides consistent error response formatting and HTTP status code handling.
"""

import json
import traceback
from typing import Dict, Any, Optional
from datetime import datetime


class APIError(Exception):
    """Base exception for API errors with status code and message."""
    
    def __init__(self, status_code: int, message: str, details: Optional[Dict[str, Any]] = None):
        self.status_code = status_code
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(APIError):
    """Exception for validation errors (400)."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(400, message, details)


class AuthenticationError(APIError):
    """Exception for authentication errors (401)."""
    
    def __init__(self, message: str = "Authentication required", details: Optional[Dict[str, Any]] = None):
        super().__init__(401, message, details)


class AuthorizationError(APIError):
    """Exception for authorization errors (403)."""
    
    def __init__(self, message: str = "Access forbidden", details: Optional[Dict[str, Any]] = None):
        super().__init__(403, message, details)


class NotFoundError(APIError):
    """Exception for not found errors (404)."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(404, message, details)


class ServerError(APIError):
    """Exception for server errors (500)."""
    
    def __init__(self, message: str = "Internal server error", details: Optional[Dict[str, Any]] = None):
        super().__init__(500, message, details)


def format_error_response(
    status_code: int,
    message: str,
    details: Optional[Dict[str, Any]] = None,
    request_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Format error response with consistent structure.
    
    Args:
        status_code: HTTP status code
        message: Error message
        details: Additional error details
        request_id: Request ID for tracking
        
    Returns:
        Formatted error response dictionary
    """
    response = {
        "error": {
            "status_code": status_code,
            "message": message,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    }
    
    if details:
        response["error"]["details"] = details
    
    if request_id:
        response["error"]["request_id"] = request_id
    
    return response


def json_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create JSON response with proper headers.
    
    Args:
        status_code: HTTP status code
        body: Response body
        
    Returns:
        Lambda response dictionary
    """
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
        "body": json.dumps(body)
    }


def handle_error(error: Exception, request_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Handle exceptions and return appropriate error response.
    
    Args:
        error: Exception to handle
        request_id: Request ID for tracking
        
    Returns:
        Lambda response dictionary with error details
    """
    # Handle known API errors
    if isinstance(error, APIError):
        error_response = format_error_response(
            status_code=error.status_code,
            message=error.message,
            details=error.details,
            request_id=request_id
        )
        return json_response(error.status_code, error_response)
    
    # Handle JSON decode errors
    if isinstance(error, json.JSONDecodeError):
        error_response = format_error_response(
            status_code=400,
            message="Invalid JSON in request body",
            details={"error": str(error)},
            request_id=request_id
        )
        return json_response(400, error_response)
    
    # Handle value errors (typically validation)
    if isinstance(error, ValueError):
        error_response = format_error_response(
            status_code=400,
            message="Invalid input value",
            details={"error": str(error)},
            request_id=request_id
        )
        return json_response(400, error_response)
    
    # Handle type errors (typically validation)
    if isinstance(error, TypeError):
        error_response = format_error_response(
            status_code=400,
            message="Invalid input type",
            details={"error": str(error)},
            request_id=request_id
        )
        return json_response(400, error_response)
    
    # Handle key errors (missing required fields)
    if isinstance(error, KeyError):
        error_response = format_error_response(
            status_code=400,
            message="Missing required field",
            details={"field": str(error)},
            request_id=request_id
        )
        return json_response(400, error_response)
    
    # Handle all other errors as 500
    error_response = format_error_response(
        status_code=500,
        message="Internal server error",
        details={
            "error_type": type(error).__name__,
            "error_message": str(error)
        },
        request_id=request_id
    )
    
    # Log the full traceback for debugging
    print(f"Unhandled error: {traceback.format_exc()}")
    
    return json_response(500, error_response)


def error_handler_middleware(handler_func):
    """
    Decorator to wrap Lambda handlers with error handling.
    
    Args:
        handler_func: Lambda handler function to wrap
        
    Returns:
        Wrapped handler function
    """
    def wrapper(event, context):
        request_id = getattr(context, "aws_request_id", "local")
        
        try:
            return handler_func(event, context)
        except Exception as error:
            return handle_error(error, request_id)
    
    return wrapper


def validate_required_fields(payload: Dict[str, Any], required_fields: list) -> None:
    """
    Validate that required fields are present in payload.
    
    Args:
        payload: Request payload
        required_fields: List of required field names
        
    Raises:
        ValidationError: If any required field is missing
    """
    missing_fields = [field for field in required_fields if field not in payload]
    
    if missing_fields:
        raise ValidationError(
            message="Missing required fields",
            details={"missing_fields": missing_fields}
        )


def validate_field_type(payload: Dict[str, Any], field: str, expected_type: type) -> None:
    """
    Validate that a field has the expected type.
    
    Args:
        payload: Request payload
        field: Field name to validate
        expected_type: Expected type
        
    Raises:
        ValidationError: If field type doesn't match
    """
    if field in payload and not isinstance(payload[field], expected_type):
        raise ValidationError(
            message=f"Invalid type for field '{field}'",
            details={
                "field": field,
                "expected_type": expected_type.__name__,
                "actual_type": type(payload[field]).__name__
            }
        )


def validate_numeric_range(value: float, field: str, min_value: float, max_value: float) -> None:
    """
    Validate that a numeric value is within range.
    
    Args:
        value: Value to validate
        field: Field name
        min_value: Minimum allowed value
        max_value: Maximum allowed value
        
    Raises:
        ValidationError: If value is out of range
    """
    if not (min_value <= value <= max_value):
        raise ValidationError(
            message=f"Value for '{field}' out of range",
            details={
                "field": field,
                "value": value,
                "min": min_value,
                "max": max_value
            }
        )
