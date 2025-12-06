---
name: docker-testing
description: Enforces non-negotiable rules for running tests in Docker. ALL tests go through NGINX. No exceptions.
---

# Docker Testing Rules

This is a fully Dockerized stack. Every test runs inside a container. Every HTTP request goes through NGINX. These rules are non-negotiable.

## The Contract

1. **ALL tests run inside Docker containers** - never on the host
2. **ALL HTTP requests go through NGINX** - never direct port access
3. **Verify containers are up before testing** - always
4. **Rebuild if dependencies changed** - always

Violating these rules means you're testing a system that doesn't exist in production.

## Pre-Test Checklist (REQUIRED)

Before running ANY test, execute these steps in order:

### Step 1: Verify Containers Are Running

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}' | grep -E '(nginx|nextjs_app|redis)'
```

**Required containers:**
- `nginx` - must be Up
- `nextjs_app` - must be Up (healthy)
- `redis` - must be Up

If any are missing or unhealthy, bring up the stack first:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Step 2: Check for Dependency Changes

If any of these files changed recently, rebuild before testing:
- `package.json`
- `package-lock.json`
- `app/Dockerfile*`
- `docker-compose*.yml`

Rebuild command:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

### Step 3: Run Tests Inside Containers

Now you may proceed with the appropriate test command.

## Test Commands

### Integration Tests

Run integration tests inside the test container:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.test.yml up --build --abort-on-container-exit test
```

This container:
- Joins `ntd_app_network`
- Uses `APP_URL=http://app:3000` (Docker service name)
- Uses `REDIS_URL=redis://redis:6379` (Docker service name)

### E2E Tests

Run E2E tests inside the e2e container:

```bash
docker-compose -f docker-compose.e2e.yml up --build --abort-on-container-exit
```

This container:
- Joins `ntd_app_network`
- Uses `BASE_URL=https://nginx` (goes through reverse proxy)
- Tests the real production path

## FORBIDDEN Actions

**NEVER do any of the following:**

- `npm run test` on the host
- `npm run test:integration` on the host
- `npx vitest` on the host
- `npx playwright test` on the host
- `curl http://localhost:3000` (bypasses NGINX)
- `curl http://localhost:9000` (direct Medusa access)
- Any HTTP request to ports other than 80/443
- Running tests before verifying containers are up

**ALWAYS do this instead:**

- Run tests inside Docker containers
- HTTP requests through NGINX (https://localhost or https://nginx)
- Verify stack health before testing
- Rebuild after dependency changes

## Why This Matters

If tests don't go through NGINX, you're not testing the real system. You're testing a configuration that doesn't exist in production. Every container - Medusa, Supabase, Redis, the frontend, the backend - is only accessible through NGINX. That's the architecture. Tests that bypass it are worthless.

## Quick Reference

| Test Type | Container | URL | Command |
|-----------|-----------|-----|---------|
| Integration | `test` | `http://app:3000` | `docker-compose ... -f docker-compose.test.yml up --abort-on-container-exit test` |
| E2E | `e2e` | `https://nginx` | `docker-compose -f docker-compose.e2e.yml up --abort-on-container-exit` |

## Troubleshooting

**Tests can't connect to services:**
- Containers aren't on `ntd_app_network`. Rebuild the test container.

**SSL errors in E2E tests:**
- Expected with self-signed certs. The e2e container sets `NODE_TLS_REJECT_UNAUTHORIZED=0`.

**Tests pass locally but fail in Docker:**
- You were probably running on the host. That's the bug. Docker is the truth.
