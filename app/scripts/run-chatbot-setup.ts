#!/usr/bin/env node

// ============================================================================
// Chatbot Setup Orchestration Script
// ============================================================================
// This script runs from the app directory and uses the API routes
// to verify database, index pages, and test vector search

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Configuration
// ============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ============================================================================
// Helper: Page Discovery
// ============================================================================

function discoverPublicPages(): { path: string; name: string }[] {
  const appDir = path.join(__dirname, '../app');
  const pages: { path: string; name: string }[] = [];

  function scanDirectory(dir: string, routePath: string = '') {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;
        if (entry.name === 'api') continue;
        if (entry.name.startsWith('[') && entry.name.includes(']')) continue;

        const newRoutePath = routePath + '/' + entry.name;
        scanDirectory(fullPath, newRoutePath);
      } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
        const route = routePath || '/';
        const isPublic = !route.startsWith('/admin') && !route.startsWith('/dashboard');

        if (isPublic) {
          const name = routePath
            ? routePath
                .split('/')
                .filter(Boolean)
                .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                .join(' ')
            : 'Home';

          pages.push({ path: route, name });
        }
      }
    }
  }

  scanDirectory(appDir);
  return pages.sort((a, b) => a.path.localeCompare(b.path));
}

// ============================================================================
// Step 1: Verify Database
// ============================================================================

async function verifyDatabase() {
  console.log('\n🔍 Step 1: Verifying Database Setup\n');

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SERVICE_ROLE_KEY');
    return false;
  }

  console.log('Checking database connectivity...');
  console.log('(Note: Full verification requires dev server running)');
  console.log('✓ Environment variables found\n');
  return true;
}

// ============================================================================
// Step 2: Index Pages
// ============================================================================

async function indexAllPages() {
  console.log('\n📄 Step 2: Indexing All Pages\n');

  if (!SERVICE_ROLE_KEY) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
    return false;
  }

  // Discover pages
  console.log('🔍 Discovering pages...\n');
  const pages = discoverPublicPages();

  if (pages.length === 0) {
    console.error('❌ No pages found');
    return false;
  }

  console.log(`Found ${pages.length} pages:\n`);
  pages.forEach((p) => {
    console.log(`   • ${p.path} (${p.name})`);
  });

  // Wait for dev server
  console.log('\n⏳ Starting indexing (this requires dev server running)');
  console.log(`   Using: ${SITE_URL}`);
  console.log('   \n📋 Instructions:');
  console.log('   1. Make sure dev server is running: cd app && npm run dev');
  console.log('   2. Keep this script running');
  console.log('   3. Indexing will start when server is ready...\n');

  // Try to connect to server
  let serverReady = false;
  for (let i = 0; i < 60; i++) {
    try {
      const response = await fetch(SITE_URL);
      if (response.ok) {
        serverReady = true;
        break;
      }
    } catch {
      // Server not ready yet
    }
    if (i % 5 === 0) {
      console.log(`   Waiting for server... (${i}/60 attempts)`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  if (!serverReady) {
    console.error('\n❌ Could not connect to dev server at', SITE_URL);
    console.error('   Make sure it is running: cd app && npm run dev');
    return false;
  }

  console.log('   ✓ Dev server is ready!\n');

  // Index each page via API
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const progress = `[${i + 1}/${pages.length}]`;

    try {
      // Fetch page
      const pageUrl = `${SITE_URL}${page.path}`;
      const pageResponse = await fetch(pageUrl, {
        headers: {
          'User-Agent': 'Chatbot Indexer',
        },
      });

      if (!pageResponse.ok) {
        console.log(`${progress} ❌ ${page.path} (HTTP ${pageResponse.status})`);
        failCount++;
        continue;
      }

      const html = await pageResponse.text();

      // Extract text (simple version)
      const text = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (text.length < 50) {
        console.log(`${progress} ⚠️  ${page.path} (content too short)`);
        failCount++;
        continue;
      }

      // Generate hash
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const contentHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      // Call indexing API
      const indexResponse = await fetch(`${SITE_URL}/api/embeddings/index`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-supabase-auth': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          page_url: page.path,
          page_title: page.name,
          page_type: 'static',
          content: text,
          content_hash: contentHash,
          metadata: { indexed_at: new Date().toISOString() },
        }),
      });

      if (!indexResponse.ok) {
        const error = await indexResponse.text();
        console.log(`${progress} ❌ ${page.path} (${indexResponse.status})`);
        failCount++;
        continue;
      }

      const result = await indexResponse.json();

      if (result.success) {
        const chunks = result.chunks_indexed || 0;
        console.log(`${progress} ✓ ${page.path} (${chunks} chunks)`);
        successCount++;
      } else {
        console.log(`${progress} ❌ ${page.path} (${result.reason})`);
        failCount++;
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.log(`${progress} ❌ ${page.path} (${reason})`);
      failCount++;
    }

    // Small delay
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Indexed: ${successCount} pages`);
  console.log(`❌ Failed: ${failCount} pages`);
  console.log('='.repeat(60) + '\n');

  return successCount > 0;
}

// ============================================================================
// Step 3: Test Vector Search
// ============================================================================

async function testVectorSearch() {
  console.log('\n🧪 Step 3: Testing Vector Search\n');

  const testQuery = 'What services do you offer?';
  console.log(`Test query: "${testQuery}"\n`);
  console.log('(Note: Full test requires dev server running and pages indexed)\n');

  console.log('To manually test:');
  console.log(`1. Visit: ${SITE_URL}`);
  console.log('2. Click the chatbot button (bottom right)');
  console.log(`3. Ask: "${testQuery}"`);
  console.log('4. Should respond with site-specific information\n');

  return true;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('╔' + '='.repeat(58) + '╗');
  console.log('║  Chatbot Setup - Index Pages for Contextual Responses  ║');
  console.log('╚' + '='.repeat(58) + '╝');

  // Step 1: Verify
  const dbOk = await verifyDatabase();
  if (!dbOk) {
    process.exit(1);
  }

  // Step 2: Index
  const indexOk = await indexAllPages();
  if (!indexOk) {
    console.error('⚠️  Indexing incomplete or failed');
    process.exit(1);
  }

  // Step 3: Test
  await testVectorSearch();

  console.log('='.repeat(60));
  console.log('✅ Chatbot setup complete!');
  console.log('='.repeat(60));
  console.log('\nNext steps:');
  console.log(`1. Make sure dev server is running: cd app && npm run dev`);
  console.log(`2. Visit: ${SITE_URL}`);
  console.log('3. Test chatbot in the browser (bottom right)');
  console.log('');
}

main().catch((error) => {
  console.error('\n❌ Setup failed:', error);
  process.exit(1);
});
