# Docker Deployment Guide

This guide explains how to deploy the Adaptive Learning Decision Engine using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10 or higher
- Docker Compose 2.0 or higher
- At least 4GB of available RAM
- At least 10GB of available disk space

## Architecture

The application consists of four main services:

1. **PostgreSQL Database** - Cloud storage for production data
2. **FastAPI Backend** - Python-based REST API server
3. **Next.js Frontend** - React-based Progressive Web App
4. **Nginx** (production only) - Reverse proxy and load balancer

## Development Deployment

### Quick Start

1. Clone the repository and navigate to the project directory:
```bash
cd adaptive-learning-engine
```

2. Copy the environment template:
```bash
cp .env.example .env
```

3. Start all services:
```bash
docker-compose up -d
```

4. Check service health:
```bash
docker-compose ps
```

5. View logs:
```bash
docker-compose logs -f
```

6. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Development Commands

**Start services:**
```bash
docker-compose up -d
```

**Stop services:**
```bash
docker-compose down
```

**Restart a specific service:**
```bash
docker-compose restart backend
```

**View logs for a specific service:**
```bash
docker-compose logs -f backend
```

**Rebuild services after code changes:**
```bash
docker-compose up -d --build
```

**Execute commands in a running container:**
```bash
docker-compose exec backend bash
docker-compose exec frontend sh
```

**Run database migrations:**
```bash
docker-compose exec backend alembic upgrade head
```

**Seed sample data:**
```bash
docker-compose exec backend python seed_data.py
```

## Production Deployment

### Environment Configuration

1. Create a production environment file:
```bash
cp .env.example .env.production
```

2. Update the following critical variables in `.env.production`:
```env
# IMPORTANT: Change these for production!
SECRET_KEY=<generate-a-strong-random-key>
POSTGRES_PASSWORD=<strong-database-password>
POSTGRES_USER=adaptive_learning_user
POSTGRES_DB=adaptive_learning_prod

# API Configuration
BACKEND_CORS_ORIGINS=["https://yourdomain.com"]
NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# Environment
ENVIRONMENT=production

# Rate Limiting (adjust based on your needs)
RATE_LIMIT_PER_MINUTE=100
```

3. Generate a strong secret key:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### SSL/TLS Configuration

1. Create SSL directory:
```bash
mkdir -p nginx/ssl
```

2. Add your SSL certificates:
```bash
cp your-cert.pem nginx/ssl/cert.pem
cp your-key.pem nginx/ssl/key.pem
```

3. Update `nginx/nginx.conf` to enable HTTPS (uncomment the HTTPS server block)

### Deploy to Production

1. Build production images:
```bash
docker-compose -f docker-compose.prod.yml build
```

2. Start production services:
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

3. Run database migrations:
```bash
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

4. Verify all services are healthy:
```bash
docker-compose -f docker-compose.prod.yml ps
```

## Health Checks

All services include health checks that monitor service availability:

### Database Health Check
- **Endpoint:** Internal PostgreSQL check
- **Interval:** 10 seconds
- **Timeout:** 5 seconds
- **Retries:** 5

### Backend Health Check
- **Endpoint:** `http://localhost:8000/api/health`
- **Interval:** 30 seconds
- **Timeout:** 10 seconds
- **Retries:** 3
- **Start Period:** 40 seconds

### Frontend Health Check
- **Endpoint:** `http://localhost:3000/api/health`
- **Interval:** 30 seconds
- **Timeout:** 10 seconds
- **Retries:** 3
- **Start Period:** 60 seconds

### Nginx Health Check (Production)
- **Endpoint:** `http://localhost/health`
- **Interval:** 30 seconds
- **Timeout:** 10 seconds
- **Retries:** 3

## Networking

### Development Network
- **Network Name:** `adaptive_learning_network`
- **Driver:** bridge
- **Services:** db, backend, frontend

### Production Network
- **Network Name:** `adaptive_learning_network_prod`
- **Driver:** bridge
- **Services:** db, backend, frontend, nginx

