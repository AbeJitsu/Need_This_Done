'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { signIn as signInWithNextAuth } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { getAuthTitle, getAuthDescription } from '@/lib/auth-utils';
import { FadeIn } from '@/components/motion/FadeIn';

// ============================================================================
// Login Client Component - Private Workspace
// ============================================================================
// Matches the public site's light canvas, restrained cards, and emerald CTA
// while keeping the authenticated workspace clearly separate.

export default function LoginClient({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Derive a key for AnimatePresence mode transitions
  const modeKey = isForgotPassword ? 'forgot' : 'signin';

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
      setError('We\'ll need your email to proceed');
      return;
    }

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
      } catch {
        setError('Hmm, something went wrong on our end. Please try again or reach out.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!password) {
      setError('Don\'t forget your password');
      return;
    }

    if (password.length < 6) {
      setError('Your password should be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/auth/login', {
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

      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      router.push('/dashboard');
    } catch {
      setError('Hmm, something went wrong on our end. Please try again or reach out.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // Keep the existing branded NextAuth Google redirect. After Google returns,
  // AuthProvider exchanges the signed Google ID token for a Supabase session.
  // ============================================================================

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      await signInWithNextAuth('google', { callbackUrl: '/dashboard' });
    } catch {
      setError('We couldn\'t sign you in with Google. Want to try again?');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section
        className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4"
        aria-live="polite"
        aria-label="Loading workspace"
      >
        <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-600" aria-hidden="true" />
          Loading workspace…
        </div>
      </section>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  const title = getAuthTitle(isForgotPassword, false);

  const labelText = isForgotPassword ? 'Account Recovery' : 'Sign In';

  return (
    <section className="relative isolate overflow-hidden bg-gray-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(16,185,129,0.14),transparent_32%),radial-gradient(circle_at_85%_85%,rgba(14,165,233,0.12),transparent_32%)]" aria-hidden="true" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,440px)] lg:gap-20 lg:py-16">
        <FadeIn triggerOnScroll={false} delay={0}>
          <div className="max-w-xl">
            <div className="mb-6 flex items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Private workspace
              </span>
              <span className="text-sm text-gray-500">NeedThisDone</span>
            </div>

            <h1 className="max-w-lg text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl sm:leading-[1.05]">
              Continue where the work is <span className="text-emerald-600">clear.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-gray-600">
              Sign in to review your work, evidence, approvals, and next step in one focused place.
            </p>

            <ul className="mt-8 space-y-4 text-sm text-gray-700" aria-label="Workspace features">
              {[
                'Review active work and its handoffs',
                'See evidence alongside each decision',
                'Keep approvals explicit before action',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 max-w-md rounded-2xl bg-gray-900 p-5 text-white shadow-xl shadow-gray-900/10">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold">A deliberate boundary</p>
                  <p className="mt-1 text-sm leading-6 text-gray-300">
                    Your workspace is for review and coordination. People stay in the loop where a decision matters.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn triggerOnScroll={false} delay={0.1}>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-8">
            <div className="mb-7">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{labelText}</p>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                {title.plain}{' '}
                <span className="text-emerald-600">{title.gradient}</span>
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                {getAuthDescription(isForgotPassword, false)}
              </p>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={modeKey}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                {!isForgotPassword && googleEnabled && (
                  <>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isSubmitting}
                      className="flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue with Google
                    </button>

                    <div className="my-6 flex items-center gap-3" aria-hidden="true">
                      <div className="h-px flex-1 bg-gray-200" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">or use email</span>
                      <div className="h-px flex-1 bg-gray-200" />
                    </div>
                  </>
                )}

                <form onSubmit={handleAuth} className="space-y-5" aria-label={isForgotPassword ? 'Password reset form' : 'Sign in form'}>
                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
                      <p className="text-sm leading-6 text-red-700">{error}</p>
                    </div>
                  )}

                  {successMessage && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4" role="status">
                      <p className="text-sm leading-6 text-emerald-800">{successMessage}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-800">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-10 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                        placeholder="you@example.com"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {!isForgotPassword && (
                    <div className="space-y-2">
                      <label htmlFor="password" className="block text-sm font-semibold text-gray-800">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                        <input
                          id="password"
                          type="password"
                          autoComplete="current-password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-10 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                          placeholder="Your password"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setError('');
                            setSuccessMessage('');
                          }}
                          className="text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                        >
                          Forgot your password?
                        </button>
                      </div>
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isSubmitting || !email || (!isForgotPassword && !password)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="min-h-12 w-full rounded-full bg-emerald-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-emerald-600/20 transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  >
                    {isSubmitting
                      ? isForgotPassword ? 'Sending link…' : 'Signing in…'
                      : isForgotPassword ? 'Send Reset Link' : 'Sign In'}
                  </motion.button>

                  {isForgotPassword && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setError('');
                        setSuccessMessage('');
                      }}
                      disabled={isSubmitting}
                      className="flex min-h-10 w-full items-center justify-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      Back to Sign In
                    </button>
                  )}
                </form>
              </motion.div>
            </AnimatePresence>

            <div className="mt-7 flex items-center justify-between border-t border-gray-200 pt-5 text-sm">
              <Link href="/" className="inline-flex items-center gap-2 font-medium text-gray-500 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to site
              </Link>
              <Link href="/contact" className="font-medium text-emerald-700 transition-colors hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2">
                Need help?
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
