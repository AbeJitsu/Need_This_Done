'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import { alertColors } from '@/lib/colors';

interface ReadyForDeliveryModalProps {
  isOpen: boolean;
  orderId: string;
  orderNumber: string;
  balanceRemaining: number;
  onClose: () => void;
  onSuccess: (method: string, charged: boolean) => void;
}

const PAYMENT_METHODS = [
  {
    value: 'card',
    label: 'Charge saved card',
    description: 'Automatically charge customer\'s card on file',
  },
  {
    value: 'cash',
    label: 'Received cash',
    description: 'Customer paid in cash',
  },
  {
    value: 'check',
    label: 'Received check',
    description: 'Customer paid by check',
  },
  {
    value: 'other',
    label: 'Other payment method',
    description: 'Wire transfer, Venmo, etc.',
  },
];

export default function ReadyForDeliveryModal({
  isOpen,
  orderId,
  orderNumber,
  balanceRemaining,
  onClose,
  onSuccess,
}: ReadyForDeliveryModalProps) {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/ready-for-delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method: selectedMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process payment');
      }

      // Success
      onSuccess(selectedMethod, data.charged === true);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900">
              Collect Final Payment
            </h2>
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-4">
            {/* Order Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Order ID</p>
              <p className="font-mono font-semibold text-gray-900 mb-3">
                {orderNumber}
              </p>
              <p className="text-sm text-gray-600 mb-1">Balance Due</p>
              <p className="text-2xl font-bold text-emerald-600">
                ${(balanceRemaining / 100).toFixed(2)}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`p-3 rounded-lg ${alertColors.error.bg}`}>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Payment Method Selection */}
            <div className="space-y-2">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={method.value}
                    checked={selectedMethod === method.value}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {method.label}
                    </p>
                    <p className="text-sm text-gray-600">
                      {method.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
            <Button
              variant="gray"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="green"
              onClick={handleSubmit}
              className="flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' :
               selectedMethod === 'card' ? 'Charge Card' : 'Mark as Paid'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
