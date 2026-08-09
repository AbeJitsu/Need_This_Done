'use client';

import LegalPageClient from '@/components/legal/LegalPageClient';
import type { TermsPageContent } from '@/lib/page-content-types';

interface TermsPageClientProps {
  initialContent: TermsPageContent;
}

/** Compatibility wrapper for the existing /terms route and content shape. */
export default function TermsPageClient({ initialContent }: TermsPageClientProps) {
  return <LegalPageClient document="terms" initialContent={initialContent} />;
}
