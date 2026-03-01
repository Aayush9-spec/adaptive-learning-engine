# Final Submission Deployment Checklist

## 1. AWS Infrastructure Verification

### Lambda: `decision-engine`
- Runtime: `Python 3.12`
- Memory: `128 MB`
- Timeout: `5 seconds`
- Architecture: `x86_64`
- Provisioned concurrency: `Disabled`
- IAM role permissions:
  - `dynamodb:GetItem`
  - `dynamodb:PutItem`
  - `dynamodb:Query`
  - `bedrock:InvokeModel`
  - `logs:CreateLogGroup`
  - `logs:CreateLogStream`
  - `logs:PutLogEvents`

### API Gateway
- API type: `HTTP API`
- Routes:
  - `POST /recommend`
  - `POST /update-progress`
  - `POST /notebook/get`
  - `POST /notebook/upsert`
  - `POST /notebook/summarize`
  - `POST /ai-help`
  - `POST /generate-questions`
  - `POST /performance-report`
  - `POST /ai-strategy`
  - `POST /classify-mistake`
  - `POST /trend-report`
  - `POST /update-learning-memory`
  - `POST /learning-memory`
- Integrations:
  - both routes -> `decision-engine` Lambda
- CORS:
  - origin: `*` (demo)
  - headers: `Content-Type`
  - methods: `POST`

### DynamoDB
- Tables:
  - `Users` (`PK: user_id`)
  - `SyllabusConcepts` (`PK: concept_id`)
  - `UserConceptProgress` (`PK: user_id`, `SK: concept_id`)
  - `StudyPlan` (`PK: user_id`, `SK: date`)
  - `ConceptNotebook` (`PK: user_id`, `SK: concept_id`)
  - `MistakeLogs` (`PK: user_id`, `SK: timestamp`)
  - `UserLearningMemory` (`PK: user_id`, `SK: memory_type`)
  - `AICache` (`PK: cache_key`, attributes: `response`, `ttl`)
  - `UserUsage` (`PK: user_id`, attributes: `daily_calls`, `last_reset_date`)
- Billing mode: `On-Demand`

For `AICache`, enable DynamoDB TTL on attribute: `ttl`.

Usage guard:
- AI routes return `429` when daily limit is reached for a user.
- Default limit in code: `20` Bedrock calls/day/user.

## 2. Data Integrity Checks

- Demo user exists:
```json
{ "user_id": "user123", "subscription_tier": "free" }
```
- At least 5 concepts exist with valid prerequisites.
- Progress records exist with varied mastery levels (include at least one blocked advanced concept).
- `Users.subscription_tier` set for test accounts (`free`, `pro`, `elite`) to validate feature gates.

## 3. Backend Functional Tests

### Test 1: Recommendation
Request:
```json
{ "user_id": "user123" }
```
Expected:
- returns up to 3 recommendations
- blocked advanced topics excluded
- each item includes `reason`

### Test 2: Adaptive Update
Request:
```json
{
  "user_id": "user123",
  "concept_id": "differentiation",
  "quiz_score": 80
}
```
Expected:
- mastery updates
- new study plan is recalculated
- previously blocked topic may unlock

### Test 3: StudyPlan Persistence
After `/recommend` or `/update-progress`:
- verify item in `StudyPlan`
- check `user_id`, `date (YYYY-MM-DD)`, `recommended_concepts`

### Test 4: Concept Notebook Upsert
Request:
```json
{
  "user_id": "user123",
  "concept_id": "differentiation",
  "notes": "Chain rule and product rule confusion",
  "mistakes": ["formula recall", "application"]
}
```
Expected:
- row written to `ConceptNotebook`
- `last_updated` populated

### Test 5: AI Summary Generation
Request:
```json
{
  "user_id": "user123",
  "concept_id": "differentiation"
}
```
Expected:
- `ai_summary` returned
- `ConceptNotebook.ai_summary` updated

### Test 6: AI Tutor Help
Request:
```json
{
  "user_id": "user123",
  "concept_id": "differentiation"
}
```
Expected:
- `ai_explanation` returned
- response reflects concept context and current mastery

### Test 7: Infinite Question Generator
Request:
```json
{
  "user_id": "user123",
  "concept_id": "differentiation"
}
```
Expected:
- `questions` returned
- includes conceptual, application, trap, and diagram-style prompts
- `strategy` reflects mastery-based difficulty/focus
- `diagram_data` parsed as structured JSON when model returns `DIAGRAM_DATA`

### Test 8: Performance Report
Request:
```json
{
  "user_id": "user123"
}
```
Expected:
- `average_mastery`
- `high_weight_mastery`
- `exam_readiness_score`
- `stagnation_risk`

### Test 9: AI Strategy Report
Request:
```json
{
  "user_id": "user123"
}
```
Expected:
- `strategy` text returned
- includes readiness + risk + short action plan

### Test 10: Mistake Classification
Request:
```json
{
  "user_id": "user123",
  "concept_id": "integration",
  "question": "Integrate x sin x",
  "student_answer": "x cos x",
  "correct_answer": "sin x - x cos x",
  "question_type": "application",
  "confidence_level": 35,
  "time_taken": 85
}
```
Expected:
- `mistake_category` returned from allowed set
- row persisted in `MistakeLogs`
- progress `mistake_type_distribution` updated

### Test 11: Trend + Learning Memory
Requests:
```json
{ "user_id": "user123" }
```
for `POST /trend-report` and `POST /update-learning-memory`.

Expected:
- trend is one of `strong_growth`, `slow_growth`, `stagnant`, `declining`, `insufficient_data`
- learning profile stored in `UserLearningMemory`

## 4. Frontend Production Setup

- `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-api-id.execute-api.region.amazonaws.com
```
- Ensure:
  - no hardcoded localhost API URLs
  - no AWS secrets in frontend code
- Build test:
```bash
npm run build
npm run start
```

## 5. Offline-First Verification

- With internet on: call `/recommend`, cache is stored.
- Disable network:
  - app still shows previously cached plan
  - app does not crash
- Re-enable network:
  - plan refreshes from API

## 6. Cost Safety

- No EC2 instances
- No RDS instances
- No unnecessary public S3 buckets
- No unused Lambda functions
- DynamoDB remains `On-Demand`

## 7. Security Minimum Hardening

- CORS configured intentionally
- IAM least privilege for Lambda role
- No API keys/secrets committed in repo
- If using OpenAI, set `OPENAI_API_KEY` in Lambda env vars only (never in frontend)
- If using Bedrock, ensure model access is enabled (Claude 3 Haiku) and set optional `BEDROCK_MODEL_ID`
- Optional: custom API key header validation

## 8. Logging Health

Check CloudWatch logs:
- no permission errors
- no JSON parse errors
- no unhandled exceptions

## 9. Demo Script

1. Show `differentiation` mastery low (e.g., 40)
2. Run `/recommend` and show recommended concepts
3. Run `/update-progress` with quiz score (e.g., 85)
4. Show updated recommendations
5. Show `StudyPlan` updated in DynamoDB

Demo line:
`Our system dynamically recalculates decision priority using mastery gaps, exam weight, and prerequisite dependency logic.`

## 10. Final Pre-Submission Questions

- Can this be deployed from scratch in 30 minutes?
- Can each AWS service choice be justified clearly?
- Does offline fallback work for last-known plan?
- Is the demo flow consistent and repeatable?
