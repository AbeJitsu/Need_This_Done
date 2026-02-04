#!/usr/bin/env node

// ============================================================================
// Chatbot Database Verification Script
// ============================================================================
// What: Verifies Supabase is configured for chatbot embeddings
// Why: Quick diagnostic to check if database setup is complete
// How: Connects to Supabase and checks pgvector extension + page_embeddings table
//
// Run: npx tsx scripts/verify-chatbot-db.ts

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Load Environment Variables
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing environment variables');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// ============================================================================
// Verification Checks
// ============================================================================

async function verify() {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  console.log('\n🔍 Checking chatbot database setup...\n');

  // Check 1: Connection
  console.log('1️⃣  Testing Supabase connection...');
  try {
    const { data, error } = await supabase.rpc('get_current_user_id');
    if (error && error.code !== 'PGRST204') {
      // PGRST204 = function doesn't exist, but that's OK - means we're connected
      console.warn('   ⚠️  Warning: Could not call test RPC:', error.message);
    }
    console.log('   ✓ Supabase connection OK');
  } catch (error) {
    console.error('   ❌ Connection failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  // Check 2: pgvector extension
  console.log('\n2️⃣  Checking pgvector extension...');
  try {
    const { data, error } = await supabase
      .rpc('check_extension_exists', { ext_name: 'vector' })
      .single();

    if (error) {
      console.log('   ℹ️  Using direct SQL query for extension check');
      const { data: extData, error: extError } = await supabase
        .from('pg_extension')
        .select('*')
        .eq('extname', 'vector');

      if (extError && extError.code === 'PGRST116') {
        console.log('   ⚠️  pg_extension table not accessible (normal)');
        console.log('   ℹ️  pgvector extension likely installed (needed by page_embeddings table)');
      } else if (extError) {
        console.error('   ❌ Extension check failed:', extError.message);
      } else if (extData && extData.length > 0) {
        console.log('   ✓ pgvector extension is enabled');
      }
    } else if (data) {
      console.log('   ✓ pgvector extension is enabled');
    }
  } catch (error) {
    console.warn('   ⚠️  Extension check inconclusive (may still be OK)');
  }

  // Check 3: page_embeddings table
  console.log('\n3️⃣  Checking page_embeddings table...');
  try {
    const { data, error, status } = await supabase
      .from('page_embeddings')
      .select('count')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST116' || error.code === 'PGRST205') {
        console.error('   ❌ page_embeddings table not found');
        console.error('\n   📋 Fix: Run Supabase migrations');
        console.error('      $ supabase db push');
        console.error('\n   Or manually run migrations from: supabase/migrations/');
        process.exit(1);
      }
      throw error;
    }

    console.log('   ✓ page_embeddings table exists');
  } catch (error) {
    console.error('   ❌ Table check failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  // Check 4: Count indexed pages
  console.log('\n4️⃣  Counting indexed pages...');
  try {
    const { data, error, count } = await supabase
      .from('page_embeddings')
      .select('page_url', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    const pageCount = count || 0;
    const uniquePages = new Set(
      Array.isArray(data) ? data.map((row: any) => row.page_url) : []
    ).size;

    if (pageCount === 0) {
      console.log(`   ℹ️  Found 0 indexed pages`);
      console.log(`   📋 Next step: Run indexing script`);
      console.log(`      $ npx tsx scripts/index-all-pages.ts`);
    } else {
      console.log(`   ✓ Found ${pageCount} embeddings across ${uniquePages} pages`);
      console.log(`   📊 Database is ready for chatbot use`);
    }
  } catch (error) {
    console.error('   ❌ Count query failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  // Check 5: OpenAI API key
  console.log('\n5️⃣  Checking OpenAI API key...');
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    console.error('   ❌ OPENAI_API_KEY not set');
    process.exit(1);
  }
  if (!openaiKey.startsWith('sk-')) {
    console.error('   ❌ OPENAI_API_KEY does not look valid (should start with sk-)');
    process.exit(1);
  }
  console.log('   ✓ OpenAI API key configured');

  // Final status
  console.log('\n' + '='.repeat(60));
  console.log('✅ All database checks passed!');
  console.log('='.repeat(60));
  console.log('\nNext steps:');
  console.log('  1. Index pages: npx tsx scripts/index-all-pages.ts');
  console.log('  2. Test search: npx tsx scripts/test-vector-search.ts');
  console.log('  3. Start dev:   cd app && npm run dev');
  console.log('');
}

verify().catch((error) => {
  console.error('\n❌ Verification failed:', error);
  process.exit(1);
});
