#!/bin/bash

# Sample Data Setup Script for Transactions
# This script creates sample categories and demonstrates transaction creation with categories

set -e

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/transactions"
USERS_API_URL="$BASE_URL/users"

echo "🌱 Setting up sample data for Transaction API..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Note: This script assumes you have some categories in your database
# If you don't have categories, you can run SQL commands to insert them

print_info "Creating sample transaction data..."

# Create a test user
print_info "Creating test user..."
USER_RESPONSE=$(curl -s -X POST "$USERS_API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "sampleuser",
    "email": "sample@example.com",
    "password": "samplepass123"
  }')

USER_ID=$(echo $USER_RESPONSE | jq -r '.id')
print_success "Test user created with ID: $USER_ID"

# Create sample transactions
print_info "Creating sample SPEND transactions..."

# Grocery transaction
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"SPEND\",
    \"amount\": 85.50,
    \"currency\": \"USD\",
    \"transactionDate\": \"2024-01-15T10:30:00Z\",
    \"description\": \"Weekly grocery shopping\",
    \"userId\": \"$USER_ID\"
  }" > /dev/null

# Coffee transaction
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"SPEND\",
    \"amount\": 4.75,
    \"currency\": \"USD\",
    \"transactionDate\": \"2024-01-16T08:15:00Z\",
    \"description\": \"Morning coffee\",
    \"userId\": \"$USER_ID\"
  }" > /dev/null

# Gas transaction
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"SPEND\",
    \"amount\": 45.00,
    \"currency\": \"USD\",
    \"transactionDate\": \"2024-01-17T14:22:00Z\",
    \"description\": \"Gas station fill-up\",
    \"userId\": \"$USER_ID\"
  }" > /dev/null

print_success "Created SPEND transactions"

print_info "Creating sample INCOME transactions..."

# Salary transaction
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"INCOME\",
    \"amount\": 3500.00,
    \"currency\": \"USD\",
    \"transactionDate\": \"2024-01-01T00:00:00Z\",
    \"description\": \"Monthly salary\",
    \"userId\": \"$USER_ID\"
  }" > /dev/null

# Freelance work
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"INCOME\",
    \"amount\": 750.00,
    \"currency\": \"USD\",
    \"transactionDate\": \"2024-01-10T16:45:00Z\",
    \"description\": \"Freelance project payment\",
    \"userId\": \"$USER_ID\"
  }" > /dev/null

print_success "Created INCOME transactions"

echo ""
echo -e "${GREEN}🎉 Sample data created successfully!${NC}"
echo ""
echo "You can now test the following API endpoints:"
echo ""
echo "📊 Get all transactions:"
echo "curl $API_URL"
echo ""
echo "💰 Get only INCOME transactions:"
echo "curl '$API_URL?type=INCOME'"
echo ""
echo "💸 Get only SPEND transactions:"
echo "curl '$API_URL?type=SPEND'"
echo ""
echo "📅 Get transactions from January 2024:"
echo "curl '$API_URL?transactionDateAfter=2024-01-01&transactionDateBefore=2024-01-31'"
echo ""
echo "🔍 Search for specific transactions:"
echo "curl '$API_URL?search=coffee'"
echo ""
echo "📈 Get transactions sorted by amount (highest first):"
echo "curl '$API_URL?sortBy=amount&sortOrder=desc'"
echo ""
echo "💵 Get transactions above $50:"
echo "curl '$API_URL?minAmount=50'"
echo ""