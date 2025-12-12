#!/bin/bash

# ============================================================================
# Update Production Environment Variables on DigitalOcean
# ============================================================================
# What: Updates .env.local on production server and restarts services
# Why: Apply new Resend email configuration to production
# How: SSH to server, update env vars, rebuild containers

set -e  # Exit on error

# Your DigitalOcean server IP
SERVER_IP="159.65.223.234"
SSH_USER="root"  # or your SSH user

echo "🚀 Updating production environment variables..."
echo ""

# SSH into server and update environment variables
ssh "${SSH_USER}@${SERVER_IP}" << 'ENDSSH'
  # Navigate to app directory
  cd /root/Need_This_Done || { echo "❌ /root/Need_This_Done directory not found"; exit 1; }

  # Backup current .env file
  echo "📦 Backing up current .env..."
  cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || cp .env.prod .env.prod.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

  # Add or update Resend environment variables
  echo "✏️  Updating Resend configuration..."

  # Check which env file exists
  if [ -f .env.local ]; then
    ENV_FILE=".env.local"
  elif [ -f .env.prod ]; then
    ENV_FILE=".env.prod"
  else
    echo "❌ No environment file found"
    exit 1
  fi

  # Update RESEND_FROM_EMAIL (or add if missing)
  if grep -q "^RESEND_FROM_EMAIL=" "$ENV_FILE"; then
    sed -i 's|^RESEND_FROM_EMAIL=.*|RESEND_FROM_EMAIL=hello@needthisdone.com|' "$ENV_FILE"
    echo "✅ Updated RESEND_FROM_EMAIL"
  else
    echo "RESEND_FROM_EMAIL=hello@needthisdone.com" >> "$ENV_FILE"
    echo "✅ Added RESEND_FROM_EMAIL"
  fi

  # Update RESEND_ADMIN_EMAIL (or add if missing)
  if grep -q "^RESEND_ADMIN_EMAIL=" "$ENV_FILE"; then
    sed -i 's|^RESEND_ADMIN_EMAIL=.*|RESEND_ADMIN_EMAIL=abe.raise@gmail.com|' "$ENV_FILE"
    echo "✅ Updated RESEND_ADMIN_EMAIL"
  else
    echo "RESEND_ADMIN_EMAIL=abe.raise@gmail.com" >> "$ENV_FILE"
    echo "✅ Added RESEND_ADMIN_EMAIL"
  fi

  echo ""
  echo "📋 Current Resend configuration:"
  grep "^RESEND_" "$ENV_FILE" || echo "No RESEND_ vars found"

  echo ""
  echo "🔄 Restarting Docker containers..."
  docker-compose -f docker-compose.production.yml down
  docker-compose -f docker-compose.production.yml up --build -d

  echo ""
  echo "✅ Production environment updated and services restarted!"
ENDSSH

echo ""
echo "🎉 Done! Your production server now has the updated Resend configuration."
echo "   Emails will be sent from: hello@needthisdone.com"
echo "   Admin notifications go to: abe.raise@gmail.com"
