'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { TrendingUp, Users, Gift } from 'lucide-react';
import Link from 'next/link';

interface ReferralStats {
  stats: {
    totalReferrers: number;
    totalCreditIssued: number;
    totalCreditUsed: number;
    totalReferrals: number;
    conversionRate: string;
  };
  topReferrers: Array<{
    code: string;
    totalEarned: number;
    totalReferrals: number;
    balance: number;
  }>;
  transactionBreakdown: {
    pending: number;
    completed: number;
    expired: number;
  };
}

export default function ReferralAnalyticsPage() {
  const { user, getToken } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const token = await getToken();
        const response = await fetch('/api/admin/referral-analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, getToken]);

  if (loading) {
    return <div className="py-12 text-center">Loading referral analytics...</div>;
  }

  if (!stats) {
    return <div className="py-12 text-center text-gray-600">Unable to load referral data</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Referral Program Analytics</h1>
        <p className="text-gray-600 mt-2">Monitor referral performance and customer engagement</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Referrers</h3>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.stats.totalReferrers}</p>
          <p className="text-xs text-gray-500 mt-2">Active referral participants</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Successful Referrals</h3>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.stats.totalReferrals}</p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.stats.conversionRate}% conversion
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Issued</h3>
            <Gift className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ${stats.stats.totalCreditIssued.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-2">Referral credits</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Used</h3>
            <Gift className="w-5 h-5 text-gold-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ${stats.stats.totalCreditUsed.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-2">Redemptions</p>
        </div>
      </div>

      {/* Transaction Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-600 font-medium">Pending</p>
            <p className="text-2xl font-bold text-blue-900 mt-2">{stats.transactionBreakdown.pending}</p>
          </div>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded">
            <p className="text-sm text-emerald-600 font-medium">Completed</p>
            <p className="text-2xl font-bold text-emerald-900 mt-2">{stats.transactionBreakdown.completed}</p>
          </div>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded">
            <p className="text-sm text-gray-600 font-medium">Expired</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.transactionBreakdown.expired}</p>
          </div>
        </div>
      </div>

      {/* Top Referrers */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Referrers</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Code</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Referrals</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Total Earned</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.topReferrers.map((referrer, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-semibold text-emerald-600">
                    {referrer.code}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{referrer.totalReferrals}</td>
                  <td className="px-4 py-3 text-gray-900">
                    ${referrer.totalEarned.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    ${referrer.balance.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <Link
          href="/admin"
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          ← Back to Admin
        </Link>
      </div>
    </div>
  );
}
