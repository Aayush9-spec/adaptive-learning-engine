"""
Rate limiting middleware using token bucket algorithm.
Prevents API abuse by limiting requests per time window.
"""

import time
from typing import Dict, Optional, Tuple
from collections import defaultdict
from threading import Lock


class TokenBucket:
    """
    Token bucket implementation for rate limiting.
    
    Attributes:
        capacity: Maximum number of tokens in the bucket
        refill_rate: Number of tokens added per second
        tokens: Current number of tokens
        last_refill: Timestamp of last refill
    """
    
    def __init__(self, capacity: int, refill_rate: float):
        """
        Initialize token bucket.
        
        Args:
            capacity: Maximum tokens
            refill_rate: Tokens per second
        """
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.tokens = float(capacity)
        self.last_refill = time.time()
        self.lock = Lock()
    
    def consume(self, tokens: int = 1) -> bool:
        """
        Try to consume tokens from the bucket.
        
        Args:
            tokens: Number of tokens to consume
            
        Returns:
            True if tokens were consumed, False if insufficient tokens
        """
        with self.lock:
            self._refill()
            
            if self.tokens >= tokens:
                self.tokens -= tokens
                return True
            
            return False
    
    def _refill(self) -> None:
        """Refill tokens based on elapsed time."""
        now = time.time()
        elapsed = now - self.last_refill
        
        # Add tokens based on elapsed time
        tokens_to_add = elapsed * self.refill_rate
        self.tokens = min(self.capacity, self.tokens + tokens_to_add)
        self.last_refill = now
    
    def get_wait_time(self, tokens: int = 1) -> float:
        """
        Get time to wait until tokens are available.
        
        Args:
            tokens: Number of tokens needed
            
        Returns:
            Seconds to wait
        """
        with self.lock:
            self._refill()
            
            if self.tokens >= tokens:
                return 0.0
            
            tokens_needed = tokens - self.tokens
            return tokens_needed / self.refill_rate


