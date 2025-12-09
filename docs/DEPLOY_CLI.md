# Deploy to DigitalOcean via CLI (Cheapest Option)

Complete CLI-based deployment guide for the most cost-effective option: **Single Droplet (~$24/month)**.

## Cost Comparison

| Option | Monthly Cost | What's Included |
|--------|--------------|-----------------|
| **Single Droplet (4GB)** | **$24** | All services on one server (Next.js, Medusa, PostgreSQL, Redis, Nginx) |
| Droplet + Managed DBs | $56 | Droplet + managed PostgreSQL + managed Redis |
| App Platform | $54-89 | Fully managed, auto-scaling |

**We're going with Option 1: Single Droplet ($24/month)** 🎯

---

## Prerequisites

### 1. Install DigitalOcean CLI (doctl)

**macOS:**
```bash
brew install doctl
```

**Linux:**
```bash
cd ~
wget https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz
tar xf doctl-1.104.0-linux-amd64.tar.gz
sudo mv doctl /usr/local/bin
```

**Verify:**
```bash
doctl version
```

### 2. Authenticate

```bash
# Get your API token from: https://cloud.digitalocean.com/account/api/tokens
doctl auth init

# Paste your token when prompted
# Verify authentication:
doctl account get
```

### 3. Set Up SSH Key

```bash
# Generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "your-email@example.com" -f ~/.ssh/digitalocean

# Add SSH key to DigitalOcean
doctl compute ssh-key create my-laptop --public-key "$(cat ~/.ssh/digitalocean.pub)"

# List your keys (note the ID for later)
doctl compute ssh-key list
```

---

## Quick Deploy (5 Commands, ~20 mins)

Here's the fastest path to deployment:

```bash
# 1. Create droplet (4GB, $24/month)
doctl compute droplet create needthisdone \
  --image ubuntu-24-04-x64 \
  --size s-2vcpu-4gb \
  --region nyc1 \
  --ssh-keys $(doctl compute ssh-key list --format ID --no-header) \
  --enable-monitoring \
  --wait

# 2. Get droplet IP
DROPLET_IP=$(doctl compute droplet list needthisdone --format PublicIPv4 --no-header)
echo "Droplet IP: $DROPLET_IP"

# 3. Initial setup (run as single command)
ssh root@$DROPLET_IP << 'ENDSSH'
  # Update system
  apt update && apt upgrade -y

  # Install Docker
  curl -fsSL https://get.docker.com | sh

  # Install Docker Compose
  curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose

  # Configure firewall
  ufw allow OpenSSH
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw --force enable

  # Create app user
  useradd -m -s /bin/bash -G sudo,docker deployer
  echo "deployer ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

  echo "✅ Server setup complete!"
ENDSSH

# 4. Deploy your app
ssh root@$DROPLET_IP << 'ENDSSH'
  # Clone repo
  cd /home/deployer
  git clone https://github.com/yourusername/Need_This_Done.git
  cd Need_This_Done

  # Create production environment file
  cat > .env.local << 'EOF'
# Medusa
MEDUSA_DB_PASSWORD=change_this_secure_password
MEDUSA_JWT_SECRET=change_this_jwt_secret
MEDUSA_ADMIN_JWT_SECRET=change_this_admin_secret

# Redis
REDIS_URL=redis://redis:6379

# Supabase (your cloud Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Production
NODE_ENV=production
EOF

  # Start all services
  docker-compose up -d

  echo "✅ App deployed! Visit http://$DROPLET_IP"
ENDSSH

# 5. Point your domain (optional)
# If you have a domain, create A record:
echo "Create DNS A record: yourdomain.com -> $DROPLET_IP"
```

**That's it! Your app is live at `http://$DROPLET_IP`** (or your domain once DNS propagates).

---

## Step-by-Step Detailed Guide

Let's break down each step with more detail and options.

### Step 1: Create Droplet

**List available options:**
```bash
# See available sizes and prices
doctl compute size list

# See available regions
doctl compute region list

# See available images
doctl compute image list --public | grep ubuntu
```

**Create droplet with options:**

