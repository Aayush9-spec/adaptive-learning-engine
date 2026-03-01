import json
import os
from datetime import datetime

import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")

USERS_TABLE = os.environ.get("USERS_TABLE", "Users")
CONCEPTS_TABLE = os.environ.get("CONCEPTS_TABLE", "SyllabusConcepts")
PROGRESS_TABLE = os.environ.get("PROGRESS_TABLE", "UserConceptProgress")
STUDY_PLAN_TABLE = os.environ.get("STUDY_PLAN_TABLE", "StudyPlan")

users_table = dynamodb.Table(USERS_TABLE)
concepts_table = dynamodb.Table(CONCEPTS_TABLE)
progress_table = dynamodb.Table(PROGRESS_TABLE)
study_plan_table = dynamodb.Table(STUDY_PLAN_TABLE)


def json_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
        "body": json.dumps(body),
    }


def parse_event(event):
    if isinstance(event, dict) and "body" in event:
        body = event.get("body")
        if isinstance(body, str):
            body = body.strip()
            return json.loads(body) if body else {}
        if isinstance(body, dict):
            return body
    return event if isinstance(event, dict) else {}


def calculate_priority(mastery, exam_weight, dependency_urgency):
    mastery = max(0, min(100, int(mastery)))
    exam_weight = max(1, min(10, int(exam_weight)))
    dependency_urgency = max(0, min(100, int(dependency_urgency)))
    return round(
        ((100 - mastery) * 0.6) + (exam_weight * 0.3) + (dependency_urgency * 0.1),
        2,
    )


def get_user_progress(user_id):
    response = progress_table.query(KeyConditionExpression=Key("user_id").eq(user_id))
    return response.get("Items", [])


def get_mastery_lookup(progress_items):
    return {
        item.get("concept_id"): int(item.get("mastery_score", 0))
        for item in progress_items
        if item.get("concept_id")
    }


def save_study_plan(user_id, recommendations):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    top_recommendations = recommendations[:3]
    study_plan_table.put_item(
        Item={
            "user_id": user_id,
            "date": today,
            "recommended_concepts": top_recommendations,
            "reasoning": "Adaptive recalculated plan",
        }
    )
    return today, top_recommendations


def generate_recommendations(user_id):
    progress_items = get_user_progress(user_id)
    mastery_lookup = get_mastery_lookup(progress_items)

    recommendations = []
    for concept_id, mastery in mastery_lookup.items():
        concept_data = concepts_table.get_item(Key={"concept_id": concept_id}).get("Item", {})
        exam_weight = int(concept_data.get("exam_weight", 5))
        prerequisites = concept_data.get("prerequisites", [])

        dependency_urgency = 0
        blocked = False
        for prereq in prerequisites:
            prereq_mastery = mastery_lookup.get(prereq, 0)
            if prereq_mastery < 50:
                blocked = True
            if prereq_mastery < 70:
                dependency_urgency += 70 - prereq_mastery

        if blocked:
            continue

        score = calculate_priority(mastery, exam_weight, dependency_urgency)
        recommendations.append(
            {
                "concept_id": concept_id,
                "priority_score": score,
                "reason": f"Mastery {mastery}, Weight {exam_weight}",
            }
        )

    recommendations.sort(key=lambda x: x["priority_score"], reverse=True)
    return recommendations


def update_mastery(user_id, concept_id, quiz_score):
    safe_quiz_score = max(0, min(100, int(quiz_score)))

    existing = progress_table.get_item(
        Key={"user_id": user_id, "concept_id": concept_id}
    ).get("Item", {})
    previous_attempts = int(existing.get("attempts", 0))

    progress_table.put_item(
        Item={
            "user_id": user_id,
            "concept_id": concept_id,
            "mastery_score": safe_quiz_score,
            "attempts": previous_attempts + 1,
            "last_updated": datetime.utcnow().strftime("%Y-%m-%d"),
        }
    )
    return safe_quiz_score


def lambda_handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method", "")
    if method == "OPTIONS":
        return json_response(200, {"ok": True})

    try:
        payload = parse_event(event)
    except (json.JSONDecodeError, ValueError):
        return json_response(400, {"error": "Invalid JSON body"})

    path = event.get("rawPath", "")
    user_id = payload.get("user_id")
    if not user_id:
        return json_response(400, {"error": "user_id is required"})

    user = users_table.get_item(Key={"user_id": user_id}).get("Item")
    if not user:
        return json_response(404, {"error": f"User '{user_id}' not found"})

    if path == "/recommend":
        recommendations = generate_recommendations(user_id)
        date, top_recommendations = save_study_plan(user_id, recommendations)
        return json_response(
            200,
            {
                "user_id": user_id,
                "date": date,
                "recommendations": top_recommendations,
            },
        )

    if path == "/update-progress":
        concept_id = payload.get("concept_id")
        quiz_score = payload.get("quiz_score")
        if not concept_id:
            return json_response(400, {"error": "concept_id is required"})
        if quiz_score is None:
            return json_response(400, {"error": "quiz_score is required"})

        try:
            new_mastery = update_mastery(user_id, concept_id, quiz_score)
        except (TypeError, ValueError):
            return json_response(400, {"error": "quiz_score must be a number"})

        recommendations = generate_recommendations(user_id)
        date, top_recommendations = save_study_plan(user_id, recommendations)
        return json_response(
            200,
            {
                "user_id": user_id,
                "concept_id": concept_id,
                "new_mastery": new_mastery,
                "date": date,
                "updated_plan": top_recommendations,
            },
        )

    return json_response(400, {"error": "Invalid route"})
