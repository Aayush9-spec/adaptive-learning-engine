"""
Script to create demo accounts in DynamoDB
Run this once to set up demo users for testing
"""
import boto3
from datetime import datetime
import os

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table(os.environ.get('USERS_TABLE', 'Users'))

def create_demo_accounts():
    """Create demo accounts for testing"""
    
    demo_accounts = [
        {
            "user_id": "demo_student",
            "username": "Demo Student",
            "password": "demo123",  # Plain text for demo only
            "role": "student",
            "grade": 10,
            "subscription_tier": "free",
            "created_at": datetime.utcnow().isoformat() + "Z"
        },
        {
            "user_id": "demo_teacher",
            "username": "Demo Teacher",
            "password": "demo123",  # Plain text for demo only
            "role": "teacher",
            "subscription_tier": "pro",
            "created_at": datetime.utcnow().isoformat() + "Z"
        },
        {
            "user_id": "demo_admin",
            "username": "Demo Admin",
            "password": "demo123",  # Plain text for demo only
            "role": "admin",
            "subscription_tier": "elite",
            "created_at": datetime.utcnow().isoformat() + "Z"
        },
        {
            "user_id": "aayush_77",
            "username": "Aayush_77 (student)",
            "password": "demo123",  # Plain text for demo only
            "role": "student",
            "grade": 12,
            "subscription_tier": "pro",
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
    ]
    
    for account in demo_accounts:
        try:
            # Check if account already exists
            existing = users_table.get_item(Key={"user_id": account["user_id"]}).get("Item")
            if existing:
                print(f"✓ Account {account['user_id']} already exists")
            else:
                users_table.put_item(Item=account)
                print(f"✓ Created demo account: {account['user_id']} (password: demo123)")
        except Exception as e:
            print(f"✗ Error creating {account['user_id']}: {str(e)}")
    
    print("\n" + "="*60)
    print("Demo Accounts Created Successfully!")
    print("="*60)
    print("\nYou can now login with:")
    print("  Student: demo_student / demo123")
    print("  Teacher: demo_teacher / demo123")
    print("  Admin:   demo_admin / demo123")
    print("  Custom:  Aayush_77 / demo123")
    print("="*60)

if __name__ == "__main__":
    create_demo_accounts()
