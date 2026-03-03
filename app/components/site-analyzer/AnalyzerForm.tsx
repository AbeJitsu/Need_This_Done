'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// ============================================================================
// Site Analyzer Form
// ============================================================================
// Client component: URL + email input, submits to /api/site-analyzer,
// shows progress animation, then redirects to /report/[id].

type FormState = 'idle' | 'crawling' | 'analyzing' | 'building' | 'error' | 'rate-limited';

const PROGRESS_MESSAGES: Record<string, string> = {
  crawling: 'Crawling pages...',
  analyzing: 'Running analysis...',
  building: 'Building your report...',
};

export default function AnalyzerForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const isSubmitting = ['crawling', 'analyzing', 'building'].includes(state);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage('');

    // Client-side validation
    if (!url.trim()) { setErrorMessage('Please enter a URL'); return; }
    if (!email.trim()) { setErrorMessage('Please enter your email'); return; }

    // Ensure URL has protocol
    let submittedUrl = url.trim();
    if (!submittedUrl.startsWith('http://') && !submittedUrl.startsWith('https://')) {
      submittedUrl = `https://${submittedUrl}`;
    }

    // Progress animation — simulates stages while the API works
    setState('crawling');
    const timer1 = setTimeout(() => setState('analyzing'), 4000);
    const timer2 = setTimeout(() => setState('building'), 12000);

    try {
      const response = await fetch('/api/site-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: submittedUrl, email: email.trim() }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (response.status === 429) {
        const data = await response.json();
        setState('rate-limited');
        setErrorMessage(data.error || "You've used your 2 free analyses for today. Come back tomorrow!");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Something went wrong' }));
        setState('error');
        setErrorMessage(data.error || 'Analysis failed. Please try again.');
        return;
      }

      const data = await response.json();
      setState('building');

      // Brief pause to show "Building your report" before redirect
      setTimeout(() => {
        router.push(data.redirectUrl);
      }, 500);
    } catch {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setState('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yoursite.com"
            disabled={isSubmitting}
            className="flex-1 px-5 py-4 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all disabled:opacity-50"
            aria-label="Website URL"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            disabled={isSubmitting}
            className="flex-1 px-5 py-4 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all disabled:opacity-50"
            aria-label="Email address"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {PROGRESS_MESSAGES[state] || 'Processing...'}
            </span>
          ) : (
            'Analyze My Site'
          )}
        </button>
      </form>

      {/* Error / rate limit message */}
      {(state === 'error' || state === 'rate-limited') && errorMessage && (
        <div className={`mt-4 px-5 py-3 rounded-xl text-sm ${
          state === 'rate-limited'
            ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
            : 'bg-red-500/10 border border-red-500/20 text-red-300'
        }`}>
          {errorMessage}
        </div>
      )}
    </div>
  );
}
