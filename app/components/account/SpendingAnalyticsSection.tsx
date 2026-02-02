'use client';

import { useEffect, useState } from 'react';
import { accentColors } from '@/lib/colors';

// ============================================================================
// Types
// ============================================================================

interface SpendingAnalytics {
  total_spent: number;
  total_orders: number;
  average_order_value: number;
  last_order_date: string | null;
  orders_this_month: number;
  spending_this_month: number;
  most_purchased_categories: Array<{
    category: string;
    count: number;
    total_spent: number;
  }>;
  order_frequency: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
}

// ============================================================================
// Spending Analytics Section Component
// ============================================================================

export default function SpendingAnalyticsSection() {
  const [analytics, setAnalytics] = useState<SpendingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // Load Analytics
  // ============================================================================

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/spending-analytics');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load analytics');
      }

      setAnalytics(data.analytics);
      setError(null);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // Format Helpers
  // ============================================================================

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No orders yet';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ============================================================================
  // Render
  // ============================================================================

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className={`text-xl font-semibold ${accentColors.blue.text} mb-4`}>
          Spending Analytics
        </h2>
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error || 'Failed to load analytics'}
        </div>
      </div>
    );
  }

  // ============================================================================
  // Empty State
  // ============================================================================

  if (analytics.total_orders === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className={`text-xl font-semibold ${accentColors.blue.text} mb-4`}>
          Spending Analytics
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-600">
            No order history yet. Your spending analytics will appear here once you make your first purchase.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Analytics Cards
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-xl font-semibold ${accentColors.blue.text}`}>
          Spending Analytics
        </h2>
        <p className="text-sm text-gray-600">
          Overview of your purchase history and spending patterns
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Spent */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="text-sm text-blue-700 font-medium mb-1">Total Spent</div>
          <div className={`text-2xl font-bold ${accentColors.blue.text}`}>
            {formatCurrency(analytics.total_spent)}
          </div>
          <div className="text-xs text-blue-600 mt-2">
            {analytics.total_orders} order{analytics.total_orders !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
          <div className="text-sm text-emerald-700 font-medium mb-1">Average Order</div>
          <div className="text-2xl font-bold text-emerald-700">
            {formatCurrency(analytics.average_order_value)}
          </div>
          <div className="text-xs text-emerald-600 mt-2">Per order</div>
        </div>

        {/* This Month */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="text-sm text-purple-700 font-medium mb-1">This Month</div>
          <div className="text-2xl font-bold text-purple-700">
            {formatCurrency(analytics.spending_this_month)}
          </div>
          <div className="text-xs text-purple-600 mt-2">
            {analytics.orders_this_month} order{analytics.orders_this_month !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Last Order */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
          <div className="text-sm text-amber-700 font-medium mb-1">Last Order</div>
          <div className="text-sm font-bold text-amber-700 mt-1">
            {formatDate(analytics.last_order_date)}
          </div>
          <div className="text-xs text-amber-600 mt-2">Most recent purchase</div>
        </div>
      </div>

      {/* Order Frequency */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Frequency</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">This Month</span>
              <span className="text-sm font-bold text-blue-700">{analytics.order_frequency.monthly}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${Math.min((analytics.order_frequency.monthly / 10) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">Last 3 Months</span>
              <span className="text-sm font-bold text-emerald-700">{analytics.order_frequency.quarterly}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: `${Math.min((analytics.order_frequency.quarterly / 30) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">Last 12 Months</span>
              <span className="text-sm font-bold text-purple-700">{analytics.order_frequency.yearly}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${Math.min((analytics.order_frequency.yearly / 100) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      {analytics.most_purchased_categories.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
          <div className="space-y-3">
            {analytics.most_purchased_categories.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{cat.category}</p>
                  <p className="text-sm text-gray-600">{cat.count} purchase{cat.count !== 1 ? 's' : ''}</p>
                </div>
                <p className="font-bold text-blue-700">{formatCurrency(cat.total_spent)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
        <h3 className="font-semibold text-blue-900 mb-3">💡 Insights</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>
            ✓ You've placed <strong>{analytics.total_orders}</strong> order{analytics.total_orders !== 1 ? 's' : ''} totaling{' '}
            <strong>{formatCurrency(analytics.total_spent)}</strong>
          </li>
          <li>
            ✓ Your average order value is <strong>{formatCurrency(analytics.average_order_value)}</strong>
          </li>
          {analytics.orders_this_month > 0 && (
            <li>
              ✓ You've spent <strong>{formatCurrency(analytics.spending_this_month)}</strong> this month
            </li>
          )}
          {analytics.last_order_date && (
            <li>
              ✓ Your most recent purchase was on <strong>{formatDate(analytics.last_order_date)}</strong>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
