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

export default function EditPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  // Fetch page data
  useEffect(() => {
    if (!isAdmin) return;

    const fetchPage = async () => {
      try {
        const response = await fetch(`/api/pages/${params.slug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load page');
        }

        setPage(data.page);
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to load page', 'error');
        router.push('/admin/pages');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [isAdmin, params.slug, router, showToast]);

  const handleSave = useCallback(async (data: any) => {
    setSaveStatus('saving');

    try {
      const response = await fetch(`/api/pages/${params.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update page');
      }

      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      showToast('Page updated successfully', 'success');

      // Reset to idle after 3 seconds so the indicator disappears
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('idle');
      showToast(err instanceof Error ? err.message : 'Failed to update page', 'error');
    }
  }, [params.slug, showToast]);

  // Track unsaved changes
  const handleChange = useCallback(() => {
    setHasUnsavedChanges(true);
    setSaveStatus('idle');
  }, []);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading page...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin || !page) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ========================================================================
          Header with Breadcrumbs & Page Info
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
            <span className="text-gray-900 dark:text-gray-100 font-medium">{page.title}</span>
          </nav>

          {/* Header Row */}
          <div className="flex items-center justify-between">
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
                  {page.title}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    /{page.slug}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      page.is_published
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {page.is_published ? 'Published' : 'Draft'}
                  </span>
                  {page.is_published && (
                    <Link
                      href={`/${page.slug}`}
                      target="_blank"
                      className="text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                    >
                      View live
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  )}
                </div>
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
        </div>
      </div>

      {/* ========================================================================
          Puck Editor
          ======================================================================== */}
      <Puck
        config={puckConfig}
        data={page.content || { content: [], root: {} }}
        onPublish={handleSave}
        onChange={handleChange}
      />
    </div>
  );
}
