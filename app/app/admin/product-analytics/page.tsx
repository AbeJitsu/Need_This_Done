'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/auth';
import Card from '@/components/Card';
import { accentColors, headingColors, mutedTextColors, cardBorderColors, formInputColors } from '@/lib/colors';

// ============================================================================
// Product Analytics Dashboard - /admin/product-analytics
// ============================================================================
// What: Displays product interaction analytics, trending products, and user behavior
// Why: Admins need to understand which products are popular and how users engage
// How: Fetches data from product_interactions table and displays visualizations

// ============================================================================
// Types
// ============================================================================

interface PopularProduct {
  product_id: string;
  total_interactions: number;
  view_count: number;
  purchase_count: number;
  cart_count: number;
}

interface TrendingProduct {
  product_id: string;
  recent_count: number;
  previous_count: number;
  trend_score: number;
}

interface InteractionsByType {
  view: number;
  cart_add: number;
  purchase: number;
  wishlist: number;
}

interface TrendDataPoint {
  date: string;
  views: number;
  carts: number;
  purchases: number;
}

interface ProductAnalyticsData {
  popularProducts: PopularProduct[];
  trendingProducts: TrendingProduct[];
  interactionsByType: InteractionsByType;
  recentActivity: Array<{
    id: string;
    product_id: string;
    interaction_type: string;
    created_at: string;
    user_id?: string;
  }>;
  trends: TrendDataPoint[];
  dateRange: {
    startDate: string;
    endDate: string;
    days: number;
  };
}

// ============================================================================
// Component
// ============================================================================

