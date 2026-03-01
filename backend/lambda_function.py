import json
import os
import re
import hashlib
import time
import urllib.error
import urllib.request
from datetime import datetime

import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")
bedrock = boto3.client("bedrock-runtime")

USERS_TABLE = os.environ.get("USERS_TABLE", "Users")
CONCEPTS_TABLE = os.environ.get("CONCEPTS_TABLE", "SyllabusConcepts")
PROGRESS_TABLE = os.environ.get("PROGRESS_TABLE", "UserConceptProgress")
STUDY_PLAN_TABLE = os.environ.get("STUDY_PLAN_TABLE", "StudyPlan")
NOTEBOOK_TABLE = os.environ.get("NOTEBOOK_TABLE", "ConceptNotebook")
MISTAKE_LOGS_TABLE = os.environ.get("MISTAKE_LOGS_TABLE", "MistakeLogs")
MEMORY_TABLE = os.environ.get("MEMORY_TABLE", "UserLearningMemory")
AI_CACHE_TABLE = os.environ.get("AI_CACHE_TABLE", "AICache")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
BEDROCK_MODEL_ID = os.environ.get(
    "BEDROCK_MODEL_ID", "anthropic.claude-3-haiku-20240307-v1:0"
)

users_table = dynamodb.Table(USERS_TABLE)
concepts_table = dynamodb.Table(CONCEPTS_TABLE)
progress_table = dynamodb.Table(PROGRESS_TABLE)
study_plan_table = dynamodb.Table(STUDY_PLAN_TABLE)
notebook_table = dynamodb.Table(NOTEBOOK_TABLE)
mistake_logs_table = dynamodb.Table(MISTAKE_LOGS_TABLE)
memory_table = dynamodb.Table(MEMORY_TABLE)
cache_table = dynamodb.Table(AI_CACHE_TABLE)

MISTAKE_CATEGORIES = {
    "conceptual",
    "formula_recall",
    "calculation",
    "application_logic",
    "exam_trap",
}


def build_cache_key(request_type, user_id, concept_id, mastery, extra=None):
    payload = {
        "request_type": request_type,
        "user_id": user_id,
        "concept_id": concept_id,
        "mastery": int(mastery),
        "extra": extra or {},
    }
    digest = hashlib.sha256(json.dumps(payload, sort_keys=True).encode("utf-8")).hexdigest()
    return f"{request_type}:{digest}"


def get_cached_response(cache_key):
    result = cache_table.get_item(Key={"cache_key": cache_key})
    item = result.get("Item")
    if not item:
        return None
    ttl = int(item.get("ttl", 0))
    if ttl and ttl <= int(time.time()):
        return None
    return item


def save_to_cache(cache_key, response_text, hours=6):
    ttl = int(time.time()) + (hours * 3600)
    cache_table.put_item(
        Item={
            "cache_key": cache_key,
            "response": response_text,
            "ttl": ttl,
        }
    )


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
    previous_mastery = int(existing.get("mastery_score", 0))
    previous_attempts = int(existing.get("attempts", 0))
    previous_avg_time = float(existing.get("average_time_per_question", 0))
    previous_distribution = existing.get("mistake_type_distribution", {})
    if not isinstance(previous_distribution, dict):
        previous_distribution = {}

    improvement_trend = safe_quiz_score - previous_mastery
    confidence_score = round((safe_quiz_score * 0.7) + (min(previous_attempts + 1, 10) * 3), 2)

    progress_table.put_item(
        Item={
            "user_id": user_id,
            "concept_id": concept_id,
            "mastery_score": safe_quiz_score,
            "attempts": previous_attempts + 1,
            "improvement_trend": improvement_trend,
            "mistake_type_distribution": previous_distribution,
            "average_time_per_question": previous_avg_time,
            "confidence_score": confidence_score,
            "last_updated": datetime.utcnow().strftime("%Y-%m-%d"),
        }
    )
    return safe_quiz_score


