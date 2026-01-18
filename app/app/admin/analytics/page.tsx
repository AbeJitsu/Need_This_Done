'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/auth';
import Card from '@/components/Card';
import { alertColors, accentColors, softBgColors, titleTextColors, cardBgColors, cardBorderColors, headingColors, mutedTextColors, formInputColors, titleColors } from '@/lib/colors';

// ============================================================================
// Admin Analytics Dashboard - /admin/analytics
// ============================================================================
// What: Displays order analytics, revenue trends, and key metrics
// Why: Admins need visibility into business performance
// How: Fetches aggregated data from analytics API, displays charts and metrics

// ============================================================================
// Types
// ============================================================================

interface OrdersByStatus {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  canceled: number;
}

interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  ordersByStatus: OrdersByStatus;
}

interface TrendDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  trends?: TrendDataPoint[];
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
}

// ============================================================================
// Component
// ============================================================================

export default function AnalyticsDashboard() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: getDefaultStartDate(),
    endDate: getDefaultEndDate(),
  });

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
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        includeTrends: 'true',
      });

      const response = await fetch(`/api/admin/analytics?${params}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch analytics');
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchAnalytics();
  }, [isAdmin, fetchAnalytics]);

  // ========================================================================
  // Format helpers
  // ========================================================================
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // ========================================================================
  // Render helpers
  // ========================================================================
  const getMaxRevenue = () => {
    if (!data?.trends?.length) return 0;
    return Math.max(...data.trends.map((t) => t.revenue));
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite" aria-busy="true">
        <p className={mutedTextColors.normal}>Loading analytics...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${headingColors.primary} mb-2`}>
          Analytics
        </h1>
        <p className={mutedTextColors.normal}>
          Revenue, orders, and trends at a glance
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className={`mb-6 p-4 rounded-lg ${alertColors.error.bg} ${alertColors.error.border}`}>
          <p className={`text-sm ${alertColors.error.text}`}>{error}</p>
          <button
            onClick={() => setError('')}
            className={`mt-2 text-sm ${alertColors.error.link}`}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Date range filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label htmlFor="startDate" className={`block text-sm font-medium ${headingColors.secondary} mb-1`}>
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={dateRange.startDate}
            onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
            className={`px-3 py-2 ${cardBorderColors.light} rounded-lg ${formInputColors.base}`}
          />
        </div>
        <div>
          <label htmlFor="endDate" className={`block text-sm font-medium ${headingColors.secondary} mb-1`}>
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={dateRange.endDate}
            onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
            className={`px-3 py-2 ${cardBorderColors.light} rounded-lg ${formInputColors.base}`}
          />
        </div>
        <button
          onClick={fetchAnalytics}
          className={`px-4 py-2 rounded-lg font-medium ${accentColors.purple.bg} text-white hover:opacity-90 transition-opacity`}
        >
          Apply
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          testId="metric-card-revenue"
          label="Total Revenue"
          value={data ? formatCurrency(data.summary.totalRevenue) : '-'}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
        />
        <MetricCard
          testId="metric-card-orders"
          label="Total Orders"
          value={data ? formatNumber(data.summary.totalOrders) : '-'}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
          color="purple"
        />
        <MetricCard
          testId="metric-card-avg"
          label="Average Order"
          value={data ? formatCurrency(data.summary.averageOrderValue) : '-'}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          }
          color="blue"
        />
        <MetricCard
          testId="metric-card-delivered"
          label="Delivered"
          value={data ? formatNumber(data.summary.ordersByStatus.delivered) : '-'}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="teal"
        />
      </div>

      {/* Orders by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card hoverEffect="none">
          <div className="p-6">
            <h2 className={`text-lg font-semibold ${headingColors.primary} mb-4`}>
              Orders by Status
            </h2>
            {data ? (
              <div className="space-y-3">
                <StatusBar label="Pending" count={data.summary.ordersByStatus.pending} total={data.summary.totalOrders} color="yellow" />
                <StatusBar label="Processing" count={data.summary.ordersByStatus.processing} total={data.summary.totalOrders} color="blue" />
                <StatusBar label="Shipped" count={data.summary.ordersByStatus.shipped} total={data.summary.totalOrders} color="purple" />
                <StatusBar label="Delivered" count={data.summary.ordersByStatus.delivered} total={data.summary.totalOrders} color="green" />
                <StatusBar label="Canceled" count={data.summary.ordersByStatus.canceled} total={data.summary.totalOrders} color="red" />
              </div>
            ) : (
              <p className={mutedTextColors.normal}>No data available</p>
            )}
          </div>
        </Card>

        {/* Revenue Trend Chart */}
        <Card hoverEffect="none">
          <div className="p-6">
            <h2 className={`text-lg font-semibold ${headingColors.primary} mb-4`}>
              Revenue Trend
            </h2>
            {data?.trends && data.trends.length > 0 ? (
              <div className="h-48 flex items-end gap-1">
                {data.trends.slice(-14).map((point) => {
                  const maxRevenue = getMaxRevenue();
                  const height = maxRevenue > 0 ? (point.revenue / maxRevenue) * 100 : 0;
                  return (
                    <div
                      key={point.date}
                      className="flex-1 flex flex-col items-center group relative"
                    >
                      <div
                        className={`w-full ${titleColors.purple} rounded-t transition-all`}
                        style={{ height: `${Math.max(height, 2)}%` }}
                      />
                      <span className={`text-xs ${mutedTextColors.normal} mt-1 hidden md:block`}>
                        {new Date(point.date).getDate()}
                      </span>
                      {/* Tooltip */}
                      <div className={`absolute bottom-full mb-2 hidden group-hover:block ${cardBgColors.base} ${headingColors.primary} text-xs px-2 py-1 rounded whitespace-nowrap z-10 border ${cardBorderColors.light}`}>
                        {formatCurrency(point.revenue)}
                        <br />
                        {point.orders} orders
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <p className={mutedTextColors.normal}>No trend data available</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

function MetricCard({
  testId,
  label,
  value,
  icon,
  color,
}: {
  testId: string;
  label: string;
  value: string;
  icon: React.ReactNode;
  color: 'green' | 'purple' | 'blue' | 'teal';
}) {
  const colorClasses = {
    green: `${softBgColors.green} ${titleTextColors.green}`,
    purple: `${softBgColors.purple} ${titleTextColors.purple}`,
    blue: `${softBgColors.blue} ${titleTextColors.blue}`,
    teal: `${softBgColors.teal} ${titleTextColors.teal}`,
  };

  return (
    <Card hoverEffect="lift" data-testid={testId}>
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
          <div>
            <p className={`text-sm ${mutedTextColors.normal}`}>{label}</p>
            <p className={`text-2xl font-bold ${headingColors.primary}`}>{value}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function StatusBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: 'yellow' | 'blue' | 'purple' | 'green' | 'red';
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  const colorClasses = {
    yellow: 'bg-gold-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className={headingColors.secondary}>{label}</span>
        <span className={mutedTextColors.normal}>{count}</span>
      </div>
      <div className={`h-2 ${cardBgColors.elevated} rounded-full overflow-hidden`}>
        <div
          className={`h-full ${colorClasses[color]} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split('T')[0];
}

function getDefaultEndDate(): string {
  return new Date().toISOString().split('T')[0];
}
