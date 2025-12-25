'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Puck } from '@measured/puck';
import { puckConfig } from '@/lib/puck-config';
import '@measured/puck/puck.css';

export default function NewPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
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

  const handleSave = useCallback(async (data: any) => {
    // Validate slug and title
    if (!slug || !title) {
      setValidationError('Please enter both slug and title');
      return;
    }

    setValidationError('');
    setSaveStatus('saving');

    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          title,
          content: data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create page');
      }

      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      showToast('Page created successfully', 'success');
      router.push('/admin/pages');
    } catch (err) {
      setSaveStatus('idle');
      showToast(err instanceof Error ? err.message : 'Failed to create page', 'error');
    }
  }, [slug, title, router, showToast]);

  // Track unsaved changes
  const handleChange = useCallback(() => {
    setHasUnsavedChanges(true);
    setSaveStatus('idle');
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ========================================================================
          Header with Breadcrumbs & Page Details
          ======================================================================== */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-6 py-5">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-sm mb-4">
            <Link
              href="/dashboard"
              className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Admin
            </Link>
            <span className="text-gray-400 dark:text-gray-500">/</span>
            <Link
              href="/admin/pages"
              className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Pages
            </Link>
            <span className="text-gray-400 dark:text-gray-500">/</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">New Page</span>
          </nav>

          {/* Header Row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/pages"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Back to Pages"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Create New Page
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Design your page with drag-and-drop components
                </p>
              </div>
            </div>

            {/* Save Status Indicator */}
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && saveStatus === 'idle' && (
                <span className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved changes
                </span>
              )}
              {saveStatus === 'saving' && (
                <span className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved
                </span>
              )}
            </div>
          </div>

          {/* Page Details Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL Slug
              </label>
              <div className="flex items-center">
                <span className="text-gray-400 dark:text-gray-500 mr-1">/</span>
                <input
                  type="text"
                  placeholder="my-page-name"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                    setValidationError('');
                    setHasUnsavedChanges(true);
                  }}
                  className="flex-1 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-3 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/30 focus:outline-none transition-all"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-3 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/30 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="mt-4 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {validationError}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================
          Puck Editor
          ======================================================================== */}
      <Puck
        config={puckConfig}
        data={{ content: [], root: {} }}
        onPublish={handleSave}
        onChange={handleChange}
      />
    </div>
  );
}
