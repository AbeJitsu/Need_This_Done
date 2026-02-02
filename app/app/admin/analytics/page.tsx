'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/auth';
import Card from '@/components/Card';
import { alertColors, accentColors, softBgColors, titleTextColors, cardBgColors, cardBorderColors, headingColors, mutedTextColors, formInputColors } from '@/lib/colors';

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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Orders by Status - Pie Chart */}
        <Card hoverEffect="none">
          <div className="p-6">
            <h2 className={`text-lg font-semibold ${headingColors.primary} mb-4`}>
              Orders by Status
            </h2>
            {data && data.summary.totalOrders > 0 ? (
              <div className="space-y-6">
                {/* Visual pie chart using CSS */}
                <div className="flex justify-center">
                  <PieChart
                    data={[
                      { label: 'Pending', value: data.summary.ordersByStatus.pending, color: '#f59e0b' },
                      { label: 'Processing', value: data.summary.ordersByStatus.processing, color: '#3b82f6' },
                      { label: 'Shipped', value: data.summary.ordersByStatus.shipped, color: '#8b5cf6' },
                      { label: 'Delivered', value: data.summary.ordersByStatus.delivered, color: '#10b981' },
                      { label: 'Canceled', value: data.summary.ordersByStatus.canceled, color: '#ef4444' },
                    ]}
                    total={data.summary.totalOrders}
                  />
                </div>
                {/* Legend */}
                <div className="space-y-2">
                  <StatusBar label="Pending" count={data.summary.ordersByStatus.pending} total={data.summary.totalOrders} color="yellow" />
                  <StatusBar label="Processing" count={data.summary.ordersByStatus.processing} total={data.summary.totalOrders} color="blue" />
                  <StatusBar label="Shipped" count={data.summary.ordersByStatus.shipped} total={data.summary.totalOrders} color="purple" />
                  <StatusBar label="Delivered" count={data.summary.ordersByStatus.delivered} total={data.summary.totalOrders} color="green" />
                  <StatusBar label="Canceled" count={data.summary.ordersByStatus.canceled} total={data.summary.totalOrders} color="red" />
                </div>
              </div>
            ) : (
              <p className={mutedTextColors.normal}>No data available</p>
            )}
          </div>
        </Card>

        {/* Revenue Trend Chart - Enhanced */}
        <Card hoverEffect="none">
          <div className="p-6">
            <h2 className={`text-lg font-semibold ${headingColors.primary} mb-4`}>
              Revenue Trend (Last 14 Days)
            </h2>
            {data?.trends && data.trends.length > 0 ? (
              <div className="space-y-4">
                {/* Line chart visualization */}
                <div className="h-48 relative">
                  <LineChart
                    data={data.trends.slice(-14)}
                    maxValue={getMaxRevenue()}
                    formatValue={formatCurrency}
                  />
                </div>
                {/* Summary stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className={`text-xs ${mutedTextColors.normal}`}>Average Daily Revenue</p>
                    <p className={`text-lg font-semibold ${headingColors.primary}`}>
                      {formatCurrency(Math.round(data.trends.slice(-14).reduce((sum, d) => sum + d.revenue, 0) / data.trends.slice(-14).length))}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${mutedTextColors.normal}`}>Peak Day</p>
                    <p className={`text-lg font-semibold ${headingColors.primary}`}>
                      {formatCurrency(getMaxRevenue())}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <p className={mutedTextColors.normal}>No trend data available</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Orders Over Time Chart */}
      {data?.trends && data.trends.length > 0 && (
        <Card hoverEffect="none">
          <div className="p-6">
            <h2 className={`text-lg font-semibold ${headingColors.primary} mb-4`}>
              Order Volume (Last 14 Days)
            </h2>
            <div className="h-64">
              <BarChart
                data={data.trends.slice(-14)}
                maxValue={Math.max(...data.trends.slice(-14).map(d => d.orders))}
                color="#3b82f6"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
              <div>
                <p className={`text-xs ${mutedTextColors.normal}`}>Total Orders</p>
                <p className={`text-lg font-semibold ${headingColors.primary}`}>
                  {data.trends.slice(-14).reduce((sum, d) => sum + d.orders, 0)}
                </p>
              </div>
              <div>
                <p className={`text-xs ${mutedTextColors.normal}`}>Daily Average</p>
                <p className={`text-lg font-semibold ${headingColors.primary}`}>
                  {Math.round(data.trends.slice(-14).reduce((sum, d) => sum + d.orders, 0) / data.trends.slice(-14).length)}
                </p>
              </div>
              <div>
                <p className={`text-xs ${mutedTextColors.normal}`}>Peak Day</p>
                <p className={`text-lg font-semibold ${headingColors.primary}`}>
                  {Math.max(...data.trends.slice(-14).map(d => d.orders))}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
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

// ============================================================================
// Chart Components
// ============================================================================

interface PieChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  total: number;
}

function PieChart({ data, total }: PieChartProps) {
  if (total === 0) {
    return (
      <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center">
        <span className="text-gray-400 text-sm">No data</span>
      </div>
    );
  }

  // Calculate percentages and create conic gradient
  let currentAngle = 0;
  const segments = data
    .filter(d => d.value > 0)
    .map(({ value, color }) => {
      const percentage = (value / total) * 100;
      const startAngle = currentAngle;
      currentAngle += percentage;
      return `${color} ${startAngle}% ${currentAngle}%`;
    });

  const gradientStyle = `conic-gradient(${segments.join(', ')})`;

  return (
    <div className="relative w-48 h-48">
      <div
        className="w-full h-full rounded-full"
        style={{ background: gradientStyle }}
      />
      {/* Center hole for donut effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{total}</p>
            <p className="text-xs text-gray-500">orders</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LineChartProps {
  data: TrendDataPoint[];
  maxValue: number;
  formatValue: (value: number) => string;
}

function LineChart({ data, maxValue, formatValue }: LineChartProps) {
  if (data.length === 0 || maxValue === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-400">No data</p>
      </div>
    );
  }

  // Calculate points for the line path
  const width = 100;
  const height = 100;
  const padding = 5;
  const pointSpacing = (width - padding * 2) / (data.length - 1);

  const points = data.map((point, i) => {
    const x = padding + i * pointSpacing;
    const y = height - padding - ((point.revenue / maxValue) * (height - padding * 2));
    return { x, y, ...point };
  });

  // Create SVG path
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Create area fill path (extends to bottom)
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="h-full relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
          const y = height - padding - (fraction * (height - padding * 2));
          return (
            <line
              key={fraction}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Area fill */}
        <path
          d={areaD}
          fill="url(#gradient)"
          opacity="0.2"
        />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill="#8b5cf6"
              className="hover:r-4 transition-all cursor-pointer"
            />
            <title>{`${new Date(point.date).toLocaleDateString()}: ${formatValue(point.revenue)} (${point.orders} orders)`}</title>
          </g>
        ))}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 px-2">
        <span className="text-xs text-gray-500">
          {new Date(data[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(data[data.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
}

interface BarChartProps {
  data: TrendDataPoint[];
  maxValue: number;
  color: string;
}

function BarChart({ data, maxValue, color }: BarChartProps) {
  if (data.length === 0 || maxValue === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-400">No data</p>
      </div>
    );
  }

  return (
    <div className="h-full flex items-end justify-between gap-1 px-2">
      {data.map((point, i) => {
        const height = (point.orders / maxValue) * 100;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center group relative"
          >
            {/* Bar */}
            <div className="w-full flex flex-col items-center">
              <div
                className="w-full rounded-t transition-all hover:opacity-80"
                style={{
                  height: `${Math.max(height, 2)}%`,
                  backgroundColor: color,
                  minHeight: point.orders > 0 ? '4px' : '0',
                }}
              />
              {/* X-axis label */}
              <span className="text-xs text-gray-500 mt-1 hidden md:block">
                {new Date(point.date).getDate()}
              </span>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-white text-gray-900 text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap z-10 border border-gray-200">
              <div className="font-semibold">{new Date(point.date).toLocaleDateString()}</div>
              <div className="text-gray-600">{point.orders} orders</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
