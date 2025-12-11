#!/usr/bin/env tsx

import { getSupabaseAdmin } from '../app/lib/supabase';

async function checkHomeContent() {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('page_content')
    .select('*')
    .eq('page_slug', 'home');

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('✅ No custom content in database - should use defaults');
  } else {
    console.log('❌ Custom content still exists:');
    console.log(JSON.stringify(data[0].content.hero, null, 2));
  }
}

checkHomeContent();
