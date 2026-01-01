// ============================================================================
// Editable Routes Tests
// ============================================================================
// Tests for the route → slug mapping used by the inline editing system
// This enables automatic page detection based on URL pathname

import { describe, it, expect } from 'vitest';

// Import will fail until we create the module (TDD Red phase)
import { editableRoutes, getPageSlugFromPath } from '@/lib/editable-routes';

describe('editableRoutes', () => {
  // ============================================================================
  // Route Mapping Tests
  // ============================================================================

  it('should map / to home slug', () => {
    expect(editableRoutes['/']).toBe('home');
  });

  it('should map /services to services slug', () => {
    expect(editableRoutes['/services']).toBe('services');
  });

  it('should map /pricing to pricing slug', () => {
    expect(editableRoutes['/pricing']).toBe('pricing');
  });

  it('should map /faq to faq slug', () => {
    expect(editableRoutes['/faq']).toBe('faq');
  });

  it('should map /how-it-works to how-it-works slug', () => {
    expect(editableRoutes['/how-it-works']).toBe('how-it-works');
  });

  it('should return undefined for non-editable routes', () => {
    expect(editableRoutes['/shop']).toBeUndefined();
    expect(editableRoutes['/cart']).toBeUndefined();
    expect(editableRoutes['/admin']).toBeUndefined();
  });
});

describe('getPageSlugFromPath', () => {
  // ============================================================================
  // Helper Function Tests
  // ============================================================================

  it('should return slug for known paths', () => {
    expect(getPageSlugFromPath('/')).toBe('home');
    expect(getPageSlugFromPath('/services')).toBe('services');
    expect(getPageSlugFromPath('/pricing')).toBe('pricing');
  });

  it('should return null for unknown paths', () => {
    expect(getPageSlugFromPath('/shop')).toBeNull();
    expect(getPageSlugFromPath('/unknown-page')).toBeNull();
  });

  it('should handle paths with trailing slashes', () => {
    expect(getPageSlugFromPath('/services/')).toBe('services');
    expect(getPageSlugFromPath('/pricing/')).toBe('pricing');
  });

  it('should handle paths with query strings', () => {
    expect(getPageSlugFromPath('/services?tab=1')).toBe('services');
    expect(getPageSlugFromPath('/?ref=google')).toBe('home');
  });
});
