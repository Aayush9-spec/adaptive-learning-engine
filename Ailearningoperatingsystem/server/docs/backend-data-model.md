# Step 1 Backend Data Model

This document defines the core data model for the decision-first learning engine.

## Core Entities

1. `Users`
- `user_id` (PK) -> implemented as `users.id`
- `name`
- `exam_type`
- `target_date`

2. `Syllabus_Concepts`
- `concept_id` (PK)
- `subject`
- `topic`
- `prerequisites` (list of `concept_id`) -> stored as JSON text in SQLite
- `exam_weight` (1-10)

3. `User_Concept_Progress`
- `user_id` (PK)
- `concept_id` (SK)
- `mastery_score` (0-100)
- `attempts`
- `last_updated`

4. `Study_Plan`
- `user_id` (PK)
- `date` (SK, `YYYY-MM-DD`)
- `recommended_concepts` (list) -> stored as JSON text in SQLite
- `reasoning`

## Decision Engine Formula

```txt
priority_score =
    (100 - mastery_score) * 0.6
    + exam_weight * 0.3
    + dependency_urgency * 0.1
```

Current implementation is in `server/engine/priority.js`.

## DynamoDB Mapping

1. `Users`
- `PK = user_id`

2. `Syllabus_Concepts`
- `PK = concept_id`
- Optional GSI:
  - `GSI1PK = subject`
  - `GSI1SK = topic`

3. `User_Concept_Progress`
- `PK = user_id`
- `SK = concept_id`

4. `Study_Plan`
- `PK = user_id`
- `SK = date`

## Why This Covers The 7 Features

1. Syllabus-aware mapping: `Syllabus_Concepts`
2. Dependency tracking: `prerequisites`
3. Exam-weight prioritization: `exam_weight`
4. Gap detection: `mastery_score` in `User_Concept_Progress`
5. Decision-first engine: `priority_score` formula
6. Adaptive planning: `Study_Plan`
7. Explainable AI: `reasoning` + score component breakdown
