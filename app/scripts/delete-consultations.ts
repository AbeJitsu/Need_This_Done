/**
 * Delete Old Consultation Products
 *
 * Removes the $20, $35, $50 consultation products from Medusa.
 * Run with: npx tsx scripts/delete-consultations.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const MEDUSA_URL = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_URL;

if (!MEDUSA_URL) {
  console.error('❌ MEDUSA_BACKEND_URL not set');
  process.exit(1);
}

// Consultation product handles to delete
const CONSULTATION_HANDLES = [
  '15-min-consultation',
  '30-min-consultation',
  '55-min-consultation',
  '15-minute-consultation',
  '30-minute-consultation',
  '55-minute-consultation',
];

async function getAdminToken(): Promise<string> {
  const email = process.env.MEDUSA_ADMIN_EMAIL;
  const password = process.env.MEDUSA_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD required');
  }

  const response = await fetch(`${MEDUSA_URL}/auth/user/emailpass`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate');
  }

  const data = await response.json();
  return data.token;
}

async function getProducts(token: string) {
  const response = await fetch(`${MEDUSA_URL}/admin/products?limit=100`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return data.products || [];
}

async function deleteProduct(token: string, productId: string, title: string) {
  const response = await fetch(`${MEDUSA_URL}/admin/products/${productId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.ok) {
    console.log(`  ✅ Deleted: ${title}`);
  } else {
    console.log(`  ❌ Failed to delete: ${title}`);
  }
}

async function main() {
  console.log('\n🗑️  Deleting old consultation products...\n');

  const token = await getAdminToken();
  const products = await getProducts(token);

  console.log(`   Found ${products.length} total products\n`);

  // Find consultation products
  const consultations = products.filter((p: { handle: string }) =>
    CONSULTATION_HANDLES.includes(p.handle) ||
    p.handle?.includes('consultation') ||
    p.handle?.includes('min-')
  );

  if (consultations.length === 0) {
    console.log('   No consultation products found to delete.\n');

    // List all products for debugging
    console.log('   All products:');
    products.forEach((p: { title: string; handle: string }) => {
      console.log(`   - ${p.title} (${p.handle})`);
    });
    return;
  }

  console.log(`   Found ${consultations.length} consultation products to delete:\n`);

  for (const product of consultations) {
    await deleteProduct(token, product.id, product.title);
  }

  console.log('\n✨ Done!\n');
}

main().catch(console.error);
