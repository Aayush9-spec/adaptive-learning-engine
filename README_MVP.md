# 🎓 Adaptive Learning Decision Engine - MVP

An AI-powered study recommendation system that helps students optimize their learning by analyzing performance, exam weightage, and time constraints.

## ✨ Features

### 🎯 Intelligent Recommendations
- **Priority-based algorithm** considering mastery, exam weightage, urgency, and efficiency
- **Detailed explanations** showing why each topic is recommended
- **Prerequisite management** ensuring proper learning progression

### 📊 Performance Tracking
- **Mastery score calculation** using accuracy, speed, confidence, and consistency
- **Mistake pattern analysis** to identify common errors
- **Learning gap detection** for targeted improvement

### 🔐 Secure Authentication
- **JWT-based authentication** with role-based access control
- **Student and teacher roles** with appropriate permissions
- **Password hashing** for security

### 📚 Knowledge Graph
- **Topic hierarchy** with prerequisite relationships
- **DAG validation** preventing circular dependencies
- **Unlockable topics** based on prerequisite mastery

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- 4GB RAM available
- Ports 80, 8000, and 5432 available

### One-Command Setup

```bash
./setup_mvp.sh
```

This will:
1. Build and start all services (database, backend, frontend)
2. Run database migrations
3. Seed sample data (topics, questions, students)
4. Display access information

### Manual Setup

```bash
# Start services
docker-compose -f docker-compose.simple.yml up -d --build

# Run migrations
docker-compose -f docker-compose.simple.yml exec backend alembic upgrade head

# Seed data
docker-compose -f docker-compose.simple.yml exec backend python scripts/seed_data.py
```

## 🌐 Access the Application

- **Frontend**: http://localhost
- **API Documentation**: http://localhost:8000/docs
- **Backend API**: http://localhost:8000

## 👥 Sample Accounts

### Students
- `student1` / `password1`
- `student2` / `password2`
- `student3` / `password3`
- `student4` / `password4`
- `student5` / `password5`

### Teacher
- `teacher1` / `teacher123`

## 🧪 Testing

### Run All Tests
```bash
docker-compose -f docker-compose.simple.yml exec backend pytest -v
```

### Run Property Tests
```bash
docker-compose -f docker-compose.simple.yml exec backend pytest backend/tests/test_*_properties.py -v
```

### Test MVP Functionality
```bash
./test_mvp.sh
```

## 📖 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout

### Performance Tracking
- `POST /api/attempts` - Record question attempt
- `GET /api/attempts/student/{student_id}` - Get student attempts
- `GET /api/mastery/student/{student_id}` - Get mastery scores
- `GET /api/mastery/student/{student_id}/concept/{concept_id}` - Get concept mastery

### Knowledge Graph
- `GET /api/topics` - Get all topics with hierarchy
- `GET /api/topics/{topic_id}` - Get topic details
- `GET /api/topics/{topic_id}/prerequisites` - Get prerequisites
- `GET /api/topics/unlockable/{student_id}` - Get unlockable topics
- `POST /api/topics` - Create topic (teacher/admin only)

### Recommendations
- `GET /api/recommendations/next/{student_id}` - Get next recommendation
- `GET /api/recommendations/top/{student_id}?n=5` - Get top N recommendations
- `GET /api/recommendations/explain/{student_id}/{topic_id}` - Get detailed explanation
- `GET /api/recommendations/concepts/{student_id}/{topic_id}` - Get concept recommendations

## 🧮 Core Algorithms

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

## 📁 Project Structure

```
adaptive-learning-engine/
├── backend/
│   ├── app/
│   │   ├── api/              # API endpoints
│   │   ├── core/             # Core utilities
│   │   ├── models/           # Database models
│   │   ├── services/         # Business logic
│   │   └── main.py           # FastAPI app
│   ├── alembic/              # Database migrations
│   ├── scripts/              # Utility scripts
│   ├── tests/                # Test suite
│   └── Dockerfile
├── frontend/
│   └── index.html            # Web interface
├── docker-compose.simple.yml # Docker config
├── setup_mvp.sh              # Setup script
├── test_mvp.sh               # Test script
└── README_MVP.md             # This file
```

## 🛠️ Development

### View Logs
```bash
docker-compose -f docker-compose.simple.yml logs -f
```

### Restart Services
```bash
docker-compose -f docker-compose.simple.yml restart
```

### Stop Services
```bash
docker-compose -f docker-compose.simple.yml down
```

### Reset Database
```bash
docker-compose -f docker-compose.simple.yml down -v
./setup_mvp.sh
```

### Access Backend Shell
```bash
docker-compose -f docker-compose.simple.yml exec backend bash
```

### Access Database
```bash
docker-compose -f docker-compose.simple.yml exec db psql -U postgres -d adaptive_learning
```

## 📊 Sample Data

The seeding script creates:
- **10 topics** across Mathematics and Physics
- **300+ questions** (MCQ, numerical, true/false)
- **5 students** with varied performance data
- **1 teacher** account
- **Prerequisite relationships** forming a DAG

### Topics Included
1. Basic Algebra (foundation)
2. Number Systems (foundation)
3. Linear Equations (requires Basic Algebra)
4. Quadratic Equations (requires Algebra + Linear)
5. Trigonometry Basics (requires Number Systems)
6. Calculus - Differentiation (requires Linear + Quadratic)
7. Calculus - Integration (requires Differentiation)
8. Mechanics - Kinematics (requires Basic Algebra)
9. Mechanics - Dynamics (requires Kinematics)
10. Electricity Basics (requires Basic Algebra)

## 🎯 Use Cases

### For Students
1. **Login** to see personalized dashboard
2. **View recommendations** based on your performance
3. **See detailed explanations** for why topics are recommended
4. **Track mastery scores** across all concepts
5. **Identify learning gaps** and weak areas

### For Teachers
1. **Login** with teacher account
2. **Create new topics** with prerequisites
3. **View student performance** (API endpoints)
4. **Monitor class progress** (API endpoints)

### For Developers
1. **Explore API** at http://localhost:8000/docs
2. **Run tests** to validate functionality
3. **Extend features** using the modular architecture
4. **Add new algorithms** in the services layer

## 🔧 Troubleshooting

### Backend Not Starting
```bash
# Check logs
docker-compose -f docker-compose.simple.yml logs backend

# Rebuild
docker-compose -f docker-compose.simple.yml build backend
docker-compose -f docker-compose.simple.yml up -d backend
```

### Database Connection Issues
```bash
# Check database status
docker-compose -f docker-compose.simple.yml ps db

# Restart database
docker-compose -f docker-compose.simple.yml restart db
```

### Frontend Not Loading
```bash
# Check if nginx is running
docker-compose -f docker-compose.simple.yml ps frontend

# Restart frontend
docker-compose -f docker-compose.simple.yml restart frontend
```

### Port Already in Use
```bash
# Find process using port 80
lsof -i :80

# Or use different ports by modifying docker-compose.simple.yml
```

## 📚 Documentation

- **MVP Quickstart**: `MVP_QUICKSTART.md` - Detailed setup and usage guide
- **Implementation Summary**: `MVP_IMPLEMENTATION_SUMMARY.md` - Complete feature list
- **API Documentation**: http://localhost:8000/docs - Interactive API docs
- **Design Document**: `.kiro/specs/adaptive-learning-decision-engine/design.md`
- **Tasks**: `.kiro/specs/adaptive-learning-decision-engine/tasks.md`

## 🚀 What's Next

This MVP includes the core functionality. To complete the full system:

1. **Study Plan Generator** - Daily/weekly/exam countdown plans
2. **Teacher Analytics** - Class performance, at-risk students
3. **Full Frontend** - Next.js with rich visualizations
4. **Offline Sync** - IndexedDB and sync manager
5. **Additional Tests** - Complete property test suite

See `MVP_IMPLEMENTATION_SUMMARY.md` for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `./test_mvp.sh`
5. Submit a pull request

## 📄 License

See LICENSE file for details.

## 🙏 Acknowledgments

Built with:
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Reliable database
- **SQLAlchemy** - Powerful ORM
- **Alembic** - Database migrations
- **Docker** - Containerization
- **Hypothesis** - Property-based testing

## 📞 Support

For issues or questions:
1. Check the documentation in `MVP_QUICKSTART.md`
2. Review API docs at http://localhost:8000/docs
3. Run `./test_mvp.sh` to verify setup
4. Check logs: `docker-compose -f docker-compose.simple.yml logs`

---

**Ready to try it?**

```bash
./setup_mvp.sh
```

Then visit http://localhost and login with `student1` / `password1`! 🎓
