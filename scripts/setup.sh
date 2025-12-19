#!/bin/bash

# ============================================================================
# Need This Done - Project Setup Script
# ============================================================================
# What does this script do?
# Initializes your .env.local file with all required environment variables.
# It will ask for your API keys and auto-generate secure secrets.
#
# When to run it?
# Once, when you first clone this project or need to regenerate your .env.local
#
# What it will ask:
# - Supabase credentials (URL and keys)
# - Stripe API keys (test keys for development)
# - Resend API key (for email notifications)
# - OpenAI API key (for AI chatbot)
#
# What it will generate:
# - .env.local file with all 31 required environment variables
# - Auto-generated secrets for Medusa (DB password, JWT secrets, etc.)

set -e  # Exit if any command fails (safety first)

echo "======================================================================="
echo "Need This Done - Environment Setup"
echo "======================================================================="
echo ""
echo "This script will create your .env.local file with all required settings."
echo "You'll be asked for API keys from external services."
echo ""
echo "Don't have all the keys yet? No problem!"
echo "You can use placeholders and update them later."
echo ""

# ============================================================================
# Collect User Input - Supabase
# ============================================================================

echo "======================================================================="
echo "1. Supabase Configuration"
echo "======================================================================="
echo ""
echo "Get these from: https://app.supabase.com"
echo "Go to your project → Settings → API"
echo ""

read -p "Supabase Project URL (e.g., https://xxx.supabase.co): " supabase_url
read -p "Supabase Anon Key (public key): " supabase_anon_key
echo "Supabase Service Role Key (keep this secret!):"
read -s -p "> " supabase_service_role_key
echo ""
echo ""

# ============================================================================
# Collect User Input - Redis (Upstash)
# ============================================================================

echo "======================================================================="
echo "2. Redis Configuration (Upstash)"
echo "======================================================================="
echo ""
echo "Get your Redis URL from: https://console.upstash.com"
echo "Create a Redis database and copy the connection string."
echo ""

read -p "Upstash Redis URL (redis://...): " redis_url

while [ -z "$redis_url" ]; do
  echo "Redis URL is required for caching."
  read -p "Upstash Redis URL: " redis_url
done

echo ""

# ============================================================================
# Collect User Input - Medusa (Railway)
# ============================================================================

echo "======================================================================="
echo "3. Medusa Backend Configuration (Railway)"
echo "======================================================================="
echo ""
echo "Get your Medusa backend URL from your Railway deployment."
echo "It should look like: https://your-app.railway.app"
echo ""

read -p "Railway Medusa URL (https://...): " medusa_backend_url

while [ -z "$medusa_backend_url" ]; do
  echo "Medusa backend URL is required for e-commerce features."
  read -p "Railway Medusa URL: " medusa_backend_url
done

echo ""

# ============================================================================
# Collect User Input - Stripe
# ============================================================================

echo "======================================================================="
echo "4. Stripe Payment Configuration"
echo "======================================================================="
echo ""
echo "Get these from: https://dashboard.stripe.com/apikeys"
echo "Use TEST keys for development (they start with sk_test_ and pk_test_)"
echo ""
echo "Don't have Stripe set up yet? Press Enter to use placeholders."
echo ""

read -p "Stripe Secret Key (sk_test_...): " stripe_secret_key
read -p "Stripe Publishable Key (pk_test_...): " stripe_publishable_key
read -p "Stripe Webhook Secret (whsec_...): " stripe_webhook_secret

# Set defaults if empty
stripe_secret_key=${stripe_secret_key:-"sk_test_YOUR_STRIPE_SECRET_KEY"}
stripe_publishable_key=${stripe_publishable_key:-"pk_test_YOUR_STRIPE_PUBLISHABLE_KEY"}
stripe_webhook_secret=${stripe_webhook_secret:-"whsec_YOUR_WEBHOOK_SECRET"}

echo ""

# ============================================================================
# Collect User Input - Resend
# ============================================================================

echo "======================================================================="
echo "5. Resend Email Configuration"
echo "======================================================================="
echo ""
echo "Get your API key from: https://resend.com/api-keys"
echo "Don't have Resend set up yet? Press Enter to use placeholder."
echo ""

read -p "Resend API Key (re_...): " resend_api_key
resend_api_key=${resend_api_key:-"re_YOUR_RESEND_API_KEY"}

echo ""

# ============================================================================
# Collect User Input - OpenAI
# ============================================================================

echo "======================================================================="
echo "6. OpenAI Configuration"
echo "======================================================================="
echo ""
echo "Get your API key from: https://platform.openai.com/api-keys"
echo "This powers the AI chatbot on your site."
echo ""

read -p "OpenAI API Key (sk-proj-...): " openai_api_key

