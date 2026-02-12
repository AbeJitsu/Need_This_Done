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

// Canonical product handles — filters out old/duplicate products
const CANONICAL_HANDLES = {
  packages: ['starter-site', 'growth-site', 'pro-site'],
  addons: [
    'additional-page', 'blog-setup', 'cms-integration', 'calendar-booking',
    'contact-form-files', 'payment-integration', 'customer-accounts', 'ai-chatbot', 'online-store',
  ],
  services: ['automation-setup', 'managed-ai'],
} as const;

// Handle aliases — maps old product handles to their canonical names
// so products created before a rename still match
const HANDLE_ALIASES: Record<string, string> = {
  'launch-site': 'starter-site',
};

// Fallback product data — used when Medusa is missing products
// (e.g., seed script hasn't been re-run after adding new tiers)
// These mirror the seed script definitions so the pricing page always shows all tiers
const FALLBACK_PACKAGES: PricingProduct[] = [
  {
    id: 'fallback-starter',
    title: 'Starter Site',
    description: 'Get online with a professional website that looks great on any device. Perfect for new businesses and personal brands.',
    handle: 'starter-site',
    price: 50000,
    variantId: '',
    type: 'package',
    depositPercent: 50,
    features: [
      '3\u20135 custom pages',
      'Custom design, mobile-friendly',
      'Contact form (sends you an email)',
      'Basic search engine optimization',
      '30 days support',
    ],
    billingPeriod: null,
    popular: false,
  },
  {
    id: 'fallback-growth',
    title: 'Growth Site',
    description: 'Grow your business with a site that saves form submissions, stores customer data, and lets people book appointments.',
    handle: 'growth-site',
    price: 150000,
    variantId: '',
    type: 'package',
    depositPercent: 50,
    features: [
      '5\u20138 custom pages',
      'Everything in Starter',
      'Database (form submissions saved, customer data stored)',
      'Appointment booking with email confirmations',
      'Better search engine visibility so customers find you',
      '60 days support',
    ],
    billingPeriod: null,
    popular: false,
  },
  {
    id: 'fallback-pro',
    title: 'Pro Site',
    description: 'Run your business from your website. Customer accounts, payments, email campaigns, analytics, and a full admin dashboard.',
    handle: 'pro-site',
    price: 500000,
    variantId: '',
    type: 'package',
    depositPercent: 50,
    features: [
      '10+ custom pages',
      'Everything in Growth',
      'Customer accounts (sign up, log in, save info, track orders)',
      'Accept payments (one-time, subscriptions, deposits)',
      'Blog with editor',
      'Edit your own site (visual content editor with version history)',
      'Customer reviews + admin moderation',
      'Loyalty program (points + referral credits)',
      'Email campaigns (templates, segments, analytics)',
      'Product analytics (views, conversions, trends)',
      'AI chatbot trained on your site content',
      'Automated emails (order confirmations, reminders, restock alerts)',
      'Appointment booking with Google Calendar sync + reminders',
      'Admin dashboard (orders, customers, reviews, analytics)',
      '90 days support',
    ],
    billingPeriod: null,
    popular: true,
  },
];

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

  // Normalize handle via aliases (e.g., old "launch-site" → "starter-site")
  const canonicalHandle = HANDLE_ALIASES[product.handle] || product.handle;

  return {
    id: product.id,
    title: product.title,
    description: product.description || '',
    handle: canonicalHandle,
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

    // Transform and filter to canonical products only, sorted by price
    const medusaPackages = packagesRaw
      .map(transformProduct)
      .filter((p): p is PricingProduct => p !== null)
      .filter((p) => (CANONICAL_HANDLES.packages as readonly string[]).includes(p.handle))
      .sort((a, b) => a.price - b.price);

    // Fill in any missing packages from fallback data
    // This handles the case where the seed script hasn't been re-run after adding new tiers
    const medusaHandles = new Set(medusaPackages.map((p) => p.handle));
    const packages = [...medusaPackages];
    for (const fallback of FALLBACK_PACKAGES) {
      if (!medusaHandles.has(fallback.handle)) {
        console.warn(`[Pricing API] Package "${fallback.handle}" missing from Medusa — using fallback data. Run the seed script to fix.`);
        packages.push(fallback);
      }
    }
    packages.sort((a, b) => a.price - b.price);

    const addons = addonsRaw
      .map(transformProduct)
      .filter((p): p is PricingProduct => p !== null)
      .filter((p) => (CANONICAL_HANDLES.addons as readonly string[]).includes(p.handle));

    const services = servicesRaw
      .map(transformProduct)
      .filter((p): p is PricingProduct => p !== null)
      .filter((p) => (CANONICAL_HANDLES.services as readonly string[]).includes(p.handle));

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
