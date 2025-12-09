# Deploy to DigitalOcean Guide

This guide walks you through deploying your Next.js + Medusa + Supabase + Redis app to DigitalOcean.

## Table of Contents
- [Deployment Options](#deployment-options)
- [Option 1: App Platform (Recommended - Easiest)](#option-1-app-platform-recommended---easiest)
- [Option 2: Droplet with Docker Compose (More Control)](#option-2-droplet-with-docker-compose-more-control)
- [Setting Up Managed Databases](#setting-up-managed-databases)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)

---

## Deployment Options

You have two main ways to deploy:

| Option | Best For | Pros | Cons | Cost |
|--------|----------|------|------|------|
| **App Platform** | Quick deployment, managed infrastructure | Auto-scaling, CI/CD, managed SSL | Less control, higher cost | ~$12-24/month per service |
| **Droplet** | Full control, cost optimization | Complete control, cheaper for multi-service apps | Manual setup, you manage everything | ~$24-48/month total |

**Recommendation**: Start with **App Platform** for speed, move to Droplet if you need more control or lower costs.

---

## Option 1: App Platform (Recommended - Easiest)

App Platform is DigitalOcean's managed platform - like Vercel or Heroku. It handles Docker builds, SSL, and auto-deploys from GitHub.

### Prerequisites

- DigitalOcean account
- GitHub repository with your code
- Credit card (free trial available)

### Step 1: Prepare Your Repository

Your app is already Docker-ready, but App Platform needs a few tweaks:

**1. Add a production Dockerfile** (if you don't have one):

```dockerfile
# app/Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

**2. Update `next.config.js`** to enable standalone mode:

```javascript
module.exports = {
  output: 'standalone',
  // ... rest of your config
}
```

**3. Commit and push** these changes to GitHub.

### Step 2: Create App on App Platform

1. **Go to App Platform**: https://cloud.digitalocean.com/apps
2. **Click "Create App"**
3. **Connect GitHub**: Authorize DigitalOcean to access your repository
4. **Select Repository**: Choose your `Need_This_Done` repo
5. **Select Branch**: Choose `main` (or your production branch)

### Step 3: Configure Your Services

App Platform will detect your services. Configure each one:

#### Service 1: Next.js App

- **Type**: Web Service
- **Dockerfile Path**: `app/Dockerfile`
- **HTTP Port**: 3000
- **Run Command**: (leave default)
- **Environment Variables**: (see Environment Variables section below)
- **Plan**: Basic ($12/month for 1GB RAM)

#### Service 2: Medusa Backend

- **Type**: Web Service
- **Dockerfile Path**: `medusa/Dockerfile`
- **HTTP Port**: 9000
- **Environment Variables**: (see Environment Variables section below)
- **Plan**: Basic ($12/month)

#### Service 3: Nginx (Optional)

For App Platform, you might skip nginx since each service gets its own URL. Or configure it as an additional service if you want unified routing.

### Step 4: Add Managed Databases

**PostgreSQL for Medusa**:
1. In App Platform, click "Add Resource" → "Database"
2. Choose PostgreSQL
3. Select plan ($15/month for development, $50/month for production with HA)
4. Name it `medusa-db`
5. App Platform automatically injects connection string as `${medusa-db.DATABASE_URL}`

**Redis for Caching**:
⚠️ **Important**: Redis is being discontinued June 2025. Use **Valkey** (Redis-compatible) instead:
1. Click "Add Resource" → "Database"
2. Choose Valkey (Redis-compatible)
3. Select plan ($15/month)
4. Name it `cache`
5. Connection: `${cache.REDIS_URL}`

**Supabase**: Keep using your existing Supabase Cloud project (easier than self-hosting).

### Step 5: Configure Environment Variables

For **Next.js App**:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Medusa
NEXT_PUBLIC_MEDUSA_URL=${medusa-backend.PUBLIC_URL}

# Redis
REDIS_URL=${cache.REDIS_URL}

# AI (optional)
OPENAI_API_KEY=sk-...
```

For **Medusa Backend**:
```bash
# Database (automatically injected)
DATABASE_URL=${medusa-db.DATABASE_URL}

# Redis
REDIS_URL=${cache.REDIS_URL}

# Secrets
MEDUSA_JWT_SECRET=your-random-string-here
MEDUSA_ADMIN_JWT_SECRET=another-random-string

# CORS
STORE_CORS=https://your-app.ondigitalocean.app
ADMIN_CORS=https://your-app.ondigitalocean.app
```

### Step 6: Deploy

1. **Review Settings**: Check all configuration
2. **Select Region**: Choose closest to your users
3. **Click "Create Resources"**
4. **Wait**: First deployment takes 5-10 minutes

App Platform will:
- Build your Docker images
- Set up databases
- Generate SSL certificates
- Deploy everything
- Give you URLs like `https://your-app.ondigitalocean.app`

### Step 7: Set Up Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your domain (e.g., `needthisdone.com`)
3. Update DNS at your registrar:
   - Add CNAME record pointing to App Platform URL
4. SSL certificate auto-generates in ~5 minutes

---

## Option 2: Droplet with Docker Compose (More Control)

A Droplet is a VPS (virtual private server) where you have full control. Good for running all services on one machine.

### Step 1: Create a Droplet

1. **Go to**: https://cloud.digitalocean.com/droplets
2. **Click**: "Create Droplet"
3. **Choose Image**: Ubuntu 24.04 LTS x64
4. **Choose Size**:
   - **Development**: $12/month (2GB RAM, 1 CPU) - bare minimum
   - **Production**: $24/month (4GB RAM, 2 CPUs) - recommended
   - **High Traffic**: $48/month (8GB RAM, 4 CPUs)
5. **Enable Monitoring**: Free, helpful for debugging
6. **Add SSH Key**: Upload your public SSH key for secure access
7. **Choose Region**: Closest to your users
8. **Create Droplet**

Wait ~60 seconds for provisioning, then note your droplet's IP address.

### Step 2: Initial Server Setup

SSH into your droplet:

```bash
# Replace with your droplet IP
ssh root@YOUR_DROPLET_IP

# Update system packages
sudo apt update && sudo apt upgrade -y

# Create a non-root user (security best practice)
adduser deployer
usermod -aG sudo deployer
usermod -aG docker deployer  # we'll add docker group later

# Set up firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### Step 3: Install Docker & Docker Compose

```bash
# Install Docker using official script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version

# Log out and back in for group changes to take effect
exit
ssh root@YOUR_DROPLET_IP
```

### Step 4: Clone Your Repository

```bash
# Switch to deployer user
su - deployer

# Install git if needed
sudo apt install -y git

# Clone your repo
git clone https://github.com/yourusername/Need_This_Done.git
cd Need_This_Done
```

### Step 5: Set Up Environment Variables

```bash
# Create .env.local file
nano .env.local
```

Add your environment variables:

```bash
# Medusa
MEDUSA_DB_PASSWORD=your_secure_password_here
MEDUSA_JWT_SECRET=your_jwt_secret_here
MEDUSA_ADMIN_JWT_SECRET=your_admin_secret_here

# Redis
REDIS_URL=redis://redis:6379

# Supabase (use your cloud Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Chatbot (optional)
OPENAI_API_KEY=sk-...

# Production settings
NODE_ENV=production
```

Save with `Ctrl+X`, then `Y`, then `Enter`.

### Step 6: Update Docker Compose for Production

Your current `docker-compose.yml` is for development. Create a production version:

```bash
cp docker-compose.yml docker-compose.prod.yml
nano docker-compose.prod.yml
```

Update key settings:

```yaml
services:
  app:
    restart: always  # Auto-restart on crashes
    build:
      dockerfile: Dockerfile  # Use production Dockerfile, not Dockerfile.dev
    # Remove volume mounts (we want immutable containers)
    environment:
      - NODE_ENV=production

  medusa:
    restart: always

  redis:
    restart: always
    command: redis-server --appendonly yes  # Persistence

  nginx:
    restart: always
```

### Step 7: Configure Nginx for Your Domain

Update nginx config for your domain:

```bash
nano nginx/nginx.conf
```

Update the `server_name` directive:

```nginx
server {
    listen 80;
    server_name needthisdone.com www.needthisdone.com;  # Your domain

    # Redirect HTTP to HTTPS (we'll set up SSL next)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name needthisdone.com www.needthisdone.com;

    # SSL certificates (we'll generate these next)
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # ... rest of your nginx config ...
}
```

### Step 8: Generate SSL Certificates with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y python3-venv
sudo python3 -m venv /opt/certbot/
sudo /opt/certbot/bin/pip install certbot certbot-nginx
sudo ln -s /opt/certbot/bin/certbot /usr/bin/certbot

# Start nginx temporarily to verify domain
docker-compose -f docker-compose.prod.yml up -d nginx

# Generate certificates (replace with your domain and email)
sudo certbot --nginx -d needthisdone.com -d www.needthisdone.com --email your-email@example.com --agree-tos --non-interactive

# Copy certificates to nginx directory
sudo cp /etc/letsencrypt/live/needthisdone.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/needthisdone.com/privkey.pem nginx/ssl/

# Set up auto-renewal (runs weekly)
echo "0 0 * * 0 /opt/certbot/bin/certbot renew --quiet" | sudo tee -a /etc/crontab
```

### Step 9: Deploy Your Application

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up --build -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f app
```

Your app should now be accessible at `https://needthisdone.com`!

### Step 10: Update DNS Settings

At your domain registrar (Namecheap, GoDaddy, etc.):

1. **Add A Record**:
   - Type: `A`
   - Name: `@` (root domain)
   - Value: `YOUR_DROPLET_IP`
   - TTL: 3600

2. **Add A Record for www**:
   - Type: `A`
   - Name: `www`
   - Value: `YOUR_DROPLET_IP`
   - TTL: 3600

DNS propagation takes 5-60 minutes.

---

## Setting Up Managed Databases

If you want to use DigitalOcean's managed databases instead of self-hosted:

### PostgreSQL for Medusa

1. **Go to**: https://cloud.digitalocean.com/databases
2. **Click**: "Create Database"
3. **Choose**: PostgreSQL
4. **Version**: Latest stable (16.x)
5. **Plan**:
   - Development: Basic ($15/month, 1GB RAM)
   - Production: Professional ($50/month, 2GB RAM + standby node)
6. **Region**: Same as your app
7. **Click**: "Create Database Cluster"

**Get Connection String**:
- After creation, click on your database
- Go to "Connection Details"
- Copy the connection string
- Update your `.env.local`: `DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require`

### Redis/Valkey for Caching

⚠️ **Redis is being discontinued June 2025** - use Valkey instead:

1. **Go to**: Databases → "Create Database"
2. **Choose**: Valkey (Redis-compatible)
3. **Version**: Latest
4. **Plan**: $15/month minimum
5. **Region**: Same as your app
6. **Create**

**Get Connection String**:
- Copy connection string from dashboard
- Update `.env.local`: `REDIS_URL=rediss://user:pass@host:port`
- Note: Uses `rediss://` (with SSL)

### Important: Secure Database Access

By default, databases are only accessible from within DigitalOcean's network. To connect from your droplet:

1. Go to database → Settings → Trusted Sources
2. Add your droplet's IP address
3. Or add the database to the same VPC as your droplet

---

## Environment Variables

### Critical Environment Variables

**Generate Secure Secrets**:
```bash
# Generate random secrets (run these locally)
openssl rand -base64 32  # For MEDUSA_JWT_SECRET
openssl rand -base64 32  # For MEDUSA_ADMIN_JWT_SECRET
openssl rand -base64 32  # For MEDUSA_DB_PASSWORD
```

### Complete Environment Variables Checklist

**App Service** (Next.js):
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Medusa
NEXT_PUBLIC_MEDUSA_URL=https://medusa.yourdomain.com
# Or for App Platform: ${medusa-backend.PUBLIC_URL}

# Redis
REDIS_URL=redis://redis:6379
# Or managed: rediss://user:pass@host:port

# AI (optional)
OPENAI_API_KEY=sk-...

# Production
NODE_ENV=production
```

**Medusa Service**:
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/medusa

# Redis
REDIS_URL=redis://redis:6379

# Secrets
MEDUSA_JWT_SECRET=<generated-secret>
MEDUSA_ADMIN_JWT_SECRET=<generated-secret>

# CORS (important!)
STORE_CORS=https://yourdomain.com
ADMIN_CORS=https://yourdomain.com

# Production
NODE_ENV=production
```

---

## Post-Deployment

### 1. Run Database Migrations

For Medusa:
```bash
# If using Droplet:
docker-compose exec medusa npm run migrations

# If using App Platform:
# Add a job component that runs: npm run migrations
```

For Supabase (apply local migrations to cloud):
```bash
# Link to your cloud project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 2. Monitor Your Application

**App Platform**:
- Go to your app → Insights tab
- View CPU, Memory, Request metrics
- Set up alerts for downtime

**Droplet**:
```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check resource usage
docker stats

# Set up monitoring with DigitalOcean's agent (already enabled if you checked monitoring during creation)
```

### 3. Set Up Backups

**App Platform**: Automatic database backups included

**Droplet**:
1. Go to Droplet → Backups
2. Enable weekly backups ($2-4/month)
3. Or use DigitalOcean Snapshots (manual, $0.05/GB/month)

**Database Backups**:
- Managed databases: Automatic daily backups with PITR
- Self-hosted: Set up cron jobs for `pg_dump` and backup to Spaces

### 4. Set Up CI/CD

**App Platform**: Automatic! Pushes to your branch auto-deploy.

**Droplet**: Set up GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy to DigitalOcean

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Droplet
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DROPLET_IP }}
          username: deployer
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd Need_This_Done
            git pull origin main
            docker-compose -f docker-compose.prod.yml up --build -d
```

### 5. Performance Optimization

**Enable CDN** (for static assets):
- App Platform: Built-in CDN
- Droplet: Use DigitalOcean Spaces + CDN

**Database Optimization**:
- Connection pooling (PgBouncer for PostgreSQL)
- Redis for caching (already implemented!)
- Database indexes

**Monitoring**:
- Set up error tracking (Sentry)
- APM monitoring (New Relic, Datadog)
- Uptime monitoring (UptimeRobot, Pingdom)

---

## Costs Breakdown

### App Platform (Managed)
- Next.js App: $12/month (Basic)
- Medusa Backend: $12/month (Basic)
- PostgreSQL: $15/month (Dev) or $50/month (Prod with HA)
- Valkey (Redis): $15/month
- **Total**: ~$54/month (dev) or ~$89/month (prod)

### Droplet (Self-Managed)
- Droplet (4GB): $24/month
- Managed PostgreSQL: $15/month
- Managed Valkey: $15/month
- Backups: $2-4/month
- **Total**: ~$56/month

**Or, fully self-hosted on Droplet**:
- Droplet (4GB): $24/month
- Backups: $2-4/month
- **Total**: ~$28/month (everything on one droplet)

---

## Troubleshooting

### Issue: "Connection refused" to database

**App Platform**: Check that database is in same region and connected in dashboard

**Droplet**:
```bash
# Check if containers are running
docker-compose ps

# Check network connectivity
docker-compose exec app ping postgres
docker-compose exec app ping redis

# Check logs
docker-compose logs postgres
docker-compose logs redis
```

### Issue: SSL/HTTPS not working

**App Platform**: SSL is automatic, wait 5 minutes after adding domain

**Droplet**:
```bash
# Verify certbot generated certificates
sudo certbot certificates

# Check nginx config
docker-compose exec nginx nginx -t

# Regenerate if needed
sudo certbot renew --force-renewal
```

### Issue: App crashes or high memory usage

```bash
# Check container resource usage
docker stats

# Increase droplet size if needed
# Or adjust container memory limits in docker-compose.yml:
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
```

### Issue: Slow performance

1. **Check Redis**: Ensure caching is working
   ```bash
   docker-compose exec redis redis-cli INFO stats
   # Look for cache hit rate
   ```

2. **Enable Connection Pooling**: For PostgreSQL, use PgBouncer

3. **Add CDN**: For static assets

4. **Scale Up**: Increase droplet size or add more containers

---

## Next Steps

1. **Secure Your App**:
   - Review [security best practices](https://docs.digitalocean.com/products/droplets/how-to/security/)
   - Set up fail2ban for SSH protection
   - Regular security updates

2. **Monitor & Optimize**:
   - Set up error tracking
   - Monitor database performance
   - Optimize slow queries

3. **Scale When Ready**:
   - Add more droplets with load balancer
   - Use managed Kubernetes (DOKS)
   - Implement caching strategies

---

## Resources

### Official Documentation
- [App Platform Guide](https://docs.digitalocean.com/products/app-platform/)
- [Managed Databases](https://docs.digitalocean.com/products/databases/)
- [Next.js on App Platform](https://docs.digitalocean.com/products/app-platform/getting-started/sample-apps/next.js/)

### Community Tutorials
- [Deploy Docker Compose with Nginx](https://dev.to/manethpak/hosting-a-simple-docker-compose-app-with-nginx-and-generate-a-ssl-with-certbot-on-digitalocean-droplet-87k)
- [Next.js to DigitalOcean Droplet](https://www.digitalocean.com/community/developer-center/deploying-a-next-js-application-on-a-digitalocean-droplet)
- [Multiple Docker Apps on One Droplet](https://danielwachtel.com/devops/deploying-multiple-dockerized-apps-digitalocean-docker-compose-contexts)

### Database Resources
- [DigitalOcean Managed Databases](https://docs.digitalocean.com/products/databases/)
- [Valkey (Redis Alternative) Documentation](https://www.digitalocean.com/products/managed-databases-valkey)

---

**Questions or issues?** Check the [DigitalOcean Community](https://www.digitalocean.com/community) or open an issue in your repository.

**Last Updated**: December 2024