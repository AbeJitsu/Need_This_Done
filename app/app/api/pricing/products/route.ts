import { NextResponse } from 'next/server';

// ============================================================================
// Pricing Products API
// ============================================================================
// What: Fetch pricing products from Medusa, grouped by category
// Why: Power the dynamic pricing page with Medusa-managed products
// How: Queries Medusa store API for products by collection
//
// GET /api/pricing/products
// Returns: { packages, addons, services }

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || process.env.MEDUSA_BACKEND_URL;
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

// ============================================================================
// Types
// ============================================================================

type ProductType = 'package' | 'addon' | 'service' | 'subscription';

interface PricingProduct {
  id: string;
  title: string;
  description: string;
  handle: string;
  price: number; // in cents
  variantId: string;
  type: ProductType;
  depositPercent: number;
  features: string[];
  billingPeriod: 'monthly' | null;
  popular: boolean;
  stripePriceId?: string;
}

interface MedusaProduct {
  id: string;
  title: string;
  description?: string;
  handle: string;
  variants?: Array<{
    id: string;
    calculated_price?: {
      calculated_amount: number;
    };
    prices?: Array<{
      amount: number;
      currency_code: string;
    }>;
  }>;
  metadata?: {
    type?: ProductType;
    deposit_percent?: number;
    features?: string[];
    billing_period?: 'monthly' | null;
    popular?: boolean;
    stripe_price_id?: string;
  };
  collection?: {
    handle: string;
  };
}

interface MedusaCollection {
  id: string;
  handle: string;
  title: string;
}

// ============================================================================
// Medusa API Helpers
// ============================================================================

async function fetchMedusa<T>(path: string): Promise<T> {
  const url = `${MEDUSA_URL}${path}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(PUBLISHABLE_KEY && { 'x-publishable-api-key': PUBLISHABLE_KEY }),
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const error = await response.text().catch(() => 'Unknown error');
    throw new Error(`Medusa API error: ${response.status} - ${error}`);
  }

  return response.json();
}

async function getRegionId(): Promise<string | null> {
  try {
    const data = await fetchMedusa<{ regions: Array<{ id: string }> }>('/store/regions');
    return data.regions?.[0]?.id || null;
  } catch {
    return null;
  }
}

async function getCollections(): Promise<MedusaCollection[]> {
  try {
    // Store API for collections
    const data = await fetchMedusa<{ collections: MedusaCollection[] }>('/store/collections');
    return data.collections || [];
  } catch {
    return [];
  }
}

async function getProductsByCollection(collectionId: string, regionId: string): Promise<MedusaProduct[]> {
  try {
    const data = await fetchMedusa<{ products: MedusaProduct[] }>(
      `/store/products?collection_id[]=${collectionId}&region_id=${regionId}`
    );
    return data.products || [];
  } catch {
    return [];
  }
}

// ============================================================================
// Transform Medusa Product to Pricing Product
// ============================================================================

function transformProduct(product: MedusaProduct): PricingProduct | null {
  const variant = product.variants?.[0];
  if (!variant) return null;

  // Get price from calculated_price (Medusa v2) or prices array (v1)
  const price = variant.calculated_price?.calculated_amount
    || variant.prices?.find((p) => p.currency_code === 'usd')?.amount
    || 0;

  const metadata = product.metadata || {};

  return {
    id: product.id,
    title: product.title,
    description: product.description || '',
    handle: product.handle,
    price,
    variantId: variant.id,
    type: metadata.type || 'addon',
    depositPercent: metadata.deposit_percent ?? 50,
    features: metadata.features || [],
    billingPeriod: metadata.billing_period || null,
    popular: metadata.popular || false,
    stripePriceId: metadata.stripe_price_id,
  };
}

// ============================================================================
// GET Handler
// ============================================================================

export async function GET() {
  try {
    if (!MEDUSA_URL) {
      return NextResponse.json(
        { error: 'Medusa URL not configured' },
        { status: 500 }
      );
    }

    // Get region for pricing
    const regionId = await getRegionId();
    if (!regionId) {
      return NextResponse.json(
        { error: 'No region configured in Medusa' },
        { status: 500 }
      );
    }

    // Get collections
    const collections = await getCollections();
    const collectionHandleToId = new Map<string, string>();
    for (const collection of collections) {
      collectionHandleToId.set(collection.handle, collection.id);
    }

    // Fetch products by collection
    const packagesCollectionId = collectionHandleToId.get('website-packages');
    const addonsCollectionId = collectionHandleToId.get('website-addons');
    const servicesCollectionId = collectionHandleToId.get('automation-services');

    const [packagesRaw, addonsRaw, servicesRaw] = await Promise.all([
      packagesCollectionId ? getProductsByCollection(packagesCollectionId, regionId) : [],
      addonsCollectionId ? getProductsByCollection(addonsCollectionId, regionId) : [],
      servicesCollectionId ? getProductsByCollection(servicesCollectionId, regionId) : [],
    ]);

    // Transform products
    const packages = packagesRaw
      .map(transformProduct)
      .filter((p): p is PricingProduct => p !== null);

    const addons = addonsRaw
      .map(transformProduct)
      .filter((p): p is PricingProduct => p !== null);

    const services = servicesRaw
      .map(transformProduct)
      .filter((p): p is PricingProduct => p !== null);

    return NextResponse.json({
      packages,
      addons,
      services,
    });
  } catch (error) {
    console.error('[Pricing Products API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing products' },
      { status: 500 }
    );
  }
}
