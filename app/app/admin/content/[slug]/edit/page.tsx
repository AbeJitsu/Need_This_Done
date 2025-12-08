'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ContentEditor } from '@/components/content-editor';
import {
  EDITABLE_PAGES,
  type EditablePageSlug,
  type PageContent,
} from '@/lib/page-content-types';
import { getDefaultContent } from '@/lib/default-page-content';

// ============================================================================
// Admin Content Editor Page
// ============================================================================
// What: Side-by-side editor for marketing page content
// Why: Allows non-technical users to edit text, colors, and content
// How: Uses ContentEditor with form on left, live preview on right

export default function EditContentPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const [initialContent, setInitialContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const slug = params.slug as EditablePageSlug;
  const isValidSlug = EDITABLE_PAGES.includes(slug);

  // Auth protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  // Validate slug
  useEffect(() => {
    if (!isValidSlug) {
      router.push('/admin/content');
    }
  }, [isValidSlug, router]);

  // Fetch current content
  useEffect(() => {
    if (!isAdmin || !isValidSlug) return;

    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/page-content/${slug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load content');
        }

        setInitialContent(data.content as PageContent);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [isAdmin, isValidSlug, slug]);

  // Handle publish
  const handlePublish = async (content: PageContent) => {
    const response = await fetch(`/api/page-content/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to save content');
    }

    // Navigate back to content list on success
    router.push('/admin/content');
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading editor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Failed to Load
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/content')}
            className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Content List
          </button>
        </div>
      </div>
    );
  }

  // Auth/validation guards
  if (!isAdmin || !isValidSlug || !initialContent) return null;

  return (
    <ContentEditor
      slug={slug}
      initialContent={initialContent}
      defaultContent={getDefaultContent(slug)}
      onPublish={handlePublish}
    />
  );
}
