#!/bin/bash

# Test script for MVP functionality

set -e

echo "=========================================="
echo "Testing Adaptive Learning Engine MVP"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_URL="http://localhost:8000"
TOKEN=""

# Test 1: Health Check
echo "Test 1: Health Check"
if curl -f -s "${API_URL}/health" > /dev/null; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
    exit 1
fi

# Test 2: Login
echo ""
echo "Test 2: User Login"
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/api/auth/login" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=student1&password=password1")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓ Login successful${NC}"
else
    echo -e "${RED}✗ Login failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

# Test 3: Get User Info
echo ""
echo "Test 3: Get User Info"
USER_INFO=$(curl -s -X GET "${API_URL}/api/auth/me" \
    -H "Authorization: Bearer ${TOKEN}")

if echo "$USER_INFO" | grep -q "student1"; then
    echo -e "${GREEN}✓ User info retrieved${NC}"
    STUDENT_ID=$(echo $USER_INFO | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo "  Student ID: $STUDENT_ID"
else
    echo -e "${RED}✗ Failed to get user info${NC}"
    exit 1
fi

# Test 4: Get Topics
echo ""
echo "Test 4: Get Topics"
TOPICS=$(curl -s -X GET "${API_URL}/api/topics" \
    -H "Authorization: Bearer ${TOKEN}")

if echo "$TOPICS" | grep -q "Basic Algebra"; then
    TOPIC_COUNT=$(echo "$TOPICS" | grep -o '"id":' | wc -l)
    echo -e "${GREEN}✓ Topics retrieved (${TOPIC_COUNT} topics)${NC}"
else
    echo -e "${RED}✗ Failed to get topics${NC}"
    exit 1
fi

# Test 5: Get Recommendations
echo ""
echo "Test 5: Get Next Recommendation"
RECOMMENDATION=$(curl -s -X GET "${API_URL}/api/recommendations/next/${STUDENT_ID}" \
    -H "Authorization: Bearer ${TOKEN}")

if echo "$RECOMMENDATION" | grep -q "topic_name\|message"; then
    echo -e "${GREEN}✓ Recommendation retrieved${NC}"
    if echo "$RECOMMENDATION" | grep -q "topic_name"; then
        TOPIC_NAME=$(echo $RECOMMENDATION | grep -o '"topic_name":"[^"]*' | cut -d'"' -f4)
        PRIORITY=$(echo $RECOMMENDATION | grep -o '"priority_score":[0-9.]*' | cut -d':' -f2)
        echo "  Recommended: $TOPIC_NAME (Priority: $PRIORITY)"
    fi
else
    echo -e "${RED}✗ Failed to get recommendation${NC}"
    exit 1
fi

# Test 6: Get Top 5 Recommendations
echo ""
echo "Test 6: Get Top 5 Recommendations"
TOP_RECS=$(curl -s -X GET "${API_URL}/api/recommendations/top/${STUDENT_ID}?n=5" \
    -H "Authorization: Bearer ${TOKEN}")

if echo "$TOP_RECS" | grep -q "recommendations"; then
    REC_COUNT=$(echo "$TOP_RECS" | grep -o '"topic_id":' | wc -l)
    echo -e "${GREEN}✓ Top recommendations retrieved (${REC_COUNT} recommendations)${NC}"
else
    echo -e "${RED}✗ Failed to get top recommendations${NC}"
    exit 1
fi

# Test 7: Get Mastery Scores
echo ""
echo "Test 7: Get Mastery Scores"
MASTERY=$(curl -s -X GET "${API_URL}/api/attempts/mastery/student/${STUDENT_ID}" \
    -H "Authorization: Bearer ${TOKEN}")

if echo "$MASTERY" | grep -q "concept_id\|\[\]"; then
    MASTERY_COUNT=$(echo "$MASTERY" | grep -o '"concept_id":' | wc -l)
    echo -e "${GREEN}✓ Mastery scores retrieved (${MASTERY_COUNT} concepts)${NC}"
else
    echo -e "${RED}✗ Failed to get mastery scores${NC}"
    exit 1
fi

# Test 8: Get Attempts
echo ""
echo "Test 8: Get Student Attempts"
ATTEMPTS=$(curl -s -X GET "${API_URL}/api/attempts/student/${STUDENT_ID}" \
    -H "Authorization: Bearer ${TOKEN}")

if echo "$ATTEMPTS" | grep -q "question_id\|\[\]"; then
    ATTEMPT_COUNT=$(echo "$ATTEMPTS" | grep -o '"id":' | wc -l)
    echo -e "${GREEN}✓ Attempts retrieved (${ATTEMPT_COUNT} attempts)${NC}"
else
    echo -e "${RED}✗ Failed to get attempts${NC}"
    exit 1
fi

# Test 9: Get Unlockable Topics
echo ""
echo "Test 9: Get Unlockable Topics"
UNLOCKABLE=$(curl -s -X GET "${API_URL}/api/topics/unlockable/${STUDENT_ID}" \
    -H "Authorization: Bearer ${TOKEN}")

if echo "$UNLOCKABLE" | grep -q "id\|\[\]"; then
    UNLOCKABLE_COUNT=$(echo "$UNLOCKABLE" | grep -o '"id":' | wc -l)
    echo -e "${GREEN}✓ Unlockable topics retrieved (${UNLOCKABLE_COUNT} topics)${NC}"
else
    echo -e "${RED}✗ Failed to get unlockable topics${NC}"
    exit 1
fi

# Summary
echo ""
echo "=========================================="
echo -e "${GREEN}✓ All Tests Passed!${NC}"
echo "=========================================="
echo ""
echo "MVP is fully functional and ready to use!"
echo ""
echo "Access the application:"
echo "  • Frontend:  http://localhost"
echo "  • API Docs:  http://localhost:8000/docs"
echo ""
