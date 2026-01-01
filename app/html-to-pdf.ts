#!/usr/bin/env npx tsx
// HTML to PDF Converter - High Quality with Clickable Links
import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

async function htmlToPdf(inputPath: string, outputPath?: string) {
  const absoluteInput = path.resolve(inputPath);

  if (!fs.existsSync(absoluteInput)) {
    console.error(`File not found: ${absoluteInput}`);
    process.exit(1);
  }

  const defaultOutput = absoluteInput.replace(/\.html$/, '.pdf');
  const absoluteOutput = outputPath ? path.resolve(outputPath) : defaultOutput;

  console.log(`Converting: ${absoluteInput}`);
  console.log(`Output: ${absoluteOutput}`);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`file://${absoluteInput}`, { waitUntil: 'networkidle' });

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

  const stats = fs.statSync(absoluteOutput);
  const fileSizeKB = (stats.size / 1024).toFixed(1);

  console.log(`\nPDF generated: ${absoluteOutput} (${fileSizeKB} KB)`);
  console.log(`Links are clickable.`);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: npx tsx html-to-pdf.ts <input.html> [output.pdf]');
  process.exit(1);
}
htmlToPdf(args[0], args[1]);
