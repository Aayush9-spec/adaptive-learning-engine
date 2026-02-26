#!/bin/bash
set -e

echo "Starting Adaptive Learning Backend..."

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
while ! pg_isready -h db -p 5432 -U postgres > /dev/null 2>&1; do
    echo "PostgreSQL is unavailable - sleeping"
    sleep 1
done
echo "✓ PostgreSQL is ready"

# Run database migrations
echo "Running database migrations..."
alembic upgrade head
echo "✓ Migrations complete"

# Initialize SQLite database
echo "Initializing SQLite database..."
python init_db.py
echo "✓ SQLite initialized"

# Start the application
echo "Starting FastAPI application..."
exec "$@"
