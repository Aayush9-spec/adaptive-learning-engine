# Architecture (Production Demo MVP)

## System Overview

```text
Next.js Frontend
    |
    v
API Gateway (HTTP API)
    |
    v
Lambda (Python 3.12, decision-engine)
    |
    v
DynamoDB (Users, SyllabusConcepts, UserConceptProgress, StudyPlan, ConceptNotebook)
```

## Why This Architecture

- Fully serverless for low operational overhead.
- Fits free-tier usage for MVP/demo traffic.
- Fast iteration speed in 48-hour build windows.
- Native AWS integrations reduce glue code.

## Decision Engine Behavior

- Inputs: `user_id`, optional progress updates from quiz.
- Priority formula:
```text
priority_score =
  (100 - mastery_score) * 0.6
  + exam_weight * 0.3
  + dependency_urgency * 0.1
```
- Dependency rules:
  - block recommending concept if prerequisite mastery `< 50`
  - increase urgency if prerequisite mastery `< 70`

## API Surface

- `POST /recommend`
  - reads concept progress
  - computes prioritized recommendations
  - writes top 3 to `StudyPlan`
- `POST /update-progress`
  - updates concept mastery
  - increments attempts
  - recalculates and stores new plan
- `POST /notebook/get`
  - fetches concept notebook for a user/concept
- `POST /notebook/upsert`
  - stores notes, mistakes, and optional summary
- `POST /notebook/summarize`
  - generates and stores concept summary
  - uses `OPENAI_API_KEY` + `gpt-4o-mini` if configured
  - falls back to deterministic summary when key is missing
- `POST /ai-help`
  - generates concept-scoped tutoring response
  - uses current mastery + concept topic context
  - invokes Bedrock Claude 3 Haiku via `bedrock:InvokeModel`
- `POST /generate-questions`
  - builds mastery-aware question strategy
  - generates conceptual + application + trap + diagram question set
  - returns dynamic, non-static assessment content
  - extracts and returns structured `diagram_data` for frontend rendering
- `POST /performance-report`
  - computes mastery aggregates and stagnation risk
  - outputs exam readiness score
- `POST /ai-strategy`
  - uses performance analytics as grounding context
  - returns a short multi-day improvement strategy
- `POST /classify-mistake`
  - classifies wrong-answer reason into cognitive category
  - stores mistake event in `MistakeLogs`
- `POST /trend-report`
  - reports growth trajectory from progress signals
- `POST /update-learning-memory`
  - builds long-term learner profile summary
  - persists to `UserLearningMemory`
- `POST /learning-memory`
  - fetches saved long-term learner memory

## Offline-First Strategy

- Frontend caches latest successful recommendation response in browser storage.
- On network failure, app serves cached plan.
- On reconnect, app refreshes from `/recommend`.

This keeps backend stateless while improving UX and reducing API calls.

## Data Model (DynamoDB)

- `Users`
  - `PK: user_id`
- `SyllabusConcepts`
  - `PK: concept_id`
  - `prerequisites: [concept_id]`
  - `exam_weight: 1..10`
- `UserConceptProgress`
  - `PK: user_id`
  - `SK: concept_id`
  - `mastery_score, attempts, last_updated`
- `StudyPlan`
  - `PK: user_id`
  - `SK: date`
  - `recommended_concepts, reasoning`
- `ConceptNotebook`
  - `PK: user_id`
  - `SK: concept_id`
  - `notes, mistakes, ai_summary, last_updated`
- `MistakeLogs`
  - `PK: user_id`
  - `SK: timestamp`
  - `concept_id, question_type, mistake_category, confidence_level, time_taken`
- `UserLearningMemory`
  - `PK: user_id`
  - `SK: memory_type`
  - `content, last_updated`
- `AICache`
  - `PK: cache_key`
  - `response, ttl`
  - used to reduce repeated Bedrock calls for same request context

## Cost Profile

- Lambda: 128MB, short execution time, no provisioned concurrency
- API Gateway: HTTP API
- DynamoDB: On-Demand billing

This is intentionally optimized for near-zero MVP cost.
