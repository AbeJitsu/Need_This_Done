# NeedThisDone.com: Go & Electron Integration Plan

*Tailored technical plan for extending the platform with Go backend services and an Electron desktop application.*

---

## Executive Summary

This document outlines how to integrate Go and Electron into the existing needthisdone.com architecture. Neither technology requires rewriting what exists. Both extend the platform's capabilities in specific, valuable ways.

```
CURRENT STATE                          FUTURE STATE
─────────────────────────────────────────────────────────────────
Next.js handles everything       →     Next.js handles UI + most API
                                       Go handles background jobs
                                       Electron provides desktop access
```

---

## Current Architecture (Verified)

```
┌─────────────────────────────────────────────────────────────────┐
│                      needthisdone.com                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   FRONTEND                          BACKEND                      │
│   ├── Next.js 15 + React 19        ├── Next.js API Routes (49)  │
│   ├── 101 React components         ├── Supabase (auth + DB)     │
│   ├── 36 public pages              ├── Stripe (payments)        │
│   ├── 16 admin pages               ├── OpenAI GPT (chatbot)     │
│   ├── Page builder (25 blocks)     ├── Google Calendar          │
│   └── Tailwind CSS                 ├── Resend (email)           │
│                                    └── Upstash Redis (cache)    │
│                                                                  │
│   INFRASTRUCTURE                                                 │
│   └── Medusa (e-commerce engine, deployed on Railway)           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Existing API Routes by Domain

| Domain | Routes | Examples |
|--------|--------|----------|
| **Auth** | 4 | `/auth/login`, `/auth/signup`, `/auth/logout` |
| **Shop** | 5 | `/shop/products`, `/shop/products/[productId]` |
| **Cart/Orders** | 5 | `/cart`, `/cart/[cartId]/items`, `/orders` |
| **Stripe** | 3 | `/stripe/create-payment-intent`, `/stripe/webhook` |
| **Admin** | 8 | `/admin/users`, `/admin/products`, `/admin/appointments` |
| **Content** | 8 | `/pages`, `/blog`, `/media` |
| **AI/Embeddings** | 5 | `/chat`, `/embeddings/index`, `/embeddings/status` |
| **Calendar** | 4 | `/google/connect`, `/appointments/request` |
| **Projects** | 5 | `/projects`, `/projects/[id]/status`, `/projects/[id]/comments` |
| **Other** | 2 | `/health`, `/email-forward` |

---

# PART 1: GO INTEGRATION

## Why Go for NeedThisDone

| Current Limitation | How Go Solves It |
|--------------------|------------------|
| AI chatbot can bottleneck under load | Go handles thousands of concurrent requests efficiently |
| Background jobs (emails, webhooks) block main thread | Go workers process jobs independently |
| No CLI tools for admin tasks | Go compiles to single binary, zero dependencies |
| Node.js memory usage spikes | Go uses significantly less memory |

---

## Go Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      needthisdone.com                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   NEXT.JS (existing)                                            │
│   ├── All UI pages (36 public + 16 admin)                       │
│   ├── Most API routes (49 current)                              │
│   └── Puck page builder (25 blocks)                             │
│                                                                  │
│              │                    │                    │         │
│              ▼                    ▼                    ▼         │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│   │  GO SERVICE  │    │  GO SERVICE  │    │   GO CLI     │      │
│   │  ai-worker   │    │  job-runner  │    │   ntd-cli    │      │
│   ├──────────────┤    ├──────────────┤    ├──────────────┤      │
│   │ • Chat queue │    │ • Email jobs │    │ • Deploy     │      │
│   │ • Embeddings │    │ • Webhooks   │    │ • DB backup  │      │
│   │ • Rate limit │    │ • Scheduling │    │ • Health     │      │
│   └──────────────┘    └──────────────┘    └──────────────┘      │
│          │                   │                                   │
│          ▼                   ▼                                   │
│   ┌─────────────────────────────────────────────────────┐       │
│   │              SHARED INFRASTRUCTURE                   │       │
│   │  Supabase (DB)  │  Upstash Redis  │  OpenAI API    │       │
│   └─────────────────────────────────────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Go Service 1: AI Worker

### Purpose
Handle chatbot requests asynchronously, preventing load spikes from affecting the main application. This replaces the current `/api/chat` synchronous flow.

### Current Implementation (to be replaced)

The chatbot currently lives in:
- `app/lib/chatbot/` - Content extraction, chunking, hashing utilities
- `app/api/chat/route.ts` - Synchronous OpenAI calls
- `app/api/embeddings/` - Vector embedding management

### How Go Worker Would Work

```
USER SENDS MESSAGE
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Next.js    │────►│    Redis     │────►│  Go Worker   │
│  /api/chat   │     │    Queue     │     │  ai-worker   │
└──────────────┘     └──────────────┘     └──────────────┘
       │                                         │
       │                                         ▼
       │                                  ┌──────────────┐
       │                                  │  OpenAI API  │
       │                                  └──────────────┘
       │                                         │
       ▼                                         ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │◄────│    Redis     │◄────│   Response   │