class RateLimiter:
    """
    Rate limiter using token bucket algorithm.
    Supports per-user and per-endpoint rate limits.
    """
    
    def __init__(self):
        """Initialize rate limiter with default limits."""
        self.user_buckets: Dict[str, TokenBucket] = {}
        self.endpoint_buckets: Dict[Tuple[str, str], TokenBucket] = {}
        self.lock = Lock()
        
        # Default rate limits (requests per minute)
        self.default_user_limit = 60  # 60 requests per minute per user
        self.default_endpoint_limits = {
            "/api/recommendations/next": (10, 60),  # 10 per minute
            "/api/recommendations/top": (10, 60),
            "/api/recommendations/explain": (20, 60),
            "/api/attempts": (30, 60),  # 30 per minute
            "/api/plans/daily": (5, 60),  # 5 per minute
            "/api/plans/weekly": (5, 60),
            "/api/plans/exam": (5, 60),
            "/api/analytics/class": (20, 60),
            "/api/questions/concept": (30, 60),
        }
    
    def _get_user_bucket(self, user_id: str) -> TokenBucket:
        """
        Get or create token bucket for user.
        
        Args:
            user_id: User identifier
            
        Returns:
            TokenBucket for the user
        """
        with self.lock:
            if user_id not in self.user_buckets:
                # 60 requests per minute = 1 request per second
                self.user_buckets[user_id] = TokenBucket(
                    capacity=self.default_user_limit,
                    refill_rate=self.default_user_limit / 60.0
                )
            
            return self.user_buckets[user_id]
    
    def _get_endpoint_bucket(self, user_id: str, endpoint: str) -> Optional[TokenBucket]:
        """
        Get or create token bucket for user-endpoint combination.
        
        Args:
            user_id: User identifier
            endpoint: API endpoint path
            
        Returns:
            TokenBucket for the user-endpoint, or None if no specific limit
        """
        # Find matching endpoint pattern
        endpoint_limit = None
        for pattern, (capacity, window) in self.default_endpoint_limits.items():
            if endpoint.startswith(pattern):
                endpoint_limit = (capacity, window)
                break
        
        if not endpoint_limit:
            return None
        
        capacity, window = endpoint_limit
        key = (user_id, endpoint)
        
        with self.lock:
            if key not in self.endpoint_buckets:
                # Convert capacity/window to refill rate
                refill_rate = capacity / window
                self.endpoint_buckets[key] = TokenBucket(
                    capacity=capacity,
                    refill_rate=refill_rate
                )
            
            return self.endpoint_buckets[key]
    
    def check_rate_limit(self, user_id: str, endpoint: str) -> Tuple[bool, Optional[float]]:
        """
        Check if request is within rate limits.
        
        Args:
            user_id: User identifier
            endpoint: API endpoint path
            
        Returns:
            Tuple of (allowed, retry_after_seconds)
        """
        # Check user-level rate limit
        user_bucket = self._get_user_bucket(user_id)
        if not user_bucket.consume():
            wait_time = user_bucket.get_wait_time()
            return False, wait_time
        
        # Check endpoint-specific rate limit
        endpoint_bucket = self._get_endpoint_bucket(user_id, endpoint)
        if endpoint_bucket and not endpoint_bucket.consume():
            wait_time = endpoint_bucket.get_wait_time()
            return False, wait_time
        
        return True, None
    
    def configure_endpoint_limit(self, endpoint: str, capacity: int, window: int) -> None:
        """
        Configure rate limit for an endpoint.
        
        Args:
            endpoint: API endpoint path
            capacity: Maximum requests
            window: Time window in seconds
        """
        self.default_endpoint_limits[endpoint] = (capacity, window)
    
    def configure_user_limit(self, limit: int) -> None:
        """
        Configure default user rate limit.
        
        Args:
            limit: Requests per minute
        """
        self.default_user_limit = limit
    
    def reset_user_limits(self, user_id: str) -> None:
        """
        Reset rate limits for a user.
        
        Args:
            user_id: User identifier
        """
        with self.lock:
            if user_id in self.user_buckets:
                del self.user_buckets[user_id]
            
            # Remove endpoint-specific buckets
            keys_to_remove = [
                key for key in self.endpoint_buckets.keys()
                if key[0] == user_id
            ]
            for key in keys_to_remove:
                del self.endpoint_buckets[key]


# Global rate limiter instance
_rate_limiter = RateLimiter()


def get_rate_limiter() -> RateLimiter:
    """Get the global rate limiter instance."""
    return _rate_limiter


def rate_limit_middleware(handler_func):
    """
    Decorator to add rate limiting to Lambda handlers.
    
    Args:
        handler_func: Lambda handler function to wrap
        
    Returns:
        Wrapped handler function
    """
    def wrapper(event, context):
        # Extract user_id and endpoint
        try:
            import json
            body = event.get("body", "{}")
            if isinstance(body, str):
                payload = json.loads(body) if body.strip() else {}
            else:
                payload = body
            
            user_id = payload.get("user_id")
            endpoint = event.get("rawPath", "")
            
            # Skip rate limiting if no user_id
            if not user_id:
                return handler_func(event, context)
            
            # Check rate limit
            limiter = get_rate_limiter()
            allowed, retry_after = limiter.check_rate_limit(user_id, endpoint)
            
            if not allowed:
                from error_handler import json_response, format_error_response
                
                error_response = format_error_response(
                    status_code=429,
                    message="Rate limit exceeded",
                    details={
                        "retry_after": int(retry_after) if retry_after else 60
                    },
                    request_id=getattr(context, "aws_request_id", "local")
                )
                
                response = json_response(429, error_response)
                # Add Retry-After header
                response["headers"]["Retry-After"] = str(int(retry_after) if retry_after else 60)
                return response
            
            return handler_func(event, context)
            
        except Exception:
            # If rate limiting fails, allow the request through
            return handler_func(event, context)
    
    return wrapper
