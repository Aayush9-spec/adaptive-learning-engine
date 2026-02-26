.PHONY: help dev prod build up down restart logs health clean migrate seed test

# Default target
help:
	@echo "Adaptive Learning Decision Engine - Docker Commands"
	@echo "=================================================="
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev          - Start development environment"
	@echo "  make build        - Build development images"
	@echo "  make up           - Start services in background"
	@echo "  make down         - Stop and remove services"
	@echo "  make restart      - Restart all services"
	@echo "  make logs         - View logs (all services)"
	@echo "  make logs-backend - View backend logs"
	@echo "  make logs-frontend- View frontend logs"
	@echo "  make logs-db      - View database logs"
	@echo ""
	@echo "Production Commands:"
	@echo "  make prod         - Start production environment"
	@echo "  make prod-build   - Build production images"
	@echo "  make prod-up      - Start production services"
	@echo "  make prod-down    - Stop production services"
	@echo ""
	@echo "Database Commands:"
	@echo "  make migrate      - Run database migrations"
	@echo "  make seed         - Seed sample data"
	@echo "  make db-shell     - Open PostgreSQL shell"
	@echo "  make backup       - Backup database"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make health       - Check service health"
	@echo "  make clean        - Remove all containers and volumes"
	@echo "  make shell-backend- Open backend shell"
	@echo "  make shell-frontend- Open frontend shell"
	@echo "  make test         - Run tests"
	@echo ""

# Development commands
dev: build up migrate seed health
	@echo "✓ Development environment is ready!"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:8000"
	@echo "  API Docs: http://localhost:8000/docs"

build:
	@echo "Building development images..."
	docker-compose build

up:
	@echo "Starting services..."
	docker-compose up -d

down:
	@echo "Stopping services..."
	docker-compose down

restart:
	@echo "Restarting services..."
	docker-compose restart

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f db

# Production commands
prod: prod-build prod-up prod-migrate health
	@echo "✓ Production environment is ready!"

prod-build:
	@echo "Building production images..."
	docker-compose -f docker-compose.prod.yml build

prod-up:
	@echo "Starting production services..."
	docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

prod-down:
	@echo "Stopping production services..."
	docker-compose -f docker-compose.prod.yml down

prod-migrate:
	@echo "Running production migrations..."
	docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Database commands
migrate:
	@echo "Running database migrations..."
	docker-compose exec backend alembic upgrade head

seed:
	@echo "Seeding sample data..."
	docker-compose exec backend python seed_data.py

db-shell:
	@echo "Opening PostgreSQL shell..."
	docker-compose exec db psql -U postgres -d adaptive_learning

backup:
	@echo "Backing up database..."
	@mkdir -p backups
	docker-compose exec db pg_dump -U postgres adaptive_learning > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✓ Backup saved to backups/"

# Utility commands
health:
	@echo "Checking service health..."
	@bash scripts/health-check.sh

clean:
	@echo "Removing all containers and volumes..."
	docker-compose down -v
	docker system prune -f

shell-backend:
	docker-compose exec backend bash

shell-frontend:
	docker-compose exec frontend sh

test:
	@echo "Running tests..."
	docker-compose exec backend pytest
	docker-compose exec frontend npm test

# Quick commands
ps:
	docker-compose ps

stats:
	docker stats

rebuild: down build up
	@echo "✓ Services rebuilt and restarted"
