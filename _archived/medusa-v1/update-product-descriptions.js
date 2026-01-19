/**
 * Update Consultation Product Descriptions via Admin API
 *
 * Run with: node update-product-descriptions.js
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
  console.log('Updating consultation product descriptions...\n');

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

  // 2. Updated descriptions - more conversational and benefit-focused
  const updates = [
    {
      handle: 'consultation-15-min',
      description: "Got a quick question or need a sanity check? In 15 minutes, we'll cut through the confusion and give you clear direction—so you can stop second-guessing and start moving forward.",
    },
    {
      handle: 'consultation-30-min',
      description: "Not sure where to start? This is our most popular option. We'll dig into your project together, talk through your options, and map out a clear path forward—no more spinning your wheels.",
    },
    {
      handle: 'consultation-55-min',
      description: "For bigger challenges that need real thinking time. We'll explore everything—your situation, your goals, the obstacles—and leave you with a concrete plan you can actually act on.",
    }
  ];

  // 3. Update each product
  console.log('\n2. Updating product descriptions...');

  for (const update of updates) {
    // Find product by handle
    const findRes = await makeRequest('GET', `/admin/products?handle=${update.handle}`);
    const product = findRes.data.products?.[0];

    if (!product) {
      console.log(`   ✗ ${update.handle}: Not found`);
      continue;
    }

    // Update the product
    const updateRes = await makeRequest('POST', `/admin/products/${product.id}`, {
      description: update.description
    });

    if (updateRes.status === 200) {
      console.log(`   ✓ ${product.title}: Updated`);
    } else {
      console.log(`   ✗ ${product.title}: Failed -`, updateRes.data.message || updateRes.data);
    }
  }

  console.log('\n✅ Descriptions updated!');
}

main().catch(console.error);
