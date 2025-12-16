const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgPath = path.join(__dirname, '../public/favicon.svg');
const outputDir = path.join(__dirname, '../public');

async function generateFavicons() {
  try {
    console.log('Generating favicon files from SVG...\n');
    const svgBuffer = fs.readFileSync(svgPath);

    // Generate 180x180 Apple Touch Icon
    console.log('✓ Generating apple-touch-icon.png (180x180)');
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));

    // Generate 32x32 favicon
    console.log('✓ Generating favicon-32x32.png');
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'favicon-32x32.png'));

    // Generate 16x16 favicon
    console.log('✓ Generating favicon-16x16.png');
    await sharp(svgBuffer)
      .resize(16, 16)
      .png()
      .toFile(path.join(outputDir, 'favicon-16x16.png'));

    // Generate ICO (32x32 PNG renamed)
    console.log('✓ Generating favicon.ico');
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'favicon.ico'));

    console.log('\n✅ All favicon files generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error.message);
    process.exit(1);
  }
}

generateFavicons();
