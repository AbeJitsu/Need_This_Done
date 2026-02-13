# Docker Setup: Local Database Development

## Architecture Overview

NeedThisDone uses Supabase, which runs as a 6-container Docker stack on your local machine. This provides a complete mirror of production infrastructure for development and testing.

### The Stack

```
┌──────────────────────────────────────────────────────────────┐
│                    DOCKER COMPOSE NETWORK                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐                                        │
│  │  Kong            │  (API Gateway + Load Balancer)         │
│  │  Port: 54321     │                                        │
│  │  Listens on all  │  Exposes PostgREST, Realtime, etc.   │
│  │  incoming requests                                        │
│  └────────┬─────────┘                                        │
│           │                                                  │
│      ┌────┴────┬──────────┬──────────┬──────────┐           │
│      │          │          │          │          │           │
│  ┌───▼──┐  ┌───▼──┐  ┌───▼──┐  ┌───▼──┐  ┌───▼──┐         │
│  │PostgREST│PostgREST│Realtime│Storage│imgproxy│         │
│  │REST API │Meta    │WebSocket│Upload │Images  │         │
│  │Port 3000│Port 3001│Port 54322   │    │        │         │
│  └─────────┘────┬───┘└────┬──┘└──────┘└────────┘          │
│                 │          │                                 │
│          ┌──────▼──────────▼──────┐                         │
│          │  PostgreSQL 17         │                         │
│          │  Database              │                         │
│          │  Port: 54322           │                         │
│          │  (Internal network)    │                         │
│          │                        │                         │
│          │  Volume: pgdata/       │ (Persistent data)       │
│          └────────────────────────┘                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### What Each Service Does

| Service | Purpose | Port (Internal) | Port (Host) |
|---------|---------|-----------------|-------------|
| **PostgreSQL** | Database engine (all data) | 5432 | 54322 |
| **Kong** | API gateway, routing, TLS | - | 54321 |
| **PostgREST** | Auto-generated REST API from schema | 3000 | (via Kong 54321) |
| **PostgREST (meta)** | Schema metadata API | 3001 | (via Kong 54321) |
| **Realtime** | WebSocket server for live subscriptions | 4000 | (via Kong 54321) |
| **Storage** | File upload management | 5000 | (via Kong 54321) |
| **imgproxy** | Image optimization + resizing | 8080 | (via Kong 54321) |

**Key insight:** Kong sits in front of all services, routing HTTP requests to the right backend based on the URL path. This simplifies networking and mimics production architecture.

## Why Docker for Local Development

### Problem: Production/Development Parity

Without Docker:
- Your laptop has different software versions than production
- "Works on my machine" but fails in CI/staging
- Debugging is harder (environment differences confuse issues)
- New team members spend hours on setup

With Docker:
- Local environment is identical to production
- Same container images, same versions, same configuration
- If it works locally, it works in production (usually)
- Team members get productive in minutes

### Problem: Database Persistence

Without Docker:
- You can't easily reset your database to a clean state
- Test data pollutes development
- Backup/restore is manual and error-prone

With Docker:
- `supabase db reset` gives you a clean database (1 command)
- Volumes ensure data persists between container restarts
- Migrations run automatically

## docker-compose.yml Breakdown

The Supabase docker-compose file orchestrates the entire stack. Here's what's happening:

### Services Section: Containers

```yaml
services:
  postgres:
    image: postgres:17
    container_name: supabase_db
    ports:
      - "54322:5432"  # Host:Container - listen on localhost:54322
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres  # Default (change in production)
    volumes:
      - pgdata:/var/lib/postgresql/data  # Persist data
    networks:
      - supabase  # Internal network for container communication
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
```

**What's happening:**
1. Pulls the official PostgreSQL 17 image
2. Exposes port 5432 (inside container) on port 54322 (your laptop)
3. Sets credentials (used by other services to connect)
4. Mounts `pgdata` volume (persists data to disk)
5. Joins `supabase` network (lets other containers talk to postgres)
6. Runs healthcheck every 10s (Kong waits for this before starting)

### Volumes Section: Persistent Storage

```yaml
volumes:
  pgdata:
    driver: local
