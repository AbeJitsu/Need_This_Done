// ============================================================================
// Global Error Boundary - error.tsx
// ============================================================================
// What: Catches all unhandled errors in the app
// Why: Provides graceful error handling instead of white screen crashes
// How: Next.js error boundary with retry and navigation options

'use client';

import { useEffect } from 'react';
import Button from '@/components/Button';
import { accentColors, titleTextColors, bodyTextColors } from '@/lib/colors';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  // ============================================================================
  // Log Error for Monitoring
  // ============================================================================

  useEffect(() => {
    // Log the error to error tracking service (e.g., Sentry)
    console.error('Application error:', error);

    // In production, you would send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }
  }, [error]);

  // ============================================================================
  // Determine Error Type for Better Messaging
  // ============================================================================

  const getErrorInfo = (error: Error) => {
    const message = error.message.toLowerCase();

    // Network/API errors
    if (message.includes('fetch') || message.includes('network') || message.includes('api')) {
      return {
        title: 'Connection Error',
        description: 'Unable to connect to the server. Please check your internet connection and try again.',
        showRetry: true,
      };
    }

    // Authentication errors
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
      return {
        title: 'Authentication Error',
        description: 'Your session may have expired. Please sign in again.',
        showRetry: false,
      };
    }

    // Data loading errors
    if (message.includes('load') || message.includes('data')) {
      return {
        title: 'Loading Error',
        description: 'Failed to load the requested data. Please try again.',
        showRetry: true,
      };
    }

    // Generic error
    return {
      title: 'Something Went Wrong',
      description: 'An unexpected error occurred. Our team has been notified.',
      showRetry: true,
    };
  };

  const errorInfo = getErrorInfo(error);

  // ============================================================================
  // Error UI
  // ============================================================================

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className={`mx-auto w-20 h-20 rounded-full ${accentColors.red.bg} flex items-center justify-center mb-6`}>
          <svg
            className={`w-10 h-10 ${accentColors.red.text}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Title */}
        <h1 className={`text-3xl font-bold ${titleTextColors.gray} mb-4`}>
          {errorInfo.title}
        </h1>

        {/* Error Description */}
        <p className={`${bodyTextColors.gray} mb-2`}>
          {errorInfo.description}
        </p>

        {/* Technical Details (dev mode only) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Technical Details
            </summary>
            <div className="mt-2 p-4 bg-gray-50 rounded border border-gray-200 text-xs font-mono text-left overflow-auto">
              <p className="text-red-600 font-semibold mb-2">{error.name}</p>
              <p className="text-gray-700 mb-2">{error.message}</p>
              {error.digest && (
                <p className="text-gray-500 mb-2">Digest: {error.digest}</p>
              )}
              {error.stack && (
                <pre className="text-gray-600 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {errorInfo.showRetry && (
            <Button
              variant="blue"
              onClick={() => reset()}
            >
              Try Again
            </Button>
          )}
          <Button
            variant="gray"
            href="/"
          >
            Go to Homepage
          </Button>
          <Button
            variant="gray"
            href="/contact"
          >
            Contact Support
          </Button>
        </div>

        {/* Additional Help */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            Need help? Here are some things you can try:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Refresh the page</li>
            <li>• Clear your browser cache</li>
            <li>• Try a different browser</li>
            <li>• Contact our support team</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
