import { NextResponse } from 'next/server';
import { withTimeout, TIMEOUT_LIMITS } from '@/lib/api-timeout';

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

// Collection handles - centralized for maintainability
const COLLECTION_HANDLES = {
  packages: 'website-packages',
  addons: 'website-addons',
  services: 'automation-services',
} as const;

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

async function fetchMedusa<T>(path: string, description: string): Promise<T> {
  const url = `${MEDUSA_URL}${path}`;

  const fetchPromise = fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(PUBLISHABLE_KEY && { 'x-publishable-api-key': PUBLISHABLE_KEY }),
    },
    next: { revalidate: 60 },
  }).then(async (response) => {
    if (!response.ok) {
      const error = await response.text().catch(() => 'Unknown error');
      throw new Error(`Medusa API error: ${response.status} - ${error}`);
    }
    return response.json() as Promise<T>;
  });

  // Wrap in timeout to prevent hanging requests
  return withTimeout(fetchPromise, TIMEOUT_LIMITS.EXTERNAL_API, description);
}

async function getRegionId(): Promise<string | null> {
  try {
    const data = await fetchMedusa<{ regions: Array<{ id: string }> }>(
      '/store/regions',
      'Fetch Medusa regions'
    );
    return data.regions?.[0]?.id || null;
  } catch (error) {
    console.error('[Pricing API] Failed to fetch regions:', error);
    return null;
  }
}

async function getCollections(): Promise<MedusaCollection[]> {
  try {
    const data = await fetchMedusa<{ collections: MedusaCollection[] }>(
      '/store/collections',
      'Fetch Medusa collections'
    );
    return data.collections || [];
  } catch (error) {
    console.error('[Pricing API] Failed to fetch collections:', error);
    return [];
  }
}

async function getProductsByCollection(collectionId: string, regionId: string): Promise<MedusaProduct[]> {
  try {
    // Medusa v2 Store API - use +metadata to include metadata in response
    const data = await fetchMedusa<{ products: MedusaProduct[] }>(
      `/store/products?collection_id[]=${collectionId}&region_id=${regionId}&fields=+metadata`,
      `Fetch products for collection ${collectionId}`
    );
    return data.products || [];
  } catch (error) {
    console.error(`[Pricing API] Failed to fetch products for collection ${collectionId}:`, error);
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

    // Fetch products by collection (using centralized constants)
    const packagesCollectionId = collectionHandleToId.get(COLLECTION_HANDLES.packages);
    const addonsCollectionId = collectionHandleToId.get(COLLECTION_HANDLES.addons);
    const servicesCollectionId = collectionHandleToId.get(COLLECTION_HANDLES.services);

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
