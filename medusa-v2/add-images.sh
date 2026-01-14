#!/bin/bash
# Add images to existing consultation products

ADMIN_EMAIL=${MEDUSA_ADMIN_EMAIL:-"abe.raise@gmail.com"}
ADMIN_PASSWORD=${MEDUSA_ADMIN_PASSWORD}
BASE_URL="https://need-this-done-production.up.railway.app"

echo "🔑 Logging in to Medusa Admin..."
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/user/emailpass" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Logged in successfully"
echo ""

# Update 15-minute consultation
echo "📸 Updating 15-Minute Consultation..."
curl -s -X POST "${BASE_URL}/admin/products/prod_01KEX6B7DTHR2P0RSET5DC64RZ" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "thumbnail": "https://oxhjtmozsdstbokwtnwa.supabase.co/storage/v1/object/public/product-images/consultation-15min.jpg",
    "images": [{"url": "https://oxhjtmozsdstbokwtnwa.supabase.co/storage/v1/object/public/product-images/consultation-15min.jpg"}]
  }' | jq '{id: .product.id, title: .product.title, thumbnail: .product.thumbnail}'

echo ""

# Update 30-minute consultation  
echo "📸 Updating 30-Minute Consultation..."
curl -s -X POST "${BASE_URL}/admin/products/prod_01KEX6B7DTE4DGRJ0HNB6K09Z3" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "thumbnail": "https://oxhjtmozsdstbokwtnwa.supabase.co/storage/v1/object/public/product-images/consultation-30min.jpg",
    "images": [{"url": "https://oxhjtmozsdstbokwtnwa.supabase.co/storage/v1/object/public/product-images/consultation-30min.jpg"}]
  }' | jq '{id: .product.id, title: .product.title, thumbnail: .product.thumbnail}'

echo ""

# Update 55-minute consultation
echo "📸 Updating 55-Minute Consultation..."
curl -s -X POST "${BASE_URL}/admin/products/prod_01KEX6B7DTHPQNT9B5PSM1M4SB" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "thumbnail": "https://oxhjtmozsdstbokwtnwa.supabase.co/storage/v1/object/public/product-images/consultation-55min.jpg",
    "images": [{"url": "https://oxhjtmozsdstbokwtnwa.supabase.co/storage/v1/object/public/product-images/consultation-55min.jpg"}]
  }' | jq '{id: .product.id, title: .product.title, thumbnail: .product.thumbnail}'

echo ""
echo "✅ All products updated!"
