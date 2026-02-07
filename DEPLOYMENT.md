# Cloud Deployment Guide - Adaptive Learning Decision Engine

This guide covers deployment to AWS, Heroku, Vercel, and Railway.

## Table of Contents
1. [Vercel + Railway (Recommended - Easiest)](#vercel--railway)
2. [AWS Deployment (Production-Grade)](#aws-deployment)
3. [Heroku Deployment (Simple)](#heroku-deployment)
4. [DigitalOcean App Platform](#digitalocean)

---

## Vercel + Railway (Recommended - Easiest)

**Cost:** Free tier available  
**Setup Time:** 15 minutes  
**Best For:** Quick deployment, automatic scaling

### Frontend on Vercel

1. **Push to GitHub** (already done ✅)

2. **Deploy to Vercel:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   cd frontend
   vercel
   ```

   Or use Vercel Dashboard:
   - Go to https://vercel.com
   - Click "Import Project"
   - Select your GitHub repo
   - Set root directory to `frontend`
   - Deploy!

3. **Environment Variables in Vercel:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
   ```

### Backend on Railway

1. **Create Railway Account:** https://railway.app

2. **Deploy Backend:**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login
   railway login
   
   # Initialize
   cd backend
   railway init
   
   # Deploy
   railway up
   ```

3. **Add PostgreSQL:**
   - In Railway dashboard, click "New"
   - Select "PostgreSQL"
   - Railway auto-configures DATABASE_URL

4. **Environment Variables in Railway:**
   ```
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   BACKEND_CORS_ORIGINS=["https://your-frontend.vercel.app"]
   ```

5. **Run Migrations:**
   ```bash
   railway run alembic upgrade head
   ```

**Total Cost:** $0/month (free tier)

---

## AWS Deployment (Production-Grade)

**Cost:** ~$20-50/month  
**Setup Time:** 1-2 hours  
**Best For:** Enterprise, high traffic, full control

### Architecture

```
CloudFront (CDN)
    ↓
S3 (Frontend Static Files)
    ↓
API Gateway → Lambda (Backend)
    ↓
RDS PostgreSQL (Database)
```

### Step 1: Backend on AWS Lambda

1. **Install AWS SAM CLI:**
   ```bash
   brew install aws-sam-cli  # macOS
   # or
   pip install aws-sam-cli
   ```

2. **Create SAM Template** (`backend/template.yaml`):
   ```yaml
   AWSTemplateFormatVersion: '2010-09-09'
   Transform: AWS::Serverless-2016-10-31
   
   Resources:
     AdaptiveLearningAPI:
       Type: AWS::Serverless::Function
       Properties:
         Handler: app.main.handler
         Runtime: python3.11
         CodeUri: .
         MemorySize: 512
         Timeout: 30
         Environment:
           Variables:
             DATABASE_URL: !Ref DatabaseURL
             SECRET_KEY: !Ref SecretKey
         Events:
           ApiEvent:
             Type: Api
             Properties:
               Path: /{proxy+}
               Method: ANY
   
     Database:
       Type: AWS::RDS::DBInstance
       Properties:
         DBInstanceClass: db.t3.micro
         Engine: postgres
         MasterUsername: admin
         MasterUserPassword: !Ref DBPassword
         AllocatedStorage: 20
   ```

3. **Deploy:**
   ```bash
   cd backend
   sam build
   sam deploy --guided
   ```

### Step 2: Frontend on S3 + CloudFront

1. **Build Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Create S3 Bucket:**
   ```bash
   aws s3 mb s3://adaptive-learning-frontend
   aws s3 sync out/ s3://adaptive-learning-frontend
   ```

3. **Create CloudFront Distribution:**
   ```bash
   aws cloudfront create-distribution \
     --origin-domain-name adaptive-learning-frontend.s3.amazonaws.com
   ```

4. **Update DNS:**
   - Point your domain to CloudFront distribution

**Estimated Cost:**
- Lambda: $0-5/month (1M requests free)
- RDS: $15-25/month (t3.micro)
- S3 + CloudFront: $1-5/month
- **Total: ~$20-35/month**

---

## Heroku Deployment (Simple)

**Cost:** $7-25/month  
**Setup Time:** 20 minutes  
**Best For:** Startups, MVPs

### Backend on Heroku

1. **Install Heroku CLI:**
   ```bash
   brew install heroku/brew/heroku
   heroku login
   ```

2. **Create Heroku App:**
   ```bash
   cd backend
   heroku create adaptive-learning-backend
   ```

3. **Add PostgreSQL:**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

4. **Create Procfile** (`backend/Procfile`):
   ```
   web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   release: alembic upgrade head
   ```

5. **Deploy:**
   ```bash
   git subtree push --prefix backend heroku main
   ```

6. **Set Environment Variables:**
   ```bash
   heroku config:set SECRET_KEY=your-secret-key
   heroku config:set ALGORITHM=HS256
   ```

### Frontend on Vercel

Same as Vercel + Railway section above.

**Total Cost:** $7-12/month (Heroku Eco dyno)

---

## DigitalOcean App Platform

**Cost:** $12-24/month  
**Setup Time:** 30 minutes  
**Best For:** Balanced cost/features

1. **Create DigitalOcean Account:** https://digitalocean.com

2. **Create App:**
   - Click "Create" → "Apps"
   - Connect GitHub repo
   - Select branch: `main`

3. **Configure Components:**

   **Backend:**
   - Type: Web Service
   - Source Directory: `/backend`
   - Build Command: `pip install -r requirements.txt`
   - Run Command: `uvicorn app.main:app --host 0.0.0.0 --port 8080`
   - HTTP Port: 8080

   **Frontend:**
   - Type: Static Site
   - Source Directory: `/frontend`
   - Build Command: `npm install && npm run build`
   - Output Directory: `out`

4. **Add Database:**
   - Click "Add Resource" → "Database"
   - Select PostgreSQL
   - Plan: Basic ($12/month)

5. **Environment Variables:**
   ```
   DATABASE_URL=${db.DATABASE_URL}
   SECRET_KEY=your-secret-key
   NEXT_PUBLIC_API_URL=${backend.PUBLIC_URL}/api
   ```

**Total Cost:** $12-24/month

---

## Comparison Table

| Platform | Cost/Month | Setup Time | Scaling | Best For |
|----------|-----------|------------|---------|----------|
| **Vercel + Railway** | $0-5 | 15 min | Auto | Quick start, free tier |
| **AWS** | $20-50 | 1-2 hrs | Manual | Enterprise, high traffic |
| **Heroku** | $7-25 | 20 min | Auto | MVPs, startups |
| **DigitalOcean** | $12-24 | 30 min | Auto | Balanced cost/features |

---

## Post-Deployment Checklist

- [ ] Set up custom domain
- [ ] Configure SSL/HTTPS (auto on most platforms)
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure backups (database)
- [ ] Set up CI/CD pipeline
- [ ] Add environment-specific configs
- [ ] Test all API endpoints
- [ ] Test offline functionality
- [ ] Load test with 100+ concurrent users
- [ ] Set up error tracking
- [ ] Configure CDN for static assets
- [ ] Enable database connection pooling
- [ ] Set up automated database backups

---

## Monitoring & Observability

### Recommended Tools

1. **Application Monitoring:**
   - Sentry (errors): https://sentry.io
   - LogRocket (session replay): https://logrocket.com
   - New Relic (APM): https://newrelic.com

2. **Uptime Monitoring:**
   - UptimeRobot: https://uptimerobot.com (free)
   - Pingdom: https://pingdom.com

3. **Analytics:**
   - Plausible (privacy-friendly): https://plausible.io
   - Google Analytics

### Setup Sentry (Recommended)

```bash
# Backend
pip install sentry-sdk[fastapi]

# In app/main.py
import sentry_sdk
sentry_sdk.init(dsn="your-dsn-here")

# Frontend
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## Scaling Considerations

### When to Scale

- Response time > 500ms
- CPU usage > 70%
- Memory usage > 80%
- Database connections maxed out

### Scaling Strategies

1. **Horizontal Scaling:**
   - Add more backend instances
   - Use load balancer (AWS ALB, Nginx)

2. **Database Scaling:**
   - Add read replicas
   - Implement caching (Redis)
   - Use connection pooling

3. **Frontend Optimization:**
   - Enable CDN caching
   - Implement code splitting
   - Use image optimization

4. **Caching Strategy:**
   ```python
   # Add Redis for caching
   from redis import Redis
   cache = Redis(host='localhost', port=6379)
   
   # Cache recommendations for 5 minutes
   @cache_result(ttl=300)
   def get_recommendation(student_id):
       # ... computation
   ```

---

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Set secure HTTP headers
- [ ] Implement rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable CORS properly
- [ ] Sanitize user inputs
- [ ] Use prepared statements (SQLAlchemy does this)
- [ ] Implement JWT token expiration
- [ ] Set up database backups
- [ ] Enable database encryption at rest
- [ ] Use secrets manager (AWS Secrets Manager, etc.)
- [ ] Implement audit logging
- [ ] Set up WAF (Web Application Firewall)

---

## Cost Optimization

### Tips to Reduce Costs

1. **Use Free Tiers:**
   - Vercel: Free for personal projects
   - Railway: $5 credit/month
   - AWS: 12 months free tier

2. **Optimize Database:**
   - Use connection pooling
   - Implement query caching
   - Archive old data

3. **CDN Caching:**
   - Cache static assets
   - Set proper cache headers
   - Use image optimization

4. **Serverless for Low Traffic:**
   - AWS Lambda (pay per request)
   - Vercel Functions
   - Cloudflare Workers

---

## Troubleshooting

### Common Issues

**1. Database Connection Errors:**
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

**2. CORS Errors:**
```python
# In app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**3. Build Failures:**
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**4. Memory Issues:**
```yaml
# Increase memory in deployment config
memory: 1024  # MB
```

---

## Support

- **Documentation:** See `.kiro/specs/` directory
- **GitHub Issues:** https://github.com/Aayush9-spec/adaptive-learning-engine/issues
- **Community:** Create discussions on GitHub

---

**Recommendation:** Start with **Vercel + Railway** for fastest deployment, then migrate to AWS when you need more control or have higher traffic.
