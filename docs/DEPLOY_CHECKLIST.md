# DigitalOcean Deployment Checklist

Quick checklist to deploy your app to DigitalOcean today.

## Pre-Deployment

- [ ] DigitalOcean account created
- [ ] Payment method added
- [ ] Domain purchased (optional, can use provided subdomain)
- [ ] Supabase Cloud project set up
- [ ] GitHub repository ready

## Environment Variables Prepared

Generate these first:

```bash
# Run locally to generate secrets
openssl rand -base64 32  # MEDUSA_JWT_SECRET
openssl rand -base64 32  # MEDUSA_ADMIN_JWT_SECRET
openssl rand -base64 32  # MEDUSA_DB_PASSWORD
```

- [ ] `MEDUSA_JWT_SECRET` generated
- [ ] `MEDUSA_ADMIN_JWT_SECRET` generated
- [ ] `MEDUSA_DB_PASSWORD` generated
- [ ] Supabase credentials copied (URL, anon key, service key)
- [ ] OpenAI API key ready (if using chatbot)

---

## Option A: App Platform (5 Steps - ~30 mins)

### Step 1: Prepare Code (5 mins)
- [ ] Add production `Dockerfile` to app directory
- [ ] Update `next.config.js` with `output: 'standalone'`
- [ ] Commit and push to GitHub

### Step 2: Create App (5 mins)
- [ ] Go to https://cloud.digitalocean.com/apps
- [ ] Click "Create App"
- [ ] Connect GitHub repository
- [ ] Select `main` branch

### Step 3: Configure Services (10 mins)
- [ ] Configure Next.js service (port 3000)
- [ ] Configure Medusa service (port 9000)
- [ ] Add PostgreSQL database ($15/month)
- [ ] Add Valkey/Redis cache ($15/month)
- [ ] Total cost: ~$54-89/month

### Step 4: Environment Variables (5 mins)
- [ ] Add Next.js environment variables
- [ ] Add Medusa environment variables
- [ ] Reference managed database URLs

### Step 5: Deploy & Domain (5 mins)
- [ ] Click "Create Resources"
- [ ] Wait 5-10 minutes for deployment
- [ ] Add custom domain (optional)
- [ ] Update DNS records at registrar

**✅ Done! Your app is live.**

---

## Option B: Droplet (10 Steps - ~60-90 mins)

### Step 1: Create Droplet (5 mins)
- [ ] Go to https://cloud.digitalocean.com/droplets
- [ ] Choose Ubuntu 24.04 LTS
- [ ] Select size: $24/month (4GB RAM, 2 CPU)
- [ ] Add SSH key
- [ ] Enable monitoring
- [ ] Create droplet
- [ ] Note IP address: `___.___.___.___`

### Step 2: Initial Setup (5 mins)
```bash
ssh root@YOUR_DROPLET_IP
sudo apt update && sudo apt upgrade -y
adduser deployer
usermod -aG sudo deployer
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```
- [ ] SSH'd into droplet
- [ ] System updated
- [ ] Firewall configured

### Step 3: Install Docker (5 mins)
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```
- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] Versions verified

### Step 4: Clone Repository (5 mins)
```bash
git clone https://github.com/yourusername/Need_This_Done.git
cd Need_This_Done
```
- [ ] Repository cloned
- [ ] In project directory

### Step 5: Configure Environment (10 mins)
```bash
nano .env.local
# Paste all environment variables
```
- [ ] `.env.local` created with all variables
- [ ] Secrets added
- [ ] Supabase credentials added

### Step 6: Production Docker Compose (5 mins)
```bash
cp docker-compose.yml docker-compose.prod.yml
nano docker-compose.prod.yml
# Add restart: always
# Remove dev volume mounts
# Use production Dockerfiles
```
- [ ] Production compose file created
- [ ] Services set to auto-restart

### Step 7: Configure Nginx (5 mins)
```bash
nano nginx/nginx.conf
# Update server_name with your domain
```
- [ ] Domain added to nginx config
- [ ] SSL paths configured

### Step 8: SSL Certificates (10 mins)
```bash
sudo apt install -y python3-venv
sudo python3 -m venv /opt/certbot/
sudo /opt/certbot/bin/pip install certbot certbot-nginx
sudo ln -s /opt/certbot/bin/certbot /usr/bin/certbot

