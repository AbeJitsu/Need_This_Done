/**
 * Seed Blog Posts Script
 *
 * Seeds blog posts from individual markdown files in the blog-posts/ folder.
 * Run with: npx tsx scripts/seed-blog-posts.ts
 *
 * Markdown file format:
 * ---
 * slug: post-slug
 * title: Post Title
 * excerpt: Brief description
 * category: behind-the-scenes
 * tags:
 *   - tag1
 *   - tag2
 * status: published
 * source: original
 * author_name: Author Name
 * meta_title: SEO Title
 * meta_description: SEO Description
 * ---
 *
 * # Content starts here (markdown)
 *
 * Requires in .env.local:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * Uses Supabase admin client to bypass RLS.
 * Idempotent — skips posts that already exist (by slug).
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { createClient } from '@supabase/supabase-js';
import { readdirSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ============================================================================
// Blog Post Type Definition
// ============================================================================

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  category: string;
  status: 'published';
  source: 'original';
  author_name: string;
  meta_title: string;
  meta_description: string;
}

// ============================================================================
// Load Posts from Markdown Files
// ============================================================================

function parseFrontmatter(content: string): {
  metadata: Record<string, unknown>;
  content: string;
} {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error('Invalid frontmatter format');
  }

  const frontmatterStr = match[1];
  const markdownContent = match[2];

  // Parse simple YAML frontmatter
  const metadata: Record<string, unknown> = {};
  const lines = frontmatterStr.split('\n');

  let currentArray: string[] | null = null;
  let currentKey = '';

  for (const line of lines) {
    if (!line.trim()) continue;

    // Check if this is an array item
    if (line.startsWith('  - ')) {
      if (currentArray) {
        currentArray.push(line.substring(4).trim());
      }
      continue;
    }

    // Check if this is a key: value pair
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();

      // Start a new array
      if (value === '') {
        currentArray = [];
        metadata[key] = currentArray;
        currentKey = key;
      } else {
        currentArray = null;
        // Strip surrounding quotes from YAML values
        const unquoted = (value.startsWith('"') && value.endsWith('"')) ||
                         (value.startsWith("'") && value.endsWith("'"))
          ? value.slice(1, -1)
          : value;
        metadata[key] = unquoted;
      }
    }
  }

  return { metadata, content: markdownContent };
}

async function loadPostsFromFolder(): Promise<BlogPost[]> {
  const postsDir = resolve(__dirname, 'blog-posts');
  const files = readdirSync(postsDir).filter(f => f.endsWith('.md'));

  const posts: BlogPost[] = [];

  for (const file of files) {
    try {
      const filePath = resolve(postsDir, file);
      const fileContent = readFileSync(filePath, 'utf-8');
      const { metadata, content } = parseFrontmatter(fileContent);

      const post: BlogPost = {
        slug: metadata.slug as string,
        title: metadata.title as string,
        excerpt: metadata.excerpt as string,
        content,
        tags: (metadata.tags as string[]) || [],
        category: metadata.category as string,
        status: 'published',
        source: 'original',
        author_name: metadata.author_name as string,
        meta_title: metadata.meta_title as string,
        meta_description: metadata.meta_description as string,
      };

      posts.push(post);
    } catch (error) {
      console.error(`Failed to load ${file}:`, error);
    }
  }

  return posts.sort((a, b) => a.slug.localeCompare(b.slug));
}

// ============================================================================
// Seed Function
// ============================================================================

async function seed() {
  console.log('Loading blog posts from blog-posts/ folder...\n');

  const posts = await loadPostsFromFolder();

  console.log(`Found ${posts.length} posts. Seeding...\n`);

  for (const post of posts) {
    // Upsert: insert new posts or update existing ones
    const { error } = await supabase.from('blog_posts').upsert(
      {
        ...post,
        published_at: new Date().toISOString(),
      },
      { onConflict: 'slug' }
    );

    if (error) {
      console.error(`  ❌ Failed: "${post.title}" — ${error.message}`);
    } else {
      console.log(`  ✅ Upserted: "${post.title}"`);
    }
  }

  console.log('\n✅ Done.');
}

seed().catch(console.error);
