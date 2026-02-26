#!/bin/bash

# Health Check Script for Adaptive Learning Decision Engine
# This script checks the health of all Docker services

set -e

echo "🏥 Adaptive Learning Decision Engine - Health Check"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a service is healthy
check_service() {
    local service_name=$1
    local url=$2
    local max_retries=5
    local retry_count=0
    
    echo -n "Checking $service_name... "
    
    while [ $retry_count -lt $max_retries ]; do
        if curl -f -s -o /dev/null "$url"; then
            echo -e "${GREEN}✓ Healthy${NC}"
            return 0
        fi
        retry_count=$((retry_count + 1))
        sleep 2
    done
    
    echo -e "${RED}✗ Unhealthy${NC}"
    return 1
}

# Function to check Docker service status
check_docker_service() {
    local service_name=$1
    echo -n "Checking Docker service $service_name... "
    
    if docker-compose ps | grep -q "$service_name.*Up.*healthy"; then
        echo -e "${GREEN}✓ Running${NC}"
        return 0
    elif docker-compose ps | grep -q "$service_name.*Up"; then
        echo -e "${YELLOW}⚠ Running (no health check)${NC}"
        return 0
    else
        echo -e "${RED}✗ Not running${NC}"
        return 1
    fi
}

# Check if Docker Compose is running
echo "1. Checking Docker Compose services..."
echo "--------------------------------------"

if ! docker-compose ps > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker Compose is not running${NC}"
    echo "Run: docker-compose up -d"
    exit 1
fi

check_docker_service "db" || DB_FAILED=1
check_docker_service "backend" || BACKEND_FAILED=1
check_docker_service "frontend" || FRONTEND_FAILED=1

echo ""
echo "2. Checking service endpoints..."
echo "--------------------------------"

# Check backend health endpoint
check_service "Backend API" "http://localhost:8000/api/health" || BACKEND_HEALTH_FAILED=1

# Check frontend health endpoint
check_service "Frontend" "http://localhost:3000/api/health" || FRONTEND_HEALTH_FAILED=1

# Check backend API docs
check_service "API Documentation" "http://localhost:8000/docs" || DOCS_FAILED=1

echo ""
echo "3. Service Details..."
echo "--------------------"

# Show service status
docker-compose ps

echo ""
echo "4. Summary"
echo "----------"

if [ -z "$DB_FAILED" ] && [ -z "$BACKEND_FAILED" ] && [ -z "$FRONTEND_FAILED" ] && \
   [ -z "$BACKEND_HEALTH_FAILED" ] && [ -z "$FRONTEND_HEALTH_FAILED" ]; then
    echo -e "${GREEN}✓ All services are healthy!${NC}"
    echo ""
    echo "Access the application:"
    echo "  Frontend:        http://localhost:3000"
    echo "  Backend API:     http://localhost:8000"
    echo "  API Docs:        http://localhost:8000/docs"
    exit 0
else
    echo -e "${RED}✗ Some services are unhealthy${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  View logs:       docker-compose logs -f"
    echo "  Restart:         docker-compose restart"
    echo "  Full restart:    docker-compose down && docker-compose up -d"
    exit 1
fi
