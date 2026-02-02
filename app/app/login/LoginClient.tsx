'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { getAuthTitle, getAuthDescription } from '@/lib/auth-utils';
import { FadeIn } from '@/components/motion/FadeIn';

// ============================================================================
// Login Client Component - Bold Editorial Dark
// ============================================================================
// Matches the site-wide editorial aesthetic: accent line + uppercase label,
// font-black headings, dark glass card, emerald primary CTA.

export default function LoginClient() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Derive a key for AnimatePresence mode transitions
  const modeKey = isForgotPassword ? 'forgot' : isSignUpMode ? 'signup' : 'signin';

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

      if (!isSignUpMode && data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      if (isSignUpMode) {
        setSuccessMessage('Account created! Check your email to confirm, then sign in.');
        setIsSignUpMode(false);
        setEmail('');
        setPassword('');
      }
    } catch {
      setError('Hmm, something went wrong on our end. Please try again or reach out.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // Handle Google Sign-In (via NextAuth)
  // ============================================================================

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch {
      setError('We couldn\'t sign you in with Google. Want to try again?');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  const title = getAuthTitle(isForgotPassword, isSignUpMode);

  // Uppercase label text based on mode
  const labelText = isForgotPassword ? 'Account Recovery' : isSignUpMode ? 'Join Us' : 'Sign In';

  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-900">
      {/* ================================================================
          Animated Gradient Background
          ================================================================ */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />

        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(34,197,94,0.4) 0%, transparent 70%)',
            top: '-10%',
            left: '-10%',
            animation: 'float1 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)',
            bottom: '-5%',
            right: '-5%',
            animation: 'float2 25s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(20,184,166,0.4) 0%, transparent 70%)',
            top: '50%',
            left: '60%',
            animation: 'float3 18s ease-in-out infinite',
          }}
        />
      </div>

      {/* ================================================================
          Main Content
          ================================================================ */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-12">
        {/* Back to home link */}
        <Link
          href="/"
          className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">&larr;</span>
          Back to Home
        </Link>

        {/* Glass Card Container */}
        <div className="w-full max-w-md">
          {/* Editorial header: accent line + uppercase label + font-black heading */}
          <FadeIn triggerOnScroll={false} delay={0}>
            <div className="flex items-center gap-3 mb-5 justify-center">
              <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
              <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">{labelText}</span>
            </div>
          </FadeIn>

          <FadeIn triggerOnScroll={false} delay={0.1}>
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[0.95] mb-3">
                {title.plain}{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  {title.gradient}
                </span>
              </h1>
              <p className="text-slate-400">
                {getAuthDescription(isForgotPassword, isSignUpMode)}
              </p>
            </div>
          </FadeIn>

          {/* Glass Card */}
          <FadeIn triggerOnScroll={false} delay={0.2}>
            <div
              className="relative backdrop-blur-2xl bg-white/[0.08] rounded-2xl p-8 md:p-10 border border-white/[0.12] ring-1 ring-white/[0.06]"
              style={{
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 60px rgba(16,185,129,0.08), 0 0 60px rgba(59,130,246,0.06), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(255,255,255,0.05)',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.08) 100%)',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={modeKey}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <form onSubmit={handleAuth} className="space-y-5">

                    {/* Error Message */}
                    {error && (
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
                        <p className="text-sm text-red-300">{error}</p>
                      </div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                      <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 backdrop-blur-sm">
                        <p className="text-sm text-green-300">{successMessage}</p>
                      </div>
                    )}

                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white/[0.08] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                          placeholder="you@example.com"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    {!isForgotPassword && (
                      <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                          <input
                            id="password"
                            type="password"
                            autoComplete={isSignUpMode ? 'new-password' : 'current-password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white/[0.08] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                            placeholder={isSignUpMode ? 'Min 6 characters' : 'Your password'}
                            disabled={isSubmitting}
                          />
                        </div>
                        {!isSignUpMode && (
                          <div className="text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setIsForgotPassword(true);
                                setError('');
                                setSuccessMessage('');
                              }}
                              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              Forgot your password?
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submit Button - emerald primary CTA */}
                    <motion.button
                      type="submit"
                      disabled={isSubmitting || !email || (!isForgotPassword && !password)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 px-6 font-semibold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                    >
                      {isSubmitting
                        ? isForgotPassword
                          ? 'Sending link...'
                          : isSignUpMode
                            ? 'Creating account...'
                            : 'Signing in...'
                        : isForgotPassword
                          ? 'Send Reset Link'
                          : isSignUpMode
                            ? 'Create Account'
                            : 'Sign In'}
                    </motion.button>

                    {/* Divider */}
                    {!isForgotPassword && (
                      <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/[0.1]"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-slate-800 text-slate-400">
                            or continue with
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
                        className="w-full py-3.5 px-6 backdrop-blur-sm bg-white/[0.05] text-white font-medium rounded-xl border border-white/[0.1] hover:bg-white/[0.1] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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
                          className="text-sm text-slate-400 hover:text-white transition-colors"
                        >
                          &larr; Back to Sign In
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
                          className="text-sm text-slate-400 hover:text-white transition-colors"
                        >
                          {isSignUpMode
                            ? 'Already have an account? Sign in'
                            : "Don't have an account? Sign up"}
                        </button>
                      )}
                    </div>
                  </form>
                </motion.div>
              </AnimatePresence>
            </div>
          </FadeIn>

          {/* Helpful Links */}
          <FadeIn triggerOnScroll={false} delay={0.3}>
            <div className="text-center mt-8">
              <p className="text-sm text-slate-500">
                New here?{' '}
                <Link href="/services" className="text-gold-400 hover:text-gold-300 transition-colors">
                  See what we do
                </Link>
                {' · '}
                <Link href="/contact" className="text-gold-400 hover:text-gold-300 transition-colors">
                  Get a free quote
                </Link>
              </p>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* ================================================================
          CSS Animations - Floating orbs
          ================================================================ */}
      <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 20px) scale(1.05); }
          66% { transform: translate(30px, -40px) scale(0.95); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, 40px) scale(1.1); }
          66% { transform: translate(-30px, -20px) scale(0.9); }
        }
      `}</style>
    </div>
  );
}
