'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/auth';
import Card from '@/components/Card';
import { accentColors, titleTextColors, mutedTextColors, headingColors } from '@/lib/colors';

// ============================================================================
// Admin Waitlist Analytics Dashboard - /admin/waitlist-analytics
// ============================================================================
// What: Displays demand metrics for out-of-stock products
// Why: Helps admins prioritize restocking and understand customer demand
// How: Fetches metrics from analytics API, displays trends and top products

interface WaitlistMetrics {
  totalWaitlistEntries: number;
  uniqueProducts: number;
  uniqueCustomers: number;
  notifiedCount: number;
  notificationRate: number;
  topWaitlistedProducts: Array<{
    productId: string;
    productName: string;
    waitlistCount: number;
    notifiedCount: number;
    pendingCount: number;
    thumbnail?: string;
  }>;
  trendsByDate: Array<{
    date: string;
    signups: number;
    notified: number;
  }>;
  statusBreakdown: {
    pending: number;
    notified: number;
    cancelled: number;
  };
  conversionMetrics: {
    avgDaysToNotification: number;
    recentConversionRate: number;
  };
}

export default function WaitlistAnalyticsDashboard() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  const [metrics, setMetrics] = useState<WaitlistMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [daysBack, setDaysBack] = useState(30);

  // ========================================================================
  // Auth protection
  // ========================================================================
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && isAuthenticated && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  // ========================================================================
  // Fetch analytics data
  // ========================================================================
  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/admin/waitlist-analytics?days=${daysBack}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch metrics');
      }

      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching waitlist analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }, [daysBack]);

  useEffect(() => {
    if (isAuthenticated && isAdmin && !authLoading) {
      fetchMetrics();
    }
  }, [isAuthenticated, isAdmin, authLoading, fetchMetrics]);

  // ========================================================================
  // Render
  // ========================================================================
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className={`text-4xl font-bold ${titleTextColors.blue} mb-2`}>
            Waitlist Analytics
          </h1>
          <p className={`text-lg ${mutedTextColors.normal}`}>
            Track demand for out-of-stock products
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Controls */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className={`font-medium ${headingColors.primary}`}>
              Time Range:
            </label>
            <select
              value={daysBack}
              onChange={(e) => setDaysBack(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              loading
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : `bg-${accentColors.blue.bg.split('-')[1]}-600 text-white hover:bg-blue-700`
            }`}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* Metrics */}
        {!loading && metrics && (
          <div className="space-y-8">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  Total Waitlist Entries
                </div>
                <div className={`text-3xl font-bold ${titleTextColors.blue}`}>
                  {metrics.totalWaitlistEntries.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {metrics.uniqueCustomers} unique customers
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  Unique Products
                </div>
                <div className={`text-3xl font-bold ${titleTextColors.green}`}>
                  {metrics.uniqueProducts}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  with waitlist demand
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  Notification Rate
                </div>
                <div className={`text-3xl font-bold ${titleTextColors.purple}`}>
                  {metrics.notificationRate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {metrics.notifiedCount} notified customers
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  Avg Days to Notify
                </div>
                <div className={`text-3xl font-bold ${titleTextColors.gold}`}>
                  {metrics.conversionMetrics.avgDaysToNotification}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  from signup to restock
                </div>
              </Card>
            </div>

            {/* Status Breakdown */}
            <Card className="p-8">
              <h2 className={`text-xl font-bold ${headingColors.primary} mb-6`}>
                Waitlist Status Breakdown
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm font-medium text-gray-600">Pending</span>
                  </div>
                  <div className={`text-2xl font-bold ${headingColors.primary}`}>
                    {metrics.statusBreakdown.pending}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {metrics.totalWaitlistEntries > 0
                      ? (
                          (metrics.statusBreakdown.pending / metrics.totalWaitlistEntries) *
                          100
                        ).toFixed(0)
                      : 0}
                    % of total
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium text-gray-600">Notified</span>
                  </div>
                  <div className={`text-2xl font-bold ${headingColors.primary}`}>
                    {metrics.statusBreakdown.notified}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {metrics.totalWaitlistEntries > 0
                      ? (
                          (metrics.statusBreakdown.notified / metrics.totalWaitlistEntries) *
                          100
                        ).toFixed(0)
                      : 0}
                    % of total
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Cancelled</span>
                  </div>
                  <div className={`text-2xl font-bold ${headingColors.primary}`}>
                    {metrics.statusBreakdown.cancelled}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {metrics.totalWaitlistEntries > 0
                      ? (
                          (metrics.statusBreakdown.cancelled / metrics.totalWaitlistEntries) *
                          100
                        ).toFixed(0)
                      : 0}
                    % of total
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Conversion Rate */}
            <Card className="p-8">
              <h2 className={`text-xl font-bold ${headingColors.primary} mb-4`}>
                Recent Performance
              </h2>
              <div className="flex items-baseline gap-2">
                <div className={`text-4xl font-bold ${titleTextColors.green}`}>
                  {metrics.conversionMetrics.recentConversionRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">
                  conversion rate in the last 7 days
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                This shows what percentage of new waitlist signups received restock notifications
                in the last week.
              </p>
            </Card>

            {/* Top Waitlisted Products */}
            <Card className="p-8">
              <h2 className={`text-xl font-bold ${headingColors.primary} mb-6`}>
                Top Waitlisted Products
              </h2>
              <div className="space-y-4">
                {metrics.topWaitlistedProducts.length === 0 ? (
                  <p className={mutedTextColors.normal}>No waitlist data available</p>
                ) : (
                  metrics.topWaitlistedProducts.map((product, index) => (
                    <div key={product.productId} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                      <div className="text-lg font-bold text-gray-400 w-6">
                        {index + 1}
                      </div>
                      {product.thumbnail && (
                        <Image
                          src={product.thumbnail}
                          alt={product.productName}
                          width={48}
                          height={48}
                          className="rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className={`font-semibold ${headingColors.primary}`}>
                          {product.productName}
                        </h3>
                        <div className="flex items-center gap-6 mt-2 text-sm">
                          <div>
                            <span className="text-gray-600">Total:</span>
                            <span className="font-semibold ml-1">{product.waitlistCount}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Pending:</span>
                            <span className="font-semibold ml-1 text-yellow-600">
                              {product.pendingCount}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Notified:</span>
                            <span className="font-semibold ml-1 text-emerald-600">
                              {product.notifiedCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Signup Trends */}
            {metrics.trendsByDate.length > 0 && (
              <Card className="p-8">
                <h2 className={`text-xl font-bold ${headingColors.primary} mb-6`}>
                  Signup Trends
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Date
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">
                          New Signups
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">
                          Notified
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.trendsByDate
                        .slice()
                        .reverse()
                        .map((trend) => (
                          <tr key={trend.date} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">{trend.date}</td>
                            <td className="text-right py-3 px-4 font-medium">
                              {trend.signups}
                            </td>
                            <td className="text-right py-3 px-4 font-medium text-emerald-600">
                              {trend.notified}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
