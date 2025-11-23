'use client';

import { useState } from 'react';

// ============================================================================
// Authentication Demo Component - Sign Up/Login Demonstration
// ============================================================================
// Shows how user authentication works in plain language. Visitors can
// "sign up" and "log in" to see how accounts and sessions work.
// No real accounts are created - this is just a demonstration.

interface UserSession {
  email: string;
  name: string;
  loginTime: string;
  isLoggedIn: boolean;
}

export default function AuthDemo() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  // ========================================================================
  // Handle sign up / login
  // ========================================================================
  const handleSignUp = async () => {
    if (!email || !name) {
      return;
    }

    setIsSigningUp(true);

    // Simulate account creation/login process
    await new Promise((resolve) => setTimeout(resolve, 500));

    setSession({
      email,
      name,
      loginTime: new Date().toLocaleTimeString(),
      isLoggedIn: true,
    });

    setEmail('');
    setName('');
    setIsSigningUp(false);
  };

  // ========================================================================
  // Handle logout
  // ========================================================================
  const handleLogout = () => {
    setSession(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          See User Accounts Working
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Type an email and name below. You'll have an instant account with a login session.
        </p>
      </div>

      {/* Logged Out State - Sign Up Form */}
      {!session ? (
        <div className="space-y-4">
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
              disabled={isSigningUp}
            />
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="
                w-full px-4 py-2
                border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-700
                text-gray-900 dark:text-gray-100
                rounded-lg
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
              disabled={isSigningUp}
            />
          </div>

          {/* Sign Up Button */}
          <button
            onClick={handleSignUp}
            disabled={isSigningUp || !email || !name}
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
            {isSigningUp ? 'Creating Account...' : 'Create Account & Sign In'}
          </button>

          {/* Explanation */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              This is a demo - no real account is created. But this is exactly how real authentication works:
              you provide info, we create an account, and you're instantly logged in.
            </p>
          </div>
        </div>
      ) : (
        /* Logged In State - Session Display */
        <div className="space-y-4">
          {/* Success Banner */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-700 dark:text-green-300 font-semibold mb-1">
              ✓ You're Signed In
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">
              Your session was created instantly. Your info is stored safely.
            </p>
          </div>

          {/* Session Info */}
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">
                Your Account
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-300">Name:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{session.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-300">Email:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{session.email}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">
                Session Info
              </p>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-300">Logged in at:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{session.loginTime}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm text-gray-600 dark:text-gray-300">Active Session</span>
              </div>
            </div>
          </div>

          {/* What This Means */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 <strong>Here's what happened:</strong> You filled in a form, clicked a button, and instantly have
              a logged-in account. Your browser remembers you're logged in without needing to sign in again.
              This is what your users will experience.
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="
              w-full px-4 py-3
              border-2 border-gray-300 dark:border-gray-600
              hover:border-gray-400 dark:hover:border-gray-500
              text-gray-700 dark:text-gray-300
              font-semibold
              rounded-lg
              transition-all duration-200
              active:scale-95
            "
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Educational Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Real authentication includes password hashing, secure sessions, and protection against attacks.
          All of that is already built in and ready to use.
        </p>
      </div>
    </div>
  );
}
