#!/bin/sh
# ============================================================================
# Seed Consultation Products via Admin API
# ============================================================================
# Uses Medusa Admin API to create consultation products
# Run from within the medusa_backend container

BASE_URL="http://localhost:9000"
ADMIN_EMAIL="admin@needthisdone.com"
ADMIN_PASS="admin123"

# Get session cookie
echo "Authenticating..."
COOKIE_FILE=$(mktemp)
wget -qO- --post-data="{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}" \
  --header='Content-Type: application/json' \
  --save-cookies="$COOKIE_FILE" \
  "$BASE_URL/admin/auth" > /dev/null

# Get first region
echo "Getting region..."
REGION=$(wget -qO- --load-cookies="$COOKIE_FILE" "$BASE_URL/admin/regions" 2>/dev/null)
REGION_ID=$(echo "$REGION" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | head -1)
echo "Region ID: $REGION_ID"

# Get or create shipping profile
echo "Getting shipping profile..."
PROFILES=$(wget -qO- --load-cookies="$COOKIE_FILE" "$BASE_URL/admin/shipping-profiles" 2>/dev/null)
PROFILE_ID=$(echo "$PROFILES" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | head -1)
echo "Profile ID: $PROFILE_ID"

# Get sales channel
echo "Getting sales channel..."
CHANNELS=$(wget -qO- --load-cookies="$COOKIE_FILE" "$BASE_URL/admin/sales-channels" 2>/dev/null)
CHANNEL_ID=$(echo "$CHANNELS" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | head -1)
echo "Channel ID: $CHANNEL_ID"

# Function to create a product
create_product() {
  TITLE="$1"
  HANDLE="$2"
  DESC="$3"
  DURATION="$4"
  PRICE="$5"

  echo "Creating: $TITLE..."

  # Check if product exists
  EXISTS=$(wget -qO- --load-cookies="$COOKIE_FILE" "$BASE_URL/admin/products?handle=$HANDLE" 2>/dev/null)
  if echo "$EXISTS" | grep -q "\"handle\":\"$HANDLE\""; then
    echo "  - Already exists, skipping"
    return
  fi

  PRODUCT_JSON=$(cat <<EOF
{
  "title": "$TITLE",
  "handle": "$HANDLE",
  "description": "$DESC",
  "status": "published",
  "is_giftcard": false,
  "discountable": true,
  "profile_id": "$PROFILE_ID",
  "sales_channels": [{"id": "$CHANNEL_ID"}],
  "metadata": {
    "requires_appointment": true,
    "duration_minutes": $DURATION,
    "service_type": "consultation"
  },
  "options": [{"title": "Duration"}],
  "variants": [{
    "title": "Default",
    "inventory_quantity": 100,
    "manage_inventory": false,
    "options": [{"value": "$DURATION min"}],
    "prices": [{"amount": $PRICE, "currency_code": "usd", "region_id": "$REGION_ID"}]
  }]
}
EOF
)

  RESULT=$(wget -qO- --post-data="$PRODUCT_JSON" \
    --header='Content-Type: application/json' \
    --load-cookies="$COOKIE_FILE" \
    "$BASE_URL/admin/products" 2>&1)

  if echo "$RESULT" | grep -q '"id":'; then
    echo "  ✓ Created successfully"
  else
    echo "  ✗ Failed: $RESULT"
  fi
}

# Create consultation products
echo ""
echo "Creating consultation products..."
echo "================================"

create_product \
  "15-Minute Quick Consultation" \
  "consultation-15-min" \
  "A focused 15-minute session to discuss your specific needs, answer questions, or provide quick guidance." \
  15 \
  2000

create_product \
  "30-Minute Strategy Consultation" \
  "consultation-30-min" \
  "A comprehensive 30-minute session to dive deeper into your project, explore solutions, and develop strategy." \
  30 \
  3500

create_product \
  "55-Minute Deep Dive Consultation" \
  "consultation-55-min" \
  "Our most thorough consultation. Nearly an hour to fully explore challenges and create an actionable plan." \
  55 \
  5000

# Cleanup
rm -f "$COOKIE_FILE"

echo ""
echo "================================"
echo "Seeding complete!"
echo ""

# Verify products
echo "Verifying products..."
wget -qO- "$BASE_URL/store/products" 2>/dev/null | grep -o '"title":"[^"]*"' | head -5
