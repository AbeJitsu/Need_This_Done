/**
 * AI Website Reviewer — CLI Wrapper (V4)
 *
 * Thin CLI wrapper around the site-analyzer library. Handles:
 * - CLI argument parsing
 * - Console output formatting (progress + report)
 * - File output (review-output.txt)
 *
 * The actual analysis engine lives in app/lib/site-analyzer.ts.
 *
 * Usage: cd app && npx tsx scripts/prototype-site-review.ts https://needthisdone.com
 *        cd app && npx tsx scripts/prototype-site-review.ts https://needthisdone.com https://example.com
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import {
  analyzeSite,
  type TechnicalMetrics,
  type ScoreBreakdown,
  type SiteReport,
} from '../lib/site-analyzer';

// ============================================
// OUTPUT — separate report (deliverable) from progress (debug)
// ============================================

const reportLines: string[] = [];

/** Write to the report deliverable AND console */
function report(line: string = '') {
  console.log(line);
  reportLines.push(line);
}

/** Write to console only (status/debug — not in the deliverable) */
function progress(line: string = '') {
  console.log(line);
}

// ============================================
// DISPLAY RESULTS (console formatting)
// ============================================

function printSiteScorecard(allMetrics: TechnicalMetrics[], score: ScoreBreakdown) {
  const LINE = '─'.repeat(70);
  const homepage = allMetrics[0];

  report(`\n${LINE}`);
  report(`  SITE SCORE: ${score.total}/100 (${score.grade})`);
  report(`  ${allMetrics.length} pages crawled | ${homepage.https ? 'HTTPS ✓' : 'HTTPS ✗'}`);
  report(LINE);

  // Per-category score breakdown
  report();
  report('  Score Breakdown:');
  for (const cat of score.categories) {
    const bar = cat.earned === cat.possible ? '✓' : `${cat.earned}/${cat.possible}`;
    report(`    ${cat.name.padEnd(20)} ${bar.padStart(5)}  ${cat.note}`);
  }
  report();

  // Per-page summary table
  report('  PATH                      TITLE                                WORDS  H1  ALT');
  report('  ' + '─'.repeat(66));

  for (const m of allMetrics) {
    const path = new URL(m.url).pathname;
    const title = (m.title || 'NO TITLE').slice(0, 35);
    report(`  ${path.padEnd(26)} ${title.padEnd(37)} ${String(m.wordCount).padStart(5)}  ${String(m.h1Count).padStart(2)}  ${m.images.altCoverage}`);
  }

  report();

  // Site-wide meta coverage
  const pagesWithTitle = allMetrics.filter((m) => m.metaCompleteness.title).length;
  const pagesWithDesc = allMetrics.filter((m) => m.metaCompleteness.description).length;
  const pagesWithOg = allMetrics.filter((m) => m.metaCompleteness.ogTitle && m.metaCompleteness.ogImage).length;
  report(`  Meta Coverage:`);
  report(`    Title .............. ${pagesWithTitle}/${allMetrics.length} pages`);
  report(`    Description ........ ${pagesWithDesc}/${allMetrics.length} pages`);
  report(`    OG Tags ............ ${pagesWithOg}/${allMetrics.length} pages`);

  // Aggregate stats
  const totalWords = allMetrics.reduce((sum, m) => sum + m.wordCount, 0);
  const totalImages = allMetrics.reduce((sum, m) => sum + m.images.total, 0);
  const totalImagesWithAlt = allMetrics.reduce((sum, m) => sum + m.images.withAlt, 0);
  const totalSvgs = allMetrics.reduce((sum, m) => sum + m.images.svgCount, 0);
  const totalBgImages = allMetrics.reduce((sum, m) => sum + m.images.bgImageCount, 0);
  const totalPictures = allMetrics.reduce((sum, m) => sum + m.images.pictureCount, 0);
  const allCtas = [...new Set(allMetrics.flatMap((m) => m.ctas))];

  report();
  report(`  Totals:`);
  report(`    Total Words ........ ${totalWords}`);
  const imgParts = [`${totalImages} <img>`];
  if (totalSvgs > 0) imgParts.push(`${totalSvgs} SVG`);
  if (totalBgImages > 0) imgParts.push(`${totalBgImages} bg-image`);
  if (totalPictures > 0) imgParts.push(`${totalPictures} <picture>`);
  report(`    Visual Assets ...... ${imgParts.join(' | ')}${totalImages > 0 ? ` (${Math.round((totalImagesWithAlt / totalImages) * 100)}% <img> alt text)` : ''}`);
  report(`    Unique CTAs ........ ${allCtas.length}`);

  if (allCtas.length > 0) {
    allCtas.slice(0, 10).forEach((cta) => {
      report(`      → "${cta}"`);
    });
  }

  // Heading hierarchy issues across all pages
  const allGaps = allMetrics.flatMap((m) =>
    m.headingHierarchyGaps.map((gap) => `${new URL(m.url).pathname}: ${gap}`)
  );
  if (allGaps.length > 0) {
    report();
    report(`  Heading Hierarchy Issues:`);
    allGaps.forEach((gap) => report(`    ⚠ ${gap}`));
  }

  // Accessibility issues across all pages
  const a11yIssues: string[] = [];
  if (!allMetrics[0].accessibility.hasLangAttribute) {
    a11yIssues.push('Missing lang attribute on <html>');
  }
  if (!allMetrics[0].accessibility.hasSkipNav) {
    a11yIssues.push('No skip navigation link');
  }
  if (!allMetrics.some((m) => m.accessibility.landmarks.main > 0)) {
    a11yIssues.push('No <main> landmark');
  }
  if (!allMetrics.some((m) => m.accessibility.landmarks.nav > 0)) {
    a11yIssues.push('No <nav> landmark');
  }
  const totalUnlabeled = allMetrics.reduce((s, m) => s + m.accessibility.formLabels.unlabeled.length, 0);
  if (totalUnlabeled > 0) {
    a11yIssues.push(`${totalUnlabeled} form input(s) without labels`);
  }
  const totalEmpty = allMetrics.reduce((s, m) => s + m.accessibility.emptyInteractives.length, 0);
  if (totalEmpty > 0) {
    a11yIssues.push(`${totalEmpty} empty link(s)/button(s) (no text or aria-label)`);
  }
  const totalGenericLinks = allMetrics.reduce((s, m) => s + m.accessibility.genericLinkText.length, 0);
  if (totalGenericLinks > 0) {
    a11yIssues.push(`${totalGenericLinks} generic link text ("click here", "read more")`);
  }
  const totalPosTab = allMetrics.reduce((s, m) => s + m.accessibility.positiveTabindex, 0);
  if (totalPosTab > 0) {
    a11yIssues.push(`${totalPosTab} element(s) with positive tabindex (disrupts tab order)`);
  }
  const totalAutoplayMedia = allMetrics.reduce((s, m) => s + m.accessibility.autoplayMedia, 0);
  if (totalAutoplayMedia > 0) {
    a11yIssues.push(`${totalAutoplayMedia} auto-playing media without muted attribute`);
  }
  const totalMissingAuto = allMetrics.reduce((s, m) => s + m.accessibility.missingAutocomplete.length, 0);
  if (totalMissingAuto > 0) {
    a11yIssues.push(`${totalMissingAuto} personal data input(s) missing autocomplete`);
  }
  const totalEmptyAlt = allMetrics.reduce((s, m) => s + m.accessibility.altTextIssues.emptyAlt, 0);
  const totalLongAlt = allMetrics.reduce((s, m) => s + m.accessibility.altTextIssues.longAlt, 0);
  if (totalEmptyAlt > 0) {
    a11yIssues.push(`${totalEmptyAlt} content image(s) with empty alt text`);
  }
  if (totalLongAlt > 0) {
    a11yIssues.push(`${totalLongAlt} image(s) with alt text > 125 characters`);
  }

  if (a11yIssues.length > 0) {
    report();
    report(`  Accessibility Issues:`);
    a11yIssues.forEach((issue) => report(`    ⚠ ${issue}`));
  } else {
    report();
    report(`  Accessibility: No issues detected ✓`);
  }

  report(LINE);
}

