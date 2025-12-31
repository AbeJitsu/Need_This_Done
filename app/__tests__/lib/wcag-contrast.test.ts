import {
  hexToRgb,
  relativeLuminance,
  contrastRatio,
  meetsWcagAA,
  meetsWcagAAA,
  findAccessibleShade,
} from '@/lib/wcag-contrast';

// ============================================================================
// WCAG Contrast Calculation Tests
// ============================================================================
// Tests for WCAG 2.1 contrast ratio calculations
// Reference: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html

describe('hexToRgb', () => {
  it('converts 6-digit hex to RGB', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('handles hex without #', () => {
    expect(hexToRgb('ffffff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('handles 3-digit hex', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 });
  });
});

describe('relativeLuminance', () => {
  it('returns 1 for white', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 2);
  });

  it('returns 0 for black', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 2);
  });

  it('returns correct luminance for gray', () => {
    // #777777 should be around 0.17
    const lum = relativeLuminance('#777777');
    expect(lum).toBeGreaterThan(0.1);
    expect(lum).toBeLessThan(0.3);
  });
});

describe('contrastRatio', () => {
  it('returns 21 for black on white', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 1);
  });

  it('returns 1 for same colors', () => {
    expect(contrastRatio('#ff0000', '#ff0000')).toBeCloseTo(1, 1);
  });

  it('is symmetric', () => {
    const ratio1 = contrastRatio('#ffffff', '#333333');
    const ratio2 = contrastRatio('#333333', '#ffffff');
    expect(ratio1).toBeCloseTo(ratio2, 2);
  });

  // Test our gold-500 color (#a36b00) against white
  it('calculates gold-500 vs white correctly', () => {
    const ratio = contrastRatio('#a36b00', '#ffffff');
    // Should be around 4.5:1 (our WCAG AA target)
    expect(ratio).toBeGreaterThan(4.4);
    expect(ratio).toBeLessThan(4.6);
  });
});

describe('meetsWcagAA', () => {
  it('returns true for sufficient contrast (4.5:1)', () => {
    expect(meetsWcagAA('#000000', '#ffffff')).toBe(true);
    expect(meetsWcagAA('#a36b00', '#ffffff')).toBe(true); // gold-500
  });

  it('returns false for insufficient contrast', () => {
    expect(meetsWcagAA('#cccccc', '#ffffff')).toBe(false);
    expect(meetsWcagAA('#999999', '#ffffff')).toBe(false);
  });

  it('uses 3:1 threshold for large text', () => {
    // #949494 has ~3.0:1 contrast with white (passes large text, fails normal)
    expect(meetsWcagAA('#949494', '#ffffff', { largeText: true })).toBe(true);
    expect(meetsWcagAA('#949494', '#ffffff', { largeText: false })).toBe(false);
  });
});

describe('meetsWcagAAA', () => {
  it('returns true for 7:1 contrast', () => {
    expect(meetsWcagAAA('#000000', '#ffffff')).toBe(true);
    expect(meetsWcagAAA('#1a1a1a', '#ffffff')).toBe(true);
  });

  it('returns false for contrast below 7:1', () => {
    // #666666 has ~5.7:1 contrast with white (below AAA 7:1)
    expect(meetsWcagAAA('#666666', '#ffffff')).toBe(false);
  });
});

describe('findAccessibleShade', () => {
  it('finds a darker shade that meets 4.5:1 with white', () => {
    const result = findAccessibleShade('#ffd700', '#ffffff', 4.5); // Gold that's too light
    expect(result).not.toBeNull();
    if (result) {
      const ratio = contrastRatio(result, '#ffffff');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('finds a lighter shade that meets 4.5:1 with black', () => {
    const result = findAccessibleShade('#333333', '#000000', 4.5); // Dark gray
    expect(result).not.toBeNull();
    if (result) {
      const ratio = contrastRatio(result, '#000000');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('returns original color if already accessible', () => {
    const result = findAccessibleShade('#a36b00', '#ffffff', 4.5); // Already meets AA
    expect(result).toBe('#a36b00');
  });
});
