#!/usr/bin/env tsx

// ============================================================================
// Reset Home Page Content
// ============================================================================
// Deletes custom homepage content from database to fall back to defaults
// Run with: npx tsx scripts/reset-home-content.ts

import { getSupabaseAdmin } from '../app/lib/supabase';

async function resetHomeContent() {
  console.log('🔄 Resetting homepage content to defaults...');

  const supabase = getSupabaseAdmin();

  // Delete the custom content row
  const { error } = await supabase
    .from('page_content')
    .delete()
    .eq('page_slug', 'home');

  if (error) {
    console.error('❌ Error deleting content:', error);
    process.exit(1);
  }

  console.log('✅ Custom homepage content deleted');
  console.log('📝 Homepage will now use defaults from lib/default-page-content.ts');
  console.log('🔄 Restart dev server to clear cache, or redeploy to Vercel');
}

resetHomeContent();
