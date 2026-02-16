'use client';

import { useState } from 'react';
import { AlertCircle, Bell, Check } from 'lucide-react';
import Button from '@/components/Button';

interface ProductAvailabilityProps {
  productId: string;
  variantId?: string;
  inventoryQuantity?: number;
  manageInventory?: boolean;
}

export default function ProductAvailability({
  productId,
  variantId,
  inventoryQuantity,
  manageInventory,
}: ProductAvailabilityProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Services and digital products don't track inventory — always available
  const isInStock = manageInventory === false ? true : (inventoryQuantity ?? 0) > 0;
  const lowStock = isInStock && manageInventory !== false && (inventoryQuantity ?? 0) < 3;

  const handleWaitlistSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/products/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          variantId,
          email,
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setEmail('');
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        const data = await response.json();
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Failed to join waitlist. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please try again.');
      console.error('Waitlist error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInStock) {
    return (
      <div className="flex items-center gap-2">
        <Check className="w-5 h-5 text-emerald-600" aria-hidden="true" />
        <span className="text-emerald-700 font-medium">
          {lowStock ? `Only ${inventoryQuantity} left in stock` : 'In stock'}
        </span>
      </div>
    );
  }

  // Out of stock with waitlist signup
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-red-700">
        <AlertCircle className="w-5 h-5" aria-hidden="true" />
        <span className="font-medium">Out of stock</span>
      </div>

      {/* Waitlist signup form */}
      <form onSubmit={handleWaitlistSignup} className="space-y-3">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Bell size={16} aria-hidden="true" />
            Get notified when back in stock
          </span>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting || submitStatus === 'success'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:bg-gray-50 disabled:text-gray-500"
            aria-label="Email address for waitlist"
          />
        </label>

        {submitStatus === 'error' && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {errorMessage}
          </p>
        )}

        {submitStatus === 'success' && (
          <p className="text-sm text-emerald-600 bg-emerald-50 p-2 rounded flex items-center gap-2">
            <Check size={16} aria-hidden="true" />
            You've been added to the waitlist
          </p>
        )}

        <Button
          type="submit"
          variant="blue"
          disabled={!email.trim() || isSubmitting || submitStatus === 'success'}
          className="w-full"
        >
          {isSubmitting ? 'Adding...' : submitStatus === 'success' ? 'Added to waitlist' : 'Join waitlist'}
        </Button>
      </form>
    </div>
  );
}
