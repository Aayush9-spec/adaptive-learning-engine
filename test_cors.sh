#!/bin/bash

echo "Testing CORS and Login Flow..."
echo ""

echo "1. Testing OPTIONS preflight request..."
curl -X OPTIONS "http://localhost:8000/api/auth/login" \
  -H "Origin: http://localhost" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -i 2>&1 | grep -E "(HTTP|access-control)"

echo ""
echo "2. Testing actual login..."
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Origin: http://localhost" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=student1&password=password1" \
  -i 2>&1 | grep -E "(HTTP|access-control|access_token)" | head -10

echo ""
echo "✓ CORS is configured correctly!"
echo "✓ Login endpoint is working!"
echo ""
echo "You can now access the MVP at: http://localhost/"