│   (polling)  │     │   Pub/Sub    │     │   stored     │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Directory Structure

```
services/
└── ai-worker/
    ├── main.go
    ├── go.mod
    ├── go.sum
    ├── internal/
    │   ├── queue/
    │   │   └── redis.go
    │   ├── llm/
    │   │   └── openai.go
    │   └── handlers/
    │       └── chat.go
    ├── Dockerfile
    └── README.md
```

### Next.js Integration (Modified /api/chat)

```typescript
// app/api/chat/route.ts (modified to use queue)

import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export async function POST(request: Request) {
  const { message, conversationId } = await request.json()

  // Push to queue instead of calling OpenAI directly
  const jobId = crypto.randomUUID()

  await redis.lpush('chat:queue', JSON.stringify({
    jobId,
    conversationId,
    message,
    createdAt: Date.now(),
  }))

  // Return job ID for polling
  return Response.json({ jobId, status: 'queued' })
}

// Separate endpoint for polling results
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('jobId')

  const result = await redis.get(`chat:result:${jobId}`)

  if (!result) {
    return Response.json({ status: 'processing' })
  }

  return Response.json({ status: 'complete', result })
}
```

---

## Go Service 2: Job Runner

### Purpose
Process background jobs: emails, webhook handling, scheduled tasks.

### Current Implementation Points to Offload

| Current Location | What It Does | Go Job Type |
|-----------------|--------------|-------------|
| `/api/stripe/webhook` | Process Stripe events inline | `webhook:stripe` |
| Resend calls in various routes | Send emails synchronously | `email:*` |
| `/api/appointments/request` | Send confirmation emails | `email:appointment` |

### Job Types

| Job Type | Trigger | What It Does |
|----------|---------|--------------|
| `email:welcome` | User signup via Supabase | Send welcome email via Resend |
| `email:order` | Order placed via Stripe | Send confirmation + receipt |
| `email:appointment` | Booking via `/api/appointments/request` | Send calendar invite |
| `webhook:stripe` | Stripe event via `/api/stripe/webhook` | Process payment events |
| `schedule:reminder` | Cron (15 min before) | Send appointment reminders |

### Directory Structure

```
services/
└── job-runner/
    ├── main.go
    ├── go.mod
    ├── internal/
    │   ├── jobs/
    │   │   ├── email.go
    │   │   ├── webhook.go
    │   │   └── scheduler.go
    │   └── services/
    │       ├── resend.go
    │       └── supabase.go
    ├── Dockerfile
    └── README.md
```

---

## Go CLI Tool: ntd-cli

### Purpose
Administrative tasks without opening browser or SSH.

### Commands Tailored to NeedThisDone

```bash
# Health check all services
ntd health

# Database operations
ntd db backup                    # Backup Supabase
ntd db stats                     # Table sizes, row counts

# Deployment
ntd deploy staging               # Deploy to Vercel preview
ntd deploy production            # Deploy to Vercel production

# Cache management (Upstash)
ntd cache clear                  # Clear Redis cache
ntd cache stats                  # Show cache hit rates

# Content management
ntd pages list                   # List Puck pages
ntd pages export [slug]          # Export page JSON
ntd embeddings reindex           # Reindex chatbot embeddings

# User management
ntd users list --limit 10
ntd users search "email@example.com"

# Order/appointment overview
ntd orders pending               # Show pending orders
ntd appointments today           # Today's appointments
```

---

## Go Deployment Strategy

### Option 1: Docker on Railway (Recommended)

Since Medusa is already on Railway, add Go services there:

```yaml
# docker-compose.yml

version: '3.8'

services:
  ai-worker:
    build: ./services/ai-worker
    environment:
      - UPSTASH_REDIS_REST_URL=${UPSTASH_REDIS_REST_URL}
      - UPSTASH_REDIS_REST_TOKEN=${UPSTASH_REDIS_REST_TOKEN}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    restart: unless-stopped

  job-runner:
    build: ./services/job-runner
    environment:
      - UPSTASH_REDIS_REST_URL=${UPSTASH_REDIS_REST_URL}
      - UPSTASH_REDIS_REST_TOKEN=${UPSTASH_REDIS_REST_TOKEN}
      - RESEND_API_KEY=${RESEND_API_KEY}
      - SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    restart: unless-stopped
```

### Option 2: Vercel Functions (Limited)

Go can run as Vercel functions but with cold start penalties and 10s timeout limits. Not recommended for job processing.

---

