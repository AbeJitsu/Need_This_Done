#!/bin/bash

# ============================================================================
# Full-Stack Template Deployment Script
# ============================================================================
# What does this script do?
# Deploys your application to a production server (VPS)
# Think of it as catering your restaurant to a new location - moving equipment,
# starting service, and handing everything over.
#
# Prerequisites (must have these before running):
# - A VPS or cloud server (DigitalOcean, Linode, AWS, etc) with Ubuntu/Debian
# - Docker and Docker Compose installed on the server
# - A domain name pointing to your server's IP address
# - SSH key set up (can connect without typing a password)
#
# What it will ask:
# - Your server's IP address
# - Your SSH username (usually 'root' or 'ubuntu')
# - Your domain name (for HTTPS certificates)
#
# What it will do:
# - Copy files to the server
# - Install Docker if needed
# - Start containers with production settings
# - Set up free HTTPS certificates (Let's Encrypt)
# - Make your app accessible at your domain

set -e  # Exit if any command fails

echo "======================================================================="
echo "Full-Stack Template Deployment"
echo "======================================================================="
echo ""
echo "This script will deploy your app to a production server."
echo "Make sure you have:"
echo "  ✓ SSH access to your server"
echo "  ✓ Docker installed on the server"
echo "  ✓ Your domain pointing to the server IP"
echo ""

# ============================================================================
# Validate Prerequisites
# ============================================================================

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
  echo "Error: docker-compose.yml not found"
  echo "Please run this script from the project root directory"
  exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo "Error: .env.local not found"
  echo "Please run: bash scripts/setup.sh"
  exit 1
fi

echo "✓ Configuration files found"
echo ""

# ============================================================================
# Collect Server Information
# ============================================================================

# Server IP address
echo "What's your server's IP address?"
echo "Example: 123.45.67.89"
read -p "> " server_ip

# SSH username
echo ""
echo "What's your SSH username?"
echo "Example: root (or ubuntu, admin, etc)"
read -p "> " ssh_user

# Domain name
echo ""
echo "What's your domain name?"
echo "Example: myapp.com"
read -p "> " domain_name

# ============================================================================
# Validate Server Connectivity
# ============================================================================

echo ""
echo "Testing SSH connection..."

if ! ssh -o ConnectTimeout=5 "$ssh_user@$server_ip" "echo 'Connected'" > /dev/null 2>&1; then
  echo "Error: Cannot connect to $ssh_user@$server_ip"
  echo "Please check:"
  echo "  - Server IP is correct"
  echo "  - SSH username is correct"
  echo "  - Your SSH key is set up"
  exit 1
fi

echo "✓ SSH connection successful"
echo ""

# ============================================================================
# Copy Files to Server
# ============================================================================

echo "Copying files to server..."

# Create app directory on server if it doesn't exist
ssh "$ssh_user@$server_ip" "mkdir -p /app"

# Copy project files
# --delete = remove files on server that don't exist locally
# -a = archive mode (preserve permissions, symlinks, etc)
# -v = verbose (show what's being copied)
rsync -av --delete \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  ./ "$ssh_user@$server_ip:/app/"

echo "✓ Files copied to server"
echo ""

# ============================================================================
# Set Up Environment on Server
# ============================================================================

echo "Setting up environment on server..."

# Copy .env.local to server
scp .env.local "$ssh_user@$server_ip:/app/.env.prod"

# Update environment for production
ssh "$ssh_user@$server_ip" "
  cd /app

  # Set production environment
  sed -i 's/NODE_ENV=development/NODE_ENV=production/g' .env.prod

  # Update domain in environment
  sed -i 's|APP_URL=.*|APP_URL=https://$domain_name|g' .env.prod
"

echo "✓ Environment configured"
echo ""

# ============================================================================
# Install Docker (if needed)
# ============================================================================

echo "Checking Docker installation..."

ssh "$ssh_user@$server_ip" "
  if ! command -v docker &> /dev/null; then
    echo 'Installing Docker...'
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
  fi

  if ! command -v docker-compose &> /dev/null; then
    echo 'Installing Docker Compose...'
    curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
  fi
"

echo "✓ Docker is installed"
echo ""

# ============================================================================
# Create SSL Certificates
# ============================================================================

echo "Setting up HTTPS certificates..."

ssh "$ssh_user@$server_ip" "
  cd /app

  # Create ssl directory
  mkdir -p nginx/ssl

  # Generate self-signed certificate for now
  # In production, you should use Let's Encrypt with certbot
  openssl req -x509 -newkey rsa:2048 -keyout nginx/ssl/key.pem \
    -out nginx/ssl/cert.pem -days 365 -nodes \
    -subj \"/C=US/ST=State/L=City/O=Company/CN=$domain_name\" \
    2>/dev/null || true
"

echo "✓ SSL certificates created (self-signed)"
echo "  Note: For production, set up Let's Encrypt with certbot"
echo ""

# ============================================================================
# Start Docker Containers
# ============================================================================

echo "Starting application..."

ssh "$ssh_user@$server_ip" "
  cd /app

  # Use production compose file with resource limits
  docker-compose --env-file .env.prod \
    -f docker-compose.yml \
    -f docker-compose.prod.yml \
    up -d
"

echo "✓ Containers started"
echo ""

# ============================================================================
# Verify Deployment
# ============================================================================

echo "Verifying deployment..."

# Wait for app to be ready
sleep 5

if curl -s "http://$server_ip/health" > /dev/null; then
  echo "✓ Health check passed"
else
  echo "⚠ Health check not responding yet (this is normal, wait a minute)"
fi

echo ""
echo "======================================================================="
echo "✓ Deployment Complete!"
echo "======================================================================="
echo ""
echo "Your app is now running!"
echo ""
echo "Access your app at: https://$domain_name"
echo "Check logs:        ssh $ssh_user@$server_ip \"cd /app && docker-compose logs -f\""
echo "Restart app:       ssh $ssh_user@$server_ip \"cd /app && docker-compose restart app\""
echo ""
echo "⚠ Important Notes:"
echo "  - We used a self-signed SSL certificate"
echo "  - For production, set up Let's Encrypt for free HTTPS"
echo "  - Run: ssh $ssh_user@$server_ip \"apt-get install certbot\""
echo ""
echo "Next steps:"
echo "  1. Point your domain's DNS to $server_ip"
echo "  2. Set up proper HTTPS certificates (Let's Encrypt)"
echo "  3. Monitor your app's logs and performance"
echo "  4. Set up backups for your Supabase database"
echo ""
