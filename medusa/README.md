# Medusa Backend - Need This Done

Custom Express backend that mimics Medusa's REST API for ecommerce functionality. Handles product catalog, shopping carts, and checkout flows.

> **Note**: This is a **bootstrap implementation**, not a full Medusa installation. See [TODO.md](../TODO.md) for the full Medusa migration plan.

---

## Current State (Bootstrap)

This is a lightweight Express server that implements Medusa-compatible endpoints:

| Feature | Status | Notes |
|---------|--------|-------|
| Products | Hardcoded | 3 products defined in `src/index.ts` |
| Carts | In-memory | Lost on container restart |
| Orders | Placeholder | Returns temp ID, linked in Supabase |
| Admin | Basic | Health check only |

**What this means:**
- Products can't be added/edited without code changes
- Cart data doesn't persist across restarts
- Perfect for development, needs upgrade for production

---

## Architecture

- **Server**: Express.js with CORS
- **Database**: PostgreSQL (available but products not stored there yet)
- **Cache**: Redis (shared with main app)
- **Port**: 9000 (internal to Docker network)

---

## Products (Hardcoded)

Three pricing tiers defined in `src/index.ts`:

| Product | Price | Handle | Variant ID |
|---------|-------|--------|------------|
| Quick Task | $50 | `quick-task` | `variant_prod_1_default` |
| Standard Project | $150 | `standard-task` | `variant_prod_2_default` |
| Premium Solution | $500 | `premium-solution` | `variant_prod_3_default` |

---

## API Endpoints

### Products
```bash
GET /store/products          # List all products
GET /store/products/:id      # Single product by ID
```

### Carts
```bash
POST /store/carts                              # Create empty cart
GET /store/carts/:id                           # Get cart
POST /store/carts/:id/line-items               # Add item
POST /store/carts/:id/line-items/:line_id      # Update quantity
DELETE /store/carts/:id/line-items/:line_id    # Remove item
```

### Orders
```bash
POST /store/orders           # Create order (placeholder)
```

### Health
```bash
GET /health                  # Service health check
GET /admin                   # Admin status (Docker health check)
```

---

## Project Structure

```
medusa/
├── src/
│   └── index.ts        # Express server with all endpoints
├── medusa-config.js    # Configuration (env vars)
├── package.json        # Dependencies
└── Dockerfile          # Docker build
```

---

## Running Locally

### Docker (Recommended)
```bash
# From project root
docker-compose up medusa
```

Available at `http://localhost:9000`

### Development
```bash
cd medusa
npm install
npm run dev
```

---

## Configuration

Environment variables (set in root `.env.local`):
- `MEDUSA_DB_PASSWORD` - PostgreSQL password
- `MEDUSA_JWT_SECRET` - JWT signing key
- `MEDUSA_ADMIN_JWT_SECRET` - Admin JWT key
- `REDIS_URL` - Redis connection string

---

## Integration with Next.js

The Next.js app communicates with this backend through:

1. **medusa-client.ts** (`app/lib/medusa-client.ts`) - Fetch wrapper with retry logic
2. **API Routes** (`app/app/api/`) - Proxy endpoints for cart, products, checkout
3. **CartContext** (`app/context/CartContext.tsx`) - Frontend state management

---

## Documentation

- [Main README](../README.md) - Project overview
- [TODO.md](../TODO.md) - Full Medusa migration plan
- [Medusa Official Docs](https://docs.medusajs.com/) - For future full implementation
