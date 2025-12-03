# Medusa Setup Guide

This guide covers integrating Medusa headless commerce with your Next.js storefront.

## Overview

Medusa handles commerce functionality (products, carts, orders, inventory) so we can focus on the frontend experience. The API layer is decoupled from presentation.

## Environment Variables

Add to `.env.local`:

```bash
# Medusa publishable API key (required)
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_123...

# Stripe publishable key (for payments)
NEXT_PUBLIC_STRIPE_KEY=pk_live_...
```

Get your publishable key from the Medusa admin dashboard.

## Connecting to Medusa Backend

### Install SDK

```bash
npm install @medusajs/medusa-js
```

### Create API Client

```typescript
// lib/medusa.ts
import Medusa from '@medusajs/medusa-js';

const medusa = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000',
  maxRetries: 3,
});

export default medusa;
```

## API Contract Basics

### Products

```typescript
// Fetch all products
const { products } = await medusa.products.list();

// Fetch single product
const { product } = await medusa.products.retrieve(productId);
```

### Cart

```typescript
// Create cart
const { cart } = await medusa.carts.create();

// Add item to cart
await medusa.carts.lineItems.create(cartId, {
  variant_id: variantId,
  quantity: 1,
});

// Get cart
const { cart } = await medusa.carts.retrieve(cartId);
```

### Orders

```typescript
// Complete cart (creates order)
const { order } = await medusa.carts.complete(cartId);

// Get order
const { order } = await medusa.orders.retrieve(orderId);
```

## Stripe Integration

Medusa handles Stripe payments. Add the Stripe key to enable checkout:

```typescript
// Stripe is configured server-side in Medusa
// Frontend just needs the publishable key for Stripe Elements

import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);
```

## Redis Caching Strategy

Cache Medusa responses in Redis to reduce API load:

```typescript
// lib/cache.ts
import { redis } from './redis';

export async function getCachedProducts() {
  const cached = await redis.get('products');
  if (cached) return JSON.parse(cached);

  const { products } = await medusa.products.list();
  await redis.set('products', JSON.stringify(products), 'EX', 300); // 5 min

  return products;
}
```

Cache invalidation rules:
- Products: 5 minutes or on admin update webhook
- Cart: No cache (real-time)
- User sessions: 30 minutes

## Next.js API Routes

Create API routes for server-side Medusa operations:

```typescript
// app/api/products/route.ts
import { NextResponse } from 'next/server';
import medusa from '@/lib/medusa';

export async function GET() {
  const { products } = await medusa.products.list();
  return NextResponse.json({ products });
}
```

## Context7 Reference

For latest Medusa docs via Claude Code:

```
Library ID: /llmstxt/medusajs_llms-full_txt
```

---

*See also: [Roadmap.md](../../Roadmap.md) for architecture overview*
