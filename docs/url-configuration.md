# URL Configuration Guide

This document explains how URLs are configured across the application, particularly for authentication flows that involve redirects.

## The Problem

When running behind nginx (Docker setup), the Next.js app receives requests on its internal port (3000), but users access the site through nginx on port 443 (HTTPS). If we use `request.url` directly for redirects, users get sent to `localhost:3000` instead of `https://localhost`.

## The Solution: NEXT_PUBLIC_SITE_URL

All redirect URLs must use `NEXT_PUBLIC_SITE_URL` as the base, not `request.url`.

### Environment Variable

Add this to `app/.env.local`:

```
NEXT_PUBLIC_SITE_URL=https://localhost
```

For production, this would be your actual domain:
```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Where This Variable Is Used

| File | Purpose |
|------|---------|
| `app/login/page.tsx` | OAuth redirect URL for Google sign-in |
| `app/auth/callback/route.ts` | Redirect after OAuth callback completes |
| `app/api/auth/signup/route.ts` | Email confirmation redirect |
| `app/api/admin/users/route.ts` | Password reset redirect |

## Supabase Dashboard Configuration

The Supabase Dashboard must also be configured to match:

1. Go to **Authentication → URL Configuration**
2. Set **Site URL**: `https://localhost` (or your production domain)
3. Add **Redirect URLs**: `https://localhost/auth/callback`

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Browser  │────▶│      Nginx      │────▶│    Next.js      │
│                 │     │   (port 443)    │     │   (port 3000)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                                               │
        │ https://localhost                             │ localhost:3000
        │                                               │
        ▼                                               ▼
   User sees this                              App sees this
```

The app internally sees `localhost:3000` but users access `https://localhost`. All external-facing URLs (redirects, links in emails, OAuth callbacks) must use the external URL.

## OAuth Flow

1. User clicks "Sign in with Google" on `/login`
2. App redirects to Google with `redirectTo: https://localhost/auth/callback`
3. User authenticates with Google
4. Google redirects to Supabase
5. Supabase redirects to `https://localhost/auth/callback?code=...`
6. Nginx proxies to `localhost:3000/auth/callback?code=...`
7. Callback exchanges code for session, sets cookies
8. Callback redirects to `https://localhost/dashboard` (using NEXT_PUBLIC_SITE_URL)

## Common Mistakes

### Wrong: Using request.url for redirects
```typescript
// BAD - will redirect to localhost:3000
const redirectUrl = new URL('/dashboard', request.url);
```

### Right: Using NEXT_PUBLIC_SITE_URL
```typescript
// GOOD - will redirect to https://localhost
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.url;
const redirectUrl = new URL('/dashboard', siteUrl);
```

## Nginx Buffer Configuration

Supabase auth cookies are large (JWT tokens split across multiple cookies). Nginx needs increased buffer sizes to handle them:

```nginx
# In nginx.conf http block
proxy_buffer_size 128k;
proxy_buffers 4 256k;
proxy_busy_buffers_size 256k;
```

Without this, you'll see `502 Bad Gateway` errors with the message:
```
upstream sent too big header while reading response header from upstream
```

## Troubleshooting

### "localhost:3000" appears in redirect URLs
- Check that `NEXT_PUBLIC_SITE_URL` is set in `.env.local`
- Restart the app container after changing env vars
- Verify the code uses `NEXT_PUBLIC_SITE_URL` not `request.url`

### 502 Bad Gateway after OAuth
- Rebuild nginx: `docker-compose build --no-cache nginx`
- Verify buffer settings in nginx.conf
- Restart: `docker-compose up -d`

### OAuth redirect mismatch errors
- Check Supabase Dashboard redirect URLs match `NEXT_PUBLIC_SITE_URL`
- Ensure both use the same protocol (https) and host (localhost)