// ============================================
// SITE REVIEW (CLI orchestration + formatting)
// ============================================

async function reviewSite(url: string) {
  report(`\n${'═'.repeat(70)}`);
  report(`  Reviewing: ${url}`);
  report(`${'═'.repeat(70)}`);

  // Run the analysis (library handles fetching, metrics, scoring, AI)
  const result: SiteReport = await analyzeSite(url, (msg) => {
    progress(`  ${msg}`);
  });

  // Executive summary
  const LINE = '─'.repeat(70);
  report(`\n${LINE}`);
  report(`  EXECUTIVE SUMMARY`);
  report(LINE);
  report();
  report(`  ${result.executiveSummary}`);
  report();

  // Scorecard display
  printSiteScorecard(result.metrics, {
    total: result.score,
    grade: result.grade,
    categories: result.categories,
  });

  // AI analysis
  report(`\n${LINE}`);
  report(`  AI SITE ANALYSIS`);
  report(LINE);
  report(result.aiAnalysis);
  report(LINE);
}

// ============================================
// MAIN
// ============================================

async function main() {
  // Validate environment
  if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY in app/.env.local');
    process.exit(1);
  }

  // Get URLs from CLI args
  const urls = process.argv.slice(2).filter((arg) => arg.startsWith('http'));

  if (urls.length === 0) {
    console.error('Usage: npx tsx scripts/prototype-site-review.ts <url> [url2] [url3]');
    console.error('Example: npx tsx scripts/prototype-site-review.ts https://needthisdone.com');
    process.exit(1);
  }

  const model = process.env.NEXT_PUBLIC_CHATBOT_MODEL || 'gpt-4.1-nano';
  report('═'.repeat(70));
  report('  AI Website Reviewer — V4');
  report(`  Model: ${model}`);
  report(`  Sites: ${urls.length}`);
  report(`  Time: ${new Date().toISOString()}`);
  report('═'.repeat(70));

  for (const url of urls) {
    try {
      await reviewSite(url);
    } catch (err) {
      report(`\n  ERROR reviewing ${url}: ${err instanceof Error ? err.message : err}`);
    }
  }

  report(`\n${'═'.repeat(70)}`);
  report('  Done.');
  report('═'.repeat(70));

  // Write report (clean deliverable) to file
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const outputPath = join(__dirname, 'review-output.txt');
  writeFileSync(outputPath, reportLines.join('\n'), 'utf-8');
  console.log(`\n  Report saved to: ${outputPath}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