# PART 2: ELECTRON INTEGRATION

## Why Electron for NeedThisDone

| Current Limitation | How Electron Solves It |
|--------------------|------------------------|
| Admin must keep browser tab open | Desktop app runs in system tray |
| No notifications unless browser focused | Native OS notifications |
| Can't work during internet outage | Offline mode with local cache |
| Puck page builder drag-and-drop is finicky in browser | Native app = smoother UX |

---

## Electron Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ELECTRON DESKTOP APP                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   RENDERER PROCESS (Loads needthisdone.com)                     │
│   ├── Admin Dashboard (/admin)                                  │
│   ├── Order Management (/admin/orders)                          │
│   ├── Appointment Calendar (/admin/appointments)                │
│   ├── Page Builder (/admin/pages/[slug]/edit)                   │
│   └── User Management (/admin/users)                            │
│                                                                  │
│              │ IPC (Inter-Process Communication)                │
│              ▼                                                   │
│   MAIN PROCESS (Node.js)                                        │
│   ├── System tray management                                    │
│   ├── Native notifications (new orders, appointments)           │
│   ├── Global keyboard shortcuts                                 │
│   ├── Offline data sync                                         │
│   ├── Auto-updater                                              │
│   └── File system access (exports)                              │
│                                                                  │
│              │ HTTPS                                            │
│              ▼                                                   │
│   ┌─────────────────────────────────────────────────────┐       │
│   │            needthisdone.com API                      │       │
│   │         (same backend, no changes)                   │       │
│   └─────────────────────────────────────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Desktop App Features

### Feature 1: System Tray

```
┌────────────────────────────────────────────────────┐
│                    SYSTEM TRAY                      │
├────────────────────────────────────────────────────┤
│                                                     │
│   [NTD Icon]                                        │
│       │                                             │
│       ├── 3 new orders                             │
│       ├── 1 appointment in 30 min                  │
│       │                                             │
│       ├── Open Dashboard                           │
│       ├── Quick Actions ►                          │
│       │       ├── View Orders                      │
│       │       ├── View Appointments                │
│       │       ├── Open Page Builder                │
│       │       └── View Users                       │
│       ├── ─────────────                            │
│       ├── Settings                                 │
│       └── Quit                                     │
│                                                     │
└────────────────────────────────────────────────────┘
```

### Feature 2: Native Notifications

Triggered by polling these existing API endpoints:
- `/api/admin/orders` - New order detection
- `/api/admin/appointments` - Upcoming appointment reminders
- `/api/projects` - Project status changes

```
┌────────────────────────────────────────────────────┐
│   NeedThisDone                              ✕      │
├────────────────────────────────────────────────────┤
│                                                     │
│   New Order Received                               │
│                                                     │
│   John Smith just placed an order for $45.00       │
│                                                     │
│   [View Order]                    [Dismiss]        │
│                                                     │
└────────────────────────────────────────────────────┘
```

### Feature 3: Global Keyboard Shortcuts

```
SHORTCUT                    ACTION
─────────────────────────────────────────────────────────────
Cmd/Ctrl + Shift + N       Open NeedThisDone (from anywhere)
Cmd/Ctrl + Shift + O       Jump to Orders
Cmd/Ctrl + Shift + A       Jump to Appointments
Cmd/Ctrl + Shift + P       Open Page Builder
Cmd/Ctrl + Shift + U       Jump to Users
```

### Feature 4: Offline Mode

Cache frequently accessed data locally using SQLite:
- Recent orders list
- Today's appointments
- Product catalog
- User list

Queue changes when offline, sync when back online.

---

## Electron Project Structure

```
needthisdone-desktop/
├── package.json
├── electron-builder.yml
├── src/
│   ├── main/
│   │   ├── index.ts              # Main process entry
│   │   ├── tray.ts               # System tray
│   │   ├── notifications.ts      # Native notifications
│   │   ├── shortcuts.ts          # Global shortcuts
│   │   ├── offline.ts            # Offline storage
│   │   ├── updater.ts            # Auto-updates
│   │   └── preload.ts            # Preload script (IPC bridge)
│   │
│   └── renderer/
│       └── index.html            # Just loads needthisdone.com
│
├── assets/
│   ├── icon.icns                 # macOS icon
│   ├── icon.ico                  # Windows icon
│   ├── icon.png                  # Linux icon
│   ├── tray-icon.png
│   └── tray-icon@2x.png
│
└── dist/                         # Built applications
    ├── NeedThisDone-1.0.0.dmg    # macOS
    ├── NeedThisDone-1.0.0.exe    # Windows
    └── NeedThisDone-1.0.0.AppImage # Linux
```

---

## Simplest Approach: Load Web App in Electron

Just load the deployed web app with native features layered on top:

