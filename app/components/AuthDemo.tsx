'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

// ============================================================================
// Authentication Demo Component - Real Sign Up/Login
// ============================================================================
// Shows how real user authentication works. Visitors can create accounts
// and log in using Supabase, experiencing actual authentication.
// This uses real Supabase accounts - no simulation.

export default function AuthDemo() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(true);

  // ========================================================================
  // Handle Authentication (Sign Up or Login)
  // ========================================================================
  const handleAuth = async () => {
    if (!email || !password) {
      setError('Email and password are required');
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
        body: JSON.stringify({
          email,
          password,
          metadata: isSignUpMode ? { email } : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Authentication failed');
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(
        isSignUpMode
          ? 'Account created! Check your email to confirm.'
          : 'Signed in successfully!'
      );
      setEmail('');
      setPassword('');

      // Wait a moment for auth state to update
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================================================
  // Handle Logout
  // ========================================================================
  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Real Authentication Working
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {isAuthenticated
            ? 'You have a real, secure account. Try signing out and back in.'
            : 'Create an account or sign in to see real Supabase authentication in action.'}
        </p>
      </div>

      {/* Not Logged In - Auth Form */}
      {!isAuthenticated ? (
        <div className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-4 bg-green-50 dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="
                w-full px-4 py-2
                border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-700
                text-gray-900 dark:text-gray-100
                rounded-lg
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
              disabled={isSubmitting}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password (min 6 characters)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="
                w-full px-4 py-2
                border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-700
                text-gray-900 dark:text-gray-100
                rounded-lg
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
              disabled={isSubmitting}
            />
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsSignUpMode(true)}
              disabled={isSubmitting}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                isSignUpMode
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setIsSignUpMode(false)}
              disabled={isSubmitting}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                !isSignUpMode
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleAuth}
            disabled={isSubmitting || !email || !password}
            className="
              w-full px-4 py-3
              bg-blue-600 dark:bg-blue-500
              hover:bg-blue-700 dark:hover:bg-blue-600
              disabled:bg-gray-400 dark:disabled:bg-gray-600
              text-white font-semibold
              rounded-lg
              transition-all duration-200
              active:scale-95
            "
          >
            {isSubmitting
              ? isSignUpMode
                ? 'Creating Account...'
                : 'Signing In...'
              : isSignUpMode
                ? 'Create Account'
                : 'Sign In'}
          </button>

          {/* Explanation */}
          <div className="p-4 bg-blue-50 dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              💡 <strong>This is real authentication.</strong> You can create an account here, and it will be stored securely in Supabase.
              Your password is encrypted. Your session is protected.
            </p>
          </div>
        </div>
      ) : (
        /* Logged In State - Session Display */
        <div className="space-y-4">
          {/* Success Banner */}
          <div className="p-4 bg-green-50 dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded-lg">
            <p className="text-green-900 dark:text-green-300 font-semibold mb-1">
              ✓ You're Signed In
            </p>
            <p className="text-sm text-green-800 dark:text-green-300">
              Your session is real and secure. Your data is encrypted.
            </p>
          </div>

          {/* Session Info */}
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">
                Your Account
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-300">Email:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-300">User ID:</span>
                  <span className="font-monospace text-xs text-gray-700 dark:text-gray-300">
                    {user?.id?.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm text-gray-600 dark:text-gray-300">Active Session</span>
              </div>
            </div>
          </div>

          {/* What This Means */}
          <div className="p-4 bg-blue-50 dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              💡 <strong>Real authentication:</strong> Your account exists in Supabase. Your password is hashed. Your session is encrypted.
              This is production-ready security. This is what your users get.
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isSubmitting}
            className="
              w-full px-4 py-3
              border-2 border-gray-300 dark:border-gray-600
              hover:border-gray-400 dark:hover:border-gray-500
              text-gray-700 dark:text-gray-300
              font-semibold
              rounded-lg
              transition-all duration-200
              active:scale-95
              disabled:opacity-50
            "
          >
            {isSubmitting ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      )}

      {/* Educational Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          All authentication is handled by Supabase: password hashing, secure sessions, email confirmation,
          and more. You get enterprise-grade security without building it yourself.
        </p>
      </div>
    </div>
  );
}
