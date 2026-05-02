#!/bin/bash

BASE="http://localhost:5000/api/v1"
PASS="Test@123456"
ADMIN_PASS="Admin@123456"

echo "========================================="
echo "  DalPay API - Complete Test Suite"
echo "========================================="
echo ""

# 1. Health check
echo "1. HEALTH CHECK"
curl -s $BASE/../health | json_pp 2>/dev/null || curl -s http://localhost:5000/health
echo -e "\n"

# 2. Register a fresh test user
echo "2. REGISTER NEW USER"
REGISTER_RESPONSE=$(curl -s -X POST $BASE/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nationalId": "SL-TEST-'$(date +%s)'",
    "firstName": "Test",
    "lastName": "User",
    "email": "test'$(date +%s)'@test.gov.so",
    "phoneNumber": "+25263'$(date +%s | tail -c 8)'",
    "password": "'$PASS'"
  }')
echo "$REGISTER_RESPONSE" | json_pp 2>/dev/null || echo "$REGISTER_RESPONSE"
echo -e "\n"

# Extract tokens and IDs
USER_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
TAXPAYER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"taxpayer_id":"[^"]*"' | cut -d'"' -f4)

echo "User Token: ${USER_TOKEN:0:30}..."
echo "Taxpayer ID: $TAXPAYER_ID"
echo ""

# 3. Login -
echo "3. LOGIN"
LOGIN_RESPONSE=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nationalId": "ADMIN-001", "password": "'$ADMIN_PASS'"}')
ADMIN_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo "Admin Token: ${ADMIN_TOKEN:0:30}..."
echo ""

# 4. Get assessment types
echo "4. TAX ASSESSMENT TYPES"
curl -s $BASE/tax/assessment-types \
  -H "Authorization: Bearer $USER_TOKEN" | json_pp 2>/dev/null
echo -e "\n"

# Get first type_id
TYPE_ID=$(curl -s $BASE/tax/assessment-types -H "Authorization: Bearer $USER_TOKEN" | grep -o '"type_id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Using type_id: $TYPE_ID"
echo ""

# 5. Get payment providers
echo "5. MOBILE MONEY PROVIDERS"
curl -s $BASE/payment/providers \
  -H "Authorization: Bearer $USER_TOKEN" | json_pp 2>/dev/null
echo -e "\n"

# Get first provider_id
PROVIDER_ID=$(curl -s $BASE/payment/providers -H "Authorization: Bearer $USER_TOKEN" | grep -o '"provider_id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Using provider_id: $PROVIDER_ID"
echo ""

# 6. Admin creates assessment
echo "6. ADMIN CREATES TAX ASSESSMENT"
ASSESSMENT_RESPONSE=$(curl -s -X POST $BASE/tax/assessments \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taxpayerId": "'$TAXPAYER_ID'",
    "assessmentTypeId": "'$TYPE_ID'",
    "assessmentYear": 2026,
    "assessedAmount": 500.00,
    "assessmentDate": "2026-04-29",
    "paymentDueDate": "2026-06-30",
    "assessmentBasis": "Monthly income USD 1,000"
  }')
echo "$ASSESSMENT_RESPONSE" | json_pp 2>/dev/null || echo "$ASSESSMENT_RESPONSE"
echo -e "\n"

ASSESSMENT_ID=$(echo "$ASSESSMENT_RESPONSE" | grep -o '"assessment_id":"[^"]*"' | cut -d'"' -f4)
echo "Assessment ID: $ASSESSMENT_ID"
echo ""

# 7. Get my assessments
echo "7. MY TAX ASSESSMENTS"
curl -s $BASE/tax/assessments \
  -H "Authorization: Bearer $USER_TOKEN" | json_pp 2>/dev/null
echo -e "\n"

# 8. Get single assessment
echo "8. SINGLE ASSESSMENT DETAIL"
curl -s $BASE/tax/assessments/$ASSESSMENT_ID \
  -H "Authorization: Bearer $USER_TOKEN" | json_pp 2>/dev/null
echo -e "\n"

# 9. Tax summary
echo "9. TAXPAYER SUMMARY"
curl -s $BASE/tax/summary \
  -H "Authorization: Bearer $USER_TOKEN" | json_pp 2>/dev/null
echo -e "\n"

# 10. Initiate payment
echo "10. INITIATE PAYMENT"
PAYMENT_RESPONSE=$(curl -s -X POST $BASE/payment/initiate \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assessmentId": "'$ASSESSMENT_ID'",
    "amount": 250.00,
    "providerId": "'$PROVIDER_ID'",
    "phoneNumber": "+252631111111"
  }')
echo "$PAYMENT_RESPONSE" | json_pp 2>/dev/null || echo "$PAYMENT_RESPONSE"
echo -e "\n"

PAYMENT_ID=$(echo "$PAYMENT_RESPONSE" | grep -o '"payment_id":"[^"]*"' | cut -d'"' -f4)
TXN_REF=$(echo "$PAYMENT_RESPONSE" | grep -o '"transaction_reference":"[^"]*"' | cut -d'"' -f4)
echo "Payment ID: $PAYMENT_ID"
echo "Transaction Ref: $TXN_REF"
echo ""

# 11. Check payment status
echo "11. PAYMENT STATUS"
curl -s $BASE/payment/status/$PAYMENT_ID \
  -H "Authorization: Bearer $USER_TOKEN" | json_pp 2>/dev/null
echo -e "\n"

# 12. Confirm payment
echo "12. CONFIRM PAYMENT"
curl -s -X POST $BASE/payment/confirm \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "'$PAYMENT_ID'",
    "transactionRef": "'$TXN_REF'",
    "status": "confirmed"
  }' | json_pp 2>/dev/null
echo -e "\n"

# 13. Payment history
echo "13. PAYMENT HISTORY"
curl -s "$BASE/payment/history?page=1&limit=10" \
  -H "Authorization: Bearer $USER_TOKEN" | json_pp 2>/dev/null
echo -e "\n"

# 14. Reconciliation - run
echo "14. RUN RECONCILIATION"
RECON_RESPONSE=$(curl -s -X POST $BASE/reconciliation/run \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-04-29"}')
echo "$RECON_RESPONSE" | json_pp 2>/dev/null || echo "$RECON_RESPONSE"
echo -e "\n"

# 15. Reconciliation report
echo "15. RECONCILIATION REPORT"
curl -s $BASE/reconciliation/report/2026-04-29 \
  -H "Authorization: Bearer $ADMIN_TOKEN" | json_pp 2>/dev/null
echo -e "\n"

# 16. Reconciliation summary
echo "16. RECONCILIATION SUMMARY"
curl -s "$BASE/reconciliation/summary?days=30" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | json_pp 2>/dev/null
echo -e "\n"

# 17. Refresh token
echo "17. REFRESH TOKEN"
curl -s -X POST $BASE/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "'$REFRESH_TOKEN'"}' | json_pp 2>/dev/null
echo -e "\n"

# 18. Logout
echo "18. LOGOUT"
curl -s -X POST $BASE/auth/logout \
  -H "Authorization: Bearer $USER_TOKEN" | json_pp 2>/dev/null
echo -e "\n"

echo "========================================="
echo "  ✅ All 18 endpoints tested"
echo "========================================="