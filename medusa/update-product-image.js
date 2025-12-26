/**
 * Update Product Image via Medusa Admin API
 *
 * Usage: MEDUSA_ADMIN_PASSWORD=your_password node update-product-image.js [handle] [image_url]
 *
 * Example:
 *   MEDUSA_ADMIN_PASSWORD=xxx node update-product-image.js 15-min-consultation https://images.pexels.com/photos/4050336/pexels-photo-4050336.jpeg
 */

const https = require('https');
const http = require('http');

// Default to Railway production URL
const BASE_URL = process.env.MEDUSA_URL || process.env.NEXT_PUBLIC_MEDUSA_URL || 'https://need-this-done-production.up.railway.app';
const isHttps = BASE_URL.startsWith('https');
const ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD;

// Get args
const [, , productHandle, imageUrl] = process.argv;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Error: MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD environment variables are required');
  process.exit(1);
}

if (!productHandle || !imageUrl) {
  console.error('Usage: node update-product-image.js [product-handle] [image-url]');
  console.error('Example: node update-product-image.js 15-min-consultation https://images.pexels.com/photos/4050336/pexels-photo-4050336.jpeg');
  process.exit(1);
}

let sessionCookie = null;

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (sessionCookie) {
      options.headers['Cookie'] = sessionCookie;
    }

    const protocol = isHttps ? https : http;
    const req = protocol.request(options, (res) => {
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
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  console.log('🔐 Authenticating with Medusa...');

  const authRes = await makeRequest('POST', '/admin/auth', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  if (authRes.status !== 200) {
    console.error('❌ Auth failed:', authRes.data);
    process.exit(1);
  }
  console.log('✅ Authenticated');

  // Find product by handle
  console.log(`🔍 Finding product: ${productHandle}`);
  const productsRes = await makeRequest('GET', `/admin/products?handle=${productHandle}`);

  if (productsRes.status !== 200 || !productsRes.data.products?.length) {
    console.error('❌ Product not found');
    process.exit(1);
  }

  const product = productsRes.data.products[0];
  console.log(`✅ Found: ${product.title} (ID: ${product.id})`);

  // Update image - Medusa expects images as array of URL strings
  console.log(`🖼️  Updating image to: ${imageUrl}`);
  const updateRes = await makeRequest('POST', `/admin/products/${product.id}`, {
    thumbnail: imageUrl,
    images: [imageUrl],
  });

  if (updateRes.status !== 200) {
    console.error('❌ Update failed:', updateRes.data);
    process.exit(1);
  }

  console.log('✅ Image updated successfully!');
  console.log(`   Product: ${product.title}`);
  console.log(`   New image: ${imageUrl}`);
}

main().catch(console.error);
