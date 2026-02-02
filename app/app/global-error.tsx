// ============================================================================
// Global Error Boundary - global-error.tsx
// ============================================================================
// What: Catches errors in the root layout and other special cases
// Why: Fallback for errors that occur before the main error boundary loads
// How: Must define its own <html> and <body> tags

'use client';

import { useEffect } from 'react';

// Prevent prerendering of error boundary - must be dynamic only
export const dynamic = 'force-dynamic';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to console and error tracking service
    console.error('Global error:', error);

    // In production, send to error tracking
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ margin: 0, padding: 0 }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backgroundColor: '#ffffff',
          }}
        >
          <div
            style={{
              maxWidth: '32rem',
              width: '100%',
              textAlign: 'center',
            }}
          >
            {/* Error Icon */}
            <div
              style={{
                margin: '0 auto 2rem',
                width: '5rem',
                height: '5rem',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  color: '#dc2626',
                }}
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
            <h1
              style={{
                fontSize: '1.875rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '1rem',
              }}
            >
              Application Error
            </h1>

            {/* Error Description */}
            <p
              style={{
                color: '#6b7280',
                marginBottom: '0.5rem',
              }}
            >
              A critical error occurred while loading the application.
            </p>

            {/* Technical Details (dev mode only) */}
            {process.env.NODE_ENV === 'development' && (
              <details style={{ marginTop: '1rem', textAlign: 'left' }}>
                <summary
                  style={{
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#6b7280',
                  }}
                >
                  Technical Details
                </summary>
                <div
                  style={{
                    marginTop: '0.5rem',
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    overflowX: 'auto',
                  }}
                >
                  <p style={{ color: '#dc2626', fontWeight: '600', marginBottom: '0.5rem' }}>
                    {error.name}
                  </p>
                  <p style={{ color: '#374151', marginBottom: '0.5rem' }}>
                    {error.message}
                  </p>
                  {error.digest && (
                    <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                      Digest: {error.digest}
                    </p>
                  )}
                  {error.stack && (
                    <pre
                      style={{
                        color: '#4b5563',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div
              style={{
                marginTop: '2rem',
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => reset()}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }}
              >
                Try Again
              </button>
              <a
                href="/"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6b7280',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#4b5563';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#6b7280';
                }}
              >
                Go to Homepage
              </a>
            </div>

            {/* Help Text */}
            <div
              style={{
                marginTop: '2rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                If this problem persists, please{' '}
                <a
                  href="/contact"
                  style={{ color: '#3b82f6', textDecoration: 'underline' }}
                >
                  contact support
                </a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