```bash
# Basic (2GB RAM, $12/month) - bare minimum, not recommended for production
doctl compute droplet create needthisdone \
  --image ubuntu-24-04-x64 \
  --size s-1vcpu-2gb \
  --region nyc1 \
  --ssh-keys $(doctl compute ssh-key list --format ID --no-header) \
  --enable-monitoring \
  --wait

# Recommended (4GB RAM, $24/month) - good for production
doctl compute droplet create needthisdone \
  --image ubuntu-24-04-x64 \
  --size s-2vcpu-4gb \
  --region nyc1 \
  --ssh-keys $(doctl compute ssh-key list --format ID --no-header) \
  --enable-monitoring \
  --wait

# High performance (8GB RAM, $48/month) - for high traffic
doctl compute droplet create needthisdone \
  --image ubuntu-24-04-x64 \
  --size s-4vcpu-8gb \
  --region nyc1 \
  --ssh-keys $(doctl compute ssh-key list --format ID --no-header) \
  --enable-monitoring \
  --wait
```

**Regions** (choose closest to your users):
- `nyc1`, `nyc3` - New York
- `sfo3` - San Francisco
- `lon1` - London
- `fra1` - Frankfurt
- `sgp1` - Singapore

**Get droplet info:**
```bash
# List all droplets
doctl compute droplet list

# Get specific droplet
doctl compute droplet get needthisdone

# Get IP address
doctl compute droplet list needthisdone --format Name,PublicIPv4 --no-header
```

### Step 2: Configure Droplet

**Save your droplet IP:**
```bash
DROPLET_IP=$(doctl compute droplet list needthisdone --format PublicIPv4 --no-header)
echo "export DROPLET_IP=$DROPLET_IP" >> ~/.bashrc
echo "Droplet IP: $DROPLET_IP"
```

**SSH into droplet:**
```bash
ssh root@$DROPLET_IP
```

**Initial setup script** (run on droplet):
```bash
#!/bin/bash

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install essentials
echo "🔧 Installing essential packages..."
apt install -y git curl wget vim ufw fail2ban

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
echo "🐙 Installing Docker Compose..."
COMPOSE_VERSION="v2.24.0"
curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version

# Configure firewall
echo "🔒 Configuring firewall..."
ufw allow OpenSSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

# Create deploy user
echo "👤 Creating deploy user..."
useradd -m -s /bin/bash -G sudo,docker deployer
mkdir -p /home/deployer/.ssh
cp /root/.ssh/authorized_keys /home/deployer/.ssh/
chown -R deployer:deployer /home/deployer/.ssh
chmod 700 /home/deployer/.ssh
chmod 600 /home/deployer/.ssh/authorized_keys

# Allow deployer to sudo without password (for deployments)
echo "deployer ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Enable automatic security updates
echo "🛡️ Enabling automatic security updates..."
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

echo "✅ Server setup complete!"
echo "You can now SSH as: ssh deployer@$(hostname -I | awk '{print $1}')"
```

Save as `setup.sh`, upload, and run:
```bash
# Local machine
scp setup.sh root@$DROPLET_IP:~/
ssh root@$DROPLET_IP 'bash ~/setup.sh'
```

### Step 3: Deploy Your Application

**Clone and configure:**
```bash
# SSH as deployer user
ssh deployer@$DROPLET_IP

# Clone your repository
git clone https://github.com/yourusername/Need_This_Done.git
cd Need_This_Done

# Create environment file
nano .env.local
```

**Environment variables template:**
```bash
# .env.local

# Medusa Backend
MEDUSA_DB_PASSWORD=$(openssl rand -base64 32)
MEDUSA_JWT_SECRET=$(openssl rand -base64 32)
MEDUSA_ADMIN_JWT_SECRET=$(openssl rand -base64 32)

# Redis
REDIS_URL=redis://redis:6379

# Supabase (use your cloud Supabase project)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Medusa Public URL (update after domain setup)
NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000

# AI Chatbot (optional)
OPENAI_API_KEY=sk-...

# Production mode
NODE_ENV=production

# CORS (update with your domain)
STORE_CORS=http://localhost,https://yourdomain.com
ADMIN_CORS=http://localhost,https://yourdomain.com
```

**Or generate from script:**
```bash
# Generate secrets automatically
cat > .env.local << EOF
MEDUSA_DB_PASSWORD=$(openssl rand -base64 32)
MEDUSA_JWT_SECRET=$(openssl rand -base64 32)
MEDUSA_ADMIN_JWT_SECRET=$(openssl rand -base64 32)
REDIS_URL=redis://redis:6379
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_key_here
NODE_ENV=production
EOF

# Then edit to add your real Supabase credentials
nano .env.local
```

