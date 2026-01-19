/**
 * Delete Existing Consultation Products
 *
 * Run with: node delete-products.js
 */

const http = require('http');

const BASE_URL = process.env.MEDUSA_URL || process.env.NEXT_PUBLIC_MEDUSA_URL || 'http://localhost:9000';
const ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD;

// Security check: Ensure admin credentials are set via environment variables
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Error: MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD environment variables are required');
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
  console.log('Deleting consultation products...\n');

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

  // 2. Get all products
  console.log('\n2. Getting existing products...');
  const productsRes = await makeRequest('GET', '/admin/products?limit=100');
  const products = productsRes.data.products || [];
  console.log(`   Found ${products.length} products`);

  // 3. Delete consultation products
  console.log('\n3. Deleting consultation products...');
  const consultationHandles = [
    'consultation-15-min',
    'consultation-30-min',
    'consultation-55-min'
  ];

  let deletedCount = 0;
  for (const product of products) {
    if (consultationHandles.includes(product.handle)) {
      const deleteRes = await makeRequest('DELETE', `/admin/products/${product.id}`);
      if (deleteRes.status === 200 || deleteRes.status === 204) {
        console.log(`   ✓ Deleted: ${product.title}`);
        deletedCount++;
      } else {
        console.log(`   ✗ Failed to delete: ${product.title}`, deleteRes.data);
      }
    }
  }

  console.log(`\n✅ Deleted ${deletedCount} consultation products`);
  console.log('\n💡 Now run: node seed-products.js');
}

main().catch(console.error);
