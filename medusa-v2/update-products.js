// Quick script to update existing products with images and metadata
const fetch = require('node-fetch');

const MEDUSA_URL = process.env.DATABASE_URL ? 'https://need-this-done-production.up.railway.app' : 'http://localhost:9000';
const PUBLISHABLE_KEY = 'pk_4f3c774806deefb5cbdb5aac83868725c12d248db98abe8c4a70e3dcbcea8676';

const products = [
  {
    handle: '15-min-consultation',
    thumbnail: 'https://oxhjtmozsdstbokwtnwa.supabase.co/storage/v1/object/public/product-images/consultation-15min.jpg',
    metadata: { base_price_usd: 2000 }
  },
  {
    handle: '30-min-consultation', 
    thumbnail: 'https://oxhjtmozsdstbokwtnwa.supabase.co/storage/v1/object/public/product-images/consultation-30min.jpg',
    metadata: { base_price_usd: 3500 }
  },
  {
    handle: '55-min-consultation',
    thumbnail: 'https://oxhjtmozsdstbokwtnwa.supabase.co/storage/v1/object/public/product-images/consultation-55min.jpg',
    metadata: { base_price_usd: 5000 }
  }
];

async function updateProducts() {
  console.log('Fetching products...');
  
  // Get all products
  const response = await fetch(`${MEDUSA_URL}/store/products`, {
    headers: {
      'x-publishable-api-key': PUBLISHABLE_KEY
    }
  });
  
  const data = await response.json();
  console.log(`Found ${data.products.length} products\n`);
  
  for (const productData of products) {
    const product = data.products.find(p => p.handle === productData.handle);
    
    if (!product) {
      console.log(`⚠️  Product ${productData.handle} not found`);
      continue;
    }
    
    console.log(`Updating ${product.title}...`);
    console.log(`  - Adding thumbnail: ${productData.thumbnail}`);
    console.log(`  - Adding metadata: base_price_usd=${productData.metadata.base_price_usd}`);
    console.log(`  - Product ID: ${product.id}`);
    console.log(`  - Variant ID: ${product.variants[0]?.id}\n`);
  }
  
  console.log('\n⚠️  Note: This script shows what needs to be updated.');
  console.log('Products must be updated via Medusa Admin API with authentication.');
  console.log('Run this on Railway after deployment completes.');
}

updateProducts().catch(console.error);
