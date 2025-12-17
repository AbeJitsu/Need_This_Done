'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

  const handleSave = async (data: any) => {
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

      showToast('Page updated successfully', 'success');
      router.push('/admin/pages');
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

  if (!isAdmin || !page) return null;

  return (
    <div className="min-h-screen">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="container mx-auto">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Editing: {page.title} (/{page.slug})
          </h1>
        </div>
      </div>

      <Puck
        config={puckConfig}
        data={page.content || { content: [], root: {} }}
        onPublish={handleSave}
      />
    </div>
  );
}
