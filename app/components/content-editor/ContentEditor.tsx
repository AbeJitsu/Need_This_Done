'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PagePreview from './PagePreview';
import { HomepageForm, PricingForm, ServicesForm, FAQForm, HowItWorksForm } from './forms';
import Button from '@/components/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  PAGE_DISPLAY_NAMES,
  type PageContent,
  type HomePageContent,
  type PricingPageContent,
  type ServicesPageContent,
  type FAQPageContent,
  type HowItWorksPageContent,
  type EditablePageSlug,
} from '@/lib/page-content-types';
import { alertColors, uiChromeBg, statusIndicatorBg, hoverBgColors, cardBgColors, dividerColors, headingColors, mutedTextColors, dangerColors, navigationColors, layoutBgColors } from '@/lib/colors';

// ============================================================================
// Content Editor - Main Editor Component
// ============================================================================
// What: Side-by-side editor with form on left, live preview on right
// Why: Provides intuitive editing experience for non-technical users
// How: Manages draft state, renders appropriate form/preview, handles publish

interface ContentEditorProps {
  slug: EditablePageSlug;
  initialContent: PageContent;
  defaultContent: PageContent;
  onPublish: (content: PageContent) => Promise<void>;
}

export default function ContentEditor({
  slug,
  initialContent,
  defaultContent,
  onPublish,
}: ContentEditorProps) {
  const router = useRouter();
  const [content, setContent] = useState<PageContent>(initialContent);
  const [isDirty, setIsDirty] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Track changes
  useEffect(() => {
    setIsDirty(JSON.stringify(content) !== JSON.stringify(initialContent));
  }, [content, initialContent]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Handle content changes
  const handleContentChange = useCallback((newContent: PageContent) => {
    setContent(newContent);
    setError(null);
  }, []);

  // Handle publish
  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);
    try {
      await onPublish(content);
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish changes');
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle cancel - Show confirmation if there are unsaved changes
  const handleCancel = () => {
    if (isDirty) {
      setShowCancelConfirm(true);
    } else {
      router.push('/admin/content');
    }
  };

  // Confirm cancel - Leave without saving
  const confirmCancel = () => {
    setShowCancelConfirm(false);
    router.push('/admin/content');
  };

  // Handle reset to defaults
  const handleReset = () => {
    setContent(defaultContent);
    setShowResetConfirm(false);
  };

  // Render the appropriate form based on slug
  const renderForm = () => {
    switch (slug) {
      case 'home':
        return (
          <HomepageForm
            content={content as HomePageContent}
            onChange={(c) => handleContentChange(c)}
          />
        );
      case 'pricing':
        return (
          <PricingForm
            content={content as PricingPageContent}
            onChange={(c) => handleContentChange(c)}
          />
        );
      case 'services':
        return (
          <ServicesForm
            content={content as ServicesPageContent}
            onChange={(c) => handleContentChange(c)}
          />
        );
      case 'faq':
        return (
          <FAQForm
            content={content as FAQPageContent}
            onChange={(c) => handleContentChange(c)}
          />
        );
      case 'how-it-works':
        return (
          <HowItWorksForm
            content={content as HowItWorksPageContent}
            onChange={(c) => handleContentChange(c)}
          />
        );
      default:
        return <div>Unknown page type</div>;
    }
  };

  const pageName = PAGE_DISPLAY_NAMES[slug] || slug;

  return (
    <div className={`h-screen flex flex-col ${layoutBgColors.page}`}>
      {/* Header Bar */}
      <header className={`flex-shrink-0 ${cardBgColors.base} border-b ${dividerColors.border} px-4 py-3`}>
        <div className="flex items-center justify-between max-w-[1800px] mx-auto">
          <div className="flex items-center gap-4">
            <h1 className={`text-lg font-semibold ${headingColors.primary}`}>
              Edit {pageName}
            </h1>
            {isDirty && (
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusIndicatorBg.modified} ${alertColors.warning.text}`}>
                Unsaved changes
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="gray" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              variant="purple"
              size="sm"
              onClick={handlePublish}
              disabled={isPublishing || !isDirty}
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className={`flex-shrink-0 ${alertColors.error.bg} border-b ${alertColors.error.border} px-4 py-2`}>
          <p className={`text-sm ${alertColors.error.text} text-center`}>
            {error}
          </p>
        </div>
      )}

      {/* Main Content - Split Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Form */}
        <div className={`w-[400px] flex-shrink-0 border-r ${dividerColors.border} ${cardBgColors.base} flex flex-col`}>
          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {renderForm()}
          </div>

          {/* Form Footer */}
          <div className={`flex-shrink-0 p-4 border-t ${dividerColors.border} ${uiChromeBg.footer}`}>
            {showResetConfirm ? (
              <div className="space-y-2">
                <p className={`text-sm ${mutedTextColors.normal}`}>
                  Reset all fields to their default values?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className={`px-3 py-1.5 text-xs font-medium ${dangerColors.text} ${hoverBgColors.red} rounded`}
                  >
                    Yes, Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className={`px-3 py-1.5 text-xs font-medium ${mutedTextColors.normal} ${hoverBgColors.gray} rounded`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className={`text-xs ${mutedTextColors.normal} ${navigationColors.linkHover}`}
              >
                Reset to Defaults
              </button>
            )}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 flex flex-col min-w-0">
          <PagePreview slug={slug} content={content} />
        </div>
      </div>

      {/* Unsaved changes confirmation dialog */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        onConfirm={confirmCancel}
        onCancel={() => setShowCancelConfirm(false)}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave?"
        confirmLabel="Leave"
        cancelLabel="Stay"
        variant="warning"
      />
    </div>
  );
}
