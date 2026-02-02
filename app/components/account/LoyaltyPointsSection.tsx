'use client';

import { useState, useEffect } from 'react';
import { Zap, TrendingUp, Clock, Gift } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Button from '@/components/Button';
import { accentColors, cardBgColors, cardBorderColors, headingColors } from '@/lib/colors';

// ============================================================================
// Loyalty Points Section Component
// ============================================================================
// What: Display customer's loyalty points balance and history
// Why: Let customers see earned points and plan redemptions
// How: Fetch from /api/loyalty/balance, display balance and recent transactions

interface LoyaltyBalance {
  currentBalance: number;
  config: {
    pointsPerDollar: number;
    minPointsToRedeem: number;
    pointValueCents: number;
  };
  recentTransactions: Array<{
    id: number;
    points_earned: number;
    source: string;
    description: string;
    created_at: string;
  }>;
}

export default function LoyaltyPointsSection() {
  const { data: session } = useSession();
  const [balance, setBalance] = useState<LoyaltyBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchBalance = async () => {
      try {
        setIsLoading(true);
        setError('');

        const token = session?.user?.id || '';
        const response = await fetch('/api/loyalty/balance', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch loyalty balance');
        }

        const data = await response.json();
        setBalance(data);
      } catch (err) {
        console.error('Error fetching loyalty balance:', err);
        setError('Unable to load loyalty points');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [session?.user?.email, session?.user?.id]);

  if (isLoading) {
    return (
      <div className={`rounded-lg p-6 ${cardBgColors.base} border ${cardBorderColors.subtle}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg p-6 ${cardBgColors.base} border ${cardBorderColors.subtle}`}>
        <h3 className={`text-lg font-semibold mb-2 ${headingColors.primary}`}>Loyalty Points</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!balance) {
    return null;
  }

  const discountValue = (balance.currentBalance * balance.config.pointValueCents) / 100;

  return (
    <div className={`rounded-lg p-6 ${cardBgColors.base} border ${cardBorderColors.subtle}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${headingColors.primary}`}>Loyalty Points</h3>
          <p className="text-gray-600 text-sm mt-1">Earn points on every purchase</p>
        </div>
        <Zap className={`w-6 h-6 ${accentColors.green.text}`} />
      </div>

      {/* Points Balance Card */}
      <div className={`rounded-lg p-4 mb-6 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200`}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 text-sm font-medium">Points Balance</p>
            <p className={`text-3xl font-bold ${accentColors.green.text}`}>
              {balance.currentBalance.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-medium">Potential Value</p>
            <p className={`text-3xl font-bold ${accentColors.green.text}`}>
              ${discountValue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Redemption Info */}
        {balance.currentBalance >= balance.config.minPointsToRedeem ? (
          <div className="mt-4 pt-4 border-t border-emerald-200">
            <p className="text-emerald-700 text-sm font-medium">
              ✓ Ready to redeem! You have enough points for ${discountValue.toFixed(2)} off
            </p>
            <Button
              variant="green"
              size="sm"
              className="mt-3 w-full"
              onClick={() => {
                // Scroll to checkout or show redemption modal
                window.location.href = '/checkout?redeem-points=true';
              }}
            >
              Redeem Points at Checkout
            </Button>
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t border-emerald-200">
            <p className="text-emerald-700 text-sm">
              {balance.config.minPointsToRedeem - balance.currentBalance} more points needed to redeem
            </p>
            <div className="mt-2 w-full bg-emerald-200 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (balance.currentBalance / balance.config.minPointsToRedeem) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Program Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex gap-3">
          <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Earn Points</p>
            <p className="text-sm text-gray-600">
              {balance.config.pointsPerDollar} point per $1 spent
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Gift className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Redeem For</p>
            <p className="text-sm text-gray-600">
              ${(balance.config.pointValueCents / 100).toFixed(2)} per point
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      {balance.recentTransactions.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Activity
          </h4>
          <div className="space-y-2">
            {balance.recentTransactions.map((transaction) => {
              const date = new Date(transaction.created_at);
              const isToday = new Date().toDateString() === date.toDateString();
              const timeStr = isToday
                ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

              return (
                <div key={transaction.id} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {transaction.source === 'purchase' ? 'Purchase' : transaction.source}
                    </p>
                    <p className="text-xs text-gray-600">{transaction.description}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${accentColors.green.text}`}>
                      +{transaction.points_earned}
                    </p>
                    <p className="text-xs text-gray-500">{timeStr}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