All services communicate through the internal Docker network. Only the frontend (development) or nginx (production) is exposed to the host.

## Volumes

### Development Volumes
- `postgres_data` - PostgreSQL database files
- `backend_cache` - Python cache files
- `./backend:/app` - Backend code (hot reload)
- `./frontend:/app` - Frontend code (hot reload)

### Production Volumes
- `postgres_data_prod` - PostgreSQL database files
- `./nginx/nginx.conf` - Nginx configuration
- `./nginx/ssl` - SSL certificates

## Environment Variables

### Database Variables
- `POSTGRES_USER` - PostgreSQL username
- `POSTGRES_PASSWORD` - PostgreSQL password
- `POSTGRES_DB` - Database name
- `DATABASE_URL` - Full PostgreSQL connection string

### Backend Variables
- `SECRET_KEY` - JWT signing key (MUST be changed in production)
- `ALGORITHM` - JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiration time
- `BACKEND_CORS_ORIGINS` - Allowed CORS origins (JSON array)
- `RATE_LIMIT_PER_MINUTE` - API rate limit
- `SYNC_INTERVAL_SECONDS` - Offline sync interval
- `SYNC_RETRY_MAX_ATTEMPTS` - Max sync retry attempts

### Frontend Variables
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NODE_ENV` - Node environment (development/production)

## Troubleshooting

### Services won't start
```bash
# Check logs for errors
docker-compose logs

# Check if ports are already in use
netstat -tuln | grep -E '3000|8000|5432'

# Remove old containers and volumes
docker-compose down -v
docker-compose up -d
```

### Database connection errors
```bash
# Check if database is healthy
docker-compose ps db

# Check database logs
docker-compose logs db

# Verify connection string
docker-compose exec backend env | grep DATABASE_URL
```

### Frontend can't connect to backend
```bash
# Check if backend is healthy
docker-compose ps backend

# Verify CORS configuration
docker-compose exec backend env | grep CORS

# Check network connectivity
docker-compose exec frontend ping backend
```

### Health checks failing
```bash
# Check service logs
docker-compose logs backend
docker-compose logs frontend

# Manually test health endpoint
curl http://localhost:8000/api/health
curl http://localhost:3000/api/health
```

### Out of disk space
```bash
# Remove unused Docker resources
docker system prune -a --volumes

# Check disk usage
docker system df
```

## Monitoring

### View resource usage
```bash
docker stats
```

### View service status
```bash
docker-compose ps
```

### View logs in real-time
```bash
docker-compose logs -f --tail=100
```

### Export logs to file
```bash
docker-compose logs > logs.txt
```

## Backup and Restore

### Backup Database
```bash
docker-compose exec db pg_dump -U postgres adaptive_learning > backup.sql
```

### Restore Database
```bash
cat backup.sql | docker-compose exec -T db psql -U postgres adaptive_learning
```

### Backup Volumes
```bash
docker run --rm -v adaptive_learning_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz /data
```

## Security Best Practices

1. **Change default passwords** - Never use default credentials in production
2. **Use strong SECRET_KEY** - Generate a cryptographically secure random key
3. **Enable HTTPS** - Always use SSL/TLS in production
4. **Restrict CORS origins** - Only allow trusted domains
5. **Keep images updated** - Regularly update base images for security patches
6. **Use non-root users** - All containers run as non-root users
7. **Limit resource usage** - Set memory and CPU limits in production
8. **Enable firewall** - Restrict access to only necessary ports
9. **Regular backups** - Automate database backups
10. **Monitor logs** - Set up log aggregation and monitoring

## Performance Optimization

### Production Optimizations
- Multi-stage builds reduce image size
- Backend runs with 4 workers (adjust based on CPU cores)
- Nginx caching for static assets
- Connection pooling for database
- Rate limiting to prevent abuse

### Scaling
To scale services horizontally:
```bash
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
