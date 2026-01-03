'use client';

import Link from 'next/link';
import { Editable } from '@/components/InlineEditor';
import { useInlineEdit } from '@/context/InlineEditContext';

// ============================================================================
// EditableLink - Wrapper for elements that are both links and editable
// ============================================================================
// What: Conditionally renders a Link or just the content based on edit mode
// Why: Links intercept clicks, preventing inline editing
// How: In edit mode, renders children with Editable wrapper; otherwise Link
//
// Usage:
// <EditableLink
//   href="/shop"
//   textPath="consultations.title"
//   hrefPath="consultations.linkHref"
//   className="..."
// >
//   {content.consultations.title}
// </EditableLink>

interface EditableLinkProps {
  /** The href for the link (used in non-edit mode) */
  href: string;
  /** The content path for inline text editing (e.g., "consultations.title") */
  textPath: string;
  /** Optional path for the href field (if href is also editable) */
  hrefPath?: string;
  /** CSS classes to apply to both Link and non-Link versions */
  className?: string;
  /** Additional Link-specific classes (only applied in non-edit mode) */
  linkClassName?: string;
  /** Children to render */
  children: React.ReactNode;
}

export default function EditableLink({
  href,
  textPath,
  hrefPath,
  className = '',
  linkClassName = '',
  children,
}: EditableLinkProps) {
  const { isEditMode } = useInlineEdit();

  if (isEditMode) {
    // In edit mode: render without Link, wrap in Editable
    return (
      <Editable path={textPath} hrefPath={hrefPath} href={hrefPath ? href : undefined}>
        <span className={className}>{children}</span>
      </Editable>
    );
  }

  // In non-edit mode: render with Link
  return (
    <Link href={href} className={`${className} ${linkClassName}`.trim()}>
      {children}
    </Link>
  );
}
