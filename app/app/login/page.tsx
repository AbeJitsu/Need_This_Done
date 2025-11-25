'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

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

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  // Don't render form if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-12">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {isForgotPassword ? 'Reset Password' : isSignUpMode ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {isForgotPassword
              ? 'Enter your email to receive a reset link'
              : isSignUpMode
                ? 'Sign up to track your projects'
                : 'Sign in to view your project status'}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 border-l-4 border-l-gray-300 dark:border-l-gray-600 shadow-sm transition-all hover:border-gray-400 hover:shadow-[0_0_8px_0px_rgba(0,0,0,0.1)] dark:hover:border-gray-500 dark:hover:shadow-[0_0_8px_0px_rgba(255,255,255,0.15)]">
          <form onSubmit={handleAuth} className="space-y-6">

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
                disabled={isSubmitting}
              />
            </div>

            {/* Password - Hidden in forgot password mode */}
            {!isForgotPassword && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete={isSignUpMode ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                      className="text-sm text-purple-700 dark:text-purple-400 hover:underline"
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
              className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all"
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
                  className="text-sm text-blue-700 dark:text-blue-400 hover:underline"
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
                  className="text-sm text-blue-700 dark:text-blue-400 hover:underline"
                >
                  {isSignUpMode
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Sign up"}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-green-700 dark:text-green-400 hover:underline text-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
