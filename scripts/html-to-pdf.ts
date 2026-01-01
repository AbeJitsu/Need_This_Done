#!/usr/bin/env npx tsx
// ============================================================================
// HTML to PDF Converter - High Quality with Clickable Links
// ============================================================================
// Uses Playwright to generate a high-quality PDF from HTML with working hyperlinks.
//
// Usage:
//   cd app && npx tsx ../scripts/html-to-pdf.ts ../resume-dev.html
//   cd app && npx tsx ../scripts/html-to-pdf.ts ../resume-dev.html ../resume.pdf

import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

async function htmlToPdf(inputPath: string, outputPath?: string) {
  const absoluteInput = path.resolve(inputPath);

  if (!fs.existsSync(absoluteInput)) {
    console.error(`File not found: ${absoluteInput}`);
    process.exit(1);
  }

  // Default output name based on input
  const defaultOutput = absoluteInput.replace(/\.html$/, '.pdf');
  const absoluteOutput = outputPath ? path.resolve(outputPath) : defaultOutput;

  console.log(`Converting: ${absoluteInput}`);
  console.log(`Output: ${absoluteOutput}`);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Load the HTML file
  await page.goto(`file://${absoluteInput}`, { waitUntil: 'networkidle' });

  // Generate high-quality PDF
  // - scale: 1 keeps text crisp
  // - printBackground: includes section backgrounds
  // - format: Letter (8.5x11) for US resumes
  // - Links are preserved automatically by Playwright
  await page.pdf({
    path: absoluteOutput,
    format: 'Letter',
    printBackground: true,
    margin: {
      top: '0.25in',
      right: '0.25in',
      bottom: '0.25in',
      left: '0.25in',
    },
    scale: 1,
    preferCSSPageSize: false,
  });

  await browser.close();

  // Get file size for confirmation
  const stats = fs.statSync(absoluteOutput);
  const fileSizeKB = (stats.size / 1024).toFixed(1);

  console.log(`\nPDF generated successfully!`);
  console.log(`  Size: ${fileSizeKB} KB`);
  console.log(`  Location: ${absoluteOutput}`);
  console.log(`\nLinks in the PDF are clickable.`);
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: cd app && npx tsx ../scripts/html-to-pdf.ts <input.html> [output.pdf]');
  console.log('\nExample:');
  console.log('  cd app && npx tsx ../scripts/html-to-pdf.ts ../resume-dev.html');
  console.log('  cd app && npx tsx ../scripts/html-to-pdf.ts ../resume-dev.html ../resume.pdf');
  process.exit(1);
}

htmlToPdf(args[0], args[1]);
