import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  getRetiredBlogDestination,
  listBlogPosts,
} from '@/lib/blog-content';

const APP = resolve(__dirname, '..');
const ROOT = resolve(APP, '..');

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = resolve(directory, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(?:ts|tsx|js|cjs)$/.test(entry) ? [path] : [];
  });
}

describe('retired content systems', () => {
  it('keeps chatbot, embeddings, changelog, CMS, media, and design tools absent', () => {
    const retiredPaths = [
      'app/admin/blog/page.tsx',
      'app/admin/blog/new/page.tsx',
      'app/admin/colors/page.tsx',
      'app/api/blog/route.ts',
      'app/api/blog/[slug]/route.ts',
      'app/api/chat/route.ts',
      'app/api/chatbot/health/route.ts',
      'app/api/changelog/route.ts',
      'app/api/cron/changelog/route.ts',
      'app/api/embeddings/index/route.ts',
      'app/api/media/route.ts',
      'components/chatbot/ChatbotWidget.tsx',
      'components/editor/RichTextEditor.tsx',
      'components/media/MediaLibrary.tsx',
      'lib/chatbot/index.ts',
      'lib/embedding-utils.ts',
      'lib/media-types.ts',
    ];

    for (const path of retiredPaths) {
      expect(existsSync(resolve(APP, path)), path).toBe(false);
    }
  });

  it('keeps retired database and route callers out of application source', () => {
    const sources = [
      ...sourceFiles(resolve(APP, 'app')),
      ...sourceFiles(resolve(APP, 'components')),
      ...sourceFiles(resolve(APP, 'lib')),
    ].map((path) => readFileSync(path, 'utf8')).join('\n');

    expect(sources).not.toMatch(/blog_posts|changelog_entries|page_embeddings|match_page_embeddings|media-library/);
    expect(sources).not.toMatch(/\/api\/(?:blog|chat|chatbot|changelog|embeddings|media)/);
    expect(sources).not.toMatch(/\/admin\/(?:blog|colors)/);

    const footer = readFileSync(resolve(APP, 'components/Footer.tsx'), 'utf8');
    expect(footer).toContain('href="/contact"');
    expect(footer).not.toMatch(/chatbot|open-chatbot/i);

    for (const config of ['vercel.json', '../vercel.json']) {
      expect(readFileSync(resolve(APP, config), 'utf8')).not.toContain('/api/cron/changelog');
    }
  });

  it('serves exactly nine versioned posts and preserves retirement destinations', () => {
    expect(listBlogPosts()).toHaveLength(9);
    expect(getRetiredBlogDestination('combat-medic-to-developer-skills-transfer')).toBe('/about');
    expect(getRetiredBlogDestination('custom-stripe-checkout-nextjs-server-actions')).toBe('/services');
    expect(getRetiredBlogDestination('jquery-shaped-modern-web')).toBe('/blog');
  });
});
