'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Puck } from '@measured/puck';
import { puckConfig } from '@/lib/puck-config';
import { PageWizard } from '@/components/templates';
import type { PuckPageData } from '@/lib/templates';
import '@measured/puck/puck.css';
import { alertColors, iconCircleColors, containerBg, cardBgColors, mutedTextColors, dividerColors, headingColors, coloredLinkText, cardBorderColors, iconButtonColors, linkHoverColors, formInputColors, accentColors } from '@/lib/colors';
import { CheckIcon } from '@/components/ui/icons';

// ============================================================================
// NEW PAGE - Choose Your Path
// ============================================================================
// Offers two ways to create a page:
// 1. Quick Wizard - 5 simple steps, phone-friendly, template-based
// 2. Full Editor - Complete Puck editor for power users
//
// Both output the same Puck JSON format, stored the same way.
// ============================================================================

type CreationMode = 'choose' | 'wizard' | 'editor';

// Completion state after wizard finishes
interface CompletedPage {
  slug: string;
  title: string;
}

export default function NewPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  // Which creation mode are we in?
  const [mode, setMode] = useState<CreationMode>('choose');

  // Wizard completion state
  const [completedPage, setCompletedPage] = useState<CompletedPage | null>(null);

  // Editor state (only used in 'editor' mode)
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [validationError, setValidationError] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auth protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  // ============================================================================
  // Save Functions - Shared by both wizard and editor
  // ============================================================================

  const savePage = useCallback(async (
    pageSlug: string,
    pageTitle: string,
    content: PuckPageData
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: pageSlug,
          title: pageTitle,
          content,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create page');
      }

      return true;
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create page', 'error');
      return false;
    }
  }, [showToast]);

  // ============================================================================
  // Wizard Completion Handler
  // ============================================================================

  const handleWizardComplete = useCallback(async (data: PuckPageData, templateId: string) => {
    // Generate slug from template ID and timestamp
    const timestamp = Date.now().toString(36);
    const pageSlug = `${templateId}-${timestamp}`;

    // Get title from the hero section if possible
    const heroSection = data.content.find((c) => c.type === 'Hero');
    const pageTitle = heroSection?.props?.heading as string || `New ${templateId} page`;

    const success = await savePage(pageSlug, pageTitle, data);

    if (success) {
      showToast('Page created successfully!', 'success');
      // Show completion modal instead of redirecting
      setCompletedPage({ slug: pageSlug, title: pageTitle });
    }
  }, [savePage, showToast]);

  // ============================================================================
  // Editor Save Handler
  // ============================================================================

  const handleEditorSave = useCallback(async (data: PuckPageData) => {
    if (!slug || !title) {
      setValidationError('Please enter both slug and title');
      return;
    }

    setValidationError('');
    setSaveStatus('saving');

    const success = await savePage(slug, title, data);

    if (success) {
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      showToast('Page created successfully', 'success');
      router.push('/admin/pages');
    } else {
      setSaveStatus('idle');
    }
  }, [slug, title, savePage, showToast, router]);

  const handleEditorChange = useCallback(() => {
    setHasUnsavedChanges(true);
    setSaveStatus('idle');
  }, []);

  // ============================================================================
  // Loading State
  // ============================================================================

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  // ============================================================================
  // Render: Choose Mode
  // ============================================================================

  if (mode === 'choose') {
    return (
      <div className={`min-h-screen ${containerBg.page} flex flex-col`}>
        {/* Header */}
        <header className={`${cardBgColors.base} border-b ${dividerColors.border} px-4 py-4`}>
          <div className="max-w-4xl mx-auto">
            <nav className="flex items-center gap-2 text-sm mb-4">
              <Link
                href="/dashboard"
                className={`${mutedTextColors.normal} hover:text-purple-600`}
              >
                Admin
              </Link>
              <span className={mutedTextColors.normal}>/</span>
              <Link
                href="/admin/pages"
                className={`${mutedTextColors.normal} hover:text-purple-600`}
              >
                Pages
              </Link>
              <span className={mutedTextColors.normal}>/</span>
              <span className={`${headingColors.primary} font-medium`}>New</span>
            </nav>

            <h1 className={`text-2xl font-bold ${headingColors.primary}`}>
              Create a New Page
            </h1>
            <p className={`${mutedTextColors.light} mt-1`}>
              Choose how you want to build your page
            </p>
          </div>
        </header>

        {/* Path Selection */}
        <main className="flex-1 px-4 py-8">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            {/* Wizard Path */}
            <button
              onClick={() => setMode('wizard')}
              className={`${cardBgColors.base} rounded-2xl ${cardBorderColors.lightMd} p-8 text-left hover:border-purple-500 hover:shadow-lg transition-all group`}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className={`w-8 h-8 ${coloredLinkText.purple}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <h2 className={`text-xl font-bold ${headingColors.primary}`}>
                  Quick Start
                </h2>
                <span className={`px-2 py-0.5 text-xs font-medium ${accentColors.green.bg} ${accentColors.green.text} rounded-full`}>
                  Recommended
                </span>
              </div>

              <p className={`${mutedTextColors.light} mb-4`}>
                Answer 5 simple questions and get a professional page in under a minute. Perfect for phones.
              </p>

              <ul className={`space-y-2 text-sm ${mutedTextColors.normal}`}>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  5 templates to choose from
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Pick colors and content
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Edit with full builder after
                </li>
              </ul>

              <div className={`mt-6 flex items-center ${coloredLinkText.purple} font-medium group-hover:gap-3 gap-2 transition-all`}>
                Start Wizard
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Full Editor Path */}
            <button
              onClick={() => setMode('editor')}
              className={`${cardBgColors.base} rounded-2xl ${cardBorderColors.lightMd} p-8 text-left hover:border-blue-500 hover:shadow-lg transition-all group`}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className={`w-8 h-8 ${coloredLinkText.blue}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>

              <h2 className={`text-xl font-bold ${headingColors.primary} mb-2`}>
                Full Editor
              </h2>

              <p className={`${mutedTextColors.light} mb-4`}>
                Complete control with drag-and-drop. 40+ components, pixel-perfect layouts.
              </p>

              <ul className={`space-y-2 text-sm ${mutedTextColors.normal}`}>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  40+ components
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Start from blank canvas
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Best on desktop
                </li>
              </ul>

              <div className={`mt-6 flex items-center ${coloredLinkText.blue} font-medium group-hover:gap-3 gap-2 transition-all`}>
                Open Editor
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ============================================================================
  // Render: Wizard Completion Modal
  // ============================================================================

  if (completedPage) {
    return (
      <div className={`min-h-screen ${containerBg.page} flex items-center justify-center p-4`}>
        <div className={`${cardBgColors.base} rounded-2xl shadow-xl max-w-lg w-full p-8 text-center`}>
          {/* Success Icon */}
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${iconCircleColors.green.bg} flex items-center justify-center`}>
            <CheckIcon size="lg" className={coloredLinkText.green} />
          </div>

          {/* Success Heading */}
          <h1 className={`text-2xl font-bold ${headingColors.primary} mb-2`}>
            Page Created!
          </h1>
          <p className={`${mutedTextColors.light} mb-8`}>
            Your page &ldquo;{completedPage.title}&rdquo; has been created successfully.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/admin/pages/${completedPage.slug}/edit`)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit with Puck
            </button>

            <button
              onClick={() => window.open(`/p/${completedPage.slug}`, '_blank')}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 ${iconButtonColors.secondary.bg} ${iconButtonColors.secondary.hover} ${headingColors.primary} font-medium rounded-xl transition-colors`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Page
            </button>

            <button
              onClick={() => router.push('/admin/pages')}
              className={`w-full px-6 py-3 ${mutedTextColors.normal} ${iconButtonColors.hover} font-medium transition-colors`}
            >
              Go to Pages List
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render: Wizard Mode
  // ============================================================================

  if (mode === 'wizard') {
    return (
      <PageWizard
        onComplete={handleWizardComplete}
        onCancel={() => setMode('choose')}
      />
    );
  }

  // ============================================================================
  // Render: Editor Mode (Original Puck Editor)
  // ============================================================================

  return (
    <div className={`min-h-screen ${containerBg.page}`}>
      {/* Header with Breadcrumbs & Page Details */}
      <div className={`${cardBgColors.base} border-b ${dividerColors.border} shadow-sm`}>
        <div className="container mx-auto px-6 py-5">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-sm mb-4">
            <Link
              href="/dashboard"
              className={`${mutedTextColors.normal} ${linkHoverColors.purple} transition-colors`}
            >
              Admin
            </Link>
            <span className={mutedTextColors.normal}>/</span>
            <Link
              href="/admin/pages"
              className={`${mutedTextColors.normal} ${linkHoverColors.purple} transition-colors`}
            >
              Pages
            </Link>
            <span className={mutedTextColors.normal}>/</span>
            <button
              onClick={() => setMode('choose')}
              className={`${mutedTextColors.normal} ${linkHoverColors.purple} transition-colors`}
            >
              New Page
            </button>
            <span className={mutedTextColors.normal}>/</span>
            <span className={`${headingColors.primary} font-medium`}>Full Editor</span>
          </nav>

          {/* Header Row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMode('choose')}
                className={`flex items-center justify-center w-10 h-10 rounded-lg ${iconButtonColors.secondary.bg} ${iconButtonColors.secondary.hover} transition-colors`}
                title="Back to options"
              >
                <svg className={`w-5 h-5 ${iconButtonColors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className={`text-2xl font-bold ${headingColors.primary}`}>
                  Full Editor
                </h1>
                <p className={`text-sm ${mutedTextColors.normal}`}>
                  Build from scratch with 40+ components
                </p>
              </div>
            </div>

            {/* Save Status Indicator */}
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && saveStatus === 'idle' && (
                <span className={`flex items-center gap-2 text-sm ${coloredLinkText.gold}`}>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved changes
                </span>
              )}
              {saveStatus === 'saving' && (
                <span className={`flex items-center gap-2 text-sm ${coloredLinkText.blue}`}>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className={`flex items-center gap-2 text-sm ${coloredLinkText.green}`}>
                  <CheckIcon size="sm" />
                  Saved
                </span>
              )}
            </div>
          </div>

          {/* Page Details Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                URL Slug
              </label>
              <div className="flex items-center">
                <span className={`${mutedTextColors.normal} mr-1`}>/</span>
                <input
                  type="text"
                  placeholder="my-page-name"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                    setValidationError('');
                    setHasUnsavedChanges(true);
                  }}
                  className={formInputColors.base}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                Page Title
              </label>
              <input
                type="text"
                placeholder="My Awesome Page"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setValidationError('');
                  setHasUnsavedChanges(true);
                }}
                className={`w-full ${formInputColors.base}`}
              />
            </div>
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className={`mt-4 flex items-center gap-2 text-sm px-4 py-3 rounded-lg ${alertColors.error.bg} ${alertColors.error.border} ${alertColors.error.text}`}>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {validationError}
            </div>
          )}
        </div>
      </div>

      {/* Puck Editor */}
      <Puck
        config={puckConfig}
        data={{ content: [], root: {} }}
        onPublish={handleEditorSave}
        onChange={handleEditorChange}
      />
    </div>
  );
}
