#!/bin/bash

# Test script to verify pricing page indexing improvement
# This validates that the /pricing page now has multiple chunks with product data

set -e

echo "================================"
echo "Testing Pricing Page Indexing"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check if dev server is running
echo "📋 Checking if dev server is running on localhost:3000..."
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo -e "${RED}✗ Dev server not running on localhost:3000${NC}"
  echo "Start dev server with: cd app && NEXT_PUBLIC_E2E_ADMIN_BYPASS=true npm run dev"
  exit 1
fi
echo -e "${GREEN}✓ Dev server is running${NC}"
echo ""

# 2. Clear existing pricing page embeddings
echo "🧹 Clearing existing /pricing embeddings..."
CLEAR_RESPONSE=$(curl -s -X DELETE "http://localhost:3000/api/embeddings/clear?page_url=/pricing")
if echo "$CLEAR_RESPONSE" | grep -q '"success"\|"cleared"'; then
  echo -e "${GREEN}✓ Cleared successfully${NC}"
else
  echo -e "${YELLOW}⚠ Clear response: $CLEAR_RESPONSE${NC}"
fi
echo ""

# 3. Visit pricing page to trigger indexing
echo "🌐 Visiting /pricing page to trigger indexing..."
curl -s http://localhost:3000/pricing > /dev/null
echo -e "${GREEN}✓ Page loaded${NC}"
echo ""

# 4. Wait for indexing to complete (3s delay + processing time)
echo "⏳ Waiting 5 seconds for indexing to complete..."
sleep 5
echo -e "${GREEN}✓ Wait complete${NC}"
echo ""

# 5. Check embedding status
echo "📊 Checking embedding status..."
STATUS=$(curl -s "http://localhost:3000/api/embeddings/status")

# Extract chunk count for /pricing
CHUNK_COUNT=$(echo "$STATUS" | grep -o '"url":"/pricing"[^}]*"chunks":([0-9]*' | grep -o '[0-9]*$' || echo "0")

echo "Page status response:"
echo "$STATUS" | jq '.pages[] | select(.url == "/pricing")' 2>/dev/null || echo "$STATUS"
echo ""

# 6. Validate results
echo "================================"
echo "📈 Results:"
echo "================================"

if [ "$CHUNK_COUNT" -gt 1 ]; then
  echo -e "${GREEN}✓ SUCCESS: /pricing has $CHUNK_COUNT chunks (expected > 1)${NC}"
  echo "  This means product data is being indexed!"
  exit 0
else
  echo -e "${RED}✗ FAILED: /pricing has $CHUNK_COUNT chunks (expected > 1)${NC}"
  echo ""
  echo "Debugging tips:"
  echo "1. Check browser console on /pricing page for errors"
  echo "2. Look for PageIndexer logs: [PageIndexer] Extracted X characters"
  echo "3. Verify products are loading from Medusa API"
  echo "4. Try manually visiting /pricing and waiting 3 seconds before checking"
  exit 1
fi
