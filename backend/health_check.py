"""
Health check endpoint for service monitoring.
"""

import time
from typing import Dict, Any


def get_health_status() -> Dict[str, Any]:
    """
    Get current health status of the service.
    
    Returns:
        Health status dictionary
    """
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "service": "adaptive-learning-decision-engine",
        "version": "1.0.0"
    }


def health_check_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda handler for health check endpoint.
    
    Args:
        event: Lambda event
        context: Lambda context
        
    Returns:
        Health check response
    """
    from error_handler import json_response
    
    health_status = get_health_status()
    return json_response(200, health_status)
