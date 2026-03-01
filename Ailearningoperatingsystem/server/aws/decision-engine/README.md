# decision-engine Lambda (Python 3.12)

Deploy file: `lambda_function.py`

## Expected Request Shapes

1. API Gateway HTTP API (POST `/recommend`)
```json
{
  "body": "{\"user_id\":\"user123\"}",
  "isBase64Encoded": false
}
```

2. Lambda console test
```json
{
  "user_id": "user123"
}
```

## Environment Variables (optional)

- `USERS_TABLE` (default: `Users`)
- `CONCEPTS_TABLE` (default: `SyllabusConcepts`)
- `PROGRESS_TABLE` (default: `UserConceptProgress`)
- `STUDY_PLAN_TABLE` (default: `StudyPlan`)

## Seed Demo Data (JEE Math - Calculus)

Script: `seed_demo_data.py`

```bash
cd Ailearningoperatingsystem/server/aws/decision-engine
python seed_demo_data.py
```

This seeds:
- 5 concepts in `SyllabusConcepts`
- 1 demo user (`user123`) in `Users`
- 5 progress rows in `UserConceptProgress`

## API Test (after deploy)

```bash
curl -X POST "https://<your-api-id>.execute-api.<region>.amazonaws.com/recommend" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\":\"user123\"}"
```

```bash
curl -X POST "https://<your-api-id>.execute-api.<region>.amazonaws.com/update-progress" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\":\"user123\",\"concept_id\":\"differentiation\",\"quiz_score\":75}"
```
