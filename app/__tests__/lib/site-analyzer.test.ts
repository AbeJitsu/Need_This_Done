/**
 * Site Analyzer Tests
 *
 * Validates the cheerio-based analyzer works correctly:
 * - HTML metric extraction (titles, headings, links, images, accessibility)
 * - Visible content extraction
 * - Nav page discovery
 * - Scoring system
 * - End-to-end analysis of a real site (needthisdone.com)
 */

import { describe, it, expect } from 'vitest';
import {
  extractMetrics,
  extractVisibleContent,
  discoverNavPages,
  computeSiteScore,
  buildExecutiveSummary,
  fetchHTML,
} from '@/lib/site-analyzer';

// ============================================
// UNIT TESTS — Static HTML parsing
// ============================================

const SAMPLE_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Test Business — Professional Services</title>
  <meta name="description" content="We offer professional services for small businesses." />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta property="og:title" content="Test Business" />
  <meta property="og:description" content="Professional services" />
  <meta property="og:image" content="https://example.com/og.jpg" />
</head>
<body>
  <a href="#main" class="skip-nav">Skip to content</a>
  <header>
    <nav>
      <a href="/">Home</a>
      <a href="/services">Services</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
    </nav>
  </header>
  <main id="main">
    <h1>Welcome to Test Business</h1>
    <p>We help small businesses grow with professional services. Our team has over 10 years of experience delivering results that matter.</p>
    <h2>Our Services</h2>
    <p>We offer web design, SEO optimization, and marketing automation. Each service is tailored to your specific needs and budget.</p>
    <img src="/hero.jpg" alt="Team working together" />
    <img src="/logo.svg" alt="" />
    <img src="/product.jpg" />
    <h3>Web Design</h3>
    <p>Beautiful, responsive websites that convert visitors into customers. Starting from $500.</p>
    <a href="/contact">Book a Free Consultation</a>
    <button>Get Started Today</button>
    <a href="/services">Learn more</a>
    <form>
      <label for="name">Name</label>
      <input type="text" id="name" name="name" />
      <input type="email" name="email" placeholder="Email" />
      <textarea name="message"></textarea>
      <button type="submit">Contact Us</button>
    </form>
  </main>
  <footer>
    <a href="/privacy">Privacy</a>
    <a href="/terms">Terms</a>
  </footer>
