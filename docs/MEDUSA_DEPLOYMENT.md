# Medusa v2 Railway Deployment

Documentation for deploying Medusa v2 on Railway.

## Working Configuration (Official Pattern)

Based on [official Medusa docs](https://docs.medusajs.com/learn/deployment/general):

1. **Build during Docker phase** → creates `.medusa/server/`
2. **Start from `.medusa/server`** directory
3. **Admin at** `.medusa/server/public/admin`

### Files Required

**`medusa-v2/nixpacks.toml`**
```toml
# Railway deployment config for Medusa v2
[phases.setup]
nixPkgs = ["nodejs_20", "npm-9_x"]

[phases.install]
cmds = ["npm install --legacy-peer-deps"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "cd .medusa/server && npm install && npx medusa db:migrate && npm run start"
```

**`medusa-v2/railway.json`**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd .medusa/server && npm install && npx medusa db:migrate && npm run start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 120,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `HOST` | Must be `0.0.0.0` for Railway (allows external connections) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `COOKIE_SECRET` | Cookie signing secret |
| `ADMIN_CORS` | CORS origins for admin panel |
| `STORE_CORS` | CORS origins for storefront |
| `DISABLE_MEDUSA_ADMIN` | Set to `true` to disable admin (optional) |

## Key Learnings

### Build Output Structure

When you run `medusa build`, it creates:
```
.medusa/
└── server/
    ├── public/
    │   └── admin/        # Admin dashboard (index.html here)
    ├── src/              # Compiled JavaScript
    ├── medusa-config.js  # Compiled config
    └── package.json      # Production dependencies
```

**Important**: The admin is at `.medusa/server/public/admin`, NOT `.medusa/admin`.

### The Nixpacks COPY Problem (Solved)

Previous issue: Nixpacks `COPY . /app` after build would overwrite `.medusa/`.

**Solution**: Build during Docker phase AND run from `.medusa/server`:
- Build creates `.medusa/server/` with all compiled assets
- Final COPY includes the `.medusa/` directory
- Start command runs FROM `.medusa/server/`

### What Doesn't Work

| Approach | Why It Fails |
|----------|--------------|
| Build at runtime | Adds 30s startup, healthcheck may timeout |
| Skip build entirely | TypeScript not compiled, config not found |
| Run `medusa start` from project root | Looks for `.medusa/admin/` which doesn't exist |
| Check `.medusa/admin/` for files | Wrong location - admin is in `.medusa/server/public/admin/` |

### What Works

| Approach | Description |
|----------|-------------|
| Build in Docker phase + start from `.medusa/server` | Official pattern, fast startup |
| Admin disabled | Works but no admin panel access |

## Comparison: v1 vs v2

| Aspect | Medusa v1 | Medusa v2 |
|--------|-----------|-----------|
| Config format | JavaScript (`.js`) | TypeScript (`.ts`) |
| Build step | Not required | Required - creates `.medusa/server/` |
| Admin location | Separate or disabled | `.medusa/server/public/admin/` |
| Start command | `medusa migrations run && medusa start` | `cd .medusa/server && npm install && npx medusa db:migrate && npm run start` |
| Production dir | Project root | `.medusa/server/` |

## Troubleshooting

### Error: "Could not find index.html in admin build directory"

**Cause**: Running `medusa start` from project root instead of `.medusa/server/`.

**Solution**: Start command must be:
```bash
cd .medusa/server && npm install && npx medusa db:migrate && npm run start
```

### Error: "Cannot find module '/app/medusa-config'"

**Cause**: TypeScript config not compiled - build step didn't run.

**Solution**: Ensure `npm run build` runs in the Docker build phase.

### Healthcheck Fails (Service Unavailable)

**Cause**: Server hasn't started within healthcheck timeout.

**Solutions**:
1. Increase `healthcheckTimeout` in railway.json (default: 120s)
2. Check deploy logs for startup errors
3. Ensure `HOST=0.0.0.0` is set

### HOST Configuration

Medusa defaults to `localhost` which doesn't accept external connections.

```bash
# Set via Railway CLI
railway variables --set "HOST=0.0.0.0"
```

## Startup Sequence (Production)

1. Docker build runs `npm run build` (~30s)
   - Compiles TypeScript
   - Generates types
   - Builds backend to `.medusa/server/`
   - Builds admin to `.medusa/server/public/admin/`
2. Container starts with:
   ```bash
   cd .medusa/server && npm install && npx medusa db:migrate && npm run start
   ```
3. Server listens on PORT (Railway provides this)
4. Admin accessible at `/app`
5. API at `/store/*` and `/admin/*`

## References

- [Medusa v2 Deployment Docs](https://docs.medusajs.com/learn/deployment/general)
- [Medusa Build Command](https://docs.medusajs.com/learn/build)
- [Railway Nixpacks](https://nixpacks.com/)
- [MedusaJS Railway Boilerplate](https://github.com/rpuls/medusajs-2.0-for-railway-boilerplate)
