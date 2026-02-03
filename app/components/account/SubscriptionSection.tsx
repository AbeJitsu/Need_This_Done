'use client';

import { useState, useEffect } from 'react';
import { CreditCard, ExternalLink, Loader2, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import Button from '@/components/Button';
import { accentColors, cardBgColors, cardBorderColors, headingColors, mutedTextColors } from '@/lib/colors';

// ============================================================================
// Subscription Section Component
// ============================================================================
// What: Display and manage user's active subscriptions
// Why: Let users view subscription status and access Stripe portal
// How: Fetches from /api/subscriptions, links to Stripe Customer Portal

interface Subscription {
  id: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

// Map Stripe price IDs to friendly product names
// This should match products in Medusa
const PRICE_NAMES: Record<string, string> = {
  // Add your Stripe price IDs here
  // e.g., 'price_xxx': 'Managed AI'
};

function getProductName(priceId: string): string {
  return PRICE_NAMES[priceId] || 'Subscription';
}

function getStatusBadge(status: string, cancelAtPeriodEnd: boolean) {
  if (cancelAtPeriodEnd) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
        <Clock className="w-3 h-3" />
        Canceling
      </span>
    );
  }

  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
          <CheckCircle className="w-3 h-3" />
          Active
        </span>
      );
    case 'past_due':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3" />
          Past Due
        </span>
      );
    case 'canceled':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          <XCircle className="w-3 h-3" />
          Canceled
        </span>
      );
    case 'trialing':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3" />
          Trial
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          {status}
        </span>
      );
  }
}

export default function SubscriptionSection() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  // Fetch subscriptions on mount
  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const response = await fetch('/api/subscriptions');
        if (!response.ok) {
          throw new Error('Failed to fetch subscriptions');
        }
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
        setError('Unable to load subscriptions');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscriptions();
  }, []);

  // Open Stripe Customer Portal
  const handleManageSubscriptions = async () => {
    setIsOpeningPortal(true);
    setError('');

    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to open customer portal');
      }

      const data = await response.json();

      // Redirect to Stripe portal
      window.location.href = data.url;
    } catch (err) {
      console.error('Error opening portal:', err);
      setError(err instanceof Error ? err.message : 'Failed to open customer portal');
      setIsOpeningPortal(false);
    }
  };

  // Filter to show only active/relevant subscriptions
  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.status === 'active' || sub.status === 'trialing' || sub.status === 'past_due'
  );

  return (
    <div className={`${cardBgColors.base} rounded-xl border-2 ${cardBorderColors.light} p-6 mb-8`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 ${accentColors.purple.bg} rounded-lg`}>
          <CreditCard className={`w-5 h-5 ${accentColors.purple.text}`} />
        </div>
        <h3 className={`text-lg font-semibold ${headingColors.primary}`}>
          Subscriptions
        </h3>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : activeSubscriptions.length === 0 ? (
        <div className="text-center py-8">
          <p className={`${mutedTextColors.normal} mb-4`}>
            You don't have any active subscriptions.
          </p>
          <Button variant="purple" href="/pricing" size="sm">
            View Plans
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {activeSubscriptions.map((sub) => (
            <div
              key={sub.id}
              className="p-4 border border-gray-200 rounded-lg bg-gray-50"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className={`font-medium ${headingColors.primary}`}>
                    {getProductName(sub.stripePriceId)}
                  </h4>
                  <p className={`text-sm ${mutedTextColors.normal}`}>
                    {sub.cancelAtPeriodEnd
                      ? `Cancels on ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`
                      : `Renews on ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`}
                  </p>
                </div>
                {getStatusBadge(sub.status, sub.cancelAtPeriodEnd)}
              </div>

              {sub.status === 'past_due' && (
                <p className="text-sm text-red-600 mt-2">
                  Payment failed. Please update your payment method.
                </p>
              )}
            </div>
          ))}

          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="purple"
              onClick={handleManageSubscriptions}
              disabled={isOpeningPortal}
              className="flex items-center gap-2"
              size="sm"
            >
              {isOpeningPortal ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Manage Subscriptions
                </>
              )}
            </Button>
            <p className={`text-xs ${mutedTextColors.normal} mt-2`}>
              Update payment methods, cancel, or change your plan
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
