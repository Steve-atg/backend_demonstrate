#!/bin/bash

# Transaction API Test Script
# This script tests all CRUD operations for the transactions API

set -e

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/transactions"
USERS_API_URL="$BASE_URL/users"

echo "🧪 Starting Transaction API Tests..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if server is running
print_info "Checking if server is running..."
curl -s "$BASE_URL/health" > /dev/null
print_status $? "Server is running"

# First, create a test user for our transactions
print_info "Creating test user..."
USER_RESPONSE=$(curl -s -X POST "$USERS_API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "transactiontester",
    "email": "transaction@test.com",
    "password": "testpass123"
  }')

USER_ID=$(echo $USER_RESPONSE | jq -r '.id')
print_status $? "Test user created with ID: $USER_ID"

# Test 1: Create a new transaction
print_info "Test 1: Creating a new transaction..."
CREATE_RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"SPEND\",
    \"amount\": 150.75,
    \"currency\": \"USD\",
    \"transactionDate\": \"2024-01-15T10:30:00Z\",
    \"description\": \"Grocery shopping\",
    \"userId\": \"$USER_ID\"
  }")

TRANSACTION_ID=$(echo $CREATE_RESPONSE | jq -r '.id')
print_status $? "Transaction created with ID: $TRANSACTION_ID"

# Test 2: Get all transactions
print_info "Test 2: Getting all transactions..."
curl -s "$API_URL" | jq . > /dev/null
print_status $? "Successfully retrieved all transactions"

# Test 3: Get transactions with pagination
print_info "Test 3: Getting transactions with pagination..."
curl -s "$API_URL?page=1&limit=5" | jq . > /dev/null
print_status $? "Successfully retrieved paginated transactions"

# Test 4: Get transactions with filters
print_info "Test 4: Getting transactions with filters..."
curl -s "$API_URL?type=SPEND&minAmount=100&currency=USD" | jq . > /dev/null
print_status $? "Successfully retrieved filtered transactions"

# Test 5: Get specific transaction by ID
print_info "Test 5: Getting transaction by ID..."
GET_RESPONSE=$(curl -s "$API_URL/$TRANSACTION_ID")
echo $GET_RESPONSE | jq . > /dev/null
print_status $? "Successfully retrieved transaction by ID"

# Test 6: Update transaction
print_info "Test 6: Updating transaction..."
UPDATE_RESPONSE=$(curl -s -X PATCH "$API_URL/$TRANSACTION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 175.25,
    "description": "Updated grocery shopping"
  }')

echo $UPDATE_RESPONSE | jq . > /dev/null
print_status $? "Successfully updated transaction"

# Test 7: Create income transaction
print_info "Test 7: Creating income transaction..."
INCOME_RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"INCOME\",
    \"amount\": 2500.00,
    \"currency\": \"USD\",
    \"transactionDate\": \"2024-01-15T09:00:00Z\",
    \"description\": \"Monthly salary\",
    \"userId\": \"$USER_ID\"
  }")

INCOME_ID=$(echo $INCOME_RESPONSE | jq -r '.id')
print_status $? "Income transaction created with ID: $INCOME_ID"

# Test 8: Search transactions
print_info "Test 8: Searching transactions..."
curl -s "$API_URL?search=grocery" | jq . > /dev/null
print_status $? "Successfully searched transactions"

# Test 9: Get transactions by date range
print_info "Test 9: Getting transactions by date range..."
curl -s "$API_URL?transactionDateAfter=2024-01-01&transactionDateBefore=2024-01-31" | jq . > /dev/null
print_status $? "Successfully retrieved transactions by date range"

# Test 10: Get transactions sorted by amount
print_info "Test 10: Getting transactions sorted by amount..."
curl -s "$API_URL?sortBy=amount&sortOrder=desc" | jq . > /dev/null
print_status $? "Successfully retrieved sorted transactions"

# Test 11: Test error handling - invalid transaction
print_info "Test 11: Testing error handling with invalid transaction ID..."
ERROR_RESPONSE=$(curl -s -w "%{http_code}" "$API_URL/invalid-uuid-format")
if [[ $ERROR_RESPONSE == *"400"* ]]; then
    print_status 0 "Properly handled invalid UUID format"
else
    print_status 1 "Failed to handle invalid UUID format"
fi

# Test 12: Test error handling - non-existent transaction
print_info "Test 12: Testing error handling with non-existent transaction..."
NON_EXISTENT_ID="550e8400-e29b-41d4-a716-446655440000"
ERROR_RESPONSE=$(curl -s -w "%{http_code}" "$API_URL/$NON_EXISTENT_ID")
if [[ $ERROR_RESPONSE == *"404"* ]]; then
    print_status 0 "Properly handled non-existent transaction"
else
    print_status 1 "Failed to handle non-existent transaction"
fi

# Test 13: Delete transactions (cleanup)
print_info "Test 13: Deleting transactions..."
curl -s -X DELETE "$API_URL/$TRANSACTION_ID" -w "%{http_code}" | grep -q "204"
print_status $? "Successfully deleted first transaction"

curl -s -X DELETE "$API_URL/$INCOME_ID" -w "%{http_code}" | grep -q "204"
print_status $? "Successfully deleted second transaction"

# Cleanup: Delete test user
print_info "Cleaning up test user..."
curl -s -X DELETE "$USERS_API_URL/$USER_ID" -w "%{http_code}" | grep -q "204"
print_status $? "Successfully deleted test user"

echo ""
echo -e "${GREEN}🎉 All Transaction API tests passed successfully!${NC}"
echo ""
echo "Summary of tests performed:"
echo "✅ Create transaction (SPEND)"
echo "✅ Create transaction (INCOME)" 
echo "✅ Get all transactions"
echo "✅ Get transactions with pagination"
echo "✅ Get transactions with filters"
echo "✅ Get transaction by ID"
echo "✅ Update transaction"
echo "✅ Search transactions"
echo "✅ Get transactions by date range"
echo "✅ Get sorted transactions"
echo "✅ Error handling tests"
echo "✅ Delete transactions"
echo ""
echo -e "${YELLOW}Note: Make sure your server is running on http://localhost:3000${NC}"