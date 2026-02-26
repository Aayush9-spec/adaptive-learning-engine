# Docker Setup - Quick Reference

This document provides a quick reference for Docker-related commands and configurations.

## Quick Start

### Development (Recommended for first-time setup)

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start everything with one command
make dev

# Or manually:
docker-compose up -d
docker-compose exec backend alembic upgrade head
docker-compose exec backend python seed_data.py
```

### Production

```bash
# 1. Copy and configure production environment
cp .env.production.example .env.production
# Edit .env.production with your values

# 2. Start production environment
make prod

# Or manually:
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

## Available Make Commands

```bash
make help          # Show all available commands
make dev           # Start development environment (recommended)
make prod          # Start production environment
make health        # Check if all services are healthy
make logs          # View logs from all services
make migrate       # Run database migrations
make seed          # Seed sample data
make clean         # Remove all containers and volumes
```

## Service URLs

### Development
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **PostgreSQL:** localhost:5432

### Production
- **Application:** http://localhost (or your domain)
- **API:** http://localhost/api (or your domain)

## Docker Compose Files

- `docker-compose.yml` - Development configuration
- `docker-compose.prod.yml` - Production configuration with Nginx

## Dockerfiles

- `backend/Dockerfile` - Development backend image
- `backend/Dockerfile.prod` - Production backend image (multi-stage)
- `frontend/Dockerfile` - Development frontend image
- `frontend/Dockerfile.prod` - Production frontend image (multi-stage)

## Health Checks

All services include health checks:

| Service  | Endpoint                          | Interval | Timeout | Retries |
|----------|-----------------------------------|----------|---------|---------|
| Database | Internal PostgreSQL check         | 10s      | 5s      | 5       |
| Backend  | http://localhost:8000/api/health  | 30s      | 10s     | 3       |
| Frontend | http://localhost:3000/api/health  | 30s      | 10s     | 3       |
| Nginx    | http://localhost/health           | 30s      | 10s     | 3       |

## Networking

### Development
- Network: `adaptive_learning_network`
- All services communicate internally
- Frontend and Backend exposed to host

### Production
- Network: `adaptive_learning_network_prod`
- All services communicate internally
- Only Nginx exposed to host (ports 80/443)

## Volumes

### Development
- `postgres_data` - Database persistence
- `backend_cache` - Python cache
- `./backend:/app` - Backend code (hot reload)
- `./frontend:/app` - Frontend code (hot reload)

### Production
- `postgres_data_prod` - Database persistence
- No code volumes (images are self-contained)

## Environment Variables

See `.env.example` for development and `.env.production.example` for production.

### Critical Variables to Change in Production

1. `SECRET_KEY` - Generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
2. `POSTGRES_PASSWORD` - Use a strong password
3. `POSTGRES_USER` - Change from default
4. `BACKEND_CORS_ORIGINS` - Set to your domain
5. `NEXT_PUBLIC_API_URL` - Set to your domain

## Common Tasks

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Restart Services
```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend
```

### Execute Commands in Containers
```bash
# Backend shell
docker-compose exec backend bash

# Frontend shell
docker-compose exec frontend sh

# Database shell
docker-compose exec db psql -U postgres -d adaptive_learning
```

### Database Operations
```bash
# Run migrations
docker-compose exec backend alembic upgrade head

# Seed data
docker-compose exec backend python seed_data.py

# Backup database
docker-compose exec db pg_dump -U postgres adaptive_learning > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T db psql -U postgres adaptive_learning
```

### Rebuild After Code Changes
```bash
# Development (with hot reload, no rebuild needed)
# Just save your files

# If you need to rebuild
docker-compose up -d --build

# Or with make
make rebuild
```

### Clean Up
```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (WARNING: deletes data)
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a --volumes
```

## Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs

# Check if ports are in use
lsof -i :3000
lsof -i :8000
lsof -i :5432

# Remove and restart
docker-compose down -v
docker-compose up -d
```

### Database connection errors
```bash
# Check database health
docker-compose ps db

# Check database logs
docker-compose logs db

# Verify connection string
docker-compose exec backend env | grep DATABASE_URL
```

### Frontend can't connect to backend
```bash
# Check backend health
curl http://localhost:8000/api/health

# Check CORS settings
docker-compose exec backend env | grep CORS

# Check network
docker-compose exec frontend ping backend
```

### Out of disk space
```bash
# Check Docker disk usage
docker system df

# Clean up
docker system prune -a --volumes
```

## Security Checklist for Production

- [ ] Changed `SECRET_KEY` to a strong random value
- [ ] Changed `POSTGRES_PASSWORD` to a strong password
- [ ] Changed `POSTGRES_USER` from default
- [ ] Updated `BACKEND_CORS_ORIGINS` to your domain
- [ ] Updated `NEXT_PUBLIC_API_URL` to your domain
- [ ] Enabled HTTPS with valid SSL certificates
- [ ] Set `FORCE_HTTPS=true`
- [ ] Set `SESSION_COOKIE_SECURE=true`
- [ ] Configured firewall to restrict access
- [ ] Set up regular database backups
- [ ] Configured log monitoring
- [ ] Limited resource usage (CPU/memory)
- [ ] Reviewed and adjusted rate limits

## Performance Tuning

### Backend Workers
Adjust `WORKERS` in `.env.production`:
```env
# Set to number of CPU cores
WORKERS=4
```

### Database Connection Pool
```env
DB_POOL_SIZE=20
DB_POOL_MAX_OVERFLOW=40
```

### Nginx Caching
Edit `nginx/nginx.conf` to adjust cache settings.

## Additional Resources

- [Full Docker Guide](./DOCKER_GUIDE.md) - Comprehensive documentation
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions
- [Main README](./README.md) - Project overview

## Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Run health check: `make health`
3. Review [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)
4. Check [Troubleshooting section](#troubleshooting)
