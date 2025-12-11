# Deployment Guide

Complete guide to deploying NeedThisDone.com to production.

---

## Quick Deploy (GitHub Actions - Automatic)

The easiest way to deploy:

1. **Test locally** at https://localhost
2. **Commit and push to main:** `git push origin main`
3. **GitHub Actions automatically deploys** (3-5 minutes)
4. **Done!** Site live at https://needthisdone.com

---

## Manual Deploy (CLI - Single Droplet)

**Cost: ~$24/month** - All services on one server.

### Prerequisites

```bash
# Install DigitalOcean CLI (macOS)
brew install doctl

# Authenticate
doctl auth init
# Paste API token from: https://cloud.digitalocean.com/account/api/tokens

# Set up SSH key
ssh-keygen -t ed25519 -C "your-email@example.com" -f ~/.ssh/digitalocean
doctl compute ssh-key create my-laptop --public-key "$(cat ~/.ssh/digitalocean.pub)"
```

### Deploy in 5 Steps

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

# 3. Initial server setup
ssh root@$DROPLET_IP << 'ENDSSH'
  apt update && apt upgrade -y
  curl -fsSL https://get.docker.com | sh
  curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
  ufw allow OpenSSH && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable
  echo "✅ Server ready!"
ENDSSH

# 4. Clone and deploy
ssh root@$DROPLET_IP << 'ENDSSH'
  git clone https://github.com/yourusername/Need_This_Done.git
  cd Need_This_Done
  # Create .env.local (see Environment Variables section below)
  docker-compose -f docker-compose.production.yml up -d --build
  echo "✅ App deployed!"
ENDSSH

# 5. Set up domain (at your registrar)
echo "Create DNS A record: yourdomain.com -> $DROPLET_IP"
```

---

## Environment Variables

Create `.env.local` on your server with these variables:

```bash
# ============================================================================
# REQUIRED - Core Services
# ============================================================================

# Supabase (from https://app.supabase.com/project/[your-project]/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Redis (Docker internal - keep this exact value)
REDIS_URL=redis://redis:6379

# Site URL
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NODE_ENV=production

# ============================================================================
# REQUIRED - Medusa E-commerce
# ============================================================================

# Generate with: openssl rand -base64 32
MEDUSA_DB_PASSWORD=your_secure_password
MEDUSA_JWT_SECRET=your_jwt_secret_min_32_chars
MEDUSA_ADMIN_JWT_SECRET=your_admin_jwt_secret_min_32_chars
MEDUSA_BACKEND_URL=http://medusa:9000

# ============================================================================
# REQUIRED - Stripe Payments
# ============================================================================

# From https://dashboard.stripe.com/apikeys (use live keys for production)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ============================================================================
# REQUIRED - Email (Resend)
# ============================================================================

# From https://resend.com/api-keys
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=hello@yourdomain.com
RESEND_ADMIN_EMAIL=admin@yourdomain.com

# ============================================================================
# REQUIRED - AI Chatbot
# ============================================================================

# From https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-...
VECTOR_SEARCH_SIMILARITY_THRESHOLD=0.5
```

### Generate Secrets

```bash
# Run this to generate secure random strings
echo "MEDUSA_DB_PASSWORD=$(openssl rand -base64 32)"
echo "MEDUSA_JWT_SECRET=$(openssl rand -base64 32)"
echo "MEDUSA_ADMIN_JWT_SECRET=$(openssl rand -base64 32)"
```

---

## SSL Certificates (HTTPS)

After DNS propagates (~5-60 minutes):

```bash
ssh root@$DROPLET_IP

# Install Certbot
apt install -y python3-venv
python3 -m venv /opt/certbot/
/opt/certbot/bin/pip install certbot
ln -s /opt/certbot/bin/certbot /usr/bin/certbot

# Get certificate
certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive

# Copy certs to nginx
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/

# Restart services
cd Need_This_Done
docker-compose -f docker-compose.production.yml restart nginx

# Set up auto-renewal
echo "0 0 * * 0 /usr/bin/certbot renew --quiet" | tee -a /etc/crontab
```

---

## Post-Deployment Checklist

- [ ] App loads at https://yourdomain.com
- [ ] Can browse products at /shop
- [ ] Can add items to cart
- [ ] Can create account / login
- [ ] Checkout with Stripe works
- [ ] Admin dashboard accessible at /admin
- [ ] Chatbot responds to questions
- [ ] Email notifications working

---

## Common Commands

### View Logs
```bash
docker-compose -f docker-compose.production.yml logs -f app
docker-compose -f docker-compose.production.yml logs -f medusa
```

### Restart Services
```bash
docker-compose -f docker-compose.production.yml restart
```

### Update App (after git push)
```bash
cd Need_This_Done
git pull origin main
docker-compose -f docker-compose.production.yml up -d --build
```

### Check Resource Usage
```bash
docker stats
```

### Database Backup
```bash
docker-compose exec postgres pg_dump -U medusa medusa > backup-$(date +%Y%m%d).sql
```

---

## Troubleshooting

### Can't connect to database
- Check database is running: `docker-compose ps`
- Verify connection string in `.env.local`
- Check logs: `docker-compose logs postgres`

### SSL not working
- Wait 5 minutes after DNS setup
- Verify DNS propagated: `dig yourdomain.com`
- Check certificates: `certbot certificates`

### Out of memory / crashes
- Check usage: `docker stats`
- Resize droplet to larger size
- Add swap space

### Slow performance
- Verify Redis is running and connected
- Check cache hit rates
- Consider CDN for static assets

---

## Cost Summary

| Option | Monthly Cost |
|--------|--------------|
| Single Droplet (4GB) | $24 |
| With backups | $26-28 |
| App Platform | $54-89 |

---

## Resources

- [DigitalOcean CLI Docs](https://docs.digitalocean.com/reference/doctl/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Let's Encrypt Certbot](https://certbot.eff.org/)
