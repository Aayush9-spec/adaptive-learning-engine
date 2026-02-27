# Adaptive Learning Decision Engine - MVP Quickstart

## What's Been Implemented

This MVP includes the core backend functionality:

### ✅ Completed Features

1. **Authentication & Authorization**
   - User registration and login with JWT tokens
   - Role-based access control (student, teacher, admin)
   - Password hashing with bcrypt

2. **Database & Models**
   - PostgreSQL schema with Alembic migrations
   - Complete data models for users, topics, concepts, questions, attempts, and mastery
   - Referential integrity and indexes

3. **Performance Tracking**
   - Record question attempts with answer, time, and confidence
   - Calculate mastery scores using weighted formula
   - Track mistake patterns and learning gaps
   - Property-based tests for correctness

4. **Knowledge Graph Management**
   - Topic hierarchy with prerequisite relationships
   - DAG validation (prevents circular dependencies)
   - Check if prerequisites are met
   - Get unlockable topics for students

5. **Decision Engine (Core Algorithm)**
   - Priority score calculation with exact formula
   - Get next recommendation based on mastery, weightage, urgency, efficiency
   - Top-N recommendations
   - Detailed explanations with all formula components

6. **API Endpoints**
   - `/api/auth/*` - Authentication
   - `/api/attempts/*` - Performance tracking
   - `/api/topics/*` - Knowledge graph
   - `/api/recommendations/*` - Recommendations and explanations
   - `/api/mastery/*` - Mastery scores

## Quick Start

### 1. Start the Services

```bash
# Start all services with Docker Compose
docker-compose up -d

# Check if services are running
docker-compose ps
```

### 2. Run Database Migrations

```bash
# Enter the backend container
docker-compose exec backend bash

# Run migrations
alembic upgrade head

# Exit container
exit
```

### 3. Seed Sample Data

```bash
# Seed the database with sample topics, questions, and students
docker-compose exec backend python scripts/seed_data.py
```

This creates:
- 10 topics with prerequisite relationships (Math & Physics)
- 300+ questions across all concepts
- 5 sample students (student1-student5, password: password1-password5)
- 1 teacher account (teacher1, password: teacher123)
- Sample performance data for all students

### 4. Test the API

Visit the interactive API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 5. Try the Core Features

#### A. Login as a Student

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "student1", "password": "password1"}'
```

Save the returned `access_token` for subsequent requests.

#### B. Get Recommendations

```bash
# Get next recommended topic
curl -X GET "http://localhost:8000/api/recommendations/next/1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get top 5 recommendations
curl -X GET "http://localhost:8000/api/recommendations/top/1?n=5" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get detailed explanation
curl -X GET "http://localhost:8000/api/recommendations/explain/1/3" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### C. Record a Question Attempt

```bash
curl -X POST "http://localhost:8000/api/attempts/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": 1,
    "answer": "A",
    "time_taken_seconds": 45.5,
    "confidence": 4
  }'
```

#### D. View Mastery Scores

```bash
# Get all mastery scores for a student
curl -X GET "http://localhost:8000/api/mastery/student/1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get mastery for specific concept
curl -X GET "http://localhost:8000/api/mastery/student/1/concept/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### E. View Topics and Prerequisites

```bash
# Get all topics with hierarchy
curl -X GET "http://localhost:8000/api/topics" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get unlockable topics for a student
curl -X GET "http://localhost:8000/api/topics/unlockable/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Testing

### Run Property Tests

```bash
# Run all property tests
docker-compose exec backend pytest backend/tests/test_*_properties.py -v

# Run specific test file
docker-compose exec backend pytest backend/tests/test_performance_tracking_properties.py -v

# Run with coverage
docker-compose exec backend pytest --cov=app backend/tests/
```

### Run Unit Tests

```bash
# Run all tests
docker-compose exec backend pytest -v

# Run specific test
docker-compose exec backend pytest backend/tests/test_auth_service.py -v
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                    (To be implemented)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      FastAPI Backend                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     Auth     │  │  Performance │  │   Decision   │      │
│  │   Service    │  │   Tracker    │  │    Engine    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Knowledge   │  │ Explanation  │  │     API      │      │
│  │    Graph     │  │  Generator   │  │  Endpoints   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  • Users & Profiles    • Topics & Concepts                   │
│  • Questions           • Attempts & Mastery                  │
│  • Prerequisites       • Study Plans                         │
└─────────────────────────────────────────────────────────────┘
```

## Key Algorithms

### Priority Score Formula

```
priority_score = (
    0.4 × (100 - current_mastery) +
    0.3 × exam_weightage +
    0.2 × urgency_factor +
    0.1 × efficiency_factor
)

where:
- urgency_factor = 100 × (1 - days_to_exam / 365)
- efficiency_factor = 100 × (1 / estimated_hours)
```

### Mastery Score Formula

```
mastery_score = (
    0.5 × accuracy_rate +
    0.2 × speed_factor +
    0.2 × confidence_factor +
    0.1 × consistency_factor
) × 100
```

## What's Next

To complete the full MVP, implement:

1. **Frontend** (Tasks 12-15)
   - Next.js with TypeScript
   - Student dashboard with recommendations
   - Question solving interface
   - Progress visualization
   - Teacher analytics dashboard

2. **Study Plan Generator** (Task 7)
   - Daily/weekly/exam countdown plans
   - Spaced repetition
   - Time constraint adherence

3. **Teacher Analytics** (Task 8)
   - Class performance overview
   - At-risk student identification
   - Weak topic detection

4. **Offline Sync** (Task 16)
   - IndexedDB for local storage
   - Sync manager with conflict resolution
   - Offline-first architecture

5. **Additional Features**
   - Rate limiting
   - Error handling middleware
   - PWA configuration
   - Mobile responsiveness

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps db

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Backend Not Starting

```bash
# View backend logs
docker-compose logs backend

# Rebuild backend
docker-compose build backend
docker-compose up -d backend
```

### Reset Database

```bash
# Stop all services
docker-compose down -v

# Start fresh
docker-compose up -d
docker-compose exec backend alembic upgrade head
docker-compose exec backend python scripts/seed_data.py
```

## API Documentation

Full API documentation is available at:
- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc)

## Support

For issues or questions:
1. Check the logs: `docker-compose logs`
2. Review the API docs: http://localhost:8000/docs
3. Check the design document: `.kiro/specs/adaptive-learning-decision-engine/design.md`
4. Review the tasks: `.kiro/specs/adaptive-learning-decision-engine/tasks.md`