def classify_mistake(question, student_answer, correct_answer):
    prompt = (
        "You are an expert exam error analyst.\n\n"
        f"Question: {question}\n"
        f"Student Answer: {student_answer}\n"
        f"Correct Answer: {correct_answer}\n\n"
        "Classify the mistake into one category only:\n"
        "- conceptual\n"
        "- formula_recall\n"
        "- calculation\n"
        "- application_logic\n"
        "- exam_trap\n\n"
        "Return only the category token, no extra text.\n"
    )

    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "messages": [
            {
                "role": "user",
                "content": [{"type": "text", "text": prompt}],
            }
        ],
        "max_tokens": 100,
    }

    response = bedrock.invoke_model(
        modelId=BEDROCK_MODEL_ID,
        body=json.dumps(body),
    )
    result = json.loads(response["body"].read())
    content = result.get("content", [])
    if not content or not isinstance(content, list):
        return "conceptual"

    category = (content[0].get("text", "") or "").strip().lower()
    category = re.sub(r"[^a-z_]", "", category)
    if category in MISTAKE_CATEGORIES:
        return category
    return "conceptual"


def store_mistake_log(
    user_id,
    concept_id,
    question_type,
    mistake_category,
    confidence_level=None,
    time_taken=None,
):
    timestamp = datetime.utcnow().isoformat(timespec="milliseconds") + "Z"
    item = {
        "user_id": user_id,
        "timestamp": timestamp,
        "concept_id": concept_id,
        "question_type": question_type or "unknown",
        "mistake_category": mistake_category,
        "confidence_level": int(confidence_level) if confidence_level is not None else 50,
        "time_taken": float(time_taken) if time_taken is not None else 0.0,
    }
    mistake_logs_table.put_item(Item=item)
    return item


def update_progress_after_mistake(
    user_id, concept_id, mistake_category, confidence_level=None, time_taken=None
):
    progress = progress_table.get_item(Key={"user_id": user_id, "concept_id": concept_id}).get("Item", {})
    distribution = progress.get("mistake_type_distribution", {})
    if not isinstance(distribution, dict):
        distribution = {}

    for category in MISTAKE_CATEGORIES:
        distribution[category] = int(distribution.get(category, 0))
    distribution[mistake_category] = int(distribution.get(mistake_category, 0)) + 1

    attempts = int(progress.get("attempts", 1))
    average_time = float(progress.get("average_time_per_question", 0))
    if time_taken is not None:
        try:
            safe_time = max(0.0, float(time_taken))
            average_time = round(((average_time * max(attempts - 1, 0)) + safe_time) / max(attempts, 1), 2)
        except (TypeError, ValueError):
            pass

    confidence_score = float(progress.get("confidence_score", 0))
    if confidence_level is not None:
        try:
            safe_confidence = max(0.0, min(100.0, float(confidence_level)))
            confidence_score = round((confidence_score * 0.7) + (safe_confidence * 0.3), 2)
        except (TypeError, ValueError):
            pass

    progress_table.update_item(
        Key={"user_id": user_id, "concept_id": concept_id},
        UpdateExpression=(
            "SET mistake_type_distribution = :distribution, "
            "average_time_per_question = :avg_time, "
            "confidence_score = :confidence, "
            "last_updated = :last_updated"
        ),
        ExpressionAttributeValues={
            ":distribution": distribution,
            ":avg_time": average_time,
            ":confidence": confidence_score,
            ":last_updated": datetime.utcnow().strftime("%Y-%m-%d"),
        },
    )


def calculate_trend(user_id):
    response = progress_table.query(KeyConditionExpression=Key("user_id").eq(user_id))
    items = response.get("Items", [])
    improvements = [int(item.get("mastery_score", 0)) for item in items]

    if len(improvements) < 2:
        return "insufficient_data"

    slope = (improvements[-1] - improvements[0]) / len(improvements)

    if slope > 2:
        return "strong_growth"
    if slope > 0:
        return "slow_growth"
    if slope == 0:
        return "stagnant"
    return "declining"


def get_notebook(user_id, concept_id):
    return notebook_table.get_item(
        Key={"user_id": user_id, "concept_id": concept_id}
    ).get("Item", {})