```typescript
// src/main/index.ts

import { app, BrowserWindow } from 'electron'
import { createTray } from './tray'
import { registerShortcuts } from './shortcuts'
import { startNotificationPolling } from './notifications'

let mainWindow: BrowserWindow

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Load the deployed web app
  mainWindow.loadURL('https://needthisdone.com/admin')

  // Add native features on top
  createTray(mainWindow)
  registerShortcuts(mainWindow)
  startNotificationPolling(mainWindow)
})
```

---

# PART 3: IMPLEMENTATION PHASES

## Phase 1: Go CLI Foundation

**Focus:** Build the CLI tool with immediately useful commands.

**Tasks:**
- [ ] Set up Go development environment
- [ ] Create `ntd` CLI structure with Cobra
- [ ] Implement `ntd health` - check all services
- [ ] Implement `ntd db stats` - show Supabase table stats
- [ ] Implement `ntd cache stats` - show Upstash metrics
- [ ] Test on local machine

**Deliverables:**
- Working CLI tool with 3 useful commands
- Familiarity with Go project patterns

---

## Phase 2: Go Job Runner

**Focus:** Move background processing out of Next.js API routes.

**Tasks:**
- [ ] Create job-runner service structure
- [ ] Implement Redis queue consumer using Upstash
- [ ] Add email job handler (welcome, order confirmation)
- [ ] Add webhook handler (Stripe events)
- [ ] Docker setup for Railway deployment
- [ ] Update Next.js routes to push to queue

**Deliverables:**
- Background job processor handling emails and webhooks
- Reduced load on Next.js serverless functions

---

## Phase 3: Electron Foundation

**Focus:** Get a working desktop app that wraps the admin.

**Tasks:**
- [ ] Set up Electron project with electron-vite
- [ ] Load needthisdone.com/admin in Electron window
- [ ] Add system tray with basic menu
- [ ] Implement "minimize to tray" behavior
- [ ] Handle authentication flow in Electron context
- [ ] Build for macOS (primary dev machine)

**Deliverables:**
- Desktop app that wraps admin dashboard
- System tray presence

---

## Phase 4: Electron Native Features

**Focus:** Add the features that make desktop worthwhile.

**Tasks:**
- [ ] Native notifications for new orders (poll `/api/admin/orders`)
- [ ] Native notifications for upcoming appointments
- [ ] Global keyboard shortcuts
- [ ] Offline indicator in UI
- [ ] Set up auto-updater with GitHub Releases
- [ ] Build for Windows + Linux

**Deliverables:**
- Full-featured desktop app
- Cross-platform builds

---

## Phase 5: Go AI Worker

**Focus:** Handle chatbot load asynchronously.

**Tasks:**
- [ ] Create ai-worker service
- [ ] Implement chat queue consumer
- [ ] Add rate limiting and retry logic
- [ ] Update `/api/chat` to async pattern
- [ ] Update ChatbotWidget to poll for responses
- [ ] Load testing under concurrent requests

**Deliverables:**
- Chatbot handles high load gracefully
- Main app performance improved

---

# PART 4: ENVIRONMENT VARIABLES

## Go Services

```env
# .env.go-services

# Shared (from existing .env.local)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

# AI Worker
OPENAI_API_KEY=...

# Job Runner
RESEND_API_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

## Electron

```env
# .env.electron

API_BASE_URL=https://needthisdone.com
SENTRY_DSN=... (optional, for error tracking)
```

---

# PART 5: DECISION LOG

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Go HTTP framework | Standard library `net/http` | No external dependencies, sufficient for simple services |
| Go CLI framework | Cobra | Industry standard, good docs |
| Go deployment | Railway (Docker) | Already running Medusa there, consistent infrastructure |
| Electron build tool | electron-vite | Modern, fast, good TypeScript support |
| Offline storage | SQLite (better-sqlite3) | Simple, no server needed, good enough for cache |
| Update distribution | GitHub Releases + electron-updater | Free, integrates well |
| Component sharing | Load web app in Electron | Fastest path, no code duplication, always up-to-date |

---

# PART 6: RESOURCES

## Go

- [A Tour of Go](https://go.dev/tour/) - Interactive basics
- [Go by Example](https://gobyexample.com/) - Pattern reference
- [Effective Go](https://go.dev/doc/effective_go) - Idiomatic patterns
- [Learn Go with Tests](https://quii.gitbook.io/learn-go-with-tests/) - TDD approach

## Electron

- [Electron Docs](https://www.electronjs.org/docs/latest/)
- [electron-vite](https://electron-vite.org/) - Build tooling
- [electron-builder](https://www.electron.build/) - Packaging
- [Electron Fiddle](https://www.electronjs.org/fiddle) - Playground

---

*Tailored for needthisdone.com - Last updated: 2025-12-29*
