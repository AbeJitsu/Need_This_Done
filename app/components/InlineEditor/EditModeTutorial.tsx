'use client';

import { useState, useEffect } from 'react';
import { useInlineEdit } from '@/context/InlineEditContext';
import { headingColors, formInputColors } from '@/lib/colors';

// ============================================================================
// Edit Mode Tutorial - Shows instructions when entering edit mode
// ============================================================================
// What: Overlay with instructions for using edit mode
// Why: Helps users discover drag-and-drop and click-to-edit features
// How: Shows on first edit mode activation, can be dismissed

const TUTORIAL_DISMISSED_KEY = 'edit-mode-tutorial-dismissed';

export default function EditModeTutorial() {
  const { isEditMode } = useInlineEdit();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (!isEditMode) {
      setShowTutorial(false);
      return;
    }

    // Check if tutorial was already dismissed
    const dismissed = localStorage.getItem(TUTORIAL_DISMISSED_KEY);
    if (!dismissed) {
      setShowTutorial(true);
    }
  }, [isEditMode]);

  const dismiss = () => {
    setShowTutorial(false);
    localStorage.setItem(TUTORIAL_DISMISSED_KEY, 'true');
  };

  const dismissForNow = () => {
    setShowTutorial(false);
  };

  if (!showTutorial) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-500 text-white px-6 py-4">
          <h2 className="text-xl font-bold">Welcome to Edit Mode!</h2>
          <p className="text-blue-100 text-sm mt-1">Here's how to edit your page</p>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          {/* Click to Edit */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-xl">👆</span>
            </div>
            <div>
              <h3 className={`font-semibold ${headingColors.primary}`}>Click to Edit</h3>
              <p className={`text-sm ${formInputColors.helper}`}>
                Click any section to open the editor sidebar. Edit text, colors, and links directly.
              </p>
            </div>
          </div>

          {/* Drag to Reorder */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-xl">⠿</span>
            </div>
            <div>
              <h3 className={`font-semibold ${headingColors.primary}`}>Drag to Reorder</h3>
              <p className={`text-sm ${formInputColors.helper}`}>
                Look for the blue grip handle on the left side of each section. Drag it up or down to reorder.
              </p>
            </div>
          </div>

          {/* Save Changes */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-xl">💾</span>
            </div>
            <div>
              <h3 className={`font-semibold ${headingColors.primary}`}>Save Your Work</h3>
              <p className={`text-sm ${formInputColors.helper}`}>
                Click "Save" in the sidebar to keep your changes. Click "Exit Edit Mode" when done.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
          <button
            onClick={dismissForNow}
            className={`text-sm ${formInputColors.helper} hover:underline`}
          >
            Remind me later
          </button>
          <button
            onClick={dismiss}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
