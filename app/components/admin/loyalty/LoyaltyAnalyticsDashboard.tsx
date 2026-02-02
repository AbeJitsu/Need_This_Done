'use client';

import { useState, useEffect } from 'react';
import { Zap, TrendingUp, Users, Gift, Loader2, AlertCircle } from 'lucide-react';
import { headingColors, cardBgColors, cardBorderColors, mutedTextColors } from '@/lib/colors';

// ============================================================================
// Loyalty Analytics Dashboard Component
// ============================================================================
// What: Admin dashboard showing loyalty program performance
// Why: Track program ROI and customer engagement metrics
// How: Fetch aggregated loyalty data from Supabase

interface LoyaltyStats {
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  totalPointsOutstanding: number;
  uniqueParticipants: number;
  redemptionRate: number;
  averagePointsPerCustomer: number;
  config: {
    pointsPerDollar: number;
    minPointsToRedeem: number;
    pointValueCents: number;
  };
  topEarners: Array<{
    email: string;
    pointsEarned: number;
    balance: number;
  }>;
}

export default function LoyaltyAnalyticsDashboard() {
  const [stats, setStats] = useState<LoyaltyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await fetch('/api/admin/loyalty-analytics');

        if (!response.ok) {
          throw new Error('Failed to fetch loyalty analytics');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching loyalty stats:', err);
        setError('Failed to load loyalty analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className={`rounded-lg p-12 ${cardBgColors.base} border ${cardBorderColors.subtle} flex items-center justify-center min-h-96`}>
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg p-6 ${cardBgColors.base} border ${cardBorderColors.subtle}`}>
        <div className="flex gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const estimatedValue = (stats.totalPointsIssued * stats.config.pointValueCents) / 100;
  const redemptionValue = (stats.totalPointsRedeemed * stats.config.pointValueCents) / 100;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className={`text-3xl font-bold ${headingColors.primary} mb-2`}>Loyalty Program Analytics</h1>
        <p className={mutedTextColors.normal}>Track program performance and customer engagement</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Points Issued */}
        <div className={`rounded-lg p-6 ${cardBgColors.base} border ${cardBorderColors.subtle}`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-gray-900">Points Issued</h3>
            <Zap className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-emerald-600 mb-2">
            {stats.totalPointsIssued.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">~${estimatedValue.toFixed(2)} value</p>
        </div>

        {/* Total Points Redeemed */}
        <div className={`rounded-lg p-6 ${cardBgColors.base} border ${cardBorderColors.subtle}`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-gray-900">Points Redeemed</h3>
            <Gift className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600 mb-2">
            {stats.totalPointsRedeemed.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">~${redemptionValue.toFixed(2)} discounts given</p>
        </div>

        {/* Outstanding Points */}
        <div className={`rounded-lg p-6 ${cardBgColors.base} border ${cardBorderColors.subtle}`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-gray-900">Outstanding</h3>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600 mb-2">
            {stats.totalPointsOutstanding.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Waiting to be redeemed</p>
        </div>

        {/* Participation */}
        <div className={`rounded-lg p-6 ${cardBgColors.base} border ${cardBorderColors.subtle}`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-gray-900">Participants</h3>
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-amber-600 mb-2">
            {stats.uniqueParticipants.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Active customers</p>
        </div>
      </div>

      {/* Program Metrics */}
      <div className={`rounded-lg p-6 ${cardBgColors.base} border ${cardBorderColors.subtle}`}>
        <h2 className={`text-xl font-bold ${headingColors.primary} mb-6`}>Program Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Redemption Rate */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Redemption Rate</p>
            <p className="text-4xl font-bold text-emerald-600 mb-3">
              {stats.redemptionRate.toFixed(1)}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-emerald-600 h-3 rounded-full transition-all"
                style={{ width: `${stats.redemptionRate}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {stats.totalPointsRedeemed.toLocaleString()} / {stats.totalPointsIssued.toLocaleString()} points redeemed
            </p>
          </div>

          {/* Avg Points Per Customer */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Avg Points Per Customer</p>
            <p className="text-4xl font-bold text-blue-600 mb-3">
              {stats.averagePointsPerCustomer.toFixed(0)}
            </p>
            <p className="text-sm text-gray-600">
              ${((stats.averagePointsPerCustomer * stats.config.pointValueCents) / 100).toFixed(2)} average value
            </p>
          </div>

          {/* Program Settings */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Program Settings</p>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">{stats.config.pointsPerDollar}</span> point per $1 spent
              </p>
              <p className="text-sm">
                <span className="font-medium">{stats.config.minPointsToRedeem}</span> min points to redeem
              </p>
              <p className="text-sm">
                <span className="font-medium">${(stats.config.pointValueCents / 100).toFixed(2)}</span> per point value
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Earners */}
      <div className={`rounded-lg p-6 ${cardBgColors.base} border ${cardBorderColors.subtle}`}>
        <h2 className={`text-xl font-bold ${headingColors.primary} mb-6`}>Top Earners</h2>
        {stats.topEarners.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Customer</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Points Earned</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Current Balance</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Value</th>
                </tr>
              </thead>
              <tbody>
                {stats.topEarners.map((earner, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900 font-medium truncate">{earner.email}</td>
                    <td className="text-right py-3 px-4 text-emerald-600 font-semibold">
                      {earner.pointsEarned.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-600">
                      {earner.balance.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-600">
                      ${((earner.balance * stats.config.pointValueCents) / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={mutedTextColors.normal}>No customers with loyalty points yet</p>
        )}
      </div>
    </div>
  );
}
