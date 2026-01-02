'use client';

import { useCallback, ReactNode, MouseEvent } from 'react';
import { useInlineEdit } from '@/context/InlineEditContext';

// ============================================================================
// Editable - Click to edit any content
// ============================================================================
// Wrap any element to make it editable:
//   <Editable path="hero.title"><h1>{title}</h1></Editable>
//
// In edit mode: Click → edit in place → click away = save
// Not in edit mode: Element renders normally, no edit behavior

interface EditableProps {
  /** JSON path to the field: "hero.title" or "services.cards.0.description" */
  path: string;
  /** The content to render (and make editable) */
  children: ReactNode;
  /** Optional: override the section key (defaults to first part of path) */
  sectionKey?: string;
  /** Optional: path to href field for links (e.g., "hero.buttons.0.href") */
  hrefPath?: string;
  /** Optional: current href value for links */
  href?: string;
}

export default function Editable({ path, children, sectionKey, hrefPath, href }: EditableProps) {
  const { isEditMode, startEditing } = useInlineEdit();

  const handleClick = useCallback((e: MouseEvent) => {
    if (!isEditMode) return;

    e.preventDefault();
    e.stopPropagation();

    // Find the content wrapper we added
    const target = e.currentTarget as HTMLElement;
    const contentWrapper = target.querySelector('[data-editable-content="true"]') as HTMLElement;

    // Get the actual child element inside the content wrapper
    const childElement = contentWrapper?.firstElementChild as HTMLElement;

    if (childElement) {
      // Parse path: "services.cards.0.title" → sectionKey="services", fieldPath="cards.0.title"
      const pathParts = path.split('.');
      const section = sectionKey || pathParts[0];
      const fieldPath = sectionKey ? path : pathParts.slice(1).join('.') || '_root';

      // Parse hrefPath if provided
      let hrefFieldPath: string | undefined;
      if (hrefPath) {
        const hrefParts = hrefPath.split('.');
        hrefFieldPath = sectionKey ? hrefPath : hrefParts.slice(1).join('.');
      }

      startEditing({
        element: childElement,
        sectionKey: section,
        fieldPath,
        fullPath: path,
        hrefFieldPath,
        originalHref: href,
      });
    }
  }, [isEditMode, path, sectionKey, hrefPath, href, startEditing]);

  // In edit mode: wrap with click handler and visual indicator
  if (isEditMode) {
    return (
      <div
        onClickCapture={handleClick}
        data-edit-path={path}
        className="relative cursor-pointer group"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick(e as unknown as MouseEvent);
          }
        }}
      >
        {/* Content wrapper - ref target for inline editing */}
        <span data-editable-content="true" className="contents">
          {children}
        </span>
        {/* Hover outline to show this is editable */}
        <div className="absolute inset-0 ring-2 ring-blue-400 ring-opacity-0 group-hover:ring-opacity-100 rounded pointer-events-none transition-opacity" />
      </div>
    );
  }

  // Not in edit mode: render children directly
  return <>{children}</>;
}
