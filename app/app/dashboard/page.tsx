'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminDashboard from '@/components/AdminDashboard';
import UserDashboard from '@/components/UserDashboard';

// ============================================================================
// Dashboard Page - Router for Admin/User Views
// ============================================================================
// What: Displays different dashboard views based on user role.
// Why: Admins need to manage all projects; users see only theirs.
// How: Routes to AdminDashboard or UserDashboard based on isAdmin context.

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  // ============================================================================
  // Redirect if Not Authenticated
  // ============================================================================

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // ============================================================================
  // Show Loading State
  // ============================================================================

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        {isAdmin ? <AdminDashboard /> : <UserDashboard />}
      </div>
    </div>
  );
}
