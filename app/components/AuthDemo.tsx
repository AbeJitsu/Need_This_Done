'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { alertColors } from '@/lib/colors';

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
  const [showJourney, setShowJourney] = useState(false);

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
        setError(data.error || "We couldn't sign you in. Please check your email and password.");
        setIsSubmitting(false);
        return;
      }

      // ====================================================================
      // Set Session on Client-Side Supabase Instance
      // ====================================================================
      // The login API returns session tokens, but we need to set them in the
      // client-side Supabase instance so the auth context knows we're logged in.
      // This triggers onAuthStateChange listener which updates the UI.
      if (!isSignUpMode && data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
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
      await signOut();
      // onAuthStateChange listener automatically updates UI with logged-out state
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
          Real Authentication: How Your Data Stays Safe
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {isAuthenticated
            ? 'Your account exists on real servers. Your password is scrambled and stored safely. Your session is protected. This is production-grade security.'
            : 'Create an account or sign in to see how your data travels safely from your browser to secure servers.'}
        </p>
      </div>

      {/* Not Logged In - Auth Form */}
      {!isAuthenticated ? (
        <div className="space-y-4">
          {/* Error Message */}
          {error && (
            <div role="alert" className={`p-4 ${alertColors.error.bg} ${alertColors.error.border} rounded-lg`}>
              <p className={`text-sm ${alertColors.error.text}`}>{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div role="alert" className={`p-4 ${alertColors.success.bg} ${alertColors.success.border} rounded-lg`}>
              <p className={`text-sm ${alertColors.success.text}`}>{successMessage}</p>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label htmlFor="auth-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
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
            <label htmlFor="auth-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password (min 6 characters)
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete="current-password"
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

          {/* Form Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            {isSignUpMode ? 'Create Your Account' : 'Welcome Back'}
          </h3>

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

          {/* Switch Mode Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUpMode(!isSignUpMode)}
              disabled={isSubmitting}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              {isSignUpMode ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Explanation */}
          <div className={`p-4 ${alertColors.info.bg} ${alertColors.info.border} rounded-lg`}>
            <p className={`text-sm ${alertColors.info.text}`}>
              💡 <strong>This is real authentication.</strong> You can create an account here, and it will be stored securely in Supabase.
              Your password is encrypted. Your session is protected.
            </p>
          </div>

          {/* Journey Explainer - Collapsible */}
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowJourney(!showJourney)}
              className="w-full p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-between transition-colors"
            >
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                Why This Matters: See What Happens Behind the Scenes
              </span>
              <span className={`transition-transform ${showJourney ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {showJourney && (
              <div className="p-4 space-y-4 bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600">
                {/* Journey Steps */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Your browser creates a sealed envelope</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        When you submit your email and password, your browser wraps them in a secure tunnel (called HTTPS). Think of it like a locked envelope. Only the server can open it.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Your password gets "scrambled" permanently</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        The server receives it and immediately transforms your password into unreadable gibberish (called hashing). Even if a hacker breaks into our servers, they can't see your actual password. It's permanently scrambled.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">You get a proof of identity (session)</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        Instead of sending your password with every request, you get a ticket stub that says "this person is logged in." It's secure and expires, so if someone steals it later, it becomes worthless.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Threat Scenarios */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-3">Without this protection, here's what could happen:</p>
                  <div className="space-y-2 text-xs">
                    <div className={`p-2 ${alertColors.error.bg} ${alertColors.error.border} rounded ${alertColors.error.text}`}>
                      ⚠️ <strong>At the coffee shop:</strong> Someone on the same WiFi could intercept your password and take over your account
                    </div>
                    <div className={`p-2 ${alertColors.error.bg} ${alertColors.error.border} rounded ${alertColors.error.text}`}>
                      ⚠️ <strong>Data breach:</strong> If hackers got into our database, they'd see passwords and could hack your other accounts
                    </div>
                    <div className={`p-2 ${alertColors.error.bg} ${alertColors.error.border} rounded ${alertColors.error.text}`}>
                      ⚠️ <strong>Session hijacking:</strong> Someone could pretend to be you without ever knowing your password
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className={`border-t border-gray-200 dark:border-gray-700 pt-4 ${alertColors.success.bg} -mx-4 -mb-4 px-4 py-4 rounded-b`}>
                  <p className={`text-xs ${alertColors.success.text}`}>
                    <strong>✓ With this system:</strong> Your password never travels as plain text. It can't be intercepted. It can't be stolen. Your data is safe even if our systems are breached. This is what your users deserve.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Logged In State - Session Display */
        <div className="space-y-4">
          {/* Success Banner */}
          <div className={`p-4 ${alertColors.success.bg} ${alertColors.success.border} rounded-lg`}>
            <p className={`${alertColors.success.text} font-semibold mb-1`}>
              ✓ You're Signed In
            </p>
            <p className={`text-sm ${alertColors.success.text}`}>
              Your session is real and secure. Your data is encrypted.
            </p>
          </div>

          {/* Session Info */}
          <div className="space-y-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
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
          <div className={`p-4 ${alertColors.info.bg} ${alertColors.info.border} rounded-lg`}>
            <p className={`text-sm ${alertColors.info.text} mb-2`}>
              💡 <strong>What Just Happened:</strong>
            </p>
            <ul className={`text-xs ${alertColors.info.text} space-y-1`}>
              <li>✓ Your password was scrambled one-way (nobody can un-scramble it)</li>
              <li>✓ It traveled in a locked envelope from your browser to the server</li>
              <li>✓ You got a secure ticket that proves you're logged in</li>
              <li>✓ Even the database stores only the scrambled version, not your real password</li>
            </ul>
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
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          <strong>Why this matters:</strong> Handling authentication securely is hard. This system does it right so your users' data is protected.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Supabase handles: password scrambling (hashing), secure tunnels (HTTPS), secure sessions, email verification, and automatic session expiration.
          Your users are safe from eavesdropping, account hijacking, and data theft.
        </p>
      </div>
    </div>
  );
}
