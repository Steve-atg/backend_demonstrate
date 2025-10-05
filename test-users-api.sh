#!/bin/bash

# Users CRUD API Test Script
BASE_URL="http://localhost:3000"

echo "🚀 Testing Users CRUD API"
echo "=========================="

# Test 1: Get all users (should be empty initially)
echo ""
echo "1. GET /users (should return empty array)"
curl -s -X GET "$BASE_URL/users" | jq .
echo ""

# Test 2: Create a new user
echo "2. POST /users (create new user)"
USER_DATA='{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "gender": "M"
}'

USER_RESPONSE=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d "$USER_DATA")

echo "Created user:"
echo "$USER_RESPONSE" | jq .
USER_ID=$(echo "$USER_RESPONSE" | jq -r '.id')
echo ""

# Test 3: Get all users (should show the created user)
echo "3. GET /users (should show created user)"
curl -s -X GET "$BASE_URL/users" | jq .
echo ""

# Test 4: Get user by ID
echo "4. GET /users/:id (get user by ID)"
curl -s -X GET "$BASE_URL/users/$USER_ID" | jq .
echo ""

# Test 5: Update user
echo "5. PATCH /users/:id (update user)"
UPDATE_DATA='{
  "username": "john_updated",
  "avatar": "https://example.com/avatar.jpg"
}'

curl -s -X PATCH "$BASE_URL/users/$USER_ID" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_DATA" | jq .
echo ""

# Test 6: Create another user to test conflict
echo "6. POST /users (test email conflict)"
DUPLICATE_USER='{
  "username": "jane_doe",
  "email": "john@example.com",
  "password": "password456"
}'

curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d "$DUPLICATE_USER" | jq .
echo ""

# Test 7: Create another user successfully
echo "7. POST /users (create second user)"
USER2_DATA='{
  "username": "jane_doe",
  "email": "jane@example.com",
  "password": "password456",
  "gender": "F",
  "dateOfBirth": "1990-01-15T00:00:00Z"
}'

USER2_RESPONSE=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d "$USER2_DATA")

echo "$USER2_RESPONSE" | jq .
USER2_ID=$(echo "$USER2_RESPONSE" | jq -r '.id')
echo ""

# Test 8: Get all users again
echo "8. GET /users (should show both users)"
curl -s -X GET "$BASE_URL/users" | jq .
echo ""

# Test 9: Delete first user
echo "9. DELETE /users/:id (soft delete first user)"
curl -s -X DELETE "$BASE_URL/users/$USER_ID" -w "HTTP Status: %{http_code}\n"
echo ""

# Test 10: Get all users (should only show second user)
echo "10. GET /users (should only show second user after soft delete)"
curl -s -X GET "$BASE_URL/users" | jq .
echo ""

# Test 11: Try to get deleted user by ID
echo "11. GET /users/:id (try to get deleted user - should return 404)"
curl -s -X GET "$BASE_URL/users/$USER_ID" | jq .
echo ""

echo "✅ CRUD API testing completed!"