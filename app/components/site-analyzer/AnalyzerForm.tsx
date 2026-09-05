'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalyzerForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting.current) return;
    setError('');
    let submittedUrl = url.trim();
    if (!/^https?:\/\//i.test(submittedUrl)) submittedUrl = `https://${submittedUrl}`;
    try {
      const parsed = new URL(submittedUrl);
      if (!url.trim() || !parsed.hostname.includes('.') || parsed.username || parsed.password) throw new Error();
    } catch { setError('Enter a website address, such as example.com.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter an email address, such as you@example.com.'); return;
    }
    submitting.current = true;
    setPending(true);
    try {
      const response = await fetch('/api/site-analyzer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: submittedUrl, email: email.trim() }),
      });
      const data = await response.json().catch(() => null);
      if (response.status === 429) {
        setError('The snapshot limit has been reached. Please try again tomorrow. Your entries are still here.');
      } else if (!response.ok) {
        setError('We could not create your snapshot. Check the website address and try again. Your entries are still here.');
      } else if (typeof data?.redirectUrl === 'string' && /^\/report\/[^/?#]+(?:\?[^#]*)?$/.test(data.redirectUrl)) {
        router.push(data.redirectUrl);
        return;
      } else {
        setError('The report link was unavailable. Please try again. Your entries are still here.');
      }
    } catch {
      setError('We could not connect. Check your connection and try again. Your entries are still here.');
    }
    submitting.current = false;
    setPending(false);
  }

  const input = 'mt-2 min-h-12 w-full min-w-0 rounded-xl border border-[var(--public-ink)]/20 bg-[var(--public-cream)] px-4 py-3 disabled:opacity-70';
  return <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-busy={pending}>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="min-w-0 font-semibold">Website URL
        <input type="text" inputMode="url" autoComplete="url" value={url} onChange={event => setUrl(event.target.value)} placeholder="https://yoursite.com" disabled={pending} required className={input} aria-describedby={error ? 'snapshot-error' : undefined} />
      </label>
      <label className="min-w-0 font-semibold">Email address
        <input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" disabled={pending} required className={input} aria-describedby={error ? 'snapshot-error' : undefined} />
      </label>
    </div>
    <button type="submit" disabled={pending} className="public-action">{pending ? 'Creating your snapshot' : error ? 'Try creating your snapshot again' : 'Create my website snapshot'}</button>
    <p role="status" className="text-[var(--public-muted)]">{pending ? 'Your request is being processed. Your report will open when it is ready.' : ''}</p>
    {error && <p id="snapshot-error" role="alert" className="rounded-xl border border-red-800/20 bg-red-50 p-4 text-red-900">{error}</p>}
  </form>;
}