**Start services:**
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Should see:
# - app (Next.js)
# - medusa (Backend)
# - postgres (Database)
# - redis (Cache)
# - nginx (Web server)
```

**Your app is now running at** `http://$DROPLET_IP`! 🎉

### Step 4: Set Up Domain & SSL (Optional)

**If you have a domain**, set up DNS:

**Option A: Via CLI (if using DigitalOcean DNS)**
```bash
# Add domain to DigitalOcean
doctl compute domain create yourdomain.com

# Add A records
doctl compute domain records create yourdomain.com \
  --record-type A \
  --record-name @ \
  --record-data $DROPLET_IP \
  --record-ttl 3600

doctl compute domain records create yourdomain.com \
  --record-type A \
  --record-name www \
  --record-data $DROPLET_IP \
  --record-ttl 3600

# Verify
doctl compute domain records list yourdomain.com
```

**Option B: Manual DNS (at your registrar)**
- Go to your domain registrar (Namecheap, GoDaddy, etc.)
- Add A record: `@` → `$DROPLET_IP`
- Add A record: `www` → `$DROPLET_IP`
- Wait 5-60 minutes for DNS propagation

**Install SSL certificate:**
```bash
# SSH to droplet
ssh deployer@$DROPLET_IP

cd Need_This_Done

# Install Certbot
sudo apt install -y python3-venv
sudo python3 -m venv /opt/certbot/
sudo /opt/certbot/bin/pip install certbot certbot-nginx
sudo ln -s /opt/certbot/bin/certbot /usr/bin/certbot

# Stop services temporarily
docker-compose down

# Get certificate (replace with your domain and email)
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive

# Copy certs to nginx directory
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
sudo chown -R deployer:deployer nginx/ssl

# Update nginx config
nano nginx/nginx.conf
# Update server_name to: yourdomain.com www.yourdomain.com

# Restart services
docker-compose up -d

# Set up auto-renewal
echo "0 0 * * 0 /opt/certbot/bin/certbot renew --quiet --deploy-hook 'cd /home/deployer/Need_This_Done && docker-compose restart nginx'" | sudo tee -a /etc/crontab
```

**Your app is now live at** `https://yourdomain.com`! 🎉🔒

### Step 5: Enable Backups

**Enable droplet backups:**
```bash
# Enable weekly backups ($2-4/month additional)
doctl compute droplet-action enable-backups $(doctl compute droplet list needthisdone --format ID --no-header)

# Verify
doctl compute droplet get needthisdone --format Name,BackupsEnabled
```

**Or use Snapshots** (manual, but cheaper):
```bash
# Create snapshot
doctl compute droplet-action snapshot $(doctl compute droplet list needthisdone --format ID --no-header) --snapshot-name needthisdone-$(date +%Y%m%d)

# List snapshots
doctl compute snapshot list

# Restore from snapshot if needed
doctl compute droplet create needthisdone-restored \
  --image YOUR_SNAPSHOT_ID \
  --size s-2vcpu-4gb \
  --region nyc1
```

---

## Deployment Automation Script

Save this as `deploy.sh` for easy deployments:

