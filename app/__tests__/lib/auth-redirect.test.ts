import { describe, expect, it } from 'vitest';
import { safeAuthNextPath } from '@/lib/auth-redirect';

describe('safeAuthNextPath', () => {
  it('keeps relative application paths', () => {
    expect(safeAuthNextPath('/employee?tab=outcomes')).toBe('/employee?tab=outcomes');
  });

  it('rejects absolute and protocol-relative redirects', () => {
    expect(safeAuthNextPath('https://example.com')).toBe('/dashboard');
    expect(safeAuthNextPath('//example.com')).toBe('/dashboard');
  });

  it('defaults missing or malformed values to the dashboard', () => {
    expect(safeAuthNextPath(null)).toBe('/dashboard');
    expect(safeAuthNextPath('dashboard')).toBe('/dashboard');
  });
});
