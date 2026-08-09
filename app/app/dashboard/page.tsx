'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DailyCockpit from '@/components/DailyCockpit';
import AgentOperationsDashboard from '@/components/AgentOperationsDashboard';

// ============================================================================
// Dashboard Page - Primary Daily Cockpit
// ============================================================================
// The project and provider workspaces remain available as detailed secondary
// views. This route is the operator's shared daily rhythm.

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const localPreview = process.env.NODE_ENV === 'development'
    && process.env.NEXT_PUBLIC_DASHBOARD_PREVIEW === 'true';

  // ============================================================================
  // Redirect if Not Authenticated
  // ============================================================================

  useEffect(() => {
    if (!localPreview && !authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, localPreview, router]);

  if (localPreview) {
    return <AgentOperationsDashboard previewMode />;
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

  return (
    <>
      <DailyCockpit />
      <AgentOperationsDashboard />
    </>
  );
}
