#!/bin/bash

# Adaptive Learning Decision Engine - MVP Setup Script
# This script sets up and runs the complete MVP

set -e

echo "=========================================="
echo "Adaptive Learning Engine - MVP Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Clean up macOS metadata files
echo "Cleaning up macOS metadata files..."
find . -name "._*" -type f -delete 2>/dev/null || true
find . -name ".DS_Store" -type f -delete 2>/dev/null || true

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"

# Stop any existing containers
echo ""
echo "Stopping any existing containers..."
docker-compose -f docker-compose.simple.yml down -v 2>/dev/null || true

# Build and start services
echo ""
echo "Building and starting services..."
docker-compose -f docker-compose.simple.yml up -d --build

# Wait for database to be ready
echo ""
echo "Waiting for database to be ready..."
sleep 10

# Check if backend is healthy
echo "Waiting for backend to be ready..."
for i in {1..30}; do
    if docker-compose -f docker-compose.simple.yml exec -T backend curl -f http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ Backend failed to start${NC}"
        echo "Checking logs..."
        docker-compose -f docker-compose.simple.yml logs backend
        exit 1
    fi
    sleep 2
done

# Run database migrations
echo ""
echo "Running database migrations..."
docker-compose -f docker-compose.simple.yml exec -T backend alembic upgrade head

# Seed database with sample data
echo ""
echo "Seeding database with sample data..."
docker-compose -f docker-compose.simple.yml exec -T backend python scripts/seed_data.py

echo ""
echo "=========================================="
echo -e "${GREEN}✓ MVP Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "🎓 Your Adaptive Learning Engine is ready!"
echo ""
echo "Access the application:"
echo "  • Frontend:  http://localhost"
echo "  • API Docs:  http://localhost:8000/docs"
echo "  • Backend:   http://localhost:8000"
echo ""
echo "Sample Accounts:"
echo "  • Students: student1-student5 (password: password1-password5)"
echo "  • Teacher:  teacher1 (password: teacher123)"
echo ""
echo "Quick Commands:"
echo "  • View logs:     docker-compose -f docker-compose.simple.yml logs -f"
echo "  • Stop services: docker-compose -f docker-compose.simple.yml down"
echo "  • Restart:       docker-compose -f docker-compose.simple.yml restart"
echo ""
echo "For more information, see MVP_QUICKSTART.md"
echo ""
