"""
Seed MVP demo data into DynamoDB for the decision-engine Lambda.

Usage:
  python seed_demo_data.py

Optional environment variables:
  AWS_REGION (default: us-east-1)
  USERS_TABLE (default: Users)
  CONCEPTS_TABLE (default: SyllabusConcepts)
  PROGRESS_TABLE (default: UserConceptProgress)
"""

import os

import boto3

AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
USERS_TABLE = os.environ.get("USERS_TABLE", "Users")
CONCEPTS_TABLE = os.environ.get("CONCEPTS_TABLE", "SyllabusConcepts")
PROGRESS_TABLE = os.environ.get("PROGRESS_TABLE", "UserConceptProgress")


concepts = [
    {
        "concept_id": "limits",
        "subject": "Mathematics",
        "topic": "Limits",
        "prerequisites": [],
        "exam_weight": 9,
    },
    {
        "concept_id": "continuity",
        "subject": "Mathematics",
        "topic": "Continuity",
        "prerequisites": ["limits"],
        "exam_weight": 8,
    },
    {
        "concept_id": "differentiation",
        "subject": "Mathematics",
        "topic": "Differentiation",
        "prerequisites": ["continuity"],
        "exam_weight": 10,
    },
    {
        "concept_id": "applications_derivatives",
        "subject": "Mathematics",
        "topic": "Applications of Derivatives",
        "prerequisites": ["differentiation"],
        "exam_weight": 9,
    },
    {
        "concept_id": "integration",
        "subject": "Mathematics",
        "topic": "Integration",
        "prerequisites": ["differentiation"],
        "exam_weight": 10,
    },
]

user = {
    "user_id": "user123",
    "name": "Demo User",
    "exam_type": "JEE",
    "target_date": "2026-04-01",
}

progress = [
    {
        "user_id": "user123",
        "concept_id": "limits",
        "mastery_score": 80,
        "attempts": 5,
        "last_updated": "2026-03-01",
    },
    {
        "user_id": "user123",
        "concept_id": "continuity",
        "mastery_score": 60,
        "attempts": 3,
        "last_updated": "2026-03-01",
    },
    {
        "user_id": "user123",
        "concept_id": "differentiation",
        "mastery_score": 40,
        "attempts": 2,
        "last_updated": "2026-03-01",
    },
    {
        "user_id": "user123",
        "concept_id": "applications_derivatives",
        "mastery_score": 20,
        "attempts": 1,
        "last_updated": "2026-03-01",
    },
    {
        "user_id": "user123",
        "concept_id": "integration",
        "mastery_score": 10,
        "attempts": 1,
        "last_updated": "2026-03-01",
    },
]


def main():
    dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
    users_table = dynamodb.Table(USERS_TABLE)
    concepts_table = dynamodb.Table(CONCEPTS_TABLE)
    progress_table = dynamodb.Table(PROGRESS_TABLE)

    for item in concepts:
        concepts_table.put_item(Item=item)
    print(f"Seeded {len(concepts)} concepts into {CONCEPTS_TABLE}")

    users_table.put_item(Item=user)
    print(f"Seeded demo user into {USERS_TABLE}")

    for item in progress:
        progress_table.put_item(Item=item)
    print(f"Seeded {len(progress)} progress rows into {PROGRESS_TABLE}")

    print("Done.")


if __name__ == "__main__":
    main()
