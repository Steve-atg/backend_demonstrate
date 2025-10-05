#!/bin/bash

# Test script to demonstrate error handling in the users API
echo "=== Testing Error Handling in Users API ==="

# Base URL
BASE_URL="http://localhost:3000"

echo "1. Testing validation errors (invalid email and missing fields)"
curl -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "123"
  }' \
  -w "\n\nStatus Code: %{http_code}\n\n"

echo "2. Testing user not found error"
curl -X GET "$BASE_URL/users/00000000-0000-0000-0000-000000000000" \
  -w "\n\nStatus Code: %{http_code}\n\n"

echo "3. Testing invalid UUID format"
curl -X GET "$BASE_URL/users/invalid-uuid" \
  -w "\n\nStatus Code: %{http_code}\n\n"

echo "4. Testing invalid pagination parameters"
curl -X GET "$BASE_URL/users?page=0&limit=200" \
  -w "\n\nStatus Code: %{http_code}\n\n"

echo "5. Testing invalid sort parameters"
curl -X GET "$BASE_URL/users?sortBy=invalidField&sortOrder=invalidOrder" \
  -w "\n\nStatus Code: %{http_code}\n\n"

echo "6. Testing invalid date format"
curl -X GET "$BASE_URL/users?createdAfter=invalid-date" \
  -w "\n\nStatus Code: %{http_code}\n\n"

echo "7. Testing duplicate email (create user first, then try to create another with same email)"
echo "Creating first user..."
curl -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser1",
    "email": "test@example.com",
    "password": "password123",
    "gender": "male",
    "userLevel": 1,
    "dateOfBirth": "1990-01-01"
  }' \
  -w "\n\nStatus Code: %{http_code}\n\n"

echo "Trying to create duplicate user..."
curl -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "test@example.com",
    "password": "password123",
    "gender": "female",
    "userLevel": 2,
    "dateOfBirth": "1995-01-01"
  }' \
  -w "\n\nStatus Code: %{http_code}\n\n"

echo "=== Error Handling Tests Completed ==="