def upsert_notebook(user_id, concept_id, notes, mistakes, ai_summary):
    existing = get_notebook(user_id, concept_id)
    item = {
        "user_id": user_id,
        "concept_id": concept_id,
        "notes": notes if notes is not None else existing.get("notes", ""),
        "mistakes": mistakes if mistakes is not None else existing.get("mistakes", []),
        "ai_summary": ai_summary if ai_summary is not None else existing.get("ai_summary", ""),
        "last_updated": datetime.utcnow().strftime("%Y-%m-%d"),
    }
    notebook_table.put_item(Item=item)
    return item


def call_openai(prompt):
    if not OPENAI_API_KEY:
        return None

    payload = {
        "model": OPENAI_MODEL,
        "messages": [
            {"role": "system", "content": "You are an exam-focused learning assistant."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
    }
    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            result = json.loads(response.read().decode("utf-8"))
            choices = result.get("choices", [])
            if not choices:
                return None
            return choices[0].get("message", {}).get("content", "").strip() or None
    except (urllib.error.URLError, TimeoutError, ValueError, KeyError):
        return None


def fallback_summary(concept_id, notes, mistakes, mastery, weak_prereqs):
    traps = ", ".join(mistakes[:3]) if mistakes else "common sign and substitution errors"
    weak = ", ".join(weak_prereqs) if weak_prereqs else "none"
    return (
        f"{concept_id.title()} quick summary: Focus on core definitions first, then standard problem types. "
        f"Current mastery is {mastery}/100. Common traps: {traps}. "
        f"Weak prerequisite areas: {weak}. "
        "For exam attempts, start with base formulas, validate domain/conditions, and check edge cases before finalizing."
    )


def generate_ai_summary(user_id, concept_id, notes, mistakes):
    concept = concepts_table.get_item(Key={"concept_id": concept_id}).get("Item", {})
    mastery_item = progress_table.get_item(
        Key={"user_id": user_id, "concept_id": concept_id}
    ).get("Item", {})
    mastery = int(mastery_item.get("mastery_score", 0))
    prereqs = concept.get("prerequisites", [])
    mastery_lookup = get_mastery_lookup(get_user_progress(user_id))
    weak_prereqs = [p for p in prereqs if mastery_lookup.get(p, 0) < 50]

    prompt = (
        "Summarize this concept in about 200 words for JEE preparation. "
        "Focus on exam traps and simple explanation.\n"
        f"Concept: {concept_id}\n"
        f"Topic: {concept.get('topic', concept_id)}\n"
        f"User mastery: {mastery}\n"
        f"Weak prerequisites: {weak_prereqs}\n"
        f"User notes: {notes or ''}\n"
        f"User mistakes: {mistakes or []}\n"
    )
    return call_openai(prompt) or fallback_summary(concept_id, notes, mistakes or [], mastery, weak_prereqs)


def build_ai_context(user_id, concept_id):
    concept_data = concepts_table.get_item(Key={"concept_id": concept_id}).get("Item", {})
    topic = concept_data.get("topic", concept_id)
    prerequisites = concept_data.get("prerequisites", [])
    exam_weight = int(concept_data.get("exam_weight", 5))

    mastery_data = progress_table.get_item(
        Key={"user_id": user_id, "concept_id": concept_id}
    ).get("Item", {})
    mastery = int(mastery_data.get("mastery_score", 50))

    prereq_mastery_info = []
    weak_prerequisites = []
    for prereq in prerequisites:
        data = progress_table.get_item(
            Key={"user_id": user_id, "concept_id": prereq}
        ).get("Item", {})
        prereq_mastery = int(data.get("mastery_score", 0))
        prereq_mastery_info.append({"concept": prereq, "mastery": prereq_mastery})
        if prereq_mastery < 50:
            weak_prerequisites.append(prereq)

    notebook = get_notebook(user_id, concept_id)
    mistakes = notebook.get("mistakes", [])
    notes = notebook.get("notes", "")

    return {
        "user_id": user_id,
        "topic": topic,
        "concept_id": concept_id,
        "mastery": mastery,
        "exam_weight": exam_weight,
        "prerequisites": prereq_mastery_info,
        "weak_prerequisites": weak_prerequisites,
        "notes": notes,
        "mistakes": mistakes if isinstance(mistakes, list) else [],
        "dependency_position": {
            "direct_prerequisite_count": len(prerequisites),
        },
    }


def generate_ai_help(context):
    cache_key = build_cache_key(
        request_type="ai-help",
        user_id=context.get("user_id", ""),
        concept_id=context.get("concept_id", ""),
        mastery=context.get("mastery", 50),
    )
    cached = get_cached_response(cache_key)
    if cached:
        return cached.get("response", "")

    prereq_lines = (
        "\n".join(
            f"- {item.get('concept')}: mastery {item.get('mastery', 0)}/100"
            for item in context.get("prerequisites", [])
        )
        or "- none"
    )
    mistakes = context.get("mistakes", [])
    mistakes_line = ", ".join(mistakes[:5]) if mistakes else "none recorded"

    prompt = (
        "You are an expert JEE tutor.\n\n"
        f"Topic: {context.get('topic', '')}\n"
        f"Student Mastery: {context.get('mastery', 50)}/100\n"
        f"Exam Weight Importance: {context.get('exam_weight', 5)}/10\n"
        f"Dependency Position (direct prerequisites): {context.get('dependency_position', {}).get('direct_prerequisite_count', 0)}\n"
        f"Weak prerequisites: {context.get('weak_prerequisites', [])}\n"
        f"Past mistakes: {mistakes_line}\n"
        f"Student notes: {context.get('notes', '')}\n\n"
        "Prerequisite Performance:\n"
        f"{prereq_lines}\n\n"
        "Instructions:\n"
        "1. Explain the topic in simple language.\n"
        "2. Focus on areas likely misunderstood.\n"
        "3. If prerequisites are weak, reinforce them.\n"
        "4. Provide one exam trap warning.\n"
        "5. Provide 3 conceptual practice questions.\n"
        "6. Suggest a simple diagram structure description for visualization.\n"
    )

    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "messages": [
            {
                "role": "user",
                "content": [{"type": "text", "text": prompt}],
            }
        ],
        "max_tokens": 700,
    }

    response = bedrock.invoke_model(
        modelId=BEDROCK_MODEL_ID,
        body=json.dumps(body),
    )
    result = json.loads(response["body"].read())
    content = result.get("content", [])
    if content and isinstance(content, list):
        ai_text = content[0].get("text", "").strip()
        if ai_text:
            save_to_cache(cache_key, ai_text, hours=6)
        return ai_text
    return ""


def build_question_strategy(context):
    mastery = int(context.get("mastery", 50))

    if mastery < 40:
        difficulty = "easy_to_medium"
        focus = "concept_clarity"
    elif mastery < 70:
        difficulty = "medium"
        focus = "application"
    else:
        difficulty = "advanced"
        focus = "exam_traps"

    return {"difficulty": difficulty, "focus": focus}


def generate_questions(context):
    strategy = build_question_strategy(context)
    cache_key = build_cache_key(
        request_type="generate-questions",
        user_id=context.get("user_id", ""),
        concept_id=context.get("concept_id", ""),
        mastery=context.get("mastery", 50),
        extra={"difficulty": strategy.get("difficulty"), "focus": strategy.get("focus")},
    )
    cached = get_cached_response(cache_key)
    if cached:
        return cached.get("response", "")

    prereq_lines = (
        "\n".join(
            f"- {item.get('concept')}: mastery {item.get('mastery', 0)}/100"
            for item in context.get("prerequisites", [])
        )
        or "- none"
    )

    prompt = (
        "You are an expert JEE mathematics question designer.\n\n"
        f"Topic: {context.get('topic', '')}\n"
        f"Student Mastery: {context.get('mastery', 50)}/100\n"
        f"Difficulty Level: {strategy.get('difficulty')}\n"
        f"Focus Area: {strategy.get('focus')}\n"
        f"Exam Weight: {context.get('exam_weight', 5)}/10\n"
        "Prerequisite Performance:\n"
        f"{prereq_lines}\n\n"
        "Generate:\n"
        "- 2 conceptual questions\n"
        "- 2 numerical/application problems\n"
        "- 1 tricky exam trap question\n"
        "- 1 diagram-based question\n\n"
        "Rules:\n"
        "- Do NOT repeat common textbook examples\n"
        "- Vary structure\n"
        "- Use real exam thinking style\n"
        "- Provide solutions after each question\n"
        "- For the diagram question, return a structured JSON block in this format:\n"
        "  {\n"
        "    \"diagram_type\": \"\",\n"
        "    \"components\": [],\n"
        "    \"visual_description\": \"\"\n"
        "  }\n"
        "- Allowed diagram types: graph, geometric_shape, function_curve, coordinate_plane, flow_structure\n"
        "- Return the diagram JSON separately under a section titled exactly: DIAGRAM_DATA\n"
        "- Ensure problems are unique and not generic\n"
    )

    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "messages": [
            {
                "role": "user",
                "content": [{"type": "text", "text": prompt}],
            }
        ],
        "max_tokens": 900,
    }

    response = bedrock.invoke_model(
        modelId=BEDROCK_MODEL_ID,
        body=json.dumps(body),
    )
    result = json.loads(response["body"].read())
    content = result.get("content", [])
    if content and isinstance(content, list):
        ai_text = content[0].get("text", "").strip()
        if ai_text:
            save_to_cache(cache_key, ai_text, hours=6)
        return ai_text
    return ""


