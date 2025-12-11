# Deployment Guide

This document explains how to deploy changes to your production server at https://needthisdone.com.

## Quick Start

1. **Make and test changes locally** at https://localhost
2. **Commit and push to main branch**:
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```
3. **GitHub Actions automatically deploys** — no manual work needed!
4. **Check your live site** at https://needthisdone.com (takes 3-5 minutes)

---

## Deployment Workflow

### Local Development → Testing → Production

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. LOCAL DEVELOPMENT (Your Machine)                             │
│ - Make code changes                                              │
│ - Run: docker-compose up -d --build                              │
│ - Test at https://localhost                                      │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. GIT & GITHUB (Your Repository)                               │
│ - git add .                                                      │
│ - git commit -m "message"                                        │
│ - git push origin main                                           │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. GITHUB ACTIONS (Automated)                                   │
│ - Triggered automatically on push to main                        │
│ - SSHes into DigitalOcean                                        │
│ - Pulls latest code                                              │
│ - Rebuilds Docker containers                                    │
│ - Verifies site is accessible                                   │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. PRODUCTION (DigitalOcean)                                    │
│ - Site runs at https://needthisdone.com                          │
│ - Watch GitHub Actions for deployment status                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step: Local Testing

Before pushing to production, always test locally:

### 1. Start Development Environment
```bash
docker-compose up -d --build
```

This rebuilds all containers with your changes and starts them.

### 2. Test at https://localhost
- Accept the self-signed SSL certificate warning
- Test all your changes thoroughly
- Check the browser console for errors
- Test on mobile if possible

### 3. Check Logs (if something breaks)
```bash
docker-compose logs nextjs_app
```

### 4. Stop When Done
```bash
docker-compose down
```

---

## Step-by-Step: Push to Production

Once local testing passes:

### 1. Stage Your Changes
```bash
git add .
```

### 2. Commit with Descriptive Message
```bash
git commit -m "Your descriptive commit message"
```

### 3. Push to Main Branch
```bash
git push origin main
```

### 4. Watch GitHub Actions Deploy
- Go to https://github.com/AbeJitsu/Need_This_Done/actions
- Click the latest workflow run
- Watch the "deploy" job progress
- Takes 3-5 minutes typically

### 5. Verify Live Site
- Visit https://needthisdone.com
- Refresh a few times to ensure it's updated
- Check that your changes are live

---

## What GitHub Actions Does Automatically

When you push to `main`, the `.github/workflows/deploy.yml` workflow:

1. **Checks out your code** from GitHub
2. **SSHes into DigitalOcean** using a deploy key
3. **Navigates to the project folder** at `/root/Need_This_Done`
4. **Pulls latest code** with `git pull origin main`
5. **Rebuilds containers** with `docker-compose -f docker-compose.production.yml up --build -d`
6. **Verifies deployment** by checking if the site responds
7. **Reports status** back to GitHub Actions

---

## SSH Connection (Already Configured)

Your SSH connection is set up with:

```bash
ssh needthisdone
```

This is configured in `~/.ssh/config`:
```
Host needthisdone
    HostName 159.65.223.234
    User root
    IdentityFile ~/.ssh/digitalocean
```

### Manual SSH (If Needed)
If you need to debug or check something on the server:

```bash
ssh needthisdone
cd ~/Need_This_Done
git status          # See current state
git log --oneline   # See commit history
docker ps          # See running containers
docker-compose logs # See container logs
```

---

## Docker Build Process

### Local Build (Development)
- Runs `npm install --legacy-peer-deps`
- Uses mounted volumes (changes appear instantly)
- Includes all dev dependencies for testing/linting

### Production Build (DigitalOcean)
- Runs `npm ci --frozen-lockfile`
- Uses exact versions from package-lock.json
- Creates optimized production image
- Only includes runtime dependencies

**Note:** The local `.next/` folder is NOT used in Docker. Each build creates its own inside the container.

---

## Troubleshooting

### Deployment Failed in GitHub Actions

1. **Check the error** in GitHub Actions logs
2. **Common issues:**
   - Missing environment variables
   - Docker build failure (check package.json dependencies)
   - SSH key problems (unlikely, but check `secrets.DEPLOY_KEY`)

3. **Fix locally and try again:**
   ```bash
   docker-compose down
   docker-compose up -d --build
   # Test changes
   git push origin main  # Triggers redeploy
   ```

### Site Not Updating After Deployment

1. **Clear your browser cache** (Cmd+Shift+R on Mac)
2. **Wait 5 minutes** — sometimes takes a moment to fully propagate
3. **Check GitHub Actions** — verify deployment actually completed
4. **SSH to server and check logs:**
   ```bash
   ssh needthisdone
   docker-compose logs nextjs_app
   ```

### Can't Connect to DigitalOcean

1. **Verify SSH key exists:**
   ```bash
   ls -la ~/.ssh/digitalocean
   ```

2. **Test SSH connection:**
   ```bash
   ssh needthisdone
   ```

3. **If connection fails:**
   - Verify you're on the right network
   - Check that the server is running in DigitalOcean dashboard
   - Confirm the IP hasn't changed (should be 159.65.223.234)

---

## Key Files

- **`.github/workflows/deploy.yml`** — Defines the automated deployment workflow
- **`docker-compose.yml`** — Development environment
- **`docker-compose.production.yml`** — Production environment
- **`app/Dockerfile`** — Production image
- **`app/Dockerfile.dev`** — Development image
- **`app/.npmrc`** — npm configuration for peer dependencies

---

## Environment Variables

The production server uses environment variables configured in DigitalOcean. If you need to add/change them:

1. **SSH to the server:** `ssh needthisdone`
2. **Check current env vars:** `docker-compose -f docker-compose.production.yml config | grep -A 20 environment`
3. **Edit docker-compose.production.yml** if needed
4. **Rebuild:** `docker-compose -f docker-compose.production.yml up --build -d`

---

## Questions?

If deployment seems broken:
1. Check GitHub Actions logs for errors
2. SSH into the server and check Docker logs
3. Verify all code is actually committed and pushed to main
4. Make sure you're testing with `docker-compose up -d --build` locally first
