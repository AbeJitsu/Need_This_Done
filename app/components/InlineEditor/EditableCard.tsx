'use client';

import Link from 'next/link';
import { useInlineEdit } from '@/context/InlineEditContext';

// ============================================================================
// EditableCard - Wrapper for card elements that are both links and editable
// ============================================================================
// What: Conditionally renders a Link wrapper or div based on edit mode
// Why: Link cards intercept clicks, preventing inline editing of card content
// How: In edit mode, renders as a div; otherwise wraps in Link
//
// Usage:
// <EditableCard href="/shop" className="...">
//   <Editable path="price"><span>{option.price}</span></Editable>
//   <Editable path="name"><span>{option.name}</span></Editable>
// </EditableCard>

interface EditableCardProps {
  /** The href for the link (used in non-edit mode) */
  href: string;
  /** CSS classes to apply to both Link and div versions */
  className?: string;
  /** Children to render */
  children: React.ReactNode;
}

export default function EditableCard({
  href,
  className = '',
  children,
}: EditableCardProps) {
  const { isEditMode } = useInlineEdit();

  if (isEditMode) {
    // In edit mode: render as div (no navigation)
    return (
      <div className={className}>
        {children}
      </div>
    );
  }

  // In non-edit mode: render with Link
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
