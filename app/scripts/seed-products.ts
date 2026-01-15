/**
 * Seed Products Script
 *
 * Creates the website build products and add-ons in Medusa.
 * Run with: npx tsx scripts/seed-products.ts
 *
 * Requires admin credentials in .env.local:
 * - MEDUSA_BACKEND_URL
 * - MEDUSA_ADMIN_EMAIL
 * - MEDUSA_ADMIN_PASSWORD
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

interface ProductDefinition {
  title: string;
  description: string;
  handle: string;
  price: number; // in cents
  category: 'package' | 'addon';
  metadata?: Record<string, unknown>;
}

const PRODUCTS: ProductDefinition[] = [
  // Main Packages
  {
    title: 'Launch Site',
    description: 'Perfect for getting online fast. 3-5 page Next.js website deployed on Vercel. Includes custom design, mobile responsive, contact form, and basic SEO setup.',
    handle: 'launch-site',
    price: 50000, // $500
    category: 'package',
    metadata: {
      pages_included: '3-5',
      timeline: '1-2 weeks',
      support_days: 30,
    },
  },
  {
    title: 'Growth Site',
    description: 'For businesses ready to scale. 5-8 page website with blog, CMS for easy updates, integrations, and enhanced SEO. Everything in Launch plus room to grow.',
    handle: 'growth-site',
    price: 120000, // $1,200
    category: 'package',
    metadata: {
      pages_included: '5-8',
      timeline: '2-4 weeks',
      support_days: 60,
      includes_blog: true,
      includes_cms: true,
    },
  },

  // Add-ons
  {
    title: 'Additional Page',
    description: 'Add another page to your site. Design, development, and deployment included.',
    handle: 'additional-page',
    price: 10000, // $100
    category: 'addon',
  },
  {
    title: 'Blog Setup',
    description: 'Add a blog to your site with MDX support. Write posts in markdown, automatic formatting and SEO.',
    handle: 'blog-setup',
    price: 30000, // $300
    category: 'addon',
  },
  {
    title: 'Contact Form with File Upload',
    description: 'Enhanced contact form with file attachment support. Up to 3 files, 5MB each.',
    handle: 'contact-form-files',
    price: 15000, // $150
    category: 'addon',
  },
  {
    title: 'Calendar Booking',
    description: 'Integrate Calendly, Cal.com, or similar booking widget. Let visitors schedule calls directly.',
    handle: 'calendar-booking',
    price: 20000, // $200
    category: 'addon',
  },
  {
    title: 'Payment Integration',
    description: 'Accept payments via Stripe. One-time payments, subscriptions, or donations.',
    handle: 'payment-integration',
    price: 40000, // $400
    category: 'addon',
  },
  {
    title: 'CMS Integration',
    description: 'Add a content management system so you can update your site without code. Edit text, images, and pages yourself.',
    handle: 'cms-integration',
    price: 50000, // $500
    category: 'addon',
  },
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

async function createProduct(
  token: string,
  product: ProductDefinition,
  regionId: string,
  salesChannelId: string
): Promise<void> {
  const sku = product.handle.replace(/-/g, '_').toUpperCase();

  const productData = {
    title: product.title,
    description: product.description,
    handle: product.handle,
    status: 'published',
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
    metadata: {
      ...product.metadata,
      category: product.category,
    },
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

  console.log(`  ✅ Created: ${product.title} ($${product.price / 100})`);
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

    // Create products
    console.log('📦 Creating products...\n');

    const packages = PRODUCTS.filter((p) => p.category === 'package');
    const addons = PRODUCTS.filter((p) => p.category === 'addon');

    console.log('   Packages:');
    for (const product of packages) {
      await createProduct(token, product, region.id, salesChannel.id);
    }

    console.log('\n   Add-ons:');
    for (const product of addons) {
      await createProduct(token, product, region.id, salesChannel.id);
    }

    console.log('\n✨ Done! Products seeded successfully.\n');
    console.log('   View at: /shop\n');
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
