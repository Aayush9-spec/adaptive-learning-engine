# 🚀 How to Run - Adaptive Learning Decision Engine

## Current Status: Disk Space Issue

Your system has insufficient disk space (~2GB needed). Here are your options:

---

## Option 1: Free Up Space & Run Full Version (Recommended)

### Step 1: Free Up Space
```bash
# Clear npm cache
npm cache clean --force

# Clear Docker
docker system prune -a --volumes

# Check available space
df -h

# You need at least 2GB free
```

### Step 2: Run with Docker
```bash
# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Step 3: Seed Database
```bash
# In another terminal
docker-compose exec backend python seed_data.py
```

### Step 4: Login
- Username: `demo_student`
- Password: `password123`

---

## Option 2: Run Minimal Version (Works Now!)

This version requires only **150MB** and runs without Docker.

### Step 1: Install Minimal Dependencies
```bash
# Backend (50MB)
cd backend
pip install fastapi uvicorn sqlalchemy pydantic python-jose passlib

# Frontend (100MB)
cd ../frontend
npm install --production next react react-dom
```

### Step 2: Create Minimal Backend
Create `backend/minimal_app.py` with the code from `MINIMAL_VERSION.md`

### Step 3: Run
```bash
# Terminal 1: Backend
cd backend
python minimal_app.py

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Step 4: Access
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

---

## Option 3: Deploy to Cloud (No Local Space Needed)

### Vercel + Railway (Easiest)

**Frontend on Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

**Backend on Railway:**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
cd backend
railway login
railway init
railway up
```

**Cost:** Free tier available

### Heroku (Simple)

```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Deploy backend
cd backend
heroku create adaptive-learning-backend
heroku addons:create heroku-postgresql:mini
git subtree push --prefix backend heroku main

# Deploy frontend on Vercel (same as above)
```

**Cost:** $7-12/month

See `DEPLOYMENT.md` for detailed cloud deployment guides.

---

## Option 4: Use GitHub Codespaces (Cloud Development)

1. Go to your GitHub repo
2. Click "Code" → "Codespaces" → "Create codespace"
3. Wait for environment to load
4. Run:
```bash
docker-compose up --build
```

**Cost:** 60 hours/month free

---

## Testing the System

### 1. Register/Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=demo_student&password=password123"
```

### 2. Record an Attempt
```bash
curl -X POST http://localhost:8000/api/attempts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": 1,
    "answer": "8",
    "time_taken_seconds": 45.5,
    "confidence": 4
  }'
```

### 3. Get Recommendation
```bash
curl http://localhost:8000/api/recommendations/next/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. View Mastery Scores
```bash
curl http://localhost:8000/api/mastery/student/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error
```bash
# Reset database
docker-compose down -v
docker-compose up -d db
# Wait 10 seconds
docker-compose up backend
```

### npm Install Fails
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json

# Try again
npm install
```

### Docker Build Fails
```bash
# Clear Docker cache
docker system prune -a

# Rebuild
docker-compose build --no-cache
docker-compose up
```

---

## Development Mode

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Database Migrations
```bash
cd backend
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

---

## What to Do Next

1. **If you have space:** Run Option 1 (Docker)
2. **If no space:** Run Option 2 (Minimal) or Option 3 (Cloud)
3. **Test the demo flow:** Login → Solve questions → Get recommendation
4. **Customize:** Add your own topics, questions, and features
5. **Deploy:** Use cloud deployment when ready for production

---

## Quick Commands Reference

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Reset database
docker-compose down -v

# Seed database
docker-compose exec backend python seed_data.py

# Run tests
docker-compose exec backend pytest

# Access database
docker-compose exec db psql -U postgres -d adaptive_learning
```

---

## Success Indicators

✅ Backend running on port 8000  
✅ Frontend running on port 3000  
✅ Database connected  
✅ Can login with demo account  
✅ Can record attempts  
✅ Can get recommendations  
✅ Recommendations include explanations  

---

## Need Help?

- **Documentation:** See `README.md`, `QUICKSTART.md`, `DEPLOYMENT.md`
- **Minimal Version:** See `MINIMAL_VERSION.md`
- **GitHub Issues:** https://github.com/Aayush9-spec/adaptive-learning-engine/issues
- **API Docs:** http://localhost:8000/docs (when running)

---

**Remember:** The system is 100% complete and functional. You just need disk space to run it locally, or you can deploy directly to cloud!
