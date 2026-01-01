#!/usr/bin/env npx tsx
/**
 * One-time migration script to move changelog JSON files to Supabase
 *
 * Run with: npx tsx scripts/migrate-changelog-to-db.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// ============================================================================
// Types
// ============================================================================

interface ChangelogChange {
  what: string;
  why: string;
  where: string;
}

interface ChangelogEntry {
  title: string;
  slug: string;
  date: string;
  category: string;
  description: string;
  benefit: string;
  changes?: ChangelogChange[];
  howToUse: string[];
  screenshots: Array<{ src: string; alt: string; caption?: string }>;
  // Internal fields (not migrated)
  _needsCompletion?: boolean;
  _gitContext?: string;
  _affectedRoutes?: string[];
}

// ============================================================================
// Setup
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================================
// Migration
// ============================================================================

async function migrateChangelogs() {
  console.log('📋 Migrating changelog entries to Supabase\n');

  const changelogDir = path.join(process.cwd(), '..', 'content', 'changelog');
  const files = fs.readdirSync(changelogDir).filter(f =>
    f.endsWith('.json') && f !== 'auto-log.json'
  );

  console.log(`Found ${files.length} changelog files to migrate\n`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const filePath = path.join(changelogDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    try {
      const entry: ChangelogEntry = JSON.parse(content);

      // Check if already exists
      const { data: existing } = await supabase
        .from('changelog_entries')
        .select('id')
        .eq('slug', entry.slug)
        .single();

      if (existing) {
        console.log(`  ⏭️  ${entry.slug} - already exists, skipping`);
        skipped++;
        continue;
      }

      // Insert into database
      const { error } = await supabase
        .from('changelog_entries')
        .insert({
          slug: entry.slug,
          title: entry.title,
          date: entry.date,
          category: entry.category,
          description: entry.description || '',
          benefit: entry.benefit || '',
          changes: entry.changes || [],
          how_to_use: entry.howToUse || [],
          screenshots: entry.screenshots || [],
          needs_completion: entry._needsCompletion || false,
          git_context: entry._gitContext || null,
          affected_routes: entry._affectedRoutes || [],
        });

      if (error) {
        console.error(`  ❌ ${entry.slug} - ${error.message}`);
        errors++;
      } else {
        console.log(`  ✅ ${entry.slug} - migrated`);
        migrated++;
      }
    } catch (err) {
      console.error(`  ❌ ${file} - failed to parse: ${err}`);
      errors++;
    }
  }

  console.log(`\n📊 Migration complete:`);
  console.log(`   ✅ Migrated: ${migrated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
}

// Run migration
migrateChangelogs().catch(console.error);