```bash
#!/bin/bash
# deploy.sh - One-command deployment

set -e  # Exit on error

DROPLET_NAME="needthisdone"
DROPLET_SIZE="s-2vcpu-4gb"
REGION="nyc1"
DOMAIN="yourdomain.com"  # Change this

echo "🚀 Deploying to DigitalOcean..."

# Check if droplet exists
if doctl compute droplet list --format Name --no-header | grep -q "^${DROPLET_NAME}$"; then
  echo "✅ Droplet already exists"
  DROPLET_IP=$(doctl compute droplet list $DROPLET_NAME --format PublicIPv4 --no-header)
else
  echo "📦 Creating droplet..."
  doctl compute droplet create $DROPLET_NAME \
    --image ubuntu-24-04-x64 \
    --size $DROPLET_SIZE \
    --region $REGION \
    --ssh-keys $(doctl compute ssh-key list --format ID --no-header) \
    --enable-monitoring \
    --wait

  DROPLET_IP=$(doctl compute droplet list $DROPLET_NAME --format PublicIPv4 --no-header)
  echo "✅ Droplet created: $DROPLET_IP"

  # Wait for SSH to be ready
  echo "⏳ Waiting for SSH..."
  sleep 30
fi

echo "🔧 Setting up server..."
ssh -o StrictHostKeyChecking=no root@$DROPLET_IP << 'ENDSSH'
  # Update & install
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -qq
  apt-get upgrade -y -qq
  apt-get install -y -qq git curl wget docker.io

  # Install Docker Compose
  curl -sL "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose

  # Firewall
  ufw --force enable
  ufw allow OpenSSH
  ufw allow 80/tcp
  ufw allow 443/tcp

  echo "✅ Server ready"
ENDSSH

echo "📥 Deploying application..."
ssh root@$DROPLET_IP << ENDSSH
  # Clone or update repo
  if [ -d "/root/Need_This_Done" ]; then
    cd /root/Need_This_Done
    git pull origin main
  else
    git clone https://github.com/yourusername/Need_This_Done.git
    cd Need_This_Done
  fi

  # Check if .env.local exists
  if [ ! -f .env.local ]; then
    echo "⚠️  Creating .env.local - YOU MUST UPDATE IT!"
    cat > .env.local << 'EOF'
MEDUSA_DB_PASSWORD=$(openssl rand -base64 32)
MEDUSA_JWT_SECRET=$(openssl rand -base64 32)
MEDUSA_ADMIN_JWT_SECRET=$(openssl rand -base64 32)
REDIS_URL=redis://redis:6379
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=CHANGE_ME
SUPABASE_SERVICE_ROLE_KEY=CHANGE_ME
NODE_ENV=production
EOF
  fi

  # Start services
  docker-compose up -d --build

  echo "✅ Application deployed"
ENDSSH

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📍 Your app is running at: http://$DROPLET_IP"
echo ""
echo "Next steps:"
echo "1. SSH in: ssh root@$DROPLET_IP"
echo "2. Edit .env.local with your credentials"
echo "3. Restart: docker-compose restart"
echo "4. Set up domain: Point $DOMAIN to $DROPLET_IP"
echo "5. Install SSL: sudo certbot --nginx -d $DOMAIN"
```

**Use it:**
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Managing Your Droplet via CLI

### View droplet status
```bash
# List all droplets
doctl compute droplet list

# Get detailed info
doctl compute droplet get needthisdone

# Check CPU/memory usage (requires monitoring enabled)
doctl monitoring droplet cpu $(doctl compute droplet list needthisdone --format ID --no-header)
```

### Resize droplet
```bash
# List available sizes
doctl compute size list

# Power off (required for resize)
doctl compute droplet-action power-off $(doctl compute droplet list needthisdone --format ID --no-header) --wait

# Resize (upgrade to 8GB)
doctl compute droplet-action resize $(doctl compute droplet list needthisdone --format ID --no-header) --size s-4vcpu-8gb --wait

# Power on
doctl compute droplet-action power-on $(doctl compute droplet list needthisdone --format ID --no-header) --wait
```

### Reboot/restart
```bash
# Reboot
doctl compute droplet-action reboot $(doctl compute droplet list needthisdone --format ID --no-header)

# Power cycle
doctl compute droplet-action power-cycle $(doctl compute droplet list needthisdone --format ID --no-header)
```

### Delete droplet
```bash
# Delete (careful!)
doctl compute droplet delete needthisdone --force
```

---

## Cost Optimization Tips

### 1. Start Small, Scale Up
```bash
# Start with $12/month droplet for testing
doctl compute droplet create needthisdone-test \
  --size s-1vcpu-2gb \
  --image ubuntu-24-04-x64 \
  --region nyc1

# Scale up when needed (see "Resize droplet" above)
```

### 2. Use Reserved Instances (30-40% discount)
For long-term projects:
- Go to: https://cloud.digitalocean.com/reservations
- Reserve droplets for 1-3 years
- Save 30-40% vs pay-as-you-go

### 3. Enable Free Monitoring
```bash
# Free CPU/memory/disk monitoring
doctl compute droplet create needthisdone \
  --enable-monitoring  # Always include this flag
```

### 4. Use Spaces for File Storage
Instead of storing files on droplet:
```bash
# Create Spaces bucket ($5/month for 250GB)
doctl spaces bucket create my-app-storage --region nyc3

# Use for user uploads, backups, etc.
```