</body>
</html>
`;

describe('extractMetrics', () => {
  const metrics = extractMetrics(SAMPLE_HTML, 'https://example.com/', 200);

  it('extracts title and meta description', () => {
    expect(metrics.title).toBe('Test Business — Professional Services');
    expect(metrics.metaDescription).toBe('We offer professional services for small businesses.');
  });

  it('detects viewport meta tag', () => {
    expect(metrics.hasViewportMeta).toBe(true);
  });

  it('extracts Open Graph meta tags', () => {
    expect(metrics.metaCompleteness.ogTitle).toBe(true);
    expect(metrics.metaCompleteness.ogDescription).toBe(true);
    expect(metrics.metaCompleteness.ogImage).toBe(true);
  });

  it('extracts headings with correct hierarchy', () => {
    expect(metrics.h1Count).toBe(1);
    expect(metrics.headings.length).toBeGreaterThanOrEqual(3);
    expect(metrics.headings[0]).toEqual({ tag: 'h1', text: 'Welcome to Test Business' });
    expect(metrics.headings[1]).toEqual({ tag: 'h2', text: 'Our Services' });
  });

  it('detects heading hierarchy gaps', () => {
    // h1 → h2 → h3 is valid, no gaps expected
    expect(metrics.headingHierarchyGaps).toHaveLength(0);
  });

  it('counts images and alt text coverage', () => {
    expect(metrics.images.total).toBe(3);
    expect(metrics.images.withAlt).toBe(1); // Only "Team working together" counts (non-empty)
    expect(metrics.images.withoutAlt).toBe(2); // empty alt and missing alt
  });

  it('counts internal and external links', () => {
    expect(metrics.links.internal).toBeGreaterThan(0);
    expect(metrics.links.total).toBeGreaterThan(0);
  });

  it('detects CTAs with action words', () => {
    expect(metrics.ctas).toContain('Book a Free Consultation');
    expect(metrics.ctas).toContain('Get Started Today');
  });

  it('counts word count from visible text', () => {
    expect(metrics.wordCount).toBeGreaterThan(30);
  });

  it('computes reading level', () => {
    expect(metrics.readingLevel).toMatch(/Grade \d+/);
  });

  it('detects HTTPS', () => {
    expect(metrics.https).toBe(true);
  });

  // Accessibility checks
  it('detects lang attribute', () => {
    expect(metrics.accessibility.hasLangAttribute).toBe(true);
    expect(metrics.accessibility.langValue).toBe('en');
  });

  it('detects skip navigation', () => {
    expect(metrics.accessibility.hasSkipNav).toBe(true);
  });

  it('detects landmarks', () => {
    expect(metrics.accessibility.landmarks.main).toBeGreaterThanOrEqual(1);
    expect(metrics.accessibility.landmarks.nav).toBeGreaterThanOrEqual(1);
    expect(metrics.accessibility.landmarks.header).toBeGreaterThanOrEqual(1);
    expect(metrics.accessibility.landmarks.footer).toBeGreaterThanOrEqual(1);
  });

  it('detects unlabeled form inputs', () => {
    // "name" input has a label, "email" and "message" don't
    expect(metrics.accessibility.formLabels.total).toBe(3);
    expect(metrics.accessibility.formLabels.labeled).toBeGreaterThanOrEqual(1);
    expect(metrics.accessibility.formLabels.unlabeled.length).toBeGreaterThanOrEqual(1);
  });

  it('detects generic link text', () => {
    // "Learn more" is generic
    expect(metrics.accessibility.genericLinkText.length).toBeGreaterThanOrEqual(1);
    expect(metrics.accessibility.genericLinkText[0]).toContain('Learn more');
  });

  it('detects empty alt text on content images', () => {
    // logo.svg has empty alt="" and src contains "logo" — flagged
    expect(metrics.accessibility.altTextIssues.emptyAlt).toBeGreaterThanOrEqual(1);
  });
});

describe('extractMetrics — missing meta tags', () => {
  const BARE_HTML = '<html><body><p>Hello</p></body></html>';
  const metrics = extractMetrics(BARE_HTML, 'http://example.com/', 200);

  it('returns null for missing title', () => {
    expect(metrics.title).toBeNull();
  });

  it('returns null for missing meta description', () => {
    expect(metrics.metaDescription).toBeNull();
  });

  it('detects missing lang attribute', () => {
    expect(metrics.accessibility.hasLangAttribute).toBe(false);
  });

  it('detects missing skip nav', () => {
    expect(metrics.accessibility.hasSkipNav).toBe(false);
  });

  it('detects HTTP (not HTTPS)', () => {
    expect(metrics.https).toBe(false);
  });
});

describe('extractVisibleContent', () => {
  it('extracts visible text without scripts/styles', () => {
    const html = `
      <html><body>
        <script>var x = 1;</script>
        <style>.hidden { display: none; }</style>
        <h1>Title</h1>
        <p>This is visible content.</p>
        <noscript>Enable JS</noscript>
      </body></html>
    `;
    const content = extractVisibleContent(html, 'https://example.com', 10000);
    expect(content).toContain('Title');
    expect(content).toContain('This is visible content');
    expect(content).not.toContain('var x = 1');
    expect(content).not.toContain('Enable JS');
  });

  it('respects maxChars limit', () => {
    const content = extractVisibleContent(SAMPLE_HTML, 'https://example.com', 50);
    expect(content.length).toBeLessThanOrEqual(50);
  });

  it('formats headings with tags', () => {
    const html = '<html><body><h2>Section Header</h2><p>Content here.</p></body></html>';
    const content = extractVisibleContent(html, 'https://example.com', 10000);
    expect(content).toContain('[H2] Section Header');
  });
});

describe('discoverNavPages', () => {
  it('discovers pages from nav links', () => {
    const html = `
      <html><body>
        <header>
          <nav>
            <a href="/">Home</a>
            <a href="/services">Services</a>
            <a href="/about">About</a>
            <a href="https://external.com">External</a>
            <a href="#section">Anchor</a>
            <a href="mailto:test@test.com">Email</a>
          </nav>
        </header>
      </body></html>
    `;
    const pages = discoverNavPages(html, 'https://example.com');

    expect(pages).toContain('https://example.com/');
    expect(pages).toContain('https://example.com/services');
    expect(pages).toContain('https://example.com/about');
    // Should NOT include external, anchor, or mailto links
    expect(pages.some(p => p.includes('external.com'))).toBe(false);
    expect(pages.some(p => p.includes('#section'))).toBe(false);
    expect(pages.some(p => p.includes('mailto:'))).toBe(false);
  });

  it('skips blacklisted paths', () => {
    const html = `
      <html><body>
        <nav>
          <a href="/cart">Cart</a>
          <a href="/login">Login</a>
          <a href="/services">Services</a>
        </nav>
      </body></html>
    `;
    const pages = discoverNavPages(html, 'https://example.com');

    expect(pages.some(p => p.includes('/cart'))).toBe(false);
    expect(pages.some(p => p.includes('/login'))).toBe(false);
    expect(pages.some(p => p.includes('/services'))).toBe(true);
  });

  it('deduplicates pages', () => {
    const html = `
      <html><body>
        <header><a href="/about">About</a></header>
        <nav><a href="/about">About Us</a></nav>
        <footer><a href="/about">About</a></footer>
      </body></html>
    `;
    const pages = discoverNavPages(html, 'https://example.com');
    const aboutPages = pages.filter(p => p.includes('/about'));
    expect(aboutPages.length).toBe(1);
  });
});

describe('computeSiteScore', () => {
  const metrics = extractMetrics(SAMPLE_HTML, 'https://example.com/', 200);
  const score = computeSiteScore([metrics]);

  it('produces a score between 0 and 100', () => {
    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
  });

  it('assigns a letter grade', () => {
    expect(['A', 'B', 'C', 'D', 'F']).toContain(score.grade);
  });

  it('has 10 scoring categories', () => {
    expect(score.categories).toHaveLength(10);
  });

  it('category scores do not exceed their possible values', () => {
    for (const cat of score.categories) {
      expect(cat.earned).toBeLessThanOrEqual(cat.possible);
      expect(cat.earned).toBeGreaterThanOrEqual(0);
    }
  });

  it('gives full HTTPS score for https URLs', () => {
    const httpsCat = score.categories.find(c => c.name === 'HTTPS');
    expect(httpsCat?.earned).toBe(5);
  });

  it('gives full meta tag score when title + description present', () => {
    const metaCat = score.categories.find(c => c.name === 'Meta Tags');
    expect(metaCat?.earned).toBe(10);
  });
});

describe('buildExecutiveSummary', () => {
  it('generates a non-empty summary', () => {
    const metrics = extractMetrics(SAMPLE_HTML, 'https://example.com/', 200);
    const score = computeSiteScore([metrics]);
    const summary = buildExecutiveSummary(score, [metrics]);

    expect(summary.length).toBeGreaterThan(50);
    expect(typeof summary).toBe('string');
  });
});

// ============================================
// INTEGRATION TEST — Real site analysis
// ============================================

describe('Live site analysis (needthisdone.com)', () => {
  it('fetches HTML from needthisdone.com', async () => {
    const { html, status } = await fetchHTML('https://needthisdone.com');
    expect(status).toBe(200);
    expect(html.length).toBeGreaterThan(1000);
    expect(html).toContain('<html');
  }, 15000);

  it('extracts metrics from needthisdone.com', async () => {
    const { html } = await fetchHTML('https://needthisdone.com');
    const metrics = extractMetrics(html, 'https://needthisdone.com/', 200);

    expect(metrics.title).toBeTruthy();
    expect(metrics.https).toBe(true);
    expect(metrics.wordCount).toBeGreaterThan(50);
    expect(metrics.h1Count).toBeGreaterThanOrEqual(1);
    expect(metrics.links.total).toBeGreaterThan(5);
  }, 15000);

  it('discovers nav pages from needthisdone.com', async () => {
    const { html } = await fetchHTML('https://needthisdone.com');
    const pages = discoverNavPages(html, 'https://needthisdone.com');

    expect(pages.length).toBeGreaterThanOrEqual(3);
    expect(pages[0]).toContain('needthisdone.com');
  }, 15000);

  it('computes a valid score for needthisdone.com', async () => {
    const { html } = await fetchHTML('https://needthisdone.com');
    const metrics = extractMetrics(html, 'https://needthisdone.com/', 200);
    const score = computeSiteScore([metrics]);

    expect(score.total).toBeGreaterThanOrEqual(30);
    expect(score.total).toBeLessThanOrEqual(100);
    expect(['A', 'B', 'C', 'D', 'F']).toContain(score.grade);
    expect(score.categories.length).toBe(10);
  }, 15000);
});
