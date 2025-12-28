'use client';

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import Button from '@/components/Button';
import { alertColors, cardBgColors, cardBorderColors } from '@/lib/colors';

// ============================================================================
// Payment Form Component
// ============================================================================
// What: Embedded payment form using Stripe Elements
// Why: Secure, PCI-compliant payment collection without handling card data
// How: Uses PaymentElement for card input, handles submission and errors
//
// Must be wrapped in StripeElementsWrapper with a clientSecret

interface PaymentFormProps {
  onSuccess: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
  returnUrl: string;
  submitText?: string;
  processingText?: string;
}

export default function PaymentForm({
  onSuccess,
  onError,
  returnUrl,
  submitText = 'Pay Now',
  processingText = 'Processing...',
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  // ========================================================================
  // Handle form submission
  // ========================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Stripe.js hasn't loaded yet
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        // Don't redirect if payment succeeds - let us handle it
        redirect: 'if_required',
      });

      if (error) {
        // Payment failed - show error to user
        const errorMessage =
          error.type === 'card_error' || error.type === 'validation_error'
            ? error.message || 'Payment failed'
            : 'An unexpected error occurred';

        setMessage(errorMessage);
        onError?.(errorMessage);
      } else if (paymentIntent) {
        // Payment succeeded or requires action
        switch (paymentIntent.status) {
          case 'succeeded':
            setMessage('Payment successful!');
            onSuccess(paymentIntent.id);
            break;

          case 'processing':
            setMessage('Your payment is processing...');
            break;

          case 'requires_payment_method':
            setMessage('Payment failed. Please try another payment method.');
            break;

          default:
            setMessage('Something went wrong.');
            break;
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = 'An unexpected error occurred';
      setMessage(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Stripe Payment Element - handles all payment method types */}
      <div className={`${cardBgColors.base} p-4 rounded-lg ${cardBorderColors.light}`}>
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Error/Status message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.includes('successful')
              ? `${alertColors.success.bg} ${alertColors.success.border}`
              : `${alertColors.error.bg} ${alertColors.error.border}`
          }`}
        >
          <p
            className={`text-sm ${
              message.includes('successful')
                ? alertColors.success.text
                : alertColors.error.text
            }`}
          >
            {message}
          </p>
        </div>
      )}

      {/* Submit button */}
      <Button
        type="submit"
        variant="purple"
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? processingText : submitText}
      </Button>

      {/* Security note */}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        Your payment is secured by Stripe. We never store your card details.
      </p>
    </form>
  );
}
