#!/usr/bin/env npx tsx
/**
 * E2E Blog Post Cleanup Script
 * ============================
 * Deletes blog posts created during E2E testing.
 *
 * What: Removes test data from the blog_posts table
 * Why: Keeps the database clean after running E2E tests
 * How: Uses Supabase admin client to bypass RLS and delete by author or title pattern
 *
 * Usage: npm run cleanup:e2e (from app/ directory)
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Load .env.local manually
// ============================================================================
// ESM hoisting makes dotenv tricky, so we load env vars manually

// Check root .env.local first, then app/.env.local
const possiblePaths = [
  join(process.cwd(), '..', '.env.local'), // root .env.local
  join(process.cwd(), '.env.local'), // app/.env.local (fallback)
];

let envPath: string | null = null;
for (const path of possiblePaths) {
  if (existsSync(path)) {
    envPath = path;
    break;
  }
}

if (!envPath) {
  console.error('Error: .env.local not found in:');
  possiblePaths.forEach((p) => console.error(`   - ${p}`));
  process.exit(1);
}

const envContent = readFileSync(envPath, 'utf-8');
const keysFound: string[] = [];
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) continue;
  const key = trimmed.slice(0, eqIndex);
  let value = trimmed.slice(eqIndex + 1);
  // Remove quotes if present
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  process.env[key] = value;
  if (key.includes('SUPABASE')) keysFound.push(key);
}
console.log(`Loaded env from: ${envPath}`);
console.log(
  `   Found SUPABASE keys: ${keysFound.length > 0 ? keysFound.join(', ') : 'NONE'}\n`
);

// ============================================================================
// Verify required env vars
// ============================================================================

console.log('E2E Blog Post Cleanup Script');
console.log('============================');
console.log(
  `NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Found' : 'Missing'}`
);
console.log(
  `SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'Missing'}\n`
);

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('Error: Cannot proceed without NEXT_PUBLIC_SUPABASE_URL');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Cannot proceed without SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// ============================================================================
// Create Supabase Admin Client
// ============================================================================
// Uses service role key to bypass RLS for admin operations

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================================================
// Cleanup E2E Blog Posts
// ============================================================================

async function main() {
  console.log('Starting cleanup...\n');

  // First, find all E2E posts to log what we're deleting
  const { data: postsToDelete, error: fetchError } = await supabaseAdmin
    .from('blog_posts')
    .select('id, slug, title, author_name, created_at')
    .or('author_name.eq.E2E Test Admin,title.ilike.%E2E Post%');

  if (fetchError) {
    console.error('Error fetching E2E posts:', fetchError.message);
    process.exit(1);
  }

  if (!postsToDelete || postsToDelete.length === 0) {
    console.log('No E2E blog posts found to delete.');
    console.log('============================');
    console.log('Done!');
    return;
  }

  // Log what we're about to delete
  console.log(`Found ${postsToDelete.length} E2E blog post(s) to delete:\n`);
  for (const post of postsToDelete) {
    console.log(`   - "${post.title}"`);
    console.log(`     Slug: ${post.slug}`);
    console.log(`     Author: ${post.author_name}`);
    console.log(`     Created: ${new Date(post.created_at).toLocaleString()}`);
    console.log('');
  }

  // Delete posts by author_name = 'E2E Test Admin'
  const { error: deleteByAuthorError, count: countByAuthor } = await supabaseAdmin
    .from('blog_posts')
    .delete({ count: 'exact' })
    .eq('author_name', 'E2E Test Admin');

  if (deleteByAuthorError) {
    console.error('Error deleting posts by author:', deleteByAuthorError.message);
  } else {
    console.log(`Deleted ${countByAuthor ?? 0} post(s) by author "E2E Test Admin"`);
  }

  // Delete posts with title containing 'E2E Post'
  const { error: deleteByTitleError, count: countByTitle } = await supabaseAdmin
    .from('blog_posts')
    .delete({ count: 'exact' })
    .ilike('title', '%E2E Post%');

  if (deleteByTitleError) {
    console.error('Error deleting posts by title:', deleteByTitleError.message);
  } else {
    console.log(`Deleted ${countByTitle ?? 0} post(s) with "E2E Post" in title`);
  }

  // Note: Some posts may be counted twice if they match both criteria
  // but Supabase handles this correctly (can't delete already-deleted rows)

  console.log('\n============================');
  console.log('Cleanup complete!');
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
