'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Reads ?heroPreview=true from the URL and adds .hero-preview-mode
 * to <body>. This class (defined in globals.css) disables interactive
 * elements and hides nav/footer inside device preview iframes.
 */
export default function HeroPreviewDetector() {
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('heroPreview') === 'true';

  useEffect(() => {
    if (isPreview) {
      document.body.classList.add('hero-preview-mode');
    }
    return () => {
      document.body.classList.remove('hero-preview-mode');
    };
  }, [isPreview]);

  return null;
}
