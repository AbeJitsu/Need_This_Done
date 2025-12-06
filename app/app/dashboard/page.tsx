'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminDashboard from '@/components/AdminDashboard';
import UserDashboard from '@/components/UserDashboard';
import { getPreviewMode } from '@/lib/mockProjects';

// ============================================================================
// Dashboard Page - Router for Admin/User Views
// ============================================================================
// What: Displays different dashboard views based on user role.
// Why: Admins need to manage all projects; users see only theirs.
// How: Routes to AdminDashboard or UserDashboard based on isAdmin context.

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const [previewMode, setPreviewMode] = useState<'admin' | 'user' | null>(null);

  // ============================================================================
  // Check for Dev Preview Mode
  // ============================================================================

  useEffect(() => {
    setPreviewMode(getPreviewMode());
  }, []);

  // ============================================================================
  // Redirect if Not Authenticated (skip in preview mode)
  // ============================================================================

  useEffect(() => {
    if (previewMode) return; // Skip auth redirect in dev preview mode
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router, previewMode]);

  // ============================================================================
  // Dev Preview Mode - Bypass Auth for Development
  // ============================================================================

  if (previewMode) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        {previewMode === 'admin' ? <AdminDashboard /> : <UserDashboard />}
      </div>
    );
  }

  // ============================================================================
  // Show Loading State
  // ============================================================================

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  // ============================================================================
  // Don't Render if Not Authenticated (Will Redirect)
  // ============================================================================

  if (!isAuthenticated) {
    return null;
  }

  // ============================================================================
  // Render Appropriate Dashboard Based on Role
  // ============================================================================

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {isAdmin ? <AdminDashboard /> : <UserDashboard />}
    </div>
  );
}
