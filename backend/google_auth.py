"""
Google OAuth Authentication Handler
"""
import json
import requests
from typing import Dict, Optional
import jwt
from jwt import PyJWKClient
import os

# Google's public keys endpoint
GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs"
GOOGLE_ISSUER = "https://accounts.google.com"

def verify_google_token(token: str) -> Optional[Dict]:
    """
    Verify Google ID token and extract user information
    
    Args:
        token: Google ID token (JWT)
        
    Returns:
        Dict with user info if valid, None otherwise
    """
    try:
        # Get Google's public keys
        jwks_client = PyJWKClient(GOOGLE_JWKS_URL)
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        # Verify and decode the token
        decoded = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=os.environ.get('GOOGLE_CLIENT_ID'),
            issuer=GOOGLE_ISSUER
        )
        
        return {
            'email': decoded.get('email'),
            'name': decoded.get('name'),
            'picture': decoded.get('picture'),
            'google_id': decoded.get('sub'),
            'email_verified': decoded.get('email_verified', False)
        }
    except Exception as e:
        print(f"Error verifying Google token: {str(e)}")
        return None

def get_user_info_from_access_token(access_token: str) -> Optional[Dict]:
    """
    Get user info from Google using access token
    
    Args:
        access_token: Google OAuth access token
        
    Returns:
        Dict with user info if valid, None otherwise
    """
    try:
        response = requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {access_token}'},
            timeout=10
        )
        
        if response.status_code == 200:
            user_info = response.json()
            return {
                'email': user_info.get('email'),
                'name': user_info.get('name'),
                'picture': user_info.get('picture'),
                'google_id': user_info.get('sub'),
                'email_verified': user_info.get('email_verified', False)
            }
        return None
    except Exception as e:
        print(f"Error getting user info from access token: {str(e)}")
        return None

def create_username_from_email(email: str) -> str:
    """
    Create a username from email address
    
    Args:
        email: User's email address
        
    Returns:
        Username derived from email
    """
    # Take the part before @ and sanitize it
    username = email.split('@')[0]
    # Remove any special characters except underscore
    username = ''.join(c if c.isalnum() or c == '_' else '_' for c in username)
    return username.lower()
