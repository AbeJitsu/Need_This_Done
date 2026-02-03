'use client';

import { getPaymentStatusLabel } from '@/lib/deposit-utils';
import { accentColors } from '@/lib/colors';

interface DepositPaymentCardProps {
  depositAmount: number;
  balanceRemaining: number;
  finalPaymentStatus: 'pending' | 'paid' | 'failed' | 'waived';
  finalPaymentMethod?: string;
  onReadyForDelivery?: () => void;
}

/**
 * Display deposit payment status for an order
 * Shows paid deposit, balance due, and final payment status
 */
export default function DepositPaymentCard({
  depositAmount,
  balanceRemaining,
  finalPaymentStatus,
  finalPaymentMethod,
  onReadyForDelivery,
}: DepositPaymentCardProps) {
  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  // Get status badge color
  const getStatusColor = () => {
    switch (finalPaymentStatus) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'waived':
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getPaymentMethodLabel = () => {
    if (!finalPaymentMethod) return null;
    const labels: Record<string, string> = {
      card: 'Credit Card',
      cash: 'Cash',
      check: 'Check',
      other: 'Alternative Payment',
    };
    return labels[finalPaymentMethod] || finalPaymentMethod;
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mt-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-3">Payment Status</h3>
      </div>

      {/* Deposit and Balance */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Deposit Paid</p>
          <p className="text-lg font-bold text-emerald-600">
            {formatCurrency(depositAmount)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Balance Due</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(balanceRemaining)}
          </p>
        </div>
      </div>

      {/* Final Payment Status */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">Final Payment</p>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor()}`}
            >
              {getPaymentStatusLabel(finalPaymentStatus)}
            </span>
            {getPaymentMethodLabel() && (
              <span className="text-xs text-gray-600">
                ({getPaymentMethodLabel()})
              </span>
            )}
          </div>
        </div>

        {/* Ready for Delivery Button */}
        {finalPaymentStatus === 'pending' && balanceRemaining > 0 && onReadyForDelivery && (
          <button
            onClick={onReadyForDelivery}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${accentColors.green.bg} ${accentColors.green.text} hover:shadow-lg hover:shadow-emerald-500/25`}
          >
            Ready for Delivery
          </button>
        )}
      </div>
    </div>
  );
}
