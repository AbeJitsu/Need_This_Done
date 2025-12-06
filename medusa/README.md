# Medusa Backend - Need This Done

Headless ecommerce backend for the Need This Done platform. Handles product catalog, shopping carts, orders, and checkout flows.

## Architecture

- **Database**: PostgreSQL (separate from Supabase)
- **Cache**: Redis (shared with main app)
- **Port**: 9000 (internal to Docker network)
- **Admin**: Accessible at `/admin` when running

## Configuration

Medusa reads configuration from `medusa-config.js` and environment variables from the root `.env.local`.

**Environment variables** (set in root `.env.local`):
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing key
- `NODE_ENV` - development or production

## Running Locally

### Docker (Recommended)

```bash
# From project root
docker-compose up medusa
```

Medusa will be available at `http://localhost:9000`
Admin will be at `http://localhost:9000/admin`

### Development

```bash
cd medusa
npm install
npm run dev
```

## Project Structure

```
medusa/
├── src/
│   ├── admin/          # Admin dashboard customizations
│   ├── api/            # Custom API endpoints
│   ├── models/         # Database models
│   ├── migrations/     # Database migrations
│   └── services/       # Business logic services
├── medusa-config.js    # Medusa configuration
├── package.json        # Dependencies
└── Dockerfile          # Docker build configuration
```

## Services (3 Tier Pricing Model)

Products are managed through Medusa's admin panel:
- Quick Task ($50)
- Standard Task ($150)
- Premium Service ($500)

These are stored in Medusa's PostgreSQL database, completely separate from app/user data in Supabase.

## API Endpoints

All Medusa API endpoints are proxied through Next.js API routes in the main app.

**Key endpoints**:
- `GET /api/pages/:slug` → `medusa:9000/store/products/:id`
- `POST /api/cart` → `medusa:9000/store/carts`
- `POST /api/checkout` → `medusa:9000/store/orders`
- `GET /api/orders` → `medusa:9000/store/orders` (with auth)

## Next Steps

1. Configure actual products in Medusa admin
2. Implement seed data for 3 pricing tiers
3. Connect Stripe payment processor
4. Build storefront in `/shop` route
5. Create admin integration at `/admin/shop`

## Documentation

- [Medusa Official Docs](https://docs.medusajs.com/)
- [Setup Guide](../app/guides/medusa-setup.md) - Implementation details
- [Puck Setup](../app/guides/puck-setup.md) - Related CMS integration
