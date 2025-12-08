'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Puck, type Data } from '@measured/puck';
import {
  getContentConfig,
  contentToPuckData,
  puckDataToContent,
} from '@/lib/puck-content-configs';
import {
  EDITABLE_PAGES,
  PAGE_DISPLAY_NAMES,
  type EditablePageSlug,
  type PageContent,
} from '@/lib/page-content-types';
import Button from '@/components/Button';
import '@measured/puck/puck.css';

// ============================================================================
// Admin Content Editor - Puck-based Editor for Page Content
// ============================================================================
// What: Visual editor for marketing page content (not layout)
// Why: Allows non-technical users to edit text, colors, and items
// How: Uses Puck with content-specific configs, transforms data on save

export default function EditContentPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const [initialData, setInitialData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const slug = params.slug as EditablePageSlug;
  const isValidSlug = EDITABLE_PAGES.includes(slug);
  const displayName = PAGE_DISPLAY_NAMES[slug] || slug;

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

        // Transform our content structure to Puck's format
        const puckData = contentToPuckData(slug, data.content as PageContent);
        setInitialData(puckData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [isAdmin, isValidSlug, slug]);

  const handleSave = async (data: Data) => {
    setSaving(true);
    setError('');

    try {
      // Transform Puck's format back to our content structure
      const content = puckDataToContent(slug, data);

      const response = await fetch(`/api/page-content/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save content');
      }

      // Navigate back to content list
      router.push('/admin/content');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content');
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAdmin || !isValidSlug || !initialData) return null;

  const config = getContentConfig(slug);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit {displayName} Content
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Changes will appear on the live page when you save
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="gray"
              href="/admin/content"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="gray"
              href={`/${slug === 'home' ? '' : slug}`}
            >
              Preview Page
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 text-red-700 px-4 py-3 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
          <div className="container mx-auto">{error}</div>
        </div>
      )}

      {/* Saving Indicator */}
      {saving && (
        <div className="bg-blue-50 border-b border-blue-200 text-blue-700 px-4 py-3 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
          <div className="container mx-auto">Saving changes...</div>
        </div>
      )}

      {/* Puck Editor */}
      <Puck
        config={config}
        data={initialData}
        onPublish={handleSave}
        headerPath="/admin/content"
        headerTitle={`Edit ${displayName}`}
      />
    </div>
  );
}