```

**What's happening:**
- Creates a named volume called `pgdata`
- Stores PostgreSQL data files on your laptop's disk
- When containers stop, data remains
- When you restart, containers reconnect to same data

**Where is the data?**
```bash
docker volume ls                           # See all volumes
docker volume inspect supabase_pgdata      # See where data lives
# Typically: /var/lib/docker/volumes/supabase_pgdata/_data/
```

**Important:** If you delete the volume, you lose all data:
```bash
docker volume rm supabase_pgdata  # ← Dangerous! Irreversible
```

### Ports Section: Host Binding

```yaml
ports:
  - "54321:8000"  # Kong API gateway
  - "54322:5432"  # PostgreSQL
  - "54323:3000"  # Studio UI
  - "54324:9000"  # inbucket (email testing)
```

**What's happening:**
- Maps ports from container to your laptop
- Format: `host_port:container_port`
- Lets you connect from your application

**Why these ports?**
- 54321: Standard Supabase API port
- 54322: Standard PostgreSQL port + 1 (avoid conflicts)
- 54323: Studio UI (Supabase admin dashboard)
- 54324: Email test inbox

### Environment Section: Configuration

```yaml
environment:
  POSTGRES_DB: postgres
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres
```

**What's happening:**
- Passes configuration to containers
- Used by services to construct connection strings
- Affects how services authenticate with each other

**In production:** These are set via environment variables (not hardcoded).

### Health Checks: Service Readiness

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 10s
  timeout: 5s
  retries: 5
```

**What's happening:**
- Every 10 seconds, runs `pg_isready` command
- If PostgreSQL responds, container is "healthy"
- Kong waits for healthcheck to pass before starting
- If healthcheck fails 5 times, container is marked "unhealthy"

