#!/bin/bash
# Script to run property tests for database schema

# Check if running in Docker
if [ -f /.dockerenv ]; then
    echo "Running in Docker container..."
    python -m pytest tests/test_database_schema_properties.py -v
else
    echo "Not in Docker. Attempting to run with local Python..."
    
    # Try different Python commands
    if command -v python &> /dev/null; then
        python -m pytest tests/test_database_schema_properties.py -v
    elif command -v python3 &> /dev/null; then
        python3 -m pytest tests/test_database_schema_properties.py -v
    else
        echo "Error: Python not found. Please run tests using Docker:"
        echo "  docker-compose run --rm backend python -m pytest tests/test_database_schema_properties.py -v"
        exit 1
    fi
fi
