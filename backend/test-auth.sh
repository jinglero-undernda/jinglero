#!/bin/bash

# Phase 1 Authentication Testing Script
# Usage: ./test-auth.sh [admin-password]

ADMIN_PASSWORD=${1:-"test-admin-password-123"}
BASE_URL="http://localhost:3000"

echo "=========================================="
echo "Phase 1 Authentication Testing"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
echo "-------------------"
curl -s "$BASE_URL/health" | jq .
echo ""
echo ""

# Test 2: Login with correct password
echo "Test 2: Login with correct password"
echo "-----------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/login" \
  -H "Content-Type: application/json" \
  -d "{\"password\":\"$ADMIN_PASSWORD\"}")

echo "$LOGIN_RESPONSE" | jq .

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "ERROR: Failed to get token from login response"
  exit 1
fi

echo ""
echo "Token extracted: ${TOKEN:0:50}..."
echo ""
echo ""

# Test 3: Login with incorrect password
echo "Test 3: Login with incorrect password"
echo "-------------------------------------"
curl -s -X POST "$BASE_URL/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"password":"wrong-password"}' | jq .
echo ""
echo ""

# Test 4: Check status without token
echo "Test 4: Check status without token"
echo "----------------------------------"
curl -s "$BASE_URL/api/admin/status" | jq .
echo ""
echo ""

# Test 5: Check status with valid token
echo "Test 5: Check status with valid token"
echo "-------------------------------------"
curl -s "$BASE_URL/api/admin/status" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""
echo ""

# Test 6: Access protected route without token
echo "Test 6: Access protected route without token"
echo "--------------------------------------------"
curl -s "$BASE_URL/api/admin/schema" | jq .
echo ""
echo ""

# Test 7: Access protected route with valid token
echo "Test 7: Access protected route with valid token"
echo "-----------------------------------------------"
curl -s "$BASE_URL/api/admin/schema" \
  -H "Authorization: Bearer $TOKEN" | jq . | head -20
echo ""
echo ""

# Test 8: Access protected route with invalid token
echo "Test 8: Access protected route with invalid token"
echo "-------------------------------------------------"
curl -s "$BASE_URL/api/admin/schema" \
  -H "Authorization: Bearer invalid-token-here" | jq .
echo ""
echo ""

# Test 9: Logout
echo "Test 9: Logout"
echo "--------------"
curl -s -X POST "$BASE_URL/api/admin/logout" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""
echo ""

echo "=========================================="
echo "Testing Complete"
echo "=========================================="