def extract_diagram_data(ai_text):
    if not ai_text:
        return None

    marker_match = re.search(r"DIAGRAM_DATA", ai_text)
    if not marker_match:
        return None

    start_search = marker_match.end()
    brace_start = ai_text.find("{", start_search)
    if brace_start == -1:
        return None

    depth = 0
    for index in range(brace_start, len(ai_text)):
        char = ai_text[index]
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                json_blob = ai_text[brace_start : index + 1]
                try:
                    return json.loads(json_blob)
                except (json.JSONDecodeError, TypeError, ValueError):
                    return None
    return None


def analyze_performance(user_id):
    response = progress_table.query(KeyConditionExpression=Key("user_id").eq(user_id))
    items = response.get("Items", [])

    total_mastery = 0
    high_weight_mastery = 0
    high_weight_count = 0
    stagnation_flags = 0
    average_confidence = 0
    low_mastery_concepts = []

    for item in items:
        mastery = int(item.get("mastery_score", 0))
        total_mastery += mastery
        average_confidence += float(item.get("confidence_score", 0))

        concept_data = concepts_table.get_item(Key={"concept_id": item.get("concept_id")}).get("Item", {})
        exam_weight = int(concept_data.get("exam_weight", 5))

        if exam_weight >= 8:
            high_weight_mastery += mastery
            high_weight_count += 1

        if mastery < 50:
            stagnation_flags += 1
            low_mastery_concepts.append(item.get("concept_id"))

    avg_mastery = total_mastery / len(items) if items else 0
    high_weight_avg = high_weight_mastery / high_weight_count if high_weight_count else 0
    avg_confidence = average_confidence / len(items) if items else 0
    exam_readiness = (avg_mastery * 0.7) + (high_weight_avg * 0.3)

    return {
        "average_mastery": round(avg_mastery, 2),
        "high_weight_mastery": round(high_weight_avg, 2),
        "average_confidence": round(avg_confidence, 2),
        "exam_readiness_score": round(exam_readiness, 2),
        "trajectory": calculate_trend(user_id),
        "stagnation_risk": stagnation_flags > 2,
        "stagnation_count": stagnation_flags,
        "at_risk_concepts": low_mastery_concepts[:5],
    }


