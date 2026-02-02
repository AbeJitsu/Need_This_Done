'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoyaltyAnalyticsDashboard from '@/components/admin/loyalty/LoyaltyAnalyticsDashboard';

// ============================================================================
// Admin Loyalty Analytics Page - /admin/loyalty
// ============================================================================
// What: View loyalty program analytics and customer metrics
// Why: Track program effectiveness and customer engagement
// How: Display program stats, top earners, redemption rates

export default function AdminLoyaltyPage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="h-12 w-12 rounded-full border-4 border-gray-300 border-t-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <LoyaltyAnalyticsDashboard />;
}
