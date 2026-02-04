#!/usr/bin/env node

// ============================================================================
// Vector Search Test Script
// ============================================================================
// What: Tests that indexed content is searchable
// Why: Verify vector embeddings are working before using chatbot
// How: Generate embedding for test query → call match function → show results
//
// Run: npx tsx scripts/test-vector-search.ts

import { createClient } from '@supabase/supabase-js';
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';

// ============================================================================
// Load Environment Variables
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey || !openaiApiKey) {
  console.error('❌ Missing environment variables');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY');
  process.exit(1);
}

// ============================================================================
// Test Vector Search
// ============================================================================

async function testVectorSearch() {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  console.log('\n🔎 Testing Vector Search\n');

  // Check if we have any indexed content
  console.log('1️⃣  Checking indexed content...');
  const { data: counts, error: countError } = await supabase
    .from('page_embeddings')
    .select('count')
    .limit(1);

  if (countError) {
    console.error('❌ Cannot access embeddings table:', countError.message);
    process.exit(1);
  }

  const { count } = counts?.[0] || {};
  if (!count || count === 0) {
    console.error('❌ No indexed content found');
    console.error('   Run indexing first: npx tsx scripts/index-all-pages.ts');
    process.exit(1);
  }

  console.log(`   ✓ Found ${count} indexed embeddings`);

  // Use a test query related to the business
  const testQuery = 'What services do you offer?';

  console.log(`\n2️⃣  Generating embedding for test query...`);
  console.log(`   Query: "${testQuery}"`);

  let queryEmbedding: number[];
  try {
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: testQuery,
    });
    queryEmbedding = embedding;
    console.log(`   ✓ Generated embedding (${embedding.length} dimensions)`);
  } catch (error) {
    console.error('❌ Failed to generate embedding:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  // Call the match_page_embeddings RPC function
  console.log(`\n3️⃣  Searching for matching pages...`);

  const threshold = parseFloat(process.env.VECTOR_SEARCH_SIMILARITY_THRESHOLD || '0.5');
  const maxResults = parseInt(process.env.VECTOR_SEARCH_MAX_RESULTS || '5');

  try {
    const { data: matches, error: matchError } = await supabase.rpc(
      'match_page_embeddings',
      {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: maxResults,
      }
    );

    if (matchError) {
      console.error('❌ Search failed:', matchError.message);
      console.error('   This function might not exist or might be misconfigured');
      process.exit(1);
    }

    if (!matches || matches.length === 0) {
      console.error(
        `❌ No matches found (threshold: ${threshold})`
      );
      console.error('   Try:');
      console.error('   1. Check that pages are properly indexed');
      console.error('   2. Lower VECTOR_SEARCH_SIMILARITY_THRESHOLD in .env.local');
      process.exit(1);
    }

    // Display results
    console.log(`\n   ✓ Found ${matches.length} matching pages\n`);
    console.log('Results (sorted by relevance):');
    console.log('─'.repeat(60));

    matches.forEach((match: any, idx: number) => {
      const pageUrl = match.page_url || 'unknown';
      const pageTitle = match.page_title || pageUrl;
      const similarity = ((match.similarity || 0) * 100).toFixed(1);
      const preview = (match.content_chunk || '')
        .substring(0, 80)
        .replace(/\n/g, ' ');

      console.log(`\n${idx + 1}. ${pageTitle} (${pageUrl})`);
      console.log(`   Similarity: ${similarity}%`);
      console.log(`   Preview: "${preview}..."`);
    });

    console.log('\n' + '─'.repeat(60));
    console.log('\n✅ Vector search is working!');
    console.log('\nNext steps:');
    console.log('  1. Start dev server: cd app && npm run dev');
    console.log('  2. Open browser: http://localhost:3000');
    console.log('  3. Click chatbot button and ask: "What do you offer?"');
    console.log('  4. Chatbot should respond with context from indexed pages');
    console.log('');
  } catch (error) {
    console.error('❌ Search failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testVectorSearch().catch((error) => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