def generate_strategy_report(user_id):
    performance = analyze_performance(user_id)
    cache_key = build_cache_key(
        request_type="ai-strategy",
        user_id=user_id,
        concept_id="global",
        mastery=round(performance.get("average_mastery", 0)),
        extra={
            "readiness": performance.get("exam_readiness_score", 0),
            "trajectory": performance.get("trajectory", "insufficient_data"),
            "stagnation": performance.get("stagnation_count", 0),
        },
    )
    cached = get_cached_response(cache_key)
    if cached:
        return cached.get("response", "")

    prompt = (
        "You are an AI exam strategist.\n\n"
        "Performance Data:\n"
        f"{performance}\n\n"
        "Provide:\n"
        "- Overall readiness assessment\n"
        "- Risk level\n"
        "- 5-day strategic improvement plan\n"
        "- Study time allocation advice\n"
        "- Psychological advice for confidence\n\n"
        "Be concise but strategic.\n"
    )

    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "messages": [
            {
                "role": "user",
                "content": [{"type": "text", "text": prompt}],
            }
        ],
        "max_tokens": 700,
    }
    response = bedrock.invoke_model(modelId=BEDROCK_MODEL_ID, body=json.dumps(body))
    result = json.loads(response["body"].read())
    content = result.get("content", [])
    if content and isinstance(content, list):
        ai_text = content[0].get("text", "").strip()
        if ai_text:
            save_to_cache(cache_key, ai_text, hours=6)
        return ai_text
    return ""


