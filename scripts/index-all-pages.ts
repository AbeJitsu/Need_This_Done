#!/usr/bin/env node

// ============================================================================
// Bulk Page Indexing Script
// ============================================================================
// What: Indexes all public pages for chatbot semantic search
// Why: Chatbot needs page content indexed to answer questions with context
// How: Discover pages → fetch HTML → call /api/embeddings/index for each
//
// Run: npx tsx scripts/index-all-pages.ts
//
// This script:
// - Discovers all public pages using page-discovery utility
// - Fetches each page as HTML
// - Extracts clean text content
// - Calls the embedding API to index each page
// - Shows progress and error summary

import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';

// ============================================================================
// Import Page Discovery Utility
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DiscoveredPage {
  path: string;
  name: string;
  isAdmin: boolean;
  isPublic: boolean;
}

function discoverPublicPages(): DiscoveredPage[] {
  const appDir = path.join(__dirname, '../app/app');
  const pages: DiscoveredPage[] = [];

  function scanDirectory(dir: string, routePath: string = '') {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip special directories
        if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;
        if (entry.name === 'api') continue;

        // Skip dynamic routes
        if (entry.name.startsWith('[') && entry.name.includes(']')) continue;

        const newRoutePath = routePath + '/' + entry.name;
        scanDirectory(fullPath, newRoutePath);
      } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
        const route = routePath || '/';
        const name = routePath
          ? routePath
              .split('/')
              .filter(Boolean)
              .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
              .join(' ')
          : 'Home';

        const isPublic = !route.startsWith('/admin') && !route.startsWith('/dashboard');

        if (isPublic) {
          pages.push({
            path: route,
            name,
            isAdmin: false,
            isPublic: true,
          });
        }
      }
    }
  }

  scanDirectory(appDir);
  return pages.sort((a, b) => a.path.localeCompare(b.path));
}

// ============================================================================
// Text Extraction from HTML (Server-side version)
// ============================================================================

function extractTextFromHTML(html: string): string {
  // Remove script, style, noscript tags and their content
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Convert common HTML tags to readable format
  text = text.replace(/<h[1-6][^>]*>/gi, '\n\n');
  text = text.replace(/<h[1-6][^>]*>/gi, '');
  text = text.replace(/<\/h[1-6]>/gi, '\n');
  text = text.replace(/<p[^>]*>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<div[^>]*>/gi, '\n');
  text = text.replace(/<\/div>/gi, '\n');
  text = text.replace(/<li[^>]*>/gi, '\n• ');
  text = text.replace(/<\/li>/gi, '');
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Clean up whitespace
  text = text
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/gm, '')
    .trim();

  return text;
}

// ============================================================================
// Content Hashing
// ============================================================================

async function generateContentHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// ============================================================================
// Main Indexing Logic
// ============================================================================

async function indexAllPages() {
  // Load env vars
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!siteUrl || !serviceRoleKey) {
    console.error('❌ Missing environment variables');
    console.error('   Required: NEXT_PUBLIC_SITE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  if (!siteUrl.startsWith('http')) {
    console.error('❌ NEXT_PUBLIC_SITE_URL should be a full URL (http:// or https://)');
    process.exit(1);
  }

  // Discover pages
  console.log('\n🔍 Discovering pages...\n');
  const pages = discoverPublicPages();

  if (pages.length === 0) {
    console.error('❌ No pages found to index');
    process.exit(1);
  }

  console.log(`Found ${pages.length} public pages to index\n`);

  // Index each page
  let successCount = 0;
  let failCount = 0;
  const failedPages: { page: string; reason: string }[] = [];
  let totalChunks = 0;

  const startTime = Date.now();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const progress = `[${i + 1}/${pages.length}]`;

    try {
      // Fetch page HTML
      const pageUrl = `${siteUrl}${page.path}`;
      const response = await fetch(pageUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Indexing Bot) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 10000,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();

      // Extract text content
      const content = extractTextFromHTML(html);

      if (content.length < 50) {
        console.log(`${progress} 📄 ${page.path} - ⚠️  Content too short (${content.length} chars)`);
        failCount++;
        failedPages.push({ page: page.path, reason: 'Content too short' });
        continue;
      }

      // Generate content hash
      const contentHash = await generateContentHash(content);

      // Call indexing API
      const indexResponse = await fetch(`${siteUrl}/api/embeddings/index`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-supabase-auth': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          page_url: page.path,
          page_title: page.name,
          page_type: 'static',
          content,
          content_hash: contentHash,
          metadata: { indexed_at: new Date().toISOString() },
        }),
        timeout: 30000,
      });

      if (!indexResponse.ok) {
        const errorText = await indexResponse.text();
        throw new Error(`API returned ${indexResponse.status}: ${errorText.substring(0, 100)}`);
      }

      const result = await indexResponse.json();

      if (!result.success) {
        throw new Error(result.reason || result.error || 'Indexing failed');
      }

      const chunks = result.chunks_indexed || 0;
      totalChunks += chunks;

      console.log(`${progress} 📄 ${page.path} - ✓ (${chunks} chunks)`);
      successCount++;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.log(`${progress} 📄 ${page.path} - ❌ ${reason}`);
      failCount++;
      failedPages.push({ page: page.path, reason });
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n' + '='.repeat(60));
  console.log('📊 Indexing Complete');
  console.log('='.repeat(60));
  console.log(`✅ Indexed: ${successCount} pages`);
  console.log(`❌ Failed: ${failCount} pages`);
  console.log(`📦 Total chunks: ${totalChunks}`);
  console.log(`⏱️  Time: ${duration}s`);

  if (failedPages.length > 0) {
    console.log('\nFailed pages:');
    failedPages.forEach(({ page, reason }) => {
      console.log(`  • ${page}: ${reason}`);
    });
  }

  if (successCount === 0) {
    console.error('\n❌ No pages were indexed successfully');
    process.exit(1);
  }

  console.log('\n✅ Indexing successful!');
  console.log('Next: Test vector search with: npx tsx scripts/test-vector-search.ts');
  console.log('');
}

indexAllPages().catch((error) => {
  console.error('\n❌ Indexing failed:', error);
  process.exit(1);
});
