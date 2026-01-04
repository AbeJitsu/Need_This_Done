'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import Card from '@/components/Card';
import PageHeader from '@/components/PageHeader';
import {
  EDITABLE_PAGES,
  PAGE_DISPLAY_NAMES,
} from '@/lib/page-content-types';
import { alertColors, statusBadgeColors, headingColors, mutedTextColors } from '@/lib/colors';

// ============================================================================
// Admin Content Management - List of Editable Marketing Pages
// ============================================================================
// What: Shows all marketing pages that can have their content edited
// Why: Central hub for non-technical users to access content editing
// How: Lists pages with status and last-edited timestamps

interface PageContentInfo {
  page_slug: string;
  content_type: string;
  updated_at: string | null;
  is_default: boolean;
}

export default function ContentManagement() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const [pageInfo, setPageInfo] = useState<Record<string, PageContentInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Auth protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  // Fetch page content status for each editable page
  useEffect(() => {
    if (!isAdmin) return;

    const fetchPageInfo = async () => {
      try {
        const results: Record<string, PageContentInfo> = {};

        // Fetch content status for each editable page
        await Promise.all(
          EDITABLE_PAGES.map(async (slug) => {
            try {
              const response = await fetch(`/api/page-content/${slug}`);
              if (response.ok) {
                const data = await response.json();
                results[slug] = {
                  page_slug: slug,
                  content_type: data.content_type,
                  updated_at: data.updated_at || null,
                  is_default: data.is_default || false,
                };
              }
            } catch {
              // If fetch fails, treat as using defaults
              results[slug] = {
                page_slug: slug,
                content_type: '',
                updated_at: null,
                is_default: true,
              };
            }
          })
        );

        setPageInfo(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load page info');
      } finally {
        setLoading(false);
      }
    };

    fetchPageInfo();
  }, [isAdmin]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <PageHeader
        title="Edit Page Content"
        description="Update text, colors, and content on your marketing pages. Changes go live immediately."
      />

      {error && (
        <div className={`px-4 py-3 rounded mb-4 ${alertColors.error.bg} ${alertColors.error.border} ${alertColors.error.text}`}>
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {EDITABLE_PAGES.map((slug) => {
          const info = pageInfo[slug];
          const displayName = PAGE_DISPLAY_NAMES[slug];
          const isCustomized = info && !info.is_default;

          return (
            <Card key={slug} hoverEffect="lift" hoverColor="blue">
              <div className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className={`text-xl font-semibold mb-1 ${headingColors.primary}`}>
                      {displayName}
                    </h2>
                    <p className={`text-sm ${mutedTextColors.normal} mb-2`}>
                      /{slug === 'home' ? '' : slug}
                    </p>
                    <div className="flex gap-2 items-center">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          isCustomized
                            ? `${statusBadgeColors.customized.bg} ${statusBadgeColors.customized.text}`
                            : `${statusBadgeColors.default.bg} ${statusBadgeColors.default.text}`
                        }`}
                      >
                        {isCustomized ? 'Customized' : 'Using Defaults'}
                      </span>
                      {isCustomized && info?.updated_at && (
                        <span className={`text-xs ${mutedTextColors.normal}`}>
                          Last updated{' '}
                          {new Date(info.updated_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="gray"
                      href={`/${slug === 'home' ? '' : slug}`}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="blue"
                      href={`/admin/content/${slug}/edit`}
                    >
                      Edit Content
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Help Text */}
      <Card hoverColor="purple" hoverEffect="glow" className="mt-8">
        <div className="p-6 text-center">
          <h3 className={`font-semibold ${headingColors.primary} mb-2`}>
            How Content Editing Works
          </h3>
          <p className={`${mutedTextColors.light} text-sm max-w-xl mx-auto`}>
            Each page has its own set of editable content: titles, descriptions,
            button text, colors, and more. The page layout stays the same;
            you&apos;re just updating the words and colors. Changes appear on the
            live site as soon as you save.
          </p>
        </div>
      </Card>
    </div>
  );
}