def update_learning_memory(user_id):
    performance = analyze_performance(user_id)
    recent_logs = mistake_logs_table.query(
        KeyConditionExpression=Key("user_id").eq(user_id),
        ScanIndexForward=False,
        Limit=25,
    ).get("Items", [])

    category_counts = {}
    for log in recent_logs:
        category = log.get("mistake_category", "conceptual")
        category_counts[category] = int(category_counts.get(category, 0)) + 1

    prompt = (
        "Based on student's recent performance, summarize:\n"
        "- Recurring mistake patterns\n"
        "- Weak conceptual areas\n"
        "- Confidence level\n"
        "- Learning behavior traits\n\n"
        "Keep structured summary.\n\n"
        f"Performance data: {performance}\n"
        f"Recent mistake category counts: {category_counts}\n"
    )

    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "messages": [
            {
                "role": "user",
                "content": [{"type": "text", "text": prompt}],
            }
        ],
        "max_tokens": 500,
    }

    response = bedrock.invoke_model(modelId=BEDROCK_MODEL_ID, body=json.dumps(body))
    summary = json.loads(response["body"].read()).get("content", [{}])[0].get("text", "").strip()

    memory_table.put_item(
        Item={
            "user_id": user_id,
            "memory_type": "learning_profile",
            "content": summary,
            "last_updated": datetime.utcnow().isoformat() + "Z",
        }
    )

    return {"memory_type": "learning_profile", "content": summary}


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

        logged_mistake = None
        question = payload.get("question")
        student_answer = payload.get("student_answer")
        correct_answer = payload.get("correct_answer")
        if question and student_answer is not None and correct_answer is not None:
            try:
                mistake_category = classify_mistake(question, student_answer, correct_answer)
                logged_mistake = store_mistake_log(
                    user_id=user_id,
                    concept_id=concept_id,
                    question_type=payload.get("question_type", "quiz"),
                    mistake_category=mistake_category,
                    confidence_level=payload.get("confidence_level"),
                    time_taken=payload.get("time_taken"),
                )
                update_progress_after_mistake(
                    user_id=user_id,
                    concept_id=concept_id,
                    mistake_category=mistake_category,
                    confidence_level=payload.get("confidence_level"),
                    time_taken=payload.get("time_taken"),
                )
            except Exception:
                logged_mistake = None

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
                "mistake_log": logged_mistake,
            },
        )

    if path == "/notebook/get":
        concept_id = payload.get("concept_id")
        if not concept_id:
            return json_response(400, {"error": "concept_id is required"})
        return json_response(200, get_notebook(user_id, concept_id))

    if path == "/notebook/upsert":
        concept_id = payload.get("concept_id")
        if not concept_id:
            return json_response(400, {"error": "concept_id is required"})
        notes = payload.get("notes")
        mistakes = payload.get("mistakes")
        ai_summary = payload.get("ai_summary")
        if mistakes is not None and not isinstance(mistakes, list):
            return json_response(400, {"error": "mistakes must be a list"})
        item = upsert_notebook(user_id, concept_id, notes, mistakes, ai_summary)
        return json_response(200, item)

    if path == "/notebook/summarize":
        concept_id = payload.get("concept_id")
        if not concept_id:
            return json_response(400, {"error": "concept_id is required"})
        notebook = get_notebook(user_id, concept_id)
        notes = payload.get("notes", notebook.get("notes", ""))
        mistakes = payload.get("mistakes", notebook.get("mistakes", []))
        if not isinstance(mistakes, list):
            return json_response(400, {"error": "mistakes must be a list"})
        ai_summary = generate_ai_summary(user_id, concept_id, notes, mistakes)
        item = upsert_notebook(user_id, concept_id, notes, mistakes, ai_summary)
        return json_response(
            200,
            {
                "concept_id": concept_id,
                "ai_summary": item.get("ai_summary", ""),
                "last_updated": item.get("last_updated"),
            },
        )

    if path == "/ai-help":
        concept_id = payload.get("concept_id")
        if not concept_id:
            return json_response(400, {"error": "concept_id is required"})

        context = build_ai_context(user_id, concept_id)

        try:
            ai_response = generate_ai_help(context)
        except Exception as error:
            return json_response(
                502,
                {
                    "error": "bedrock_invoke_failed",
                    "message": str(error),
                },
            )

        return json_response(
            200,
            {
                "concept_id": concept_id,
                "mastery_score": context.get("mastery", 50),
                "context": context,
                "ai_response": ai_response,
                "ai_explanation": ai_response,
            },
        )

    if path == "/generate-questions":
        concept_id = payload.get("concept_id")
        if not concept_id:
            return json_response(400, {"error": "concept_id is required"})

        context = build_ai_context(user_id, concept_id)
        try:
            questions = generate_questions(context)
        except Exception as error:
            return json_response(
                502,
                {
                    "error": "bedrock_invoke_failed",
                    "message": str(error),
                },
            )

        return json_response(
            200,
            {
                "concept_id": concept_id,
                "strategy": build_question_strategy(context),
                "questions": questions,
                "diagram_data": extract_diagram_data(questions),
            },
        )

    if path == "/performance-report":
        report = analyze_performance(user_id)
        return json_response(200, report)

    if path == "/trend-report":
        return json_response(200, {"trajectory": calculate_trend(user_id)})

    if path == "/classify-mistake":
        concept_id = payload.get("concept_id")
        question = payload.get("question")
        student_answer = payload.get("student_answer")
        correct_answer = payload.get("correct_answer")
        if not concept_id:
            return json_response(400, {"error": "concept_id is required"})
        if not question or student_answer is None or correct_answer is None:
            return json_response(
                400,
                {"error": "question, student_answer, and correct_answer are required"},
            )

        try:
            mistake_category = classify_mistake(question, student_answer, correct_answer)
            logged = store_mistake_log(
                user_id=user_id,
                concept_id=concept_id,
                question_type=payload.get("question_type", "quiz"),
                mistake_category=mistake_category,
                confidence_level=payload.get("confidence_level"),
                time_taken=payload.get("time_taken"),
            )
            update_progress_after_mistake(
                user_id=user_id,
                concept_id=concept_id,
                mistake_category=mistake_category,
                confidence_level=payload.get("confidence_level"),
                time_taken=payload.get("time_taken"),
            )
            return json_response(
                200,
                {
                    "mistake_category": mistake_category,
                    "mistake_log": logged,
                },
            )
        except Exception as error:
            return json_response(
                502,
                {
                    "error": "bedrock_invoke_failed",
                    "message": str(error),
                },
            )

    if path == "/ai-strategy":
        try:
            strategy = generate_strategy_report(user_id)
        except Exception as error:
            return json_response(
                502,
                {
                    "error": "bedrock_invoke_failed",
                    "message": str(error),
                },
            )
        return json_response(200, {"strategy": strategy})

    if path == "/update-learning-memory":
        try:
            memory = update_learning_memory(user_id)
            return json_response(200, memory)
        except Exception as error:
            return json_response(
                502,
                {
                    "error": "bedrock_invoke_failed",
                    "message": str(error),
                },
            )

    if path == "/learning-memory":
        memory_type = payload.get("memory_type", "learning_profile")
        memory = memory_table.get_item(
            Key={"user_id": user_id, "memory_type": memory_type}
        ).get("Item", {})
        return json_response(200, memory)

    return json_response(400, {"error": "Invalid route"})
