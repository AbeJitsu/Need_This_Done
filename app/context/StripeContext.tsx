'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// ============================================================================
// Stripe Context
// ============================================================================
// What: Provides Stripe.js instance and Elements wrapper across the app
// Why: Stripe.js should be loaded once and shared for consistent UX
// How: Loads Stripe asynchronously, provides context + Elements wrapper

interface StripeContextType {
  stripe: Stripe | null;
  isLoading: boolean;
  error: string | null;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

// ============================================================================
// Stripe.js Loader
// ============================================================================
// Load Stripe.js once as a singleton promise
// This ensures we don't create multiple instances

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Only create the promise if we have a key (prevents errors during build)
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

// ============================================================================
// Stripe Provider Component
// ============================================================================
// Wrap your app with this to enable Stripe functionality

export function StripeProvider({ children }: { children: React.ReactNode }) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stripePromise) {
      setError('Stripe publishable key not configured');
      setIsLoading(false);
      return;
    }

    stripePromise
      .then((stripeInstance) => {
        setStripe(stripeInstance);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load Stripe:', err);
        setError('Failed to load payment system');
        setIsLoading(false);
      });
  }, []);

  return (
    <StripeContext.Provider value={{ stripe, isLoading, error }}>
      {children}
    </StripeContext.Provider>
  );
}

// ============================================================================
// useStripe Hook
// ============================================================================
// Access the Stripe context from any component

export function useStripeContext() {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripeContext must be used within StripeProvider');
  }
  return context;
}

// ============================================================================
// Stripe Elements Wrapper
// ============================================================================
// Wrap payment forms with this to provide Elements context
// The clientSecret comes from your PaymentIntent or SetupIntent

interface StripeElementsWrapperProps {
  children: React.ReactNode;
  clientSecret: string;
}

export function StripeElementsWrapper({
  children,
  clientSecret,
}: StripeElementsWrapperProps) {
  // Don't render if no publishable key
  if (!stripePromise) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-900 dark:text-yellow-200">
          Payment system not configured. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
        </p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            // Match your brand colors
            colorPrimary: '#7c3aed', // Purple
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#dc2626',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '8px',
            spacingUnit: '4px',
          },
          rules: {
            '.Input': {
              border: '1px solid #d1d5db',
              boxShadow: 'none',
            },
            '.Input:focus': {
              border: '1px solid #7c3aed',
              boxShadow: '0 0 0 1px #7c3aed',
            },
            '.Label': {
              fontWeight: '500',
              marginBottom: '8px',
            },
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}

// ============================================================================
// Dark Mode Elements Wrapper
// ============================================================================
// Alternative wrapper for dark mode pages

export function StripeElementsWrapperDark({
  children,
  clientSecret,
}: StripeElementsWrapperProps) {
  if (!stripePromise) {
    return (
      <div className="p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-200">
          Payment system not configured. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
        </p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#a78bfa', // Lighter purple for dark mode
            colorBackground: '#1f2937',
            colorText: '#f9fafb',
            colorDanger: '#f87171',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '8px',
            spacingUnit: '4px',
          },
          rules: {
            '.Input': {
              border: '1px solid #4b5563',
              backgroundColor: '#111827',
            },
            '.Input:focus': {
              border: '1px solid #a78bfa',
              boxShadow: '0 0 0 1px #a78bfa',
            },
            '.Label': {
              fontWeight: '500',
              marginBottom: '8px',
            },
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}
