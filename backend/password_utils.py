"""
Password hashing and verification utilities
"""
import hashlib
import secrets
import base64

def hash_password(password: str) -> str:
    """
    Hash a password using PBKDF2-HMAC-SHA256
    Returns: base64 encoded salt:hash
    """
    # Generate a random salt
    salt = secrets.token_bytes(32)
    
    # Hash the password with the salt using PBKDF2
    # 100,000 iterations for security (OWASP recommendation)
    pwd_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt,
        100000
    )
    
    # Combine salt and hash, encode as base64
    combined = salt + pwd_hash
    return base64.b64encode(combined).decode('utf-8')

def verify_password(password: str, stored_hash: str) -> bool:
    """
    Verify a password against a stored hash
    """
    try:
        # Decode the stored hash
        combined = base64.b64decode(stored_hash.encode('utf-8'))
        
        # Extract salt (first 32 bytes) and hash (rest)
        salt = combined[:32]
        stored_pwd_hash = combined[32:]
        
        # Hash the provided password with the same salt
        pwd_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt,
            100000
        )
        
        # Compare hashes (constant-time comparison)
        return secrets.compare_digest(pwd_hash, stored_pwd_hash)
    except Exception as e:
        print(f"Error verifying password: {str(e)}")
        return False

def is_password_strong(password: str) -> tuple[bool, str]:
    """
    Check if password meets security requirements
    Returns: (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one number"
    
    return True, ""
