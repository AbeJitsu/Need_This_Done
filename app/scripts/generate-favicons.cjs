/**
 * Generate favicon PNG and ICO files from SVG
 * Run with: node scripts/generate-favicons.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgPath = path.join(__dirname, '../public/favicon.svg');
const outputDir = path.join(__dirname, '../public');

async function generateFavicons() {
  try {
    console.log('Generating favicon files from SVG...\n');

    // Read SVG file
    const svgBuffer = fs.readFileSync(svgPath);

    // Generate 180x180 Apple Touch Icon
    console.log('1. Generating apple-touch-icon.png (180x180)...');
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));
    console.log('   ✓ Created apple-touch-icon.png');

    // Generate 32x32 favicon
    console.log('2. Generating favicon-32x32.png...');
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'favicon-32x32.png'));
    console.log('   ✓ Created favicon-32x32.png');

    // Generate 16x16 favicon
    console.log('3. Generating favicon-16x16.png...');
    await sharp(svgBuffer)
      .resize(16, 16)
      .png()
      .toFile(path.join(outputDir, 'favicon-16x16.png'));
    console.log('   ✓ Created favicon-16x16.png');

    // For ICO, we'll create a 32x32 PNG and rename it
    // (ICO format requires special encoding, but most browsers accept PNG)
    console.log('4. Generating favicon.ico (32x32)...');
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'favicon.ico'));
    console.log('   ✓ Created favicon.ico');

    console.log('\n✅ All favicon files generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error.message);
    process.exit(1);
  }
}

generateFavicons();
