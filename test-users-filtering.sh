#!/bin/bash

# Users CRUD API with Filtering Test Script
BASE_URL="http://localhost:3000"

echo "🚀 Testing Users CRUD API with Filtering"
echo "========================================="

# Helper function to create test users
create_test_users() {
    echo "📝 Creating test users..."
    
    # User 1 - John (Male, Level 5)
    curl -s -X POST "$BASE_URL/users" \
      -H "Content-Type: application/json" \
      -d '{
        "username": "john_doe",
        "email": "john@example.com",
        "password": "password123",
        "gender": "M",
        "dateOfBirth": "1990-05-15T00:00:00Z"
      }' > /dev/null

    # User 2 - Jane (Female, Level 1 - default)
    curl -s -X POST "$BASE_URL/users" \
      -H "Content-Type: application/json" \
      -d '{
        "username": "jane_smith",
        "email": "jane@example.com",
        "password": "password456",
        "gender": "F",
        "dateOfBirth": "1985-03-20T00:00:00Z"
      }' > /dev/null

    # User 3 - Alex (Other, Level 3)
    ALEX_RESPONSE=$(curl -s -X POST "$BASE_URL/users" \
      -H "Content-Type: application/json" \
      -d '{
        "username": "alex_johnson",
        "email": "alex@example.com",
        "password": "password789",
        "gender": "OTHER",
        "dateOfBirth": "1995-12-10T00:00:00Z"
      }')
    
    ALEX_ID=$(echo "$ALEX_RESPONSE" | jq -r '.id')
    
    # Update Alex's user level to 3
    curl -s -X PATCH "$BASE_URL/users/$ALEX_ID" \
      -H "Content-Type: application/json" \
      -d '{"userLevel": 3}' > /dev/null

    # User 4 - Mike (Male, Level 10)
    MIKE_RESPONSE=$(curl -s -X POST "$BASE_URL/users" \
      -H "Content-Type: application/json" \
      -d '{
        "username": "mike_wilson",
        "email": "mike@example.com",
        "password": "password101",
        "gender": "M",
        "dateOfBirth": "1988-07-25T00:00:00Z"
      }')
    
    MIKE_ID=$(echo "$MIKE_RESPONSE" | jq -r '.id')
    
    # Update Mike's user level to 10
    curl -s -X PATCH "$BASE_URL/users/$MIKE_ID" \
      -H "Content-Type: application/json" \
      -d '{"userLevel": 10}' > /dev/null

    # User 5 - Sarah (Female, Level 7)
    SARAH_RESPONSE=$(curl -s -X POST "$BASE_URL/users" \
      -H "Content-Type: application/json" \
      -d '{
        "username": "sarah_brown",
        "email": "sarah@company.com",
        "password": "password202",
        "gender": "F",
        "dateOfBirth": "1992-01-30T00:00:00Z"
      }')
    
    SARAH_ID=$(echo "$SARAH_RESPONSE" | jq -r '.id')
    
    # Update Sarah's user level to 7
    curl -s -X PATCH "$BASE_URL/users/$SARAH_ID" \
      -H "Content-Type: application/json" \
      -d '{"userLevel": 7}' > /dev/null

    echo "✅ Test users created!"
    echo ""
}

# Clean up existing users first
echo "🧹 Cleaning up existing data..."
USERS=$(curl -s "$BASE_URL/users?limit=100" | jq -r '.data[]?.id // .[]?.id // empty')
for user_id in $USERS; do
    if [ ! -z "$user_id" ] && [ "$user_id" != "null" ]; then
        curl -s -X DELETE "$BASE_URL/users/$user_id" > /dev/null
    fi
done
echo ""

# Create test data
create_test_users

echo "🔍 Testing Filtering Capabilities"
echo "================================="

# Test 1: Get all users with pagination
echo "1. GET /users (paginated - default)"
curl -s "$BASE_URL/users" | jq .
echo ""

# Test 2: Filter by gender
echo "2. Filter by gender (Male users only)"
curl -s "$BASE_URL/users?gender=M" | jq .
echo ""

# Test 3: Filter by user level range
echo "3. Filter by user level range (level 3-8)"
curl -s "$BASE_URL/users?minUserLevel=3&maxUserLevel=8" | jq .
echo ""

# Test 4: Search by username
echo "4. Search by username containing 'john'"
curl -s "$BASE_URL/users?username=john" | jq .
echo ""

# Test 5: Search by email domain
echo "5. Search by email containing 'company'"
curl -s "$BASE_URL/users?email=company" | jq .
echo ""

# Test 6: General search term
echo "6. General search for 'sarah' (searches username and email)"
curl -s "$BASE_URL/users?search=sarah" | jq .
echo ""

# Test 7: Filter by birth date range
echo "7. Filter by birth date (born after 1990)"
curl -s "$BASE_URL/users?bornAfter=1990-01-01T00:00:00Z" | jq .
echo ""

# Test 8: Custom pagination
echo "8. Custom pagination (page 1, limit 2)"
curl -s "$BASE_URL/users?page=1&limit=2" | jq .
echo ""

# Test 9: Custom sorting
echo "9. Sort by username ascending"
curl -s "$BASE_URL/users?sortBy=username&sortOrder=asc" | jq .
echo ""

# Test 10: Sort by user level descending
echo "10. Sort by user level descending"
curl -s "$BASE_URL/users?sortBy=userLevel&sortOrder=desc" | jq .
echo ""

# Test 11: Complex filter combination
echo "11. Complex filter: Female users with level >= 5, sorted by email"
curl -s "$BASE_URL/users?gender=F&minUserLevel=5&sortBy=email&sortOrder=asc" | jq .
echo ""

# Test 12: Filter with no results
echo "12. Filter with no results (userLevel = 99)"
curl -s "$BASE_URL/users?userLevel=99" | jq .
echo ""

# Test 13: Date range filter (users created today)
TODAY=$(date -u +"%Y-%m-%dT00:00:00Z")
echo "13. Filter by creation date (created today)"
curl -s "$BASE_URL/users?createdAfter=$TODAY" | jq .
echo ""

echo "✅ Filtering tests completed!"
echo ""
echo "📋 Available Filter Parameters:"
echo "- username: partial match (case-insensitive)"
echo "- email: partial match (case-insensitive)"
echo "- gender: exact match (M, F, OTHER)"
echo "- userLevel: exact match"
echo "- minUserLevel: minimum level filter"
echo "- maxUserLevel: maximum level filter"
echo "- search: searches in username and email"
echo "- createdAfter/createdBefore: date range for creation"
echo "- bornAfter/bornBefore: date range for birth date"
echo "- page: page number (default: 1)"
echo "- limit: results per page (default: 10, max: 100)"
echo "- sortBy: username, email, userLevel, createdAt, updatedAt"
echo "- sortOrder: asc, desc (default: desc)"