**Why it matters:**
- Kong needs PostgreSQL running (it can't serve requests without it)
- Without healthcheck, Kong starts before PostgreSQL is ready
- Applications get "connection refused" errors

### Dependencies: Startup Order

```yaml
depends_on:
  postgres:
    condition: service_healthy
```

**What's happening:**
- Kong won't start until postgres healthcheck passes
- Ensures services start in correct order
- Prevents "dependency not ready" errors

**Without this:** Containers start in arbitrary order, causing failures.

## Container Networking

The magic that makes containers talk to each other:

```yaml
networks:
  supabase:
    driver: bridge
```

### How Containers Communicate

```
┌─────────────────────────────────────┐
│     Docker Host (Your Laptop)       │
├─────────────────────────────────────┤
│                                     │
│  Virtual Network Bridge (supabase)  │
│  ┌──────────────────────────────┐   │
│  │ Internal IPs:                │   │
│  │  postgres:   172.20.0.2      │   │
│  │  kong:       172.20.0.3      │   │
│  │  postgrest:  172.20.0.4      │   │
│  │  realtime:   172.20.0.5      │   │
│  │  storage:    172.20.0.6      │   │
│  └──────────────────────────────┘   │
│           ▲          │               │
│           │          │               │
│    Host Network     External API     │
│  (localhost:54322) (localhost:54321) │
│           │          │               │
└─────────────────────────────────────┘
```

### Connection Patterns

**From inside a container (e.g., postgrest → postgres):**
```
postgrest → postgres:5432  (internal network, fast)
```

**From your laptop (e.g., app → Kong):**
```
your_app → localhost:54321 → Kong → internal:5432
```

**From PostgreSQL to PostgREST:**
```sql
-- PostgREST needs to call PostgreSQL functions
-- Uses internal network: postgres:5432
-- Never goes through Kong
```

## Data Persistence: How Your Data Survives Restarts

### The Scenario

```bash
# You start Supabase
supabase start

# You seed the database
npx tsx scripts/seed-products.ts

# You stop Supabase (or it crashes)
supabase stop
```

**Question:** Is your seed data still there?

**Answer:** Yes! Because of volumes.

### How Persistence Works

```
PostgreSQL Process
       ↓
Write to /var/lib/postgresql/data/
       ↓
Docker Volume (pgdata)
       ↓
Your laptop's disk (e.g., /var/lib/docker/volumes/supabase_pgdata/_data/)
       ↓
Data persists after restart
```

**When you run `supabase start` again:**
1. Docker creates a new PostgreSQL container
2. Container mounts the same pgdata volume
3. PostgreSQL reads existing data files
4. Everything is restored

### What Gets Persisted

- **Yes:** All database tables, indexes, data, sequences
- **No:** Container logs, temporary files

### What Doesn't Persist

```bash
# This deletes the volume (irreversible!)
docker volume rm supabase_pgdata

# Now your data is gone forever
supabase start  # New empty database
```

### Backup Strategy for Local Dev

```bash
# Dump your database to a file
pg_dump postgresql://postgres:postgres@localhost:54322/postgres > backup.sql

# Later, restore it
psql postgresql://postgres:postgres@localhost:54322/postgres < backup.sql
```

## Troubleshooting

### Container Won't Start

**Symptom:** `supabase start` fails or container crashes

**Diagnosis:**
```bash
# Check logs
supabase logs

# See specific error (e.g., healthcheck failing)
docker-compose logs postgres

# Check if postgres is listening
lsof -i :54322  # Is port 54322 in use?
```

**Common causes:**

1. **Port already in use**
```bash
lsof -i :54322  # Find what's using the port
kill -9 <PID>   # Kill the process
supabase start   # Try again
```

2. **Docker daemon not running**
```bash
# macOS: Docker Desktop needs to be open
open /Applications/Docker.app

# Verify Docker is running
docker ps
```

3. **Corrupted volume**
```bash
# As last resort, clean everything
supabase stop
docker volume rm supabase_pgdata
docker system prune
supabase start
```

### Port Conflicts (Already in Use)

**Symptom:** Error like `Address already in use`

```bash
# Find what's using port 54321
lsof -i :54321

# If it's an old Docker container
docker container ls -a
docker rm <container_id>

# If it's your application
# Make sure app isn't running on that port
```

**Prevention:** Don't use port 54321-54324 for other services.

### Migration Failures

**Symptom:** `supabase db reset` fails with SQL syntax error

**Diagnosis:**
```bash
supabase logs  # See the SQL error

# Check migration file for syntax errors
cat supabase/migrations/055_*.sql
```

**Fix:**
```bash
# Edit migration file to fix syntax
# Then reset
supabase db reset
```

**Common SQL errors:**
- Missing semicolon at end of statement
- Unmatched parentheses
- Invalid PostgreSQL syntax
- Typos in table/column names

### Data Not Persisting

**Symptom:** You seed data, restart, data is gone

**Diagnosis:**
```bash
# Check if volume exists
docker volume ls | grep supabase_pgdata

# Check if volume has data
docker volume inspect supabase_pgdata
```

**Solutions:**

1. **Volume wasn't mounted**
```bash
# Check docker-compose.yml has volumes: section
volumes:
  - pgdata:/var/lib/postgresql/data
```

2. **Wrong volume name**
```bash
# Ensure container uses correct volume
# Check: docker-compose logs postgres
```

3. **Manual deletion**
```bash
# If you deleted the volume by mistake
# It's gone - start fresh
supabase start  # Creates new empty database
```

### Can't Connect from Application

**Symptom:** App can't reach database on localhost:54322

**Diagnosis:**
```bash
# Test connection manually
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT 1;"

# Check port is exposed
docker-compose ps
# Should show: 0.0.0.0:54322->5432/tcp

# Check application connection string
echo $NEXT_PUBLIC_SUPABASE_URL
# Should be: http://127.0.0.1:54321
```

**Solutions:**

1. **Wrong connection string**
```bash
# Your app needs:
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_key>

# Get keys from:
supabase status
```

2. **Firewall blocking localhost**
```bash
# Rare on macOS/Windows, but on some Linux distros
# Test: curl http://127.0.0.1:54321/health
```

3. **Application not running**
```bash
cd app && npm run dev
# Then test: curl http://localhost:3000
```

4. **DNS issue (use 127.0.0.1 not localhost)**
```bash
# Some systems have localhost resolution issues
# Always use 127.0.0.1 for Docker connections
# NOT: postgresql://postgres@localhost:54322
# YES: postgresql://postgres@127.0.0.1:54322
```

### Performance: Slow Queries

**Symptom:** Queries are slower in Docker than production

**Causes:**
1. **Docker resource limits** - Containers have CPU/memory quotas
2. **Volume I/O** - Disk performance varies by volume type
3. **Unindexed queries** - Missing indexes are more noticeable locally
4. **Missing connection pooling** - Development doesn't use Pgbouncer

**Solutions:**
1. **Increase Docker resources**
   - Docker Desktop → Preferences → Resources → Increase CPUs/Memory

2. **Add indexes for slow queries**
   ```bash
   EXPLAIN ANALYZE <slow_query>;
   # Look for sequential scans, add indexes
   ```

3. **Use prepared statements** - Reduces parsing overhead

4. **Profile with docker stats**
   ```bash
   docker stats
   # See CPU/memory usage of each container
   ```

## Common Workflows

### Starting Fresh Database

```bash
# Reset to clean state (all migrations + seed data)
supabase db reset

# Or manually
supabase stop
docker volume rm supabase_pgdata
supabase start
```

### Running a Single Migration

```bash
# Create new migration
supabase migration new add_new_feature

# Edit the file
# supabase/migrations/NNN_add_new_feature.sql

# Apply it
supabase migration up
```

### Exporting Data for Backup

```bash
# Full database dump
pg_dump postgresql://postgres:postgres@localhost:54322/postgres > backup.sql

# Just schema (no data)
pg_dump --schema-only postgresql://postgres:postgres@localhost:54322/postgres > schema.sql

# Just data (no schema)
pg_dump --data-only postgresql://postgres:postgres@localhost:54322/postgres > data.sql
```

### Connecting with Tools

**DBeaver (GUI Database Manager):**
1. New Database Connection → PostgreSQL
2. Host: 127.0.0.1
3. Port: 54322
4. Database: postgres
5. Username: postgres
6. Password: postgres

**psql (Command Line):**
```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

**pgAdmin (Web UI):**
```bash
# pgAdmin runs in separate container, not in supabase_pgdata
docker run -p 5050:80 dpage/pgadmin4
# Visit: http://localhost:5050
# Login with: pgadmin4@pgadmin.org / admin
```

## Development Workflow

### Typical Session

```bash
# 1. Start database (if not running)
supabase start

# 2. Reset to clean state
supabase db reset

# 3. Start application
cd app && npm run dev

# 4. Open app: http://localhost:3000

# 5. Make code changes, test locally

# 6. When done
Ctrl+C                     # Stop app
supabase stop              # Stop database
# (or leave running - data persists)
```

### TDD Workflow

```bash
# 1. Write database migration
# supabase/migrations/NNN_new_feature.sql

# 2. Run migration
supabase migration up

# 3. Run tests
npm test

# 4. If tests fail, iterate
# - Edit migration
# - Reset database: supabase db reset
# - Re-run tests

# 5. When tests pass, commit
git add .
git commit -m "Feature: add new_feature"
```

## Summary

Docker provides a complete, reproducible local environment that mirrors production. The key concepts:

- **Containers:** Isolated processes (postgres, kong, postgrest, etc.)
- **Volumes:** Persistent storage (your data survives restarts)
- **Networks:** Container-to-container communication (supabase bridge)
- **Ports:** Host machine access (localhost:54321 → Kong)
- **Health checks:** Ensures services start in correct order

With these fundamentals, you can:
- Start a clean database in seconds
- Run the same environment as production
- Debug issues with production parity
- Onboard new team members instantly

The Supabase CLI (`supabase start`, `supabase db reset`) handles all the Docker complexity for you. When something breaks, understanding the architecture above makes troubleshooting straightforward.
