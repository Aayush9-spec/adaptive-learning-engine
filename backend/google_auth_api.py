"""
Google OAuth API endpoints
"""
import json
import uuid
from datetime import datetime
from google_auth import verify_google_token, get_user_info_from_access_token, create_username_from_email
from database import get_db_connection

def handle_google_auth(event, context):
    """
    Handle Google OAuth login/signup
    
    Expected body:
    {
        "credential": "google_id_token_or_user_info_json",
        "token_type": "id_token" or "user_info"
    }
    """
    try:
        body = json.loads(event.get('body', '{}'))
        credential = body.get('credential')
        token_type = body.get('token_type', 'id_token')
        
        if not credential:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Missing credential'})
            }
        
        # Get user info from Google
        user_info = None
        if token_type == 'id_token':
            user_info = verify_google_token(credential)
        elif token_type == 'access_token':
            user_info = get_user_info_from_access_token(credential)
        else:
            # Assume it's already user info JSON
            try:
                user_info = json.loads(credential) if isinstance(credential, str) else credential
            except:
                pass
        
        if not user_info or not user_info.get('email'):
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Invalid Google credential'})
            }
        
        # Check if email is verified
        if not user_info.get('email_verified', True):
            return {
                'statusCode': 403,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Email not verified with Google'})
            }
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user exists by Google ID
        google_id = user_info.get('google_id')
        email = user_info.get('email')
        
        cursor.execute(
            "SELECT user_id, username, role, grade, subscription_tier FROM users WHERE google_id = %s",
            (google_id,)
        )
        existing_user = cursor.fetchone()
        
        if existing_user:
            # User exists, return their info
            user_data = {
                'user_id': existing_user[0],
                'username': existing_user[1],
                'role': existing_user[2],
                'grade': existing_user[3],
                'subscription_tier': existing_user[4],
                'email': email,
                'picture': user_info.get('picture')
            }
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(user_data)
            }
        
        # Check if email already exists (user might have registered with password)
        cursor.execute(
            "SELECT user_id FROM users WHERE username = %s",
            (email,)
        )
        email_exists = cursor.fetchone()
        
        if email_exists:
            # Link Google account to existing user
            cursor.execute(
                "UPDATE users SET google_id = %s WHERE user_id = %s",
                (google_id, email_exists[0])
            )
            conn.commit()
            
            # Get updated user info
            cursor.execute(
                "SELECT user_id, username, role, grade, subscription_tier FROM users WHERE user_id = %s",
                (email_exists[0],)
            )
            user = cursor.fetchone()
            
            user_data = {
                'user_id': user[0],
                'username': user[1],
                'role': user[2],
                'grade': user[3],
                'subscription_tier': user[4],
                'email': email,
                'picture': user_info.get('picture')
            }
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(user_data)
            }
        
        # Create new user
        user_id = str(uuid.uuid4())
        username = create_username_from_email(email)
        
        # Make sure username is unique
        base_username = username
        counter = 1
        while True:
            cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
            if not cursor.fetchone():
                break
            username = f"{base_username}{counter}"
            counter += 1
        
        cursor.execute(
            """
            INSERT INTO users (user_id, username, password_hash, role, google_id, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (user_id, username, 'GOOGLE_AUTH', 'student', google_id, datetime.now())
        )
        conn.commit()
        
        user_data = {
            'user_id': user_id,
            'username': username,
            'role': 'student',
            'grade': None,
            'subscription_tier': 'free',
            'email': email,
            'picture': user_info.get('picture')
        }
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(user_data)
        }
        
    except Exception as e:
        print(f"Error in Google auth: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }
