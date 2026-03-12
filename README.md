# Adaptive Learning Decision Engine

An offline-first AI system that provides intelligent, explainable study recommendations to students based on performance data, syllabus structure, and exam weightage.

## 🌐 Live Demo

**Frontend Demo**: https://d3ctpm1r7o6k3m.cloudfront.net  
**API Endpoint**: https://b3fw6ipszl.execute-api.us-east-1.amazonaws.com  
**Status**: ✅ Production Ready | 71/71 Tests Passing 

## 🎯 Overview
    
This is **NOT** a chatbot tutor. This is a **decision intelligence engine** that answers:

> "Given limited time, what topic should I study right now to maximize my exam score?"

The system operates deterministically with full explainability, ensuring students understand exactly why each recommendation is made.

## ✨ Key Features

### 1. **Student Assessment Engine**
- Tracks accuracy, speed, confidence, and mistake patterns
- Computes per-concept mastery scores (0-100)
- Real-time performance tracking  
 
### 2. **Syllabus Knowledge Graph**
- Directed acyclic graph (DAG) of topics and prerequisites
- Multi-level hierarchy: Subject → Chapter → Topic → Concept
- Exam weightage and estimated study time per topic

### 3. **Decision Intelligence Algorithm**
Computes priority scores using: 
```
Priority Score = (Exam Weightage × Importance) / 
                 (Weakness Score × Dependency Factor × Mastery Level × Time Cost)
```

### 4. **Explainable AI** 🔍
Every recommendation includes clear reasoning:
```
Study Trigonometric Identities because:
• 18% of exam questions come from this topic
• Your current accuracy is 42% (needs improvement)
• Mastering this unlocks 3 future chapters
• Expected improvement: +12 marks
• Estimated study time: 2.5 hours
```

### 5. **Adaptive Study Planner**
- Daily and weekly study plans
- Spaced repetition revision cycles
- Exam countdown strategy
- Auto-adjusts based on progress

### 6. **Offline-First Architecture**
- Works completely without internet
- Local SQLite database
- Automatic sync to PostgreSQL cloud when online
- Conflict resolution with latest-attempt-wins strategy

### 7. **Teacher Analytics Dashboard**
- Class-wide performance metrics
- Identify at-risk students
- Predict board exam results
- Track weak topics across the class

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- Next.js 14 (React 18) with App Router
- TailwindCSS for styling
- Progressive Web App (PWA)
- IndexedDB for offline storage

**Backend:**
- FastAPI (Python 3.11+)
- SQLAlchemy ORM
- Pydantic for validation
- JWT authentication

**Databases:**
- SQLite (local offline storage)
- PostgreSQL 15 (cloud sync)

**DevOps:**
- Docker & Docker Compose
- Nginx reverse proxy
- Alembic migrations

### System Architecture

```
┌─────────────────┐
│   Next.js PWA   │
│   (Frontend)    │
└────────┬────────┘
         │
    ┌────┴────┐
    │  SQLite │ (Offline)
    └─────────┘
         │
         │ REST API
         ▼
┌─────────────────┐
│  FastAPI Server │
│   (Backend)     │
└────────┬────────┘
         │
    ┌────┴────────┐
    │ PostgreSQL  │ (Cloud)
    └─────────────┘
```

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended for Local/Development)

Get the entire system running with one command:

```bash
# Clone the repository
git clone https://github.com/yourusername/adaptive-learning-engine.git
cd adaptive-learning-engine

# Configure environment
cp .env.example .env
# Edit .env with your settings (at minimum, change JWT_SECRET and POSTGRES_PASSWORD)

# Start all services (database, backend, frontend)
docker-compose up -d

# Run database migrations
docker-compose exec backend alembic upgrade head

# Load sample data (optional)
docker-compose exec backend python fixtures/demo.py

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

**What you get**:
- ✅ PostgreSQL database
- ✅ FastAPI backend with all APIs
- ✅ Next.js frontend with PWA support
- ✅ Automatic offline sync
- ✅ Sample data and demo users
- ✅ Health checks and monitoring

📖 **Detailed Guide**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

### Option 2: AWS Deployment (Production)

Deploy to AWS in 15 minutes with one command:

```bash
# Configure AWS credentials
aws configure

# Deploy everything
chmod +x deploy-complete.sh
./deploy-complete.sh
```

**What you get**:
- ✅ Live application URL (CloudFront)
- ✅ Serverless API (Lambda + API Gateway)
- ✅ Scalable database (DynamoDB)
- ✅ AI features (Amazon Bedrock)
- ✅ Demo users and data
- ✅ Automated tests

**Cost**: $10-20/month for low-medium traffic

📖 **Detailed Guide**: See [QUICK_START_AWS.md](QUICK_START_AWS.md)

### Option 3: Local Development (Without Docker)

For development without Docker:

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/adaptive-learning-engine.git
cd adaptive-learning-engine
```

2. **Set up PostgreSQL**
```bash
# Install PostgreSQL 15
# Create database
createdb adaptive_learning
```

3. **Start the backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with database URL
alembic upgrade head
uvicorn main:app --reload
```

4. **Start the frontend**
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with backend URL
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📚 Documentation

### Getting Started
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Complete deployment instructions (Docker, AWS, local)
- [User Guide](USER_GUIDE.md) - Complete guide for students, teachers, and admins
- [Environment Variables](ENVIRONMENT_VARIABLES.md) - All configuration options explained

### API Documentation
- [API Documentation](API_DOCUMENTATION.md) - Complete REST API reference
- [Interactive API Docs](http://localhost:8000/docs) - Swagger UI (when running locally)

### Deployment Guides
- [Quick Start - AWS Deployment](QUICK_START_AWS.md) - Deploy to AWS in 15 minutes
- [Deployment Summary](DEPLOYMENT_SUMMARY.md) - Complete deployment overview
- [AWS Architecture](AWS_ARCHITECTURE.md) - Detailed AWS architecture
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Step-by-step checklist

### Technical Documentation
- [Architecture Document](ARCHITECTURE.md) - System architecture and design
- [Design Document](.kiro/specs/adaptive-learning-decision-engine/design.md) - Detailed design specifications
- [Requirements Document](.kiro/specs/adaptive-learning-decision-engine/requirements.md) - Complete requirements
- [Product Readiness](PRODUCT_READINESS.md) - Feature completeness status

### Business Documentation
- [Investor Brief](INVESTOR_BRIEF.md) - Business positioning and scalability
- [Subscription Model](SUBSCRIPTION_MODEL.md) - Monetization strategy

## 🧪 Testing

The system uses a dual testing approach:

### Unit Tests
```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

### Property-Based Tests
56 correctness properties validated using:
- **Hypothesis** (Python) for backend
- **fast-check** (TypeScript) for frontend

```bash
# Run property tests
pytest tests/property/
```

## 🎓 Core Algorithms

### Mastery Score Calculation
```python
mastery_score = (
    0.5 * accuracy_rate +
    0.2 * speed_factor +
    0.2 * confidence_factor +
    0.1 * consistency_factor
) * 100
```

### Priority Score Formula
```python
Priority_Score = (Exam_Weightage × Importance_Factor) / 
                 (Weakness_Score × Dependency_Factor × Mastery_Level × Time_Cost)
```

### Study Plan Generation
1. Get student's available hours per day
2. Get top N recommendations based on priority scores
3. Allocate time proportional to priority
4. Reserve 20% for revision (spaced repetition)
5. Ensure no topic exceeds 50% of daily time

## 📦 Submission Layout

The final submission artifacts are available at repository root:

- `backend/lambda_function.py` - AWS Lambda decision engine
- `backend/requirements.txt` - backend Python dependencies
- `frontend/lib/api.js` - frontend API client with offline-first helper
- `frontend/.env.example` - required frontend environment variable
- `DEPLOYMENT.md` - end-to-end deployment and demo checklist
- `ARCHITECTURE.md` - production-demo architecture explanation
- `INVESTOR_BRIEF.md` - positioning, scalability, defensibility, and cost narrative
- `SUBSCRIPTION_MODEL.md` - tiering, usage limits, and feature gating model
- `PRODUCT_READINESS.md` - hardening summary (stability, prompts, UX polish)

## 👥 User Roles

### Students
- Solve questions and track performance
- Receive personalized recommendations
- View study plans and progress analytics
- Works offline on mobile devices

### Teachers
- Monitor class-wide performance
- Identify struggling students
- View topic-wise analytics
- Predict exam outcomes

### School Admins
- Access all teacher features
- Manage users and classes
- View system-wide analytics

## 📊 Performance Requirements

- **Recommendation computation:** < 200ms
- **Database queries:** < 100ms
- **Dashboard load time:** < 3s on 3G
- **Minimum device specs:** 2GB RAM, dual-core processor
- **Concurrent users:** 1000+

## 🔒 Security

- Bcrypt password hashing (12 rounds)
- JWT token authentication (24-hour expiration)
- Role-based access control (RBAC)
- HTTP-only cookies for token storage
- Rate limiting on all endpoints

## 📱 Mobile Support

- Responsive design (320px - 2560px)
- Progressive Web App (PWA)
- Touch-friendly UI (44px minimum tap targets)
- Offline-first architecture
- Installable on iOS and Android

## 🛠️ Development

### Project Structure
```
adaptive-learning-engine/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── models/      # SQLAlchemy models
│   │   ├── services/    # Business logic
│   │   ├── api/         # API endpoints
│   │   └── core/        # Config, auth, etc.
│   ├── tests/           # Unit & property tests
│   └── alembic/         # Database migrations
├── frontend/            # Next.js frontend
│   ├── app/             # App router pages
│   ├── components/      # React components
│   ├── lib/             # Utilities
│   └── public/          # Static assets
├── docker/              # Docker configurations
└── docs/                # Additional documentation
```

### Running in Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with property-based testing for mathematical correctness
- Inspired by spaced repetition and cognitive science research
- Designed for students in areas with unreliable internet connectivity

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check the [documentation](.kiro/specs/adaptive-learning-decision-engine/)
- Review the [API documentation](http://localhost:8000/docs) when running locally

---
                                                                             **Built with ❤️ for students who want to study smarter, not harder.**                     









    
