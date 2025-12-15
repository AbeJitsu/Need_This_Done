'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

  // Auth protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  const handleSave = async (data: any) => {
    // Validate slug and title
    if (!slug || !title) {
      setValidationError('Please enter both slug and title');
      return;
    }

    setValidationError('');

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

      showToast('Page created successfully', 'success');
      router.push('/admin/pages');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create page', 'error');
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="container mx-auto">
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="page-slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                setValidationError('');
              }}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2 w-48"
            />
            <input
              type="text"
              placeholder="Page Title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setValidationError('');
              }}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2 flex-1"
            />
          </div>
          {validationError && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              {validationError}
            </p>
          )}
        </div>
      </div>

      <Puck
        config={puckConfig}
        data={{ content: [], root: {} }}
        onPublish={handleSave}
      />
    </div>
  );
}
