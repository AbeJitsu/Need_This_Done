// ============================================================================
// useEditableContent Hook Tests
// ============================================================================
// Tests for the hook that consolidates page content initialization
// Replaces 15+ lines of boilerplate with a single hook call
//
// NOTE: These tests are temporarily skipped due to jsdom/webidl-conversions
// compatibility issues with Node.js 18. The hook is tested via E2E tests.
// TODO: Re-enable once dependency issues are resolved.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';

// These will fail until implemented (TDD Red phase)
import { useEditableContent } from '@/hooks/useEditableContent';
import { InlineEditProvider } from '@/context/InlineEditContext';

// Mock content types for testing
interface TestPageContent {
  title: string;
  description: string;
  items?: string[];
}

const defaultTestContent: TestPageContent = {
  title: 'Default Title',
  description: 'Default Description',
  items: ['item1', 'item2'],
};

const partialContent: Partial<TestPageContent> = {
  title: 'Custom Title',
  // description intentionally missing - should use default
};

// Wrapper component that provides the InlineEditContext
function Wrapper({ children }: { children: ReactNode }) {
  return <InlineEditProvider>{children}</InlineEditProvider>;
}

describe('useEditableContent', () => {
  // ============================================================================
  // Basic Functionality
  // ============================================================================

  it('should return content when called with initial content', () => {
    const { result } = renderHook(
      () => useEditableContent<TestPageContent>('test-page', defaultTestContent),
      { wrapper: Wrapper }
    );

    expect(result.current.content).toEqual(defaultTestContent);
  });

  it('should set pageSlug in context', () => {
    const { result } = renderHook(
      () => useEditableContent<TestPageContent>('test-page', defaultTestContent),
      { wrapper: Wrapper }
    );

    expect(result.current.pageSlug).toBe('test-page');
  });

  // ============================================================================
  // Content Merging with Defaults
  // ============================================================================

  it('should merge partial content with defaults', () => {
    const { result } = renderHook(
      () => useEditableContent<TestPageContent>(
        'test-page',
        partialContent as TestPageContent,
        defaultTestContent
      ),
      { wrapper: Wrapper }
    );

    // Should have custom title from partialContent
    expect(result.current.content.title).toBe('Custom Title');
    // Should have default description since it was missing
    expect(result.current.content.description).toBe('Default Description');
    // Should have default items
    expect(result.current.content.items).toEqual(['item1', 'item2']);
  });

  // ============================================================================
  // Memoization (prevents infinite re-renders)
  // ============================================================================

  it('should not cause infinite re-renders', () => {
    let renderCount = 0;

    const { result, rerender } = renderHook(
      () => {
        renderCount++;
        return useEditableContent<TestPageContent>('test-page', defaultTestContent);
      },
      { wrapper: Wrapper }
    );

    // Initial render
    expect(renderCount).toBe(1);

    // Rerender with same props should not cause additional renders
    rerender();

    // Should be at most 2 renders (initial + rerender), not infinite
    expect(renderCount).toBeLessThanOrEqual(3);
  });

  it('should memoize content to prevent object recreation', () => {
    const { result, rerender } = renderHook(
      () => useEditableContent<TestPageContent>('test-page', defaultTestContent),
      { wrapper: Wrapper }
    );

    const firstContent = result.current.content;

    rerender();

    const secondContent = result.current.content;

    // Content reference should be stable if nothing changed
    expect(firstContent).toBe(secondContent);
  });

  // ============================================================================
  // Pending Edits Integration
  // ============================================================================

  it('should return updated content when edits are pending', async () => {
    const { result } = renderHook(
      () => useEditableContent<TestPageContent>('test-page', defaultTestContent),
      { wrapper: Wrapper }
    );

    // Initially should have default content
    expect(result.current.content.title).toBe('Default Title');

    // Simulate an edit via the updateField function
    await act(async () => {
      result.current.updateField('title', 'Edited Title');
    });

    // Should now have the edited value
    expect(result.current.content.title).toBe('Edited Title');
  });

  // ============================================================================
  // Multiple Pages
  // ============================================================================

  it('should handle different page slugs', () => {
    const { result: result1 } = renderHook(
      () => useEditableContent<TestPageContent>('page-one', { ...defaultTestContent, title: 'Page One' }),
      { wrapper: Wrapper }
    );

    expect(result1.current.pageSlug).toBe('page-one');
    expect(result1.current.content.title).toBe('Page One');
  });
});

describe('useEditableContent - Error Handling', () => {
  it('should throw if used outside InlineEditProvider', () => {
    // Attempting to use the hook without a provider should throw
    expect(() => {
      renderHook(() => useEditableContent<TestPageContent>('test', defaultTestContent));
    }).toThrow('useInlineEdit must be used within an InlineEditProvider');
  });
});
