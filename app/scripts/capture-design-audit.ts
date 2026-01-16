import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_PAGES = [
  { path: '/', name: 'homepage' },
  { path: '/services', name: 'services' },
  { path: '/pricing', name: 'pricing' },
  { path: '/how-it-works', name: 'how-it-works' },
  { path: '/about', name: 'about' },
  { path: '/faq', name: 'faq' },
  { path: '/contact', name: 'contact' },
  { path: '/blog', name: 'blog' },
  { path: '/privacy', name: 'privacy' },
  { path: '/terms', name: 'terms' },
  { path: '/get-started', name: 'get-started' },
  { path: '/build', name: 'build' },
  { path: '/shop', name: 'shop' },
];

const OUTPUT_DIR = path.join(__dirname, '../../design-audit-screenshots');

async function captureAllPages() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  console.log('Starting design audit screenshot capture...\n');

  for (const pageConfig of PUBLIC_PAGES) {
    const url = `http://localhost:3000${pageConfig.path}`;
    const filename = `${pageConfig.name}-full.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    try {
      console.log(`Capturing: ${pageConfig.name} (${url})`);

      await page.goto(url, { waitUntil: 'networkidle' });

      // Wait for any animations to settle
      await page.waitForTimeout(1000);

      // Capture full page screenshot
      await page.screenshot({
        path: filepath,
        fullPage: true,
      });

      console.log(`  ✓ Saved: ${filename}`);
    } catch (error) {
      console.error(`  ✗ Failed: ${pageConfig.name} - ${error}`);
    }
  }

  await browser.close();
  console.log('\nDone! Screenshots saved to:', OUTPUT_DIR);
}

captureAllPages().catch(console.error);
