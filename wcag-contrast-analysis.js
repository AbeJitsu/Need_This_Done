#!/usr/bin/env node

/**
 * WCAG AA Contrast Ratio Calculator
 *
 * This script calculates contrast ratios for color combinations used in the web application
 * and verifies compliance with WCAG AA standards.
 *
 * WCAG AA Requirements:
 * - Normal text: 4.5:1 minimum
 * - Large text (18px+ or 14px+ bold): 3:1 minimum
 * - UI components: 3:1 minimum
 */

// ============================================================================
// COLOR CONVERSION AND LUMINANCE CALCULATION
// ============================================================================

/**
 * Convert hex color to RGB values
 * @param {string} hex - Hex color code (e.g., "#ffffff")
 * @returns {object} RGB values {r, g, b}
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance of a color
 * Formula from WCAG 2.0: https://www.w3.org/TR/WCAG20-TECHS/G17.html
 * @param {object} rgb - RGB values {r, g, b}
 * @returns {number} Relative luminance (0-1)
 */
function getLuminance(rgb) {
  const { r, g, b } = rgb;

  // Normalize RGB values to 0-1 range
  const [rs, gs, bs] = [r, g, b].map(val => {
    const normalized = val / 255;
    // Apply gamma correction
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  // Calculate relative luminance using the formula
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * @param {string} color1 - Hex color code
 * @param {string} color2 - Hex color code
 * @returns {number} Contrast ratio
 */
function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);

  // Ensure L1 is the lighter color
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  // WCAG formula: (L1 + 0.05) / (L2 + 0.05)
  return (lighter + 0.05) / (darker + 0.05);
}

// ============================================================================
// WCAG COMPLIANCE CHECKING
// ============================================================================

/**
 * Check if a contrast ratio passes WCAG AA standards
 * @param {number} ratio - Contrast ratio
 * @param {string} usage - Type of usage ('normal', 'large', 'ui')
 * @returns {object} Compliance result
 */
function checkWCAGCompliance(ratio, usage = 'normal') {
  const requirements = {
    normal: 4.5,
    large: 3.0,
    ui: 3.0
  };

  const required = requirements[usage];
  const passes = ratio >= required;

  return {
    passes,
    ratio: ratio.toFixed(2),
    required: required.toFixed(1),
    usage
  };
}

// ============================================================================
// COLOR ALTERNATIVES GENERATOR
// ============================================================================

/**
 * Suggest darker or lighter alternatives for failing combinations
 * @param {string} foreground - Foreground color hex
 * @param {string} background - Background color hex
 * @param {number} targetRatio - Target contrast ratio
 * @returns {string} Suggestion for improvement
 */
function suggestAlternative(foreground, background, targetRatio) {
  const fgRgb = hexToRgb(foreground);
  const bgLum = getLuminance(hexToRgb(background));

  // Determine if we need to darken or lighten the foreground
  const fgLum = getLuminance(fgRgb);

  if (bgLum > 0.5) {
    // Light background - need darker foreground
    return `Consider using a darker shade (try reducing lightness by 10-20%)`;
  } else {
    // Dark background - need lighter foreground
    return `Consider using a lighter shade (try increasing lightness by 10-20%)`;
  }
}

// ============================================================================
// TEST COLOR COMBINATIONS
// ============================================================================

const lightModeTests = [
  { fg: '#171717', bg: '#ffffff', name: 'gray-900 on white', usage: 'normal', context: 'body text on backgrounds' },
  { fg: '#525252', bg: '#ffffff', name: 'gray-600 on white', usage: 'normal', context: 'secondary text' },
  { fg: '#0062c7', bg: '#ffffff', name: 'blue-600 on white', usage: 'normal', context: 'links and primary buttons' },
  { fg: '#16a34a', bg: '#ffffff', name: 'green-600 on white', usage: 'normal', context: 'success states' },
  { fg: '#dc2626', bg: '#ffffff', name: 'red-600 on white', usage: 'normal', context: 'error states' },
  { fg: '#ca8a04', bg: '#ffffff', name: 'yellow-600 on white', usage: 'normal', context: 'warning states' },
  { fg: '#171717', bg: '#f0f7ff', name: 'gray-900 on blue-50', usage: 'normal', context: 'feature cards' },
  { fg: '#0062c7', bg: '#f0f7ff', name: 'blue-600 on blue-50', usage: 'ui', context: 'colored card accents' }
];

const darkModeTests = [
  { fg: '#f3f4f6', bg: '#0f172a', name: 'gray-100 on slate-900', usage: 'normal', context: 'body text on dark background' },
  { fg: '#d1d5db', bg: '#0f172a', name: 'gray-300 on slate-900', usage: 'normal', context: 'secondary text' },
  { fg: '#3d9aff', bg: '#0f172a', name: 'blue-400 on slate-900', usage: 'normal', context: 'links in dark mode' },
  { fg: '#4ade80', bg: '#0f172a', name: 'green-400 on slate-900', usage: 'normal', context: 'success indicators' },
  { fg: '#f87171', bg: '#0f172a', name: 'red-400 on slate-900', usage: 'normal', context: 'error indicators' },
  { fg: '#facc15', bg: '#0f172a', name: 'yellow-400 on slate-900', usage: 'normal', context: 'warning indicators' },
  { fg: '#4ade80', bg: '#14532d33', name: 'green-400 on green-900/20', usage: 'ui', context: 'status badges', note: 'Approximated green-900/20 as #14532d33' },
  { fg: '#f87171', bg: '#7f1d1d33', name: 'red-400 on red-900/20', usage: 'ui', context: 'error badges', note: 'Approximated red-900/20 as #7f1d1d33' },
  { fg: '#facc15', bg: '#71370633', name: 'yellow-400 on yellow-900/20', usage: 'ui', context: 'warning badges', note: 'Approximated yellow-900/20 as #71370633' }
];

// ============================================================================
// ANALYSIS AND REPORTING
// ============================================================================

/**
 * Analyze all color combinations and generate report
 */
function analyzeColorCombinations() {
  console.log('='.repeat(80));
  console.log('WCAG AA CONTRAST RATIO ANALYSIS REPORT');
  console.log('='.repeat(80));
  console.log();

  const results = {
    lightMode: { passing: [], failing: [] },
    darkMode: { passing: [], failing: [] }
  };

  // Analyze Light Mode
  console.log('LIGHT MODE COMBINATIONS');
  console.log('-'.repeat(80));
  console.log();

  lightModeTests.forEach((test, index) => {
    const ratio = getContrastRatio(test.fg, test.bg);
    const compliance = checkWCAGCompliance(ratio, test.usage);

    const result = {
      ...test,
      ratio: parseFloat(compliance.ratio),
      passes: compliance.passes,
      required: parseFloat(compliance.required)
    };

    if (compliance.passes) {
      results.lightMode.passing.push(result);
    } else {
      results.lightMode.failing.push(result);
    }

    console.log(`${index + 1}. ${test.name}`);
    console.log(`   Context: ${test.context}`);
    console.log(`   Foreground: ${test.fg} | Background: ${test.bg}`);
    console.log(`   Contrast Ratio: ${compliance.ratio}:1`);
    console.log(`   Required: ${compliance.required}:1 (${test.usage} text)`);
    console.log(`   Status: ${compliance.passes ? '✓ PASS' : '✗ FAIL'}`);

    if (!compliance.passes) {
      console.log(`   ⚠ Suggestion: ${suggestAlternative(test.fg, test.bg, compliance.required)}`);
    }
    console.log();
  });

  // Analyze Dark Mode
  console.log('='.repeat(80));
  console.log('DARK MODE COMBINATIONS');
  console.log('-'.repeat(80));
  console.log();

  darkModeTests.forEach((test, index) => {
    // Handle transparency approximation for badge backgrounds
    let bgColor = test.bg;
    let actualRatio;

    if (test.bg.length > 7) {
      // Has alpha channel - approximate by blending with dark background
      console.log(`${index + 1}. ${test.name}`);
      console.log(`   Context: ${test.context}`);
      console.log(`   Note: ${test.note || 'Transparent background approximated'}`);
      console.log(`   Foreground: ${test.fg}`);
      console.log(`   Background: ${test.bg.substring(0, 7)} with transparency`);

      // For 20% opacity badges, approximate the resulting color
      // when layered over dark background #0f172a
      const baseColor = hexToRgb(test.bg.substring(0, 7));
      const darkBg = hexToRgb('#0f172a');
      const alpha = 0.2;

      const blendedR = Math.round(baseColor.r * alpha + darkBg.r * (1 - alpha));
      const blendedG = Math.round(baseColor.g * alpha + darkBg.g * (1 - alpha));
      const blendedB = Math.round(baseColor.b * alpha + darkBg.b * (1 - alpha));

      const blendedHex = '#' +
        blendedR.toString(16).padStart(2, '0') +
        blendedG.toString(16).padStart(2, '0') +
        blendedB.toString(16).padStart(2, '0');

      actualRatio = getContrastRatio(test.fg, blendedHex);
      console.log(`   Calculated blended background: ${blendedHex}`);
    } else {
      actualRatio = getContrastRatio(test.fg, test.bg);
      console.log(`${index + 1}. ${test.name}`);
      console.log(`   Context: ${test.context}`);
      console.log(`   Foreground: ${test.fg} | Background: ${test.bg}`);
    }

    const compliance = checkWCAGCompliance(actualRatio, test.usage);

    const result = {
      ...test,
      ratio: parseFloat(compliance.ratio),
      passes: compliance.passes,
      required: parseFloat(compliance.required)
    };

    if (compliance.passes) {
      results.darkMode.passing.push(result);
    } else {
      results.darkMode.failing.push(result);
    }

    console.log(`   Contrast Ratio: ${compliance.ratio}:1`);
    console.log(`   Required: ${compliance.required}:1 (${test.usage} text)`);
    console.log(`   Status: ${compliance.passes ? '✓ PASS' : '✗ FAIL'}`);

    if (!compliance.passes) {
      console.log(`   ⚠ Suggestion: ${suggestAlternative(test.fg, bgColor, compliance.required)}`);
    }
    console.log();
  });

  // Summary Report
  console.log('='.repeat(80));
  console.log('SUMMARY REPORT');
  console.log('='.repeat(80));
  console.log();

  const totalPassing = results.lightMode.passing.length + results.darkMode.passing.length;
  const totalFailing = results.lightMode.failing.length + results.darkMode.failing.length;
  const totalTests = totalPassing + totalFailing;

  console.log(`Total Combinations Tested: ${totalTests}`);
  console.log(`Passing: ${totalPassing} ✓`);
  console.log(`Failing: ${totalFailing} ✗`);
  console.log();

  console.log('Light Mode:');
  console.log(`  Passing: ${results.lightMode.passing.length}/${lightModeTests.length}`);
  console.log(`  Failing: ${results.lightMode.failing.length}/${lightModeTests.length}`);
  console.log();

  console.log('Dark Mode:');
  console.log(`  Passing: ${results.darkMode.passing.length}/${darkModeTests.length}`);
  console.log(`  Failing: ${results.darkMode.failing.length}/${darkModeTests.length}`);
  console.log();

  // List all passing combinations
  if (totalPassing > 0) {
    console.log('-'.repeat(80));
    console.log('ALL PASSING COMBINATIONS');
    console.log('-'.repeat(80));
    console.log();

    console.log('Light Mode:');
    results.lightMode.passing.forEach(test => {
      console.log(`  ✓ ${test.name} - ${test.ratio}:1 (${test.context})`);
    });
    console.log();

    console.log('Dark Mode:');
    results.darkMode.passing.forEach(test => {
      console.log(`  ✓ ${test.name} - ${test.ratio}:1 (${test.context})`);
    });
    console.log();
  }

  // List failing combinations with suggestions
  if (totalFailing > 0) {
    console.log('-'.repeat(80));
    console.log('FAILING COMBINATIONS & SUGGESTIONS');
    console.log('-'.repeat(80));
    console.log();

    if (results.lightMode.failing.length > 0) {
      console.log('Light Mode Failures:');
      results.lightMode.failing.forEach(test => {
        console.log(`  ✗ ${test.name}`);
        console.log(`    Ratio: ${test.ratio}:1 (needs ${test.required}:1)`);
        console.log(`    Context: ${test.context}`);
        console.log(`    Fix: ${suggestAlternative(test.fg, test.bg, test.required)}`);
        console.log();
      });
    }

    if (results.darkMode.failing.length > 0) {
      console.log('Dark Mode Failures:');
      results.darkMode.failing.forEach(test => {
        console.log(`  ✗ ${test.name}`);
        console.log(`    Ratio: ${test.ratio}:1 (needs ${test.required}:1)`);
        console.log(`    Context: ${test.context}`);
        console.log(`    Fix: ${suggestAlternative(test.fg, test.bg, test.required)}`);
        console.log();
      });
    }
  }

  // Overall compliance status
  console.log('='.repeat(80));
  console.log('OVERALL COMPLIANCE STATUS');
  console.log('='.repeat(80));
  console.log();

  if (totalFailing === 0) {
    console.log('✓✓✓ ALL COMBINATIONS PASS WCAG AA STANDARDS ✓✓✓');
    console.log();
    console.log('Your color palette is fully compliant with WCAG AA accessibility standards.');
  } else {
    console.log('✗✗✗ SOME COMBINATIONS FAIL WCAG AA STANDARDS ✗✗✗');
    console.log();
    console.log(`${totalFailing} combination(s) need attention to meet WCAG AA compliance.`);
    console.log('Please review the failing combinations and apply suggested fixes.');
  }

  console.log();
  console.log('='.repeat(80));
}

// Run the analysis
analyzeColorCombinations();
