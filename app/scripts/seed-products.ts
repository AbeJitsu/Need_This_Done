/**
 * Seed Products Script
 *
 * Creates the website build products, add-ons, and services in Medusa.
 * Run with: npx tsx scripts/seed-products.ts
 *
 * Requires admin credentials in .env.local:
 * - MEDUSA_BACKEND_URL (or NEXT_PUBLIC_MEDUSA_URL)
 * - MEDUSA_ADMIN_EMAIL
 * - MEDUSA_ADMIN_PASSWORD
 *
 * Note: Subscription products are handled natively by Medusa's
 * subscription module - no separate Stripe price IDs required.
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
    title: 'Starter Site',
    description: 'Get online with a professional website that looks great on any device. Perfect for new businesses and personal brands.',
    handle: 'starter-site',
    price: 50000, // $500
    type: 'package',
    collection: 'website-packages',
    metadata: {
      type: 'package',
      deposit_percent: 50,
      features: [
        '3–5 custom pages',
        'Custom design, mobile-friendly',
        'Contact form (sends you an email)',
        'Basic search engine optimization',
        '30 days support',
      ],
    },
  },
  {
    title: 'Growth Site',
    description: 'Grow your business with a site that saves form submissions, stores customer data, and lets people book appointments.',
    handle: 'growth-site',
    price: 150000, // $1,500
    type: 'package',
    collection: 'website-packages',
    metadata: {
      type: 'package',
      deposit_percent: 50,
      features: [
        '5–8 custom pages',
        'Everything in Starter',
        'Database (form submissions saved, customer data stored)',
        'Appointment booking with email confirmations',
        'Better search engine visibility so customers find you',
        '60 days support',
      ],
    },
  },
  {
    title: 'Pro Site',
    description: 'Run your business from your website. Customer accounts, payments, email campaigns, analytics, and a full admin dashboard.',
    handle: 'pro-site',
    price: 500000, // $5,000
    type: 'package',
    collection: 'website-packages',
    metadata: {
      type: 'package',
      deposit_percent: 50,
      popular: true,
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
    },
  },

  // ========================================
  // Website Add-ons
  // ========================================
  {
    title: 'Extra Page',
    description: 'One more custom page for your site. Design, development, and deployment included.',
    handle: 'additional-page',
    price: 10000, // $100
    type: 'addon',
    collection: 'website-addons',
    metadata: {
      type: 'addon',
      deposit_percent: 50,
      features: ['Custom page design', 'Mobile-friendly', 'Search engine optimized'],
    },
  },
  {
    title: 'Blog',
    description: 'Write and publish articles on your site. Includes formatting, categories, and search engine optimization.',
    handle: 'blog-setup',
    price: 30000, // $300
    type: 'addon',
    collection: 'website-addons',
    metadata: {
      type: 'addon',
      deposit_percent: 50,
      features: ['Write and publish articles', 'Auto formatting', 'Search engine optimization', 'RSS feed'],
    },
  },
  {
    title: 'Edit Your Own Site',
    description: 'Change text and images on your site without calling us. Visual editor with version history.',
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
  {
    title: 'Calendar Booking',
    description: 'Let customers book appointments on your site. Includes email confirmations and reminders.',
    handle: 'calendar-booking',
    price: 20000, // $200
    type: 'addon',
    collection: 'website-addons',
    metadata: {
      type: 'addon',
      deposit_percent: 50,
      features: ['Calendar integration', 'Online booking widget', 'Email confirmations'],
    },
  },
  {
    title: 'File Uploads',
    description: 'Customers can attach files to forms. Up to 3 files, 5MB each.',
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
    title: 'Accept Payments',
    description: 'Take payments from customers: one-time, monthly subscriptions, or deposits.',
    handle: 'payment-integration',
    price: 40000, // $400
    type: 'addon',
    collection: 'website-addons',
    metadata: {
      type: 'addon',
      deposit_percent: 50,
      features: ['Secure payment processing', 'One-time payments', 'Subscriptions', 'Deposits'],
    },
  },
  {
    title: 'Customer Accounts',
    description: 'Let people sign up, log in, and save their info on your site.',
    handle: 'customer-accounts',
    price: 40000, // $400
    type: 'addon',
    collection: 'website-addons',
    metadata: {
      type: 'addon',
      deposit_percent: 50,
      features: ['User sign up & login', 'Save personal info', 'Order history', 'Account dashboard'],
    },
  },
  {
    title: 'AI Chatbot',
    description: 'Smart assistant trained on your site content. Answers customer questions 24/7.',
    handle: 'ai-chatbot',
    price: 60000, // $600
    type: 'addon',
    collection: 'website-addons',
    metadata: {
      type: 'addon',
      deposit_percent: 50,
      features: ['Trained on your content', '24/7 availability', 'Natural conversation', 'Lead capture'],
    },
  },
  {
    title: 'Online Store',
    description: 'Full shop: product catalog, cart, checkout, inventory tracking, and order management.',
    handle: 'online-store',
    price: 200000, // $2,000
    type: 'addon',
    collection: 'website-addons',
    metadata: {
      type: 'addon',
      deposit_percent: 50,
      features: ['Product catalog', 'Shopping cart', 'Secure checkout', 'Inventory tracking', 'Order management'],
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
      // Medusa handles subscription billing natively - no stripe_price_id needed
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

  // Get existing collections (Medusa v2 uses /admin/collections)
  const listRes = await fetch(`${MEDUSA_URL}/admin/collections`, {
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

    // Create collection (Medusa v2 uses /admin/collections)
    const createRes = await fetch(`${MEDUSA_URL}/admin/collections`, {
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

async function findProductByHandle(token: string, handle: string): Promise<string | null> {
  const response = await fetch(`${MEDUSA_URL}/admin/products?handle=${handle}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) return null;

  const data = await response.json();
  return data.products?.[0]?.id || null;
}

async function createOrUpdateProduct(
  token: string,
  product: ProductDefinition,
  regionId: string,
  salesChannelId: string,
  collectionMap: Map<string, string>
): Promise<void> {
  const sku = product.handle.replace(/-/g, '_').toUpperCase();
  const collectionId = collectionMap.get(product.collection);

  // Check if product already exists
  const existingProductId = await findProductByHandle(token, product.handle);

  if (existingProductId) {
    // UPDATE existing product with new data
    const updateData = {
      title: product.title,
      description: product.description,
      collection_id: collectionId,
      metadata: product.metadata,
    };

    const updateResponse = await fetch(`${MEDUSA_URL}/admin/products/${existingProductId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.json().catch(() => ({}));
      throw new Error(`Failed to update ${product.title}: ${JSON.stringify(error)}`);
    }

    // Fetch product to check variant prices and update if needed
    const productRes = await fetch(`${MEDUSA_URL}/admin/products/${existingProductId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const productData = await productRes.json();
    const variant = productData.product?.variants?.[0];

    if (variant) {
      const currentPrice = variant.prices?.find(
        (p: { currency_code: string; amount: number }) => p.currency_code === 'usd'
      );

      if (currentPrice && currentPrice.amount !== product.price) {
        // Update variant price via Medusa admin API
        const priceUpdateRes = await fetch(
          `${MEDUSA_URL}/admin/products/${existingProductId}/variants/${variant.id}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prices: [
                {
                  amount: product.price,
                  currency_code: 'usd',
                  region_id: regionId,
                },
              ],
            }),
          }
        );

        if (priceUpdateRes.ok) {
          console.log(
            `  💰 Price updated: ${product.title} ($${currentPrice.amount / 100} → $${product.price / 100})`
          );
        } else {
          console.warn(`  ⚠️  Could not update price for ${product.title}`);
        }
      }
    }

    console.log(`  🔄 Updated: ${product.title} (linked to collection)`);
    return;
  }

  // CREATE new product
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

    // Create or update products grouped by type
    console.log('\n📦 Syncing products...\n');

    const packages = PRODUCTS.filter((p) => p.type === 'package');
    const addons = PRODUCTS.filter((p) => p.type === 'addon');
    const services = PRODUCTS.filter((p) => p.type === 'service' || p.type === 'subscription');

    console.log('   Website Packages:');
    for (const product of packages) {
      await createOrUpdateProduct(token, product, region.id, salesChannel.id, collectionMap);
    }

    console.log('\n   Website Add-ons:');
    for (const product of addons) {
      await createOrUpdateProduct(token, product, region.id, salesChannel.id, collectionMap);
    }

    console.log('\n   Automation Services:');
    for (const product of services) {
      await createOrUpdateProduct(token, product, region.id, salesChannel.id, collectionMap);
    }

    console.log('\n✨ Done! Products seeded successfully.\n');
    console.log('   View at: /pricing\n');
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
