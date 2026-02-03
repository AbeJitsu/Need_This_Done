/**
 * Seed Products Script
 *
 * Creates the website build products, add-ons, and services in Medusa.
 * Run with: npx tsx scripts/seed-products.ts
 *
 * Requires admin credentials in .env.local:
 * - MEDUSA_BACKEND_URL
 * - MEDUSA_ADMIN_EMAIL
 * - MEDUSA_ADMIN_PASSWORD
 *
 * Optional for subscription products:
 * - STRIPE_MANAGED_AI_PRICE_ID (Stripe price ID for monthly subscription)
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local from app directory
config({ path: resolve(process.cwd(), '.env.local') });

const MEDUSA_URL = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_URL;

if (!MEDUSA_URL) {
  console.error('❌ MEDUSA_BACKEND_URL not set in .env.local');
  process.exit(1);
}

// ============================================================================
// Early Validation - Check Required Config Before Seeding
// ============================================================================

function validateSubscriptionConfig(): void {
  const subscriptionProducts = [
    { handle: 'managed-ai', envVar: 'STRIPE_MANAGED_AI_PRICE_ID' },
    // Add more subscription products here as needed
  ];

  const missingConfig: string[] = [];

  for (const product of subscriptionProducts) {
    const priceId = process.env[product.envVar];
    if (!priceId) {
      missingConfig.push(`  - ${product.envVar} (required for "${product.handle}")`);
    }
  }

  if (missingConfig.length > 0) {
    console.error('\n❌ Missing Stripe price IDs for subscription products:\n');
    console.error(missingConfig.join('\n'));
    console.error('\n   To fix:');
    console.error('   1. Create the recurring price in Stripe Dashboard');
    console.error('   2. Add the price ID to .env.local');
    console.error('   3. Run this script again\n');
    console.error('   Or remove subscription products from PRODUCTS array if not needed.\n');
    process.exit(1);
  }
}

// ============================================================================
// Product Definitions
// ============================================================================

type ProductType = 'package' | 'addon' | 'service' | 'subscription';

interface ProductDefinition {
  title: string;
  description: string;
  handle: string;
  price: number; // in cents
  type: ProductType;
  collection: string; // collection handle
  metadata: {
    type: ProductType;
    deposit_percent: number;
    features: string[];
    billing_period?: 'monthly' | null;
    popular?: boolean;
    stripe_price_id?: string; // For subscription products
  };
}

const PRODUCTS: ProductDefinition[] = [
  // ========================================
  // Website Packages
  // ========================================
  {
    title: 'Launch Site',
    description: 'Perfect for getting online fast. 3-5 page Next.js website deployed on Vercel.',
    handle: 'launch-site',
    price: 50000, // $500
    type: 'package',
    collection: 'website-packages',
    metadata: {
      type: 'package',
      deposit_percent: 50,
      features: [
        '3-5 pages',
        'Custom design',
        'Mobile responsive',
        'Contact form',
        'Basic SEO',
        '30 days support',
      ],
    },
  },
  {
    title: 'Growth Site',
    description: 'For businesses ready to scale. 5-8 page website with blog, CMS, and enhanced SEO.',
    handle: 'growth-site',
    price: 120000, // $1,200
    type: 'package',
    collection: 'website-packages',
    metadata: {
      type: 'package',
      deposit_percent: 50,
      popular: true,
      features: [
        '5-8 pages',
        'Everything in Launch',
        'Blog with CMS',
        'Content editing',
        'Enhanced SEO',
        '60 days support',
      ],
    },
  },

  // ========================================
  // Website Add-ons
  // ========================================
  {
    title: 'Extra Page',
    description: 'Add another page to your site. Design, development, and deployment included.',
    handle: 'additional-page',
    price: 10000, // $100
    type: 'addon',
    collection: 'website-addons',
    metadata: {
      type: 'addon',
      deposit_percent: 50,
      features: ['Custom page design', 'Mobile responsive', 'SEO optimized'],
    },
  },
  {
    title: 'Blog',
    description: 'Add a blog to your site with MDX support. Full SEO optimization included.',
    handle: 'blog-setup',
    price: 30000, // $300
    type: 'addon',
    collection: 'website-addons',
    metadata: {
      type: 'addon',
      deposit_percent: 50,
      features: ['MDX blog support', 'Auto formatting', 'SEO optimization', 'RSS feed'],
    },
  },
  {
    title: 'File Uploads',
    description: 'Enhanced contact form with file attachment support. Up to 3 files, 5MB each.',
    handle: 'contact-form-files',
    price: 15000, // $150
    type: 'addon',
    collection: 'website-addons',
    metadata: {
      type: 'addon',
      deposit_percent: 50,
      features: ['File attachments', 'Up to 3 files', '5MB per file', 'Email notifications'],
    },
  },
  {
    title: 'Booking',
    description: 'Integrate Calendly, Cal.com, or similar booking widget.',
    handle: 'calendar-booking',
    price: 20000, // $200
    type: 'addon',
    collection: 'website-addons',
    metadata: {
      type: 'addon',
      deposit_percent: 50,
      features: ['Calendar integration', 'Booking widget', 'Email confirmations'],
    },
  },
  {
    title: 'Payments',
    description: 'Accept payments via Stripe. One-time payments, subscriptions, or donations.',
    handle: 'payment-integration',
    price: 40000, // $400
    type: 'addon',
    collection: 'website-addons',
    metadata: {
      type: 'addon',
      deposit_percent: 50,
      features: ['Stripe integration', 'One-time payments', 'Subscriptions', 'Donations'],
    },
  },
  {
    title: 'CMS',
    description: 'Add a content management system so you can update your site without code.',
    handle: 'cms-integration',
    price: 50000, // $500
    type: 'addon',
    collection: 'website-addons',
    metadata: {
      type: 'addon',
      deposit_percent: 50,
      features: ['Visual editor', 'Edit text & images', 'No code required', 'Version history'],
    },
  },

  // ========================================
  // Automation Services
  // ========================================
  {
    title: 'Automation Setup',
    description: 'Connect your tools and eliminate repetitive work. We build workflows that save you hours every week.',
    handle: 'automation-setup',
    price: 15000, // $150 per workflow
    type: 'service',
    collection: 'automation-services',
    metadata: {
      type: 'service',
      deposit_percent: 100, // Pay upfront for services
      features: [
        'Tool integration',
        'Workflow automation',
        'Time savings',
        'Custom triggers',
      ],
    },
  },
  {
    title: 'Managed AI',
    description: 'AI agents that handle customer support, data entry, and internal ops — around the clock.',
    handle: 'managed-ai',
    price: 50000, // $500/month
    type: 'subscription',
    collection: 'automation-services',
    metadata: {
      type: 'subscription',
      deposit_percent: 0, // No deposit for subscriptions
      billing_period: 'monthly',
      stripe_price_id: process.env.STRIPE_MANAGED_AI_PRICE_ID || '', // Set in .env.local
      features: [
        'AI agents',
        'Customer support',
        'Data entry automation',
        '24/7 operations',
      ],
    },
  },
];

// ============================================================================
// Collection Definitions
// ============================================================================

interface CollectionDefinition {
  title: string;
  handle: string;
}

const COLLECTIONS: CollectionDefinition[] = [
  { title: 'Website Packages', handle: 'website-packages' },
  { title: 'Website Add-ons', handle: 'website-addons' },
  { title: 'Automation Services', handle: 'automation-services' },
];

// ============================================================================
// Medusa API Helpers
// ============================================================================

async function getAdminToken(): Promise<string> {
  const email = process.env.MEDUSA_ADMIN_EMAIL;
  const password = process.env.MEDUSA_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD required in .env.local');
  }

  const response = await fetch(`${MEDUSA_URL}/auth/user/emailpass`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to authenticate: ${error}`);
  }

  const data = await response.json();
  return data.token;
}

async function getRegionAndSalesChannel(token: string) {
  // Get default region
  const regionsRes = await fetch(`${MEDUSA_URL}/admin/regions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const regionsData = await regionsRes.json();
  const region = regionsData.regions?.[0];

  // Get default sales channel
  const channelsRes = await fetch(`${MEDUSA_URL}/admin/sales-channels`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const channelsData = await channelsRes.json();
  const salesChannel = channelsData.sales_channels?.[0];

  return { region, salesChannel };
}

async function ensureCollections(token: string): Promise<Map<string, string>> {
  const collectionMap = new Map<string, string>();

  // Get existing collections
  const listRes = await fetch(`${MEDUSA_URL}/admin/product-collections`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listData = await listRes.json();
  const existingCollections = listData.collections || [];

  for (const collection of COLLECTIONS) {
    // Check if collection exists
    const existing = existingCollections.find(
      (c: { handle: string }) => c.handle === collection.handle
    );

    if (existing) {
      console.log(`  ⏭️  Collection "${collection.title}" already exists`);
      collectionMap.set(collection.handle, existing.id);
      continue;
    }

    // Create collection
    const createRes = await fetch(`${MEDUSA_URL}/admin/product-collections`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: collection.title,
        handle: collection.handle,
      }),
    });

    if (!createRes.ok) {
      const error = await createRes.json().catch(() => ({}));
      throw new Error(`Failed to create collection ${collection.title}: ${JSON.stringify(error)}`);
    }

    const createData = await createRes.json();
    console.log(`  ✅ Created collection: ${collection.title}`);
    collectionMap.set(collection.handle, createData.collection.id);
  }

  return collectionMap;
}

async function createProduct(
  token: string,
  product: ProductDefinition,
  regionId: string,
  salesChannelId: string,
  collectionMap: Map<string, string>
): Promise<void> {
  const sku = product.handle.replace(/-/g, '_').toUpperCase();
  const collectionId = collectionMap.get(product.collection);

  const productData = {
    title: product.title,
    description: product.description,
    handle: product.handle,
    status: 'published',
    collection_id: collectionId,
    options: [
      {
        title: 'Default',
        values: ['Standard'],
      },
    ],
    variants: [
      {
        title: 'Standard',
        sku,
        prices: [
          {
            amount: product.price,
            currency_code: 'usd',
            region_id: regionId,
          },
        ],
        options: { Default: 'Standard' },
        manage_inventory: false,
      },
    ],
    sales_channels: [{ id: salesChannelId }],
    metadata: product.metadata,
  };

  const response = await fetch(`${MEDUSA_URL}/admin/products`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    // Check if product already exists
    if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      console.log(`  ⏭️  ${product.title} already exists, skipping`);
      return;
    }
    throw new Error(`Failed to create ${product.title}: ${JSON.stringify(error)}`);
  }

  const priceLabel = product.type === 'subscription'
    ? `$${product.price / 100}/month`
    : `$${product.price / 100}`;

  console.log(`  ✅ Created: ${product.title} (${priceLabel})`);
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('\n🚀 Seeding products to Medusa...\n');
  console.log(`   Backend: ${MEDUSA_URL}\n`);

  // Validate subscription config BEFORE doing anything
  // This prevents creating products with empty stripe_price_id
  validateSubscriptionConfig();

  try {
    // Authenticate
    console.log('🔐 Authenticating...');
    const token = await getAdminToken();
    console.log('   ✅ Authenticated\n');

    // Get region and sales channel
    console.log('⚙️  Getting Medusa config...');
    const { region, salesChannel } = await getRegionAndSalesChannel(token);

    if (!region || !salesChannel) {
      throw new Error('Could not find region or sales channel in Medusa');
    }
    console.log(`   Region: ${region.name}`);
    console.log(`   Sales Channel: ${salesChannel.name}\n`);

    // Ensure collections exist
    console.log('📂 Creating collections...\n');
    const collectionMap = await ensureCollections(token);

    // Create products grouped by type
    console.log('\n📦 Creating products...\n');

    const packages = PRODUCTS.filter((p) => p.type === 'package');
    const addons = PRODUCTS.filter((p) => p.type === 'addon');
    const services = PRODUCTS.filter((p) => p.type === 'service' || p.type === 'subscription');

    console.log('   Website Packages:');
    for (const product of packages) {
      await createProduct(token, product, region.id, salesChannel.id, collectionMap);
    }

    console.log('\n   Website Add-ons:');
    for (const product of addons) {
      await createProduct(token, product, region.id, salesChannel.id, collectionMap);
    }

    console.log('\n   Automation Services:');
    for (const product of services) {
      await createProduct(token, product, region.id, salesChannel.id, collectionMap);
    }

    console.log('\n✨ Done! Products seeded successfully.\n');
    console.log('   View at: /pricing\n');
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
