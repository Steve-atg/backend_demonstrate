#!/bin/bash

# Test Refresh Token Implementation

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/auth"

echo "🚀 Testing Refresh Token Implementation"
echo "======================================"

# Test 1: Register a new user
echo "📝 Test 1: Register a new user"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Password123!",
    "gender": "OTHER"
  }')

echo "Register Response:"
echo "$REGISTER_RESPONSE" | jq .

# Extract tokens from register response
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.access_token')
REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.refresh_token')

if [ "$ACCESS_TOKEN" = "null" ] || [ "$REFRESH_TOKEN" = "null" ]; then
  echo "❌ Registration failed - no tokens received"
  exit 1
fi

echo "✅ Registration successful"
echo "Access Token: ${ACCESS_TOKEN:0:50}..."
echo "Refresh Token: ${REFRESH_TOKEN:0:50}..."
echo ""

# Test 2: Use access token to get profile
echo "🔐 Test 2: Access protected endpoint with access token"
PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Profile Response:"
echo "$PROFILE_RESPONSE" | jq .

if echo "$PROFILE_RESPONSE" | jq -e '.id' > /dev/null; then
  echo "✅ Access token works correctly"
else
  echo "❌ Access token failed"
fi
echo ""

# Test 3: Refresh tokens
echo "🔄 Test 3: Refresh tokens using refresh token"
REFRESH_RESPONSE=$(curl -s -X POST "$API_URL/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\": \"$REFRESH_TOKEN\"}")

echo "Refresh Response:"
echo "$REFRESH_RESPONSE" | jq .

# Extract new tokens
NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.access_token')
NEW_REFRESH_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.refresh_token')

if [ "$NEW_ACCESS_TOKEN" = "null" ] || [ "$NEW_REFRESH_TOKEN" = "null" ]; then
  echo "❌ Token refresh failed"
  exit 1
fi

echo "✅ Token refresh successful"
echo "New Access Token: ${NEW_ACCESS_TOKEN:0:50}..."
echo "New Refresh Token: ${NEW_REFRESH_TOKEN:0:50}..."
echo ""

# Test 4: Use new access token
echo "🔐 Test 4: Use new access token to access protected endpoint"
NEW_PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/profile" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN")

echo "Profile with New Token Response:"
echo "$NEW_PROFILE_RESPONSE" | jq .

if echo "$NEW_PROFILE_RESPONSE" | jq -e '.id' > /dev/null; then
  echo "✅ New access token works correctly"
else
  echo "❌ New access token failed"
fi
echo ""

# Test 5: Test old refresh token (should fail)
echo "🚫 Test 5: Try to use old refresh token (should fail)"
OLD_REFRESH_RESPONSE=$(curl -s -X POST "$API_URL/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\": \"$REFRESH_TOKEN\"}")

echo "Old Refresh Token Response:"
echo "$OLD_REFRESH_RESPONSE" | jq .

if echo "$OLD_REFRESH_RESPONSE" | jq -e '.statusCode == 401' > /dev/null; then
  echo "✅ Old refresh token correctly rejected"
else
  echo "❌ Old refresh token should have been rejected"
fi
echo ""

# Test 6: Logout
echo "👋 Test 6: Logout user"
LOGOUT_RESPONSE=$(curl -s -X POST "$API_URL/logout" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\": \"$NEW_REFRESH_TOKEN\"}")

echo "Logout Response:"
echo "$LOGOUT_RESPONSE" | jq .

if echo "$LOGOUT_RESPONSE" | jq -e '.message' > /dev/null; then
  echo "✅ Logout successful"
else
  echo "❌ Logout failed"
fi
echo ""

# Test 7: Try to use refresh token after logout (should fail)
echo "🚫 Test 7: Try to use refresh token after logout (should fail)"
POST_LOGOUT_REFRESH_RESPONSE=$(curl -s -X POST "$API_URL/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\": \"$NEW_REFRESH_TOKEN\"}")

echo "Post-Logout Refresh Response:"
echo "$POST_LOGOUT_REFRESH_RESPONSE" | jq .

if echo "$POST_LOGOUT_REFRESH_RESPONSE" | jq -e '.statusCode == 401' > /dev/null; then
  echo "✅ Refresh token correctly rejected after logout"
else
  echo "❌ Refresh token should have been rejected after logout"
fi

echo ""
echo "🎉 Refresh Token Implementation Test Complete!"
echo "=============================================="