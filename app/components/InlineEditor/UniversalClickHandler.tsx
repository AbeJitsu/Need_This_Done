'use client';

import { useUniversalClick } from '@/hooks/useUniversalClick';

// ============================================================================
// Universal Click Handler - Enables click-anywhere-to-edit in edit mode
// ============================================================================
// What: Invisible component that handles global clicks for content editing
// Why: Makes any text on the page editable without needing wrappers
// How: Uses useUniversalClick hook which captures clicks and finds JSON paths

export default function UniversalClickHandler() {
  // The hook handles everything - listens for clicks in edit mode,
  // finds the JSON path for clicked text, and opens the sidebar
  useUniversalClick();

  // This component renders nothing - it just provides the click handler
  return null;
}
