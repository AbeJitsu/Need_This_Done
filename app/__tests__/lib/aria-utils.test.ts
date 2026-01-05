import { describe, it, expect } from 'vitest';
import { getAriaSortValue } from '@/lib/aria-utils';

describe('getAriaSortValue', () => {
  it('should return undefined when field does not match current sort field', () => {
    expect(getAriaSortValue('email', 'name', 'asc')).toBeUndefined();
    expect(getAriaSortValue('email', 'role', 'desc')).toBeUndefined();
  });

  it('should return "ascending" when field matches and direction is asc', () => {
    expect(getAriaSortValue('email', 'email', 'asc')).toBe('ascending');
    expect(getAriaSortValue('role', 'role', 'asc')).toBe('ascending');
  });

  it('should return "descending" when field matches and direction is desc', () => {
    expect(getAriaSortValue('email', 'email', 'desc')).toBe('descending');
    expect(getAriaSortValue('status', 'status', 'desc')).toBe('descending');
  });

  it('should handle undefined sort direction gracefully', () => {
    expect(getAriaSortValue('email', 'email', undefined as any)).toBeUndefined();
  });
});