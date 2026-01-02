import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jobSearchDir = path.resolve(__dirname, '../../job-search');

async function generateResumePDF() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    deviceScaleFactor: 2, // Retina quality - good balance of quality vs file size
  });

  // Load the HTML file
  const htmlPath = path.resolve(jobSearchDir, 'resume-dev.html');
  const pdfPath = path.resolve(jobSearchDir, 'Resume_Abe_Reyes.pdf');

  console.log('HTML path:', htmlPath);
  console.log('PDF path:', pdfPath);

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });

  // Generate PDF with high quality settings
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true, // Include background colors/images
    margin: {
      top: '0.5in',
      bottom: '0.5in',
      left: '0.5in',
      right: '0.5in',
    },
    scale: 1,
  });

  await browser.close();
  console.log('PDF generated: job-search/Resume_Abe_Reyes.pdf');
}

generateResumePDF().catch(console.error);
