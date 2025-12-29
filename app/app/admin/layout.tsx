'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';

// ============================================================================
// Shared Admin Layout - Wraps all /admin/* routes
// ============================================================================
// What: Provides consistent layout with sidebar navigation for all admin pages
// Why: Makes admin sections easily discoverable and navigable
// How: Checks for admin authentication and renders sidebar with main content

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  // ============================================================================
  // Redirect non-admins
  // ============================================================================
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  // ============================================================================
  // Loading state
  // ============================================================================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Don't render if not admin (will redirect)
  // ============================================================================
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  // ============================================================================
  // Render admin layout with sidebar
  // ============================================================================
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <main className="flex-1 overflow-auto lg:ml-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
