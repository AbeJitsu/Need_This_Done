// ============================================================================
// 404 Not Found Page
// ============================================================================
// What: Custom 404 error page with proper contrast and styling
// Why: Default Next.js 404 has poor contrast (light text on light background)
// How: Uses centralized colors from lib/colors.ts for WCAG AA compliance

import Link from 'next/link';
import { titleTextColors, bodyTextColors, accentColors } from '@/lib/colors';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className={`text-8xl font-bold ${titleTextColors.blue}`}>
        404
      </h1>
      <p className={`mt-4 text-xl ${bodyTextColors.gray}`}>
        This page could not be found.
      </p>
      <Link
        href="/"
        className={`mt-6 px-6 py-3 rounded-lg font-medium transition-colors
                   ${accentColors.blue.bg} ${accentColors.blue.text}
                   hover:bg-blue-200 dark:hover:bg-blue-800`}
      >
        Go back home
      </Link>
    </div>
  );
}