### 5. Snapshot Before Upgrades
```bash
# Free snapshot while testing (delete after)
doctl compute droplet-action snapshot YOUR_DROPLET_ID --snapshot-name pre-upgrade-backup

# Test changes, then delete snapshot
doctl compute snapshot delete SNAPSHOT_ID
```

---

## Maintenance Commands

### Update application
```bash
# SSH to droplet
ssh deployer@$DROPLET_IP

cd Need_This_Done

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# View logs
docker-compose logs -f app
```

### Check resource usage
```bash
# Via CLI (requires monitoring)
doctl monitoring droplet cpu $(doctl compute droplet list needthisdone --format ID --no-header)

# Or SSH in
ssh deployer@$DROPLET_IP
docker stats
df -h
free -m
```

### Database backup
```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U medusa medusa > backup-$(date +%Y%m%d).sql

# Backup Redis
docker-compose exec redis redis-cli SAVE
docker cp $(docker-compose ps -q redis):/data/dump.rdb ./redis-backup-$(date +%Y%m%d).rdb
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f medusa
docker-compose logs -f nginx

# Last 100 lines
docker-compose logs --tail=100 app
```

---

## Troubleshooting

### Droplet won't create
```bash
# Check your account limits
doctl account get

# Try different region
doctl compute region list
doctl compute droplet create needthisdone --region sfo3 ...

# Check available sizes in region
doctl compute size list --format Slug,Available,Regions
```

### Can't SSH to droplet
```bash
# Check droplet status
doctl compute droplet get needthisdone

# Check if SSH key was added
doctl compute ssh-key list

# Use console access via web dashboard as backup
```

### Out of memory
```bash
# Check usage
ssh deployer@$DROPLET_IP 'free -m'

# Resize droplet to next tier
# See "Resize droplet" section above
```

### SSL renewal fails
```bash
ssh deployer@$DROPLET_IP

# Manually renew
sudo certbot renew --dry-run  # Test first
sudo certbot renew            # Actually renew

# Check cron job
sudo crontab -l | grep certbot
```

---

## Comparison: CLI vs Web Dashboard

| Task | CLI | Web Dashboard |
|------|-----|---------------|
| Create droplet | `doctl compute droplet create...` | Click "Create Droplet" |
| View droplets | `doctl compute droplet list` | Navigate to Droplets page |
| Resize | `doctl compute droplet-action resize...` | Droplet → Resize |
| Monitoring | `doctl monitoring...` | Droplet → Graphs tab |
| Backups | `doctl compute droplet-action enable-backups...` | Droplet → Backups tab |
| DNS | `doctl compute domain records create...` | Networking → Domains |

**Recommendation**: Use CLI for creation/automation, use dashboard for monitoring/graphs.

---

## Final Cost Summary

### Single Droplet (All Services)
- **4GB Droplet**: $24/month
- **Backups (optional)**: $2-4/month
- **Domain (external)**: $10-15/year
- **Total**: ~$26-28/month

### With Managed Databases
- **4GB Droplet**: $24/month
- **Managed PostgreSQL**: $15/month
- **Managed Valkey**: $15/month
- **Total**: ~$54/month

### App Platform
- **Next.js**: $12/month
- **Medusa**: $12/month
- **PostgreSQL**: $15/month
- **Valkey**: $15/month
- **Total**: ~$54/month

**Winner for cost: Single Droplet at $24/month** 🏆

---

## Next Steps

1. **Run the deployment**: Use the automation script above
2. **Configure environment**: Update `.env.local` with your credentials
3. **Set up domain**: Point DNS to your droplet
4. **Install SSL**: Use Certbot for free HTTPS
5. **Enable backups**: $2-4/month for peace of mind
6. **Monitor**: Check DigitalOcean dashboard regularly

**You're all set to deploy for just $24/month!** 🎉

---

## Resources

- **doctl documentation**: https://docs.digitalocean.com/reference/doctl/
- **API reference**: https://docs.digitalocean.com/reference/api/
- **Community tutorials**: https://www.digitalocean.com/community/tutorials
- **Pricing calculator**: https://www.digitalocean.com/pricing/calculator

**Questions?** Check the [main deployment guide](DEPLOY_DIGITALOCEAN.md) or DigitalOcean community forums.
