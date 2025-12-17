'use client';

// Force dynamic rendering - page uses AuthContext which fails during prerendering
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  formInputColors,
  formValidationColors,
  headingColors,
  alertColors,
  cardBgColors,
  cardBorderColors,
  dividerColors,
  mutedTextColors,
  titleColors,
  accentColors,
} from '@/lib/colors';

// ============================================================================
// Login Page - User Authentication
// ============================================================================
// Allows users to sign in or create an account.
// Redirects to dashboard after successful login.

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // ============================================================================
  // Redirect if Already Logged In
  // ============================================================================

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // ============================================================================
  // Handle Authentication
  // ============================================================================

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Email is required');
      return;
    }

    // Handle forgot password
    if (isForgotPassword) {
      setIsSubmitting(true);
      setError('');
      setSuccessMessage('');

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });

        if (error) {
          setError(error.message);
        } else {
          setSuccessMessage('Check your email for a password reset link.');
          setEmail('');
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Normal login/signup flow
    if (!password) {
      setError('Password is required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const endpoint = isSignUpMode ? '/api/auth/signup' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Authentication failed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Set session on client-side Supabase instance
      if (!isSignUpMode && data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        // Redirect happens via useEffect when isAuthenticated changes
      }

      if (isSignUpMode) {
        setSuccessMessage('Account created! Check your email to confirm, then sign in.');
        setIsSignUpMode(false);
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // Handle Google Sign-In
  // ============================================================================

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Use environment variable for consistent redirect URL
      // Falls back to window.location.origin if not set
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
                      (typeof window !== 'undefined' ? window.location.origin : '');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${siteUrl}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        setError(error.message);
        setIsSubmitting(false);
      }
      // If successful, Supabase will redirect to Google login
    } catch (err) {
      setError('Failed to sign in with Google');
      setIsSubmitting(false);
    }
  };

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className={formInputColors.helper}>Loading...</div>
      </div>
    );
  }

  // Don't render form if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold ${headingColors.primary} mb-2`}>
            {isForgotPassword ? 'Reset Your Password' : isSignUpMode ? 'Join Us' : 'Welcome Back'}
          </h1>
          <p className={formInputColors.helper}>
            {isForgotPassword
              ? "No worries—we'll send you a reset link"
              : isSignUpMode
                ? 'Create an account to track your projects and stay in the loop'
                : 'Good to see you! Sign in to check on your projects'}
          </p>
        </div>

        {/* Login Form */}
        <div className={`${cardBgColors.base} rounded-xl p-8 ${cardBorderColors.light} border-l-4 border-l-gray-300 dark:border-l-gray-600 shadow-sm transition-all hover:border-gray-400 hover:shadow-[0_0_8px_0px_rgba(0,0,0,0.1)] dark:hover:border-gray-500 dark:hover:shadow-[0_0_8px_0px_rgba(255,255,255,0.15)]`}>
          <form onSubmit={handleAuth} className="space-y-6">

            {/* Error Message */}
            {error && (
              <div className={`p-3 rounded-lg ${alertColors.error.bg} ${alertColors.error.border}`}>
                <p className={`text-sm ${formValidationColors.error}`}>{error}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className={`p-3 rounded-lg ${alertColors.success.bg} ${alertColors.success.border}`}>
                <p className={`text-sm ${formValidationColors.success}`}>{successMessage}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${formInputColors.label}`}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg ${formInputColors.base} ${formInputColors.focus} focus:border-transparent transition-all`}
                placeholder="you@example.com"
                disabled={isSubmitting}
              />
            </div>

            {/* Password - Hidden in forgot password mode */}
            {!isForgotPassword && (
              <div>
                <label htmlFor="password" className={`block text-sm font-medium ${formInputColors.label}`}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete={isSignUpMode ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg ${formInputColors.base} ${formInputColors.focus} focus:border-transparent transition-all`}
                  placeholder={isSignUpMode ? 'Min 6 characters' : 'Your password'}
                  disabled={isSubmitting}
                />
                {/* Forgot Password Link - Only in sign-in mode */}
                {!isSignUpMode && (
                  <div className="text-center mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setError('');
                        setSuccessMessage('');
                      }}
                      className={`text-sm ${titleColors.purple} hover:underline`}
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !email || (!isForgotPassword && !password)}
              className={`w-full py-3 px-6 ${accentColors.blue.bg} ${accentColors.blue.text} font-semibold rounded-full border ${accentColors.blue.border} hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-200 dark:hover:text-blue-800 dark:hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
            >
              {isSubmitting
                ? isForgotPassword
                  ? 'Sending Reset Link...'
                  : isSignUpMode
                    ? 'Creating Account...'
                    : 'Signing In...'
                : isForgotPassword
                  ? 'Send Reset Link'
                  : isSignUpMode
                    ? 'Create Account'
                    : 'Sign In'}
            </button>

            {/* Divider */}
            {!isForgotPassword && (
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${dividerColors.border}`}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-2 ${cardBgColors.base} ${mutedTextColors.light}`}>
                    Or continue with
                  </span>
                </div>
              </div>
            )}

            {/* Google Sign-In Button */}
            {!isForgotPassword && (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className={`w-full py-3 px-6 ${cardBgColors.base} ${headingColors.secondary} font-semibold rounded-full ${cardBorderColors.lightMd} ${cardBgColors.interactive} disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3`}
              >
                {/* Google Icon SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </button>
            )}

            {/* Toggle Mode */}
            <div className="text-center pt-2">
              {isForgotPassword ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError('');
                    setSuccessMessage('');
                  }}
                  disabled={isSubmitting}
                  className={`text-sm ${titleColors.blue} hover:underline`}
                >
                  Back to Sign In
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUpMode(!isSignUpMode);
                    setError('');
                    setSuccessMessage('');
                  }}
                  disabled={isSubmitting}
                  className={`text-sm ${titleColors.blue} hover:underline`}
                >
                  {isSignUpMode
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Sign up"}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Helpful Links */}
        <div className="text-center mt-6 space-y-2">
          <Link
            href="/"
            className={`${titleColors.green} hover:underline text-sm`}
          >
            ← Back to Home
          </Link>
          <p className={`text-sm ${formInputColors.helper}`}>
            New here?{' '}
            <Link href="/services" className={`${titleColors.blue} hover:underline`}>
              See what we do
            </Link>
            {' · '}
            <Link href="/contact" className={`${titleColors.blue} hover:underline`}>
              Get a free quote
            </Link>
          </p>
        </div>
    </div>
  );
}