export default function ProductAnalyticsDashboard() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  const [data, setData] = useState<ProductAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(7);

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

      const response = await fetch(`/api/admin/product-analytics?days=${days}`, {
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
      console.error('Failed to load product analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchAnalytics();
  }, [isAdmin, fetchAnalytics]);

  // ========================================================================
  // Format helpers
  // ========================================================================
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${(num * 100).toFixed(0)}%`;
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite" aria-busy="true">
        <p className={mutedTextColors.normal}>Loading product analytics...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  const totalInteractions = data
    ? Object.values(data.interactionsByType).reduce((sum, count) => sum + count, 0)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${headingColors.primary} mb-2`}>
          Product Analytics
        </h1>
        <p className={mutedTextColors.normal}>
          Product popularity, trends, and user engagement insights
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Time range selector */}
      <div className="mb-6 flex items-center gap-4">
        <label htmlFor="days" className={`text-sm font-medium ${headingColors.secondary}`}>
          Time Range:
        </label>
        <select
          id="days"
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className={`px-3 py-2 ${cardBorderColors.light} rounded-lg ${formInputColors.base}`}
        >
          <option value="7">Last 7 days</option>
          <option value="14">Last 14 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
        <button
          onClick={fetchAnalytics}
          className={`px-4 py-2 rounded-lg font-medium ${accentColors.purple.bg} text-white hover:opacity-90 transition-opacity`}
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Total Interactions"
          value={formatNumber(totalInteractions)}
          icon="📊"
          color="purple"
        />
        <MetricCard
          label="Product Views"
          value={formatNumber(data?.interactionsByType.view || 0)}
          icon="👁️"
          color="blue"
        />
        <MetricCard
          label="Cart Additions"
          value={formatNumber(data?.interactionsByType.cart_add || 0)}
          icon="🛒"
          color="green"
        />
        <MetricCard
          label="Purchases"
          value={formatNumber(data?.interactionsByType.purchase || 0)}
          icon="💳"
          color="gold"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Interaction Breakdown */}
        <Card hoverEffect="none">
          <div className="p-6">
            <h2 className={`text-lg font-semibold ${headingColors.primary} mb-4`}>
              Interaction Breakdown
            </h2>
            {data && totalInteractions > 0 ? (
              <div className="space-y-4">
                <InteractionBar
                  label="Views"
                  count={data.interactionsByType.view}
                  total={totalInteractions}
                  color="blue"
                />
                <InteractionBar
                  label="Cart Adds"
                  count={data.interactionsByType.cart_add}
                  total={totalInteractions}
                  color="green"
                />
                <InteractionBar
                  label="Purchases"
                  count={data.interactionsByType.purchase}
                  total={totalInteractions}
                  color="gold"
                />
                <InteractionBar
                  label="Wishlist"
                  count={data.interactionsByType.wishlist}
                  total={totalInteractions}
                  color="purple"
                />
              </div>
            ) : (
              <p className={mutedTextColors.normal}>No interaction data available</p>
            )}
          </div>
        </Card>

        {/* Trending Products */}
        <Card hoverEffect="none">
          <div className="p-6">
            <h2 className={`text-lg font-semibold ${headingColors.primary} mb-4`}>
              Trending Products (24h vs Previous)
            </h2>
            {data && data.trendingProducts.length > 0 ? (
              <div className="space-y-3">
                {data.trendingProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.product_id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${headingColors.secondary}`}>
                        {product.product_id}
                      </p>
                      <p className={`text-xs ${mutedTextColors.normal}`}>
                        {product.recent_count} interactions (was {product.previous_count})
                      </p>
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        product.trend_score > 0 ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {product.trend_score > 0 ? '↗' : '→'} {formatPercentage(product.trend_score)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={mutedTextColors.normal}>No trending data available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Popular Products Table */}
      <Card hoverEffect="none">
        <div className="p-6">
          <h2 className={`text-lg font-semibold ${headingColors.primary} mb-4`}>
            Popular Products
          </h2>
          {data && data.popularProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${headingColors.secondary}`}>
                      Product ID
                    </th>
                    <th className={`text-right py-3 px-4 text-sm font-semibold ${headingColors.secondary}`}>
                      Total
                    </th>
                    <th className={`text-right py-3 px-4 text-sm font-semibold ${headingColors.secondary}`}>
                      Views
                    </th>
                    <th className={`text-right py-3 px-4 text-sm font-semibold ${headingColors.secondary}`}>
                      Cart Adds
                    </th>
                    <th className={`text-right py-3 px-4 text-sm font-semibold ${headingColors.secondary}`}>
                      Purchases
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.popularProducts.map((product) => (
                    <tr key={product.product_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className={`py-3 px-4 text-sm ${headingColors.primary}`}>
                        {product.product_id}
                      </td>
                      <td className={`py-3 px-4 text-sm text-right ${mutedTextColors.normal}`}>
                        {formatNumber(product.total_interactions)}
                      </td>
                      <td className={`py-3 px-4 text-sm text-right ${mutedTextColors.normal}`}>
                        {formatNumber(product.view_count)}
                      </td>
                      <td className={`py-3 px-4 text-sm text-right ${mutedTextColors.normal}`}>
                        {formatNumber(product.cart_count)}
                      </td>
                      <td className={`py-3 px-4 text-sm text-right text-green-600 font-medium`}>
                        {formatNumber(product.purchase_count)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={mutedTextColors.normal}>No popular products data available</p>
          )}
        </div>
      </Card>

      {/* Activity Trend Chart */}
      {data && data.trends.length > 0 && (
        <Card hoverEffect="none" className="mt-8">
          <div className="p-6">
            <h2 className={`text-lg font-semibold ${headingColors.primary} mb-4`}>
              Interaction Trends Over Time
            </h2>
            <div className="h-64">
              <TrendChart data={data.trends} />
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
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: 'purple' | 'blue' | 'green' | 'gold';
}) {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    gold: 'bg-gold-100 text-gold-600',
  };

  return (
    <Card hoverEffect="lift">
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div className={`text-3xl p-3 rounded-full ${colorClasses[color]}`}>
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

function InteractionBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: 'blue' | 'green' | 'gold' | 'purple';
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    gold: 'bg-gold-500',
    purple: 'bg-purple-500',
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className={headingColors.secondary}>{label}</span>
        <span className={mutedTextColors.normal}>
          {count} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function TrendChart({ data }: { data: TrendDataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-400">No trend data</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.flatMap(d => [d.views, d.carts, d.purchases]));

  return (
    <div className="h-full flex items-end justify-between gap-1 px-2">
      {data.map((point, i) => {
        const viewHeight = (point.views / maxValue) * 100;
        const cartHeight = (point.carts / maxValue) * 100;
        const purchaseHeight = (point.purchases / maxValue) * 100;

        return (
          <div key={i} className="flex-1 flex flex-col items-center group relative">
            <div className="w-full flex flex-col items-center gap-0.5">
              {/* Purchases (top) */}
              <div
                className="w-full rounded-t bg-gold-500 transition-all"
                style={{
                  height: `${Math.max(purchaseHeight, 2)}%`,
                  minHeight: point.purchases > 0 ? '2px' : '0',
                }}
              />
              {/* Cart adds (middle) */}
              <div
                className="w-full bg-green-500 transition-all"
                style={{
                  height: `${Math.max(cartHeight, 2)}%`,
                  minHeight: point.carts > 0 ? '2px' : '0',
                }}
              />
              {/* Views (bottom) */}
              <div
                className="w-full bg-blue-500 transition-all"
                style={{
                  height: `${Math.max(viewHeight, 2)}%`,
                  minHeight: point.views > 0 ? '2px' : '0',
                }}
              />
              <span className="text-xs text-gray-500 mt-1 hidden md:block">
                {new Date(point.date).getDate()}
              </span>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-white text-gray-900 text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap z-10 border border-gray-200">
              <div className="font-semibold">{new Date(point.date).toLocaleDateString()}</div>
              <div className="text-blue-600">👁️ {point.views} views</div>
              <div className="text-green-600">🛒 {point.carts} cart adds</div>
              <div className="text-gold-600">💳 {point.purchases} purchases</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