while [ -z "$openai_api_key" ]; do
  echo "OpenAI API key is required for the chatbot to work."
  read -p "OpenAI API Key (sk-proj-...): " openai_api_key
done

echo ""

# ============================================================================
# Generate Secrets
# ============================================================================

echo "======================================================================="
echo "7. Generating Secure Secrets"
echo "======================================================================="
echo ""
echo "Auto-generating secure passwords and secrets for Medusa backend..."
echo ""

# Generate all required secrets (32 bytes = strong encryption)
medusa_db_password=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-40)
medusa_jwt_secret=$(openssl rand -base64 32)
medusa_admin_jwt_secret=$(openssl rand -base64 32)
cookie_secret=$(openssl rand -base64 32)

echo "✓ Database password generated"
echo "✓ JWT secrets generated"
echo "✓ Cookie secret generated"
echo ""

# ============================================================================
# Create .env.local File
# ============================================================================

echo "======================================================================="
echo "8. Creating .env.local File"
echo "======================================================================="
echo ""

cat > .env.local <<EOF
# ============================================================================
# Local Development Environment Variables
# ============================================================================
# Generated by scripts/setup.sh on $(date)
# Last updated: $(date +%Y-%m-%d)

# ============================================================================
# Supabase Configuration (REQUIRED)
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=$supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=$supabase_service_role_key

# ============================================================================
# Redis Configuration (Upstash)
# ============================================================================
REDIS_URL=$redis_url
SKIP_CACHE=true

# ============================================================================
# Site Configuration (LOCAL DEVELOPMENT)
# ============================================================================
NEXT_PUBLIC_SITE_URL=https://localhost

# ============================================================================
# Node Environment (LOCAL DEVELOPMENT)
# ============================================================================
NODE_ENV=development

# ============================================================================
# Medusa E-commerce Backend (REQUIRED)
# ============================================================================
MEDUSA_DB_PASSWORD=$medusa_db_password
MEDUSA_JWT_SECRET=$medusa_jwt_secret
MEDUSA_ADMIN_JWT_SECRET=$medusa_admin_jwt_secret
COOKIE_SECRET=$cookie_secret
MEDUSA_BACKEND_URL=$medusa_backend_url
ADMIN_CORS=https://localhost

# ============================================================================
# Stripe Payments (REQUIRED - UPDATE WITH YOUR KEYS)
# ============================================================================
# Get from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=$stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$stripe_publishable_key
STRIPE_WEBHOOK_SECRET=$stripe_webhook_secret

# ============================================================================
# Resend Email Service (REQUIRED - ADD WHEN YOU CREATE ACCOUNT)
# ============================================================================
# Get from: https://resend.com/api-keys
RESEND_API_KEY=$resend_api_key
RESEND_FROM_EMAIL=hello@needthisdone.com
RESEND_ADMIN_EMAIL=admin@needthisdone.com

# ============================================================================
# OpenAI API (REQUIRED)
# ============================================================================
OPENAI_API_KEY=$openai_api_key

# ============================================================================
# Chatbot Configuration (OPTIONAL - has defaults)
# ============================================================================
NEXT_PUBLIC_CHATBOT_MODEL=gpt-4o-mini
NEXT_PUBLIC_CHATBOT_MAX_TOKENS=1000
NEXT_PUBLIC_CHATBOT_TEMPERATURE=0.7

# ============================================================================
# Embedding Configuration (OPTIONAL - has defaults)
# ============================================================================
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_BATCH_SIZE=100

# ============================================================================
# Vector Search Configuration (REQUIRED)
# ============================================================================
VECTOR_SEARCH_SIMILARITY_THRESHOLD=0.5
VECTOR_SEARCH_MAX_RESULTS=5
EOF

echo "✓ .env.local file created successfully!"
echo ""

# ============================================================================
# Summary
# ============================================================================

echo "======================================================================="
echo "✓ Setup Complete!"
echo "======================================================================="
echo ""
echo "Your .env.local file has been created with all 31 environment variables."
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Review your .env.local file and update any placeholder values"
echo "2. Save your credentials to a secure password manager (Keeper, 1Password, etc.)"
echo ""

if [[ "$stripe_secret_key" == "sk_test_YOUR_STRIPE_SECRET_KEY" ]]; then
  echo "⚠️  Stripe: Add your real API keys from https://dashboard.stripe.com/apikeys"
fi

if [[ "$resend_api_key" == "re_YOUR_RESEND_API_KEY" ]]; then
  echo "⚠️  Resend: Add your API key from https://resend.com/api-keys"
fi

echo ""
echo "🚀 Ready to start development:"
echo ""
echo "   cd app && npm run dev"
echo "   # Then visit: http://localhost:3000"
echo ""
echo "Happy building! 🎯"
echo ""
