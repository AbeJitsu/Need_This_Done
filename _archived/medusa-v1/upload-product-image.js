/**
 * Upload Product Image to Supabase Storage and Update Medusa
 *
 * Usage:
 *   MEDUSA_ADMIN_PASSWORD=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node upload-product-image.js [handle] [source] [filename]
 *
 * Examples:
 *   # From URL:
 *   node upload-product-image.js consultation-15-min "https://images.pexels.com/photos/4474047/pexels-photo-4474047.jpeg" consultation-15min.jpg
 *
 *   # From local file:
 *   node upload-product-image.js consultation-15-min "/path/to/local/image.jpg" consultation-15min.jpg
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Config
const MEDUSA_URL = process.env.MEDUSA_URL || process.env.NEXT_PUBLIC_MEDUSA_URL || 'https://need-this-done-production.up.railway.app';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MEDUSA_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD;
const ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL;

const isHttps = MEDUSA_URL.startsWith('https');

// Args
const [, , productHandle, sourceImageUrl, filename] = process.argv;

if (!ADMIN_EMAIL || !MEDUSA_PASSWORD || !SUPABASE_SERVICE_KEY) {
  console.error('Error: MEDUSA_ADMIN_EMAIL, MEDUSA_ADMIN_PASSWORD, and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

if (!productHandle || !sourceImageUrl || !filename) {
  console.error('Usage: node upload-product-image.js [handle] [image_url] [filename]');
  console.error('Example: node upload-product-image.js consultation-15-min "https://..." consultation-15min.jpg');
  process.exit(1);
}

let sessionCookie = null;

// HTTP request helper
function makeRequest(baseUrl, method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const useHttps = baseUrl.startsWith('https');
    const options = {
      hostname: url.hostname,
      port: url.port || (useHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json', ...headers }
    };

    if (sessionCookie && baseUrl === MEDUSA_URL) {
      options.headers['Cookie'] = sessionCookie;
    }

    const protocol = useHttps ? https : http;
    const req = protocol.request(options, (res) => {
      if (res.headers['set-cookie']) {
        sessionCookie = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
      }

      let body = [];
      res.on('data', chunk => body.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(body);
        try {
          resolve({ status: res.statusCode, data: JSON.parse(buffer.toString()) });
        } catch {
          resolve({ status: res.statusCode, data: buffer });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      if (Buffer.isBuffer(data)) {
        req.write(data);
      } else {
        req.write(JSON.stringify(data));
      }
    }
    req.end();
  });
}

// Download image
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        return downloadImage(res.headers.location).then(resolve).catch(reject);
      }
      let chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// Upload to Supabase Storage
async function uploadToSupabase(buffer, filename) {
  const url = new URL(`/storage/v1/object/product-images/${filename}`, SUPABASE_URL);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'image/jpeg',
        'Content-Length': buffer.length,
        'x-upsert': 'true'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data: body });
      });
    });

    req.on('error', reject);
    req.write(buffer);
    req.end();
  });
}

// Check if source is a local file or URL
function isLocalFile(source) {
  return fs.existsSync(source) || source.startsWith('/') || source.startsWith('./');
}

// Read local file
function readLocalFile(filePath) {
  return fs.readFileSync(filePath);
}

async function main() {
  let imageBuffer;

  if (isLocalFile(sourceImageUrl)) {
    console.log('📂 Reading local file:', sourceImageUrl);
    imageBuffer = readLocalFile(sourceImageUrl);
    console.log(`✅ Read ${(imageBuffer.length / 1024).toFixed(1)} KB from local file`);
  } else {
    console.log('📥 Downloading image from:', sourceImageUrl);
    imageBuffer = await downloadImage(sourceImageUrl);
    console.log(`✅ Downloaded ${(imageBuffer.length / 1024).toFixed(1)} KB`);
  }

  console.log('📤 Uploading to Supabase Storage...');
  const uploadRes = await uploadToSupabase(imageBuffer, filename);
  if (uploadRes.status !== 200) {
    console.error('❌ Upload failed:', uploadRes.data);
    process.exit(1);
  }
  console.log('✅ Uploaded to Supabase');

  const supabaseImageUrl = `${SUPABASE_URL}/storage/v1/object/public/product-images/${filename}`;
  console.log('🔗 Public URL:', supabaseImageUrl);

  // Authenticate with Medusa
  console.log('🔐 Authenticating with Medusa...');
  const authRes = await makeRequest(MEDUSA_URL, 'POST', '/admin/auth', {
    email: ADMIN_EMAIL,
    password: MEDUSA_PASSWORD,
  });

  if (authRes.status !== 200) {
    console.error('❌ Auth failed:', authRes.data);
    process.exit(1);
  }
  console.log('✅ Authenticated');

  // Find product
  console.log(`🔍 Finding product: ${productHandle}`);
  const productsRes = await makeRequest(MEDUSA_URL, 'GET', `/admin/products?handle=${productHandle}`);

  if (productsRes.status !== 200 || !productsRes.data.products?.length) {
    console.error('❌ Product not found');
    process.exit(1);
  }

  const product = productsRes.data.products[0];
  console.log(`✅ Found: ${product.title} (ID: ${product.id})`);

  // Update product image
  console.log('🖼️  Updating Medusa product image...');
  const updateRes = await makeRequest(MEDUSA_URL, 'POST', `/admin/products/${product.id}`, {
    thumbnail: supabaseImageUrl,
    images: [supabaseImageUrl],
  });

  if (updateRes.status !== 200) {
    console.error('❌ Update failed:', updateRes.data);
    process.exit(1);
  }

  console.log('✅ Product image updated successfully!');
  console.log(`   Product: ${product.title}`);
  console.log(`   New image: ${supabaseImageUrl}`);
}

main().catch(console.error);
