'use client';

import LegalPageClient from '@/components/legal/LegalPageClient';
import type { PrivacyPageContent } from '@/lib/page-content-types';

interface PrivacyPageClientProps {
  initialContent: PrivacyPageContent;
}

/** Compatibility wrapper for the existing /privacy route and content shape. */
export default function PrivacyPageClient({ initialContent }: PrivacyPageClientProps) {
  return <LegalPageClient document="privacy" initialContent={initialContent} />;
}
