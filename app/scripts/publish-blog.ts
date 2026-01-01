#!/usr/bin/env npx tsx
// ============================================================================
// Blog Publishing Script - Direct Database Insert
// ============================================================================
// Publishes blog posts directly to Supabase using the service role key.
// Bypasses API auth for local development convenience.
//
// Usage:
//   cd app && npx tsx scripts/publish-blog.ts ../blog-drafts/your-post.md
//   cd app && npx tsx scripts/publish-blog.ts ../blog-drafts/your-post.md --publish
//
// The markdown file should have this format at the top:
//   # Title Here
//   **Slug:** your-slug-here
//   **Category:** category-name
//   **Tags:** tag1, tag2, tag3
//   **Status:** draft (or published)
//   ---
//   Content starts here...

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

interface BlogPostData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string | null;
  tags: string[];
  status: 'draft' | 'published';
  author_name: string;
}

function parseMarkdownFile(filePath: string): BlogPostData {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  const lines = content.split('\n');

  // Parse metadata from the top of the file
  let title = '';
  let slug = '';
  let category: string | null = null;
  let tags: string[] = [];
  let status: 'draft' | 'published' = 'draft';
  let contentStartIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Title from # heading
    if (line.startsWith('# ')) {
      title = line.substring(2).trim();
      continue;
    }

    // Metadata fields
    if (line.startsWith('**Slug:**')) {
      slug = line.replace('**Slug:**', '').trim();
      continue;
    }
    if (line.startsWith('**Category:**')) {
      category = line.replace('**Category:**', '').trim() || null;
      continue;
    }
    if (line.startsWith('**Tags:**')) {
      const tagString = line.replace('**Tags:**', '').trim();
      tags = tagString.split(',').map(t => t.trim()).filter(t => t);
      continue;
    }
    if (line.startsWith('**Status:**')) {
      const statusValue = line.replace('**Status:**', '').trim().toLowerCase();
      status = statusValue === 'published' ? 'published' : 'draft';
      continue;
    }

    // Content starts after the --- separator
    if (line === '---') {
      // Skip the next line if it's "## The Post"
      const nextLine = lines[i + 1]?.trim();
      if (nextLine === '## The Post') {
        contentStartIndex = i + 3; // Skip ---, ## The Post, and blank line
      } else {
        contentStartIndex = i + 2; // Skip --- and blank line
      }
      break;
    }
  }

  // Extract the actual content
  const blogContent = lines.slice(contentStartIndex).join('\n').trim();

  // Generate excerpt from first paragraph
  const firstParagraph = blogContent.split('\n\n')[0].replace(/[#*`]/g, '').trim();
  const excerpt = firstParagraph.length > 200
    ? firstParagraph.substring(0, 197) + '...'
    : firstParagraph;

  // Generate slug from title if not provided
  if (!slug && title) {
    slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  return {
    title,
    slug,
    content: blogContent,
    excerpt,
    category,
    tags,
    status,
    author_name: 'Abe Reyes',
  };
}

async function publishBlogPost(data: BlogPostData, forcePublish: boolean): Promise<void> {
  // Override status if --publish flag is used
  if (forcePublish) {
    data.status = 'published';
  }

  console.log('\nParsed blog post:');
  console.log(`  Title: ${data.title}`);
  console.log(`  Slug: ${data.slug}`);
  console.log(`  Category: ${data.category || '(none)'}`);
  console.log(`  Tags: ${data.tags.join(', ') || '(none)'}`);
  console.log(`  Status: ${data.status}`);
  console.log(`  Excerpt: ${data.excerpt.substring(0, 80)}...`);
  console.log(`  Content length: ${data.content.length} chars`);

  // Check if slug already exists
  const { data: existing } = await supabase
    .from('blog_posts')
    .select('id, slug')
    .eq('slug', data.slug)
    .single();

  if (existing) {
    console.log(`\nUpdating existing post with slug: ${data.slug}`);

    const { error } = await supabase
      .from('blog_posts')
      .update({
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        category: data.category,
        tags: data.tags,
        status: data.status,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', data.slug);

    if (error) {
      console.error('Update failed:', error);
      process.exit(1);
    }

    console.log('Post updated successfully!');
  } else {
    console.log(`\nCreating new post with slug: ${data.slug}`);

    const { error } = await supabase
      .from('blog_posts')
      .insert({
        ...data,
        source: 'original',
      });

    if (error) {
      console.error('Insert failed:', error);
      process.exit(1);
    }

    console.log('Post created successfully!');
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  console.log(`\nView at: ${baseUrl}/blog/${data.slug}`);

  if (data.status === 'draft') {
    console.log('(Currently a draft - use --publish to publish immediately)');
  }
}

// Main execution
const args = process.argv.slice(2);
const filePath = args.find(arg => !arg.startsWith('--'));
const forcePublish = args.includes('--publish');

if (!filePath) {
  console.log('Usage: npx tsx scripts/publish-blog.ts <path-to-markdown-file> [--publish]');
  console.log('\nExample:');
  console.log('  npx tsx scripts/publish-blog.ts ../blog-drafts/my-post.md');
  console.log('  npx tsx scripts/publish-blog.ts ../blog-drafts/my-post.md --publish');
  process.exit(1);
}

const postData = parseMarkdownFile(filePath);
publishBlogPost(postData, forcePublish);
