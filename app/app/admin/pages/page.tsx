'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Pages</h1>
        <Button
          variant="purple"
          href="/admin/pages/new"
        >
          Create New Page
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {pages.map((page) => (
          <Card key={page.id} hoverEffect="lift">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{page.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Slug: /{page.slug}
                  </p>
                  <div className="flex gap-2 items-center">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        page.is_published
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {page.is_published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Updated {new Date(page.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
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

        {pages.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No pages yet. Create your first page to get started.
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
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
  );
}
