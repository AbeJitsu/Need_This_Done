/**
 * Seed Consultation Products via Admin API
 *
 * Run with: node seed-products.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:9000';
const ADMIN_EMAIL = 'admin@needthisdone.com';
const ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD;

// Security check: Ensure admin password is set via environment variable
if (!ADMIN_PASSWORD) {
  console.error('Error: MEDUSA_ADMIN_PASSWORD environment variable is required');
  process.exit(1);
}

let sessionCookie = null;

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (sessionCookie) {
      options.headers['Cookie'] = sessionCookie;
    }

    const req = http.request(options, (res) => {
      // Capture session cookie
      if (res.headers['set-cookie']) {
        sessionCookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
      }

      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body || '{}') });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function main() {
  console.log('Seeding consultation products...\n');

  // 1. Authenticate
  console.log('1. Authenticating...');
  const authRes = await makeRequest('POST', '/admin/auth', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });
  if (authRes.status !== 200) {
    console.error('Auth failed:', authRes.data);
    process.exit(1);
  }
  console.log('   ✓ Authenticated as', authRes.data.user?.email);

  // 2. Get region
  console.log('2. Getting region...');
  const regionsRes = await makeRequest('GET', '/admin/regions');
  let region = regionsRes.data.regions?.[0];
  if (!region) {
    console.log('   No region found. Creating one...');
    const createRegionRes = await makeRequest('POST', '/admin/regions', {
      name: 'United States',
      currency_code: 'usd',
      tax_rate: 0,
      payment_providers: ['manual'],
      fulfillment_providers: ['manual'],
      countries: ['us']
    });
    if (createRegionRes.status !== 200 && createRegionRes.status !== 201) {
      console.error('Failed to create region:', createRegionRes.data);
      process.exit(1);
    }
    region = createRegionRes.data.region;
  }
  console.log('   ✓ Region:', region.name, '(' + region.id + ')');

  // 3. Get shipping profile
  console.log('3. Getting shipping profile...');
  const profilesRes = await makeRequest('GET', '/admin/shipping-profiles');
  const profile = profilesRes.data.shipping_profiles?.[0];
  if (!profile) {
    console.error('No shipping profile found');
    process.exit(1);
  }
  console.log('   ✓ Profile:', profile.name, '(' + profile.id + ')');

  // 4. Get sales channel
  console.log('4. Getting sales channel...');
  const channelsRes = await makeRequest('GET', '/admin/sales-channels');
  const channel = channelsRes.data.sales_channels?.[0];
  if (!channel) {
    console.error('No sales channel found');
    process.exit(1);
  }
  console.log('   ✓ Channel:', channel.name, '(' + channel.id + ')');

  // 5. Create products
  console.log('\n5. Creating consultation products...');

  const products = [
    {
      title: '15-Minute Quick Consultation',
      handle: 'consultation-15-min',
      description: 'A focused 15-minute session to discuss your specific needs, answer questions, or provide quick guidance on your project.',
      duration: 15,
      price: 2000, // $20.00
    },
    {
      title: '30-Minute Strategy Consultation',
      handle: 'consultation-30-min',
      description: 'A comprehensive 30-minute session to dive deeper into your project, explore solutions, and develop a strategic approach.',
      duration: 30,
      price: 3500, // $35.00
    },
    {
      title: '55-Minute Deep Dive Consultation',
      handle: 'consultation-55-min',
      description: 'Our most thorough consultation. Nearly an hour to fully explore your challenges, brainstorm solutions, and create an actionable plan.',
      duration: 55,
      price: 5000, // $50.00
    }
  ];

  for (const product of products) {
    // Check if exists
    const existsRes = await makeRequest('GET', `/admin/products?handle=${product.handle}`);
    if (existsRes.data.products?.length > 0) {
      console.log(`   - ${product.title}: Already exists`);
      continue;
    }

    // Create product (without profile_id and using only region_id for prices)
    const createRes = await makeRequest('POST', '/admin/products', {
      title: product.title,
      handle: product.handle,
      description: product.description,
      status: 'published',
      is_giftcard: false,
      discountable: true,
      sales_channels: [{ id: channel.id }],
      metadata: {
        requires_appointment: true,
        duration_minutes: product.duration,
        service_type: 'consultation'
      },
      options: [{ title: 'Duration' }],
      variants: [{
        title: `${product.duration} Minutes`,
        inventory_quantity: 100,
        manage_inventory: false,
        options: [{ value: `${product.duration} min` }],
        prices: [{ amount: product.price, region_id: region.id }]
      }]
    });

    if (createRes.status === 200 || createRes.status === 201) {
      console.log(`   ✓ ${product.title}: Created ($${(product.price / 100).toFixed(2)})`);
    } else {
      console.log(`   ✗ ${product.title}: Failed -`, createRes.data.message || createRes.data);
    }
  }

  // 6. Verify
  console.log('\n6. Verifying products...');
  const storeRes = await makeRequest('GET', '/store/products');
  console.log(`   Found ${storeRes.data.count || 0} products in store`);

  console.log('\n✅ Seeding complete!');
}

main().catch(console.error);