# Start nginx first
docker-compose -f docker-compose.prod.yml up -d nginx

# Generate certs
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
- [ ] Certbot installed
- [ ] SSL certificates generated
- [ ] Auto-renewal configured

### Step 9: Deploy (10 mins)
```bash
docker-compose -f docker-compose.prod.yml up --build -d
docker-compose -f docker-compose.prod.yml ps
```
- [ ] All services built
- [ ] All services running
- [ ] Logs look healthy

### Step 10: DNS Configuration (10 mins)
At your domain registrar:
- [ ] A Record: `@` → `YOUR_DROPLET_IP`
- [ ] A Record: `www` → `YOUR_DROPLET_IP`
- [ ] DNS propagated (wait 5-60 mins)
- [ ] Site accessible at https://yourdomain.com

**✅ Done! Your app is live.**

---

## Post-Deployment (Both Options)

### Run Migrations
```bash
# Medusa migrations
docker-compose exec medusa npm run migrations

# Supabase migrations
supabase link --project-ref your-project-ref
supabase db push
```
- [ ] Medusa migrations run
- [ ] Supabase migrations applied

### Verify Everything Works
- [ ] App loads at https://yourdomain.com
- [ ] Can browse products
- [ ] Can add items to cart
- [ ] Can create account / login
- [ ] Admin dashboard accessible
- [ ] No console errors

### Set Up Monitoring
- [ ] Check DigitalOcean Insights/Monitoring
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Set up error tracking (optional: Sentry)
- [ ] Configure alerts for downtime

### Enable Backups
- [ ] Database backups enabled (automatic for managed DBs)
- [ ] Droplet backups enabled ($2-4/month)
- [ ] Test restore process

### Security Hardening
- [ ] Change default SSH port (optional)
- [ ] Disable root login (optional)
- [ ] Install fail2ban (optional)
- [ ] Review firewall rules
- [ ] Set up automatic security updates

---

## Cost Summary

### App Platform
- Basic plan: ~$54/month
- Production plan: ~$89/month

### Droplet
- With managed databases: ~$56/month
- Fully self-hosted: ~$28/month

---

## Quick Commands Reference

### View logs
```bash
# App Platform: Use web dashboard
# Droplet:
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f medusa
```

### Restart services
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Update app (after git push)
```bash
cd Need_This_Done
git pull origin main
docker-compose -f docker-compose.prod.yml up --build -d
```

### Check resource usage
```bash
docker stats
```

### Renew SSL manually
```bash
sudo certbot renew
```

---

## Troubleshooting

### Can't connect to database
- [ ] Check database is in same region
- [ ] Verify connection string in `.env.local`
- [ ] Check firewall/trusted sources

### SSL not working
- [ ] Wait 5 minutes after setup
- [ ] Verify DNS is propagated: `dig yourdomain.com`
- [ ] Check certbot certificates: `sudo certbot certificates`

### High memory usage / crashes
- [ ] Check `docker stats`
- [ ] Increase droplet size
- [ ] Add memory limits in docker-compose

### Slow performance
- [ ] Verify Redis is working
- [ ] Check database queries
- [ ] Add CDN for static assets
- [ ] Scale up resources

---

## Next Steps After Deployment

1. **Test thoroughly**: Go through all user flows
2. **Set up CI/CD**: Auto-deploy on git push
3. **Monitor performance**: Track response times, errors
4. **Optimize**: Based on real-world usage patterns
5. **Scale**: Add resources as traffic grows

---

## Support Resources

- **Full Guide**: See [DEPLOY_DIGITALOCEAN.md](DEPLOY_DIGITALOCEAN.md)
- **DigitalOcean Docs**: https://docs.digitalocean.com
- **Community Forum**: https://www.digitalocean.com/community
- **Your App Docs**: See [README.md](../README.md)

---

**You've got this! Your app will be live in under an hour. Let's ship it! 🚀**
