'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { alertColors, statusBadgeColors } from '@/lib/colors';

interface Page {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function PagesManagement() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);

  // Auth protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  // Fetch pages
  useEffect(() => {
    if (!isAdmin) return;

    const fetchPages = async () => {
      try {
        const response = await fetch('/api/pages');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load pages');
        }

        setPages(data.pages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load pages');
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, [isAdmin]);

  const handleDelete = (slug: string) => {
    setPageToDelete(slug);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!pageToDelete) return;

    try {
      setShowDeleteConfirm(false);
      const response = await fetch(`/api/pages/${pageToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete page');
      }

      setPages(pages.filter((p) => p.slug !== pageToDelete));
      showToast('Page deleted successfully', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete page', 'error');
    } finally {
      setPageToDelete(null);
    }
  };

  const handleTogglePublish = async (slug: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/pages/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update page');
      }

      setPages(
        pages.map((p) =>
          p.slug === slug ? { ...p, is_published: !currentStatus } : p
        )
      );
      showToast(
        `Page ${!currentStatus ? 'published' : 'unpublished'} successfully`,
        'success'
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update page', 'error');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* ====================================================================
            Breadcrumb Navigation
            ==================================================================== */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link
            href="/dashboard"
            className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            Admin
          </Link>
          <span className="text-gray-400 dark:text-gray-500">/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">Pages</span>
        </nav>

        {/* ====================================================================
            Header
            ==================================================================== */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Page Builder
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create and manage custom pages with drag-and-drop
            </p>
          </div>
          <Button
            variant="purple"
            href="/admin/pages/new"
            size="lg"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Page
            </span>
          </Button>
        </div>

        {/* ====================================================================
            Error State
            ==================================================================== */}
        {error && (
          <div className={`flex items-center gap-3 px-5 py-4 rounded-xl mb-6 ${alertColors.error.bg} ${alertColors.error.border} ${alertColors.error.text}`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* ====================================================================
            Pages Grid
            ==================================================================== */}
        <div className="grid gap-5">
          {pages.map((page) => (
            <Card key={page.id} hoverEffect="lift">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {page.title}
                      </h2>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          page.is_published
                            ? `${statusBadgeColors.published.bg} ${statusBadgeColors.published.text}`
                            : `${statusBadgeColors.draft.bg} ${statusBadgeColors.draft.text}`
                        }`}
                      >
                        {page.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        /{page.slug}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500">
                        Updated {new Date(page.updated_at).toLocaleDateString()}
                      </span>
                      {page.is_published && (
                        <Link
                          href={`/${page.slug}`}
                          target="_blank"
                          className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                        >
                          View live
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="blue"
                      href={`/admin/pages/${page.slug}/edit`}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={page.is_published ? 'orange' : 'green'}
                      onClick={() => handleTogglePublish(page.slug, page.is_published)}
                    >
                      {page.is_published ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button
                      size="sm"
                      variant="gray"
                      onClick={() => handleDelete(page.slug)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* ====================================================================
              Empty State
              ==================================================================== */}
          {pages.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 px-8 py-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Start building your first page
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
                Drag and drop components to create custom landing pages, about pages, and more - no code required.
              </p>
              <Button
                variant="purple"
                href="/admin/pages/new"
                size="lg"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Your First Page
                </span>
              </Button>

              {/* Feature highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Drag & Drop</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Build layouts visually</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Publish Control</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Draft or go live instantly</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Mobile Ready</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Responsive by default</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ====================================================================
            Delete Confirmation Dialog
            ==================================================================== */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setPageToDelete(null);
          }}
          title="Delete Page"
          message="Are you sure you want to delete this page? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
        />
      </div>
    </div>
  );
}
