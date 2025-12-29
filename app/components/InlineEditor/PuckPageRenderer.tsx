'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Render } from '@measured/puck';
import { puckConfig } from '@/lib/puck-config';
import { useInlineEdit } from '@/context/InlineEditContext';
import { gradientColors } from '@/lib/colors';

// ============================================================================
// Puck Page Renderer - Client-side Puck rendering with inline edit support
// ============================================================================
// What: Renders a Puck page and registers it for inline editing
// Why: AdminEditBar needs to know which page is being viewed
// How: Sets pageSlug and pageData in context, renders Puck content

interface PuckPageRendererProps {
  slug: string;
  content: Record<string, unknown>;
}

interface PuckContentItem {
  type: string;
  props: Record<string, unknown>;
}

interface PuckContent {
  content: PuckContentItem[];
  root?: Record<string, unknown>;
}

export default function PuckPageRenderer({ slug, content }: PuckPageRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setPageSlug, setPageData, isEditMode, selectComponent } = useInlineEdit();

  useEffect(() => {
    // Set the page context when this page mounts
    setPageSlug(slug);
    setPageData(content);

    // Clear when unmounting (navigating away)
    return () => {
      setPageSlug(null);
      setPageData(null);
    };
  }, [slug, content, setPageSlug, setPageData]);

  // Handle clicks in edit mode to select components
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isEditMode) return;

    // Find the closest component container
    const target = e.target as HTMLElement;
    const componentContainer = target.closest('[data-puck-component]');

    if (componentContainer) {
      e.stopPropagation();
      const componentIndex = componentContainer.getAttribute('data-puck-component');
      const componentType = componentContainer.getAttribute('data-puck-type');

      if (componentIndex !== null && componentType) {
        const idx = parseInt(componentIndex, 10);
        const puckContent = content as unknown as PuckContent;
        const componentData = puckContent.content?.[idx];

        if (componentData) {
          selectComponent({
            path: `content.${idx}`,
            type: componentType,
            props: componentData.props || {},
          });
        }
      }
    }
  }, [isEditMode, content, selectComponent]);

  // Add data attributes to Puck components for click detection
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isEditMode) return;

    // Find direct children of the Puck root and add data attributes
    const puckRoot = container.querySelector('[data-puck-root]');
    if (!puckRoot) {
      // If no puck-root, try to find main content area
      const mainContent = container.querySelector('main');
      if (mainContent) {
        const children = mainContent.children;
        const puckContent = content as unknown as PuckContent;
        Array.from(children).forEach((child, index) => {
          if (index < (puckContent.content?.length || 0)) {
            const componentType = puckContent.content[index]?.type || 'Unknown';
            (child as HTMLElement).setAttribute('data-puck-component', String(index));
            (child as HTMLElement).setAttribute('data-puck-type', componentType);

            // Add visual styling for edit mode
            (child as HTMLElement).classList.add(
              'cursor-pointer',
              'transition-all',
              'duration-150',
              'hover:ring-2',
              'hover:ring-blue-300',
              'hover:ring-offset-2'
            );
          }
        });
      }
    }

    // Cleanup function to remove classes
    return () => {
      const mainContent = container.querySelector('main');
      if (mainContent) {
        Array.from(mainContent.children).forEach((child) => {
          (child as HTMLElement).classList.remove(
            'cursor-pointer',
            'transition-all',
            'duration-150',
            'hover:ring-2',
            'hover:ring-blue-300',
            'hover:ring-offset-2'
          );
        });
      }
    };
  }, [isEditMode, content]);

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={`min-h-screen ${gradientColors.pageBackground} ${isEditMode ? 'ring-2 ring-blue-400 ring-inset' : ''}`}
    >
      <main>
        <Render config={puckConfig} data={content} />
      </main>
    </div>
  );
}
