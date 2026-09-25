'use client';

import { useState } from 'react';
import { ArrowRight, Check, ExternalLink, RotateCw, X } from 'lucide-react';
import { PORTFOLIO_PAGES, type PortfolioPageId } from '@/lib/portfolio-pages';

type PageCheck = {
  page: { id: PortfolioPageId; label: string; path: string };
  checkedAt: string;
  title: string | null;
  mainHeading: string | null;
  headings: { tag: string; text: string }[];
  links: number;
  checks: { label: string; passed: boolean; detail: string }[];
};

export default function LivePageCheck() {
  const [selected, setSelected] = useState<PortfolioPageId>('home');
  const [result, setResult] = useState<PageCheck | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const page = PORTFOLIO_PAGES.find((item) => item.id === selected)!;

  async function runCheck() {
    setStatus('loading');
    setError('');
    setResult(null);
    try {
      const response = await fetch(`/api/portfolio/page-check?page=${selected}`);
      const payload = await response.json() as PageCheck & { error?: string };
      if (!response.ok) throw new Error(payload.error || 'The check could not finish.');
      setResult(payload);
      setStatus('success');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'The check could not finish.');
      setStatus('error');
    }
  }

  return (
    <div className="homepage-demo" id="live-demo">
      <div className="homepage-demo__intro">
        <div>
          <p className="homepage-eyebrow">Try a working feature</p>
          <h2 className="homepage-heading homepage-heading--compact">One click. A real page check.</h2>
          <p className="homepage-section__lead">
            Choose a page, then see what the server finds in its HTML. React handles
            the interaction; a JavaScript API reads the page and returns the results.
          </p>
        </div>
        <p className="homepage-demo__note">No account, email, or pretend results. These checks read public NeedThisDone pages.</p>
      </div>

      <div className="homepage-demo__grid">
        <div className="homepage-demo__controls">
          <p className="homepage-demo__step">01 / Choose a page</p>
          <div className="homepage-demo__choices" role="group" aria-label="Page to check">
            {PORTFOLIO_PAGES.map((choice) => (
              <button
                key={choice.id}
                type="button"
                className={`homepage-demo__choice ${selected === choice.id ? 'homepage-demo__choice--active' : ''}`}
                aria-pressed={selected === choice.id}
                disabled={status === 'loading'}
                onClick={() => { setSelected(choice.id); setResult(null); setStatus('idle'); setError(''); }}
              >
                <span>{choice.label}</span>
                <span className="homepage-demo__path">needthisdone.com{choice.path}</span>
              </button>
            ))}
          </div>
          <p className="homepage-demo__step">02 / See the response</p>
          <button type="button" className="homepage-button homepage-button--gold homepage-demo__run" onClick={runCheck} disabled={status === 'loading'}>
            {status === 'loading' ? <RotateCw className="homepage-demo__spin" aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
            {status === 'loading' ? 'Checking page…' : result ? 'Run check again' : 'Run live check'}
          </button>
          <p className="homepage-demo__small">The API reads one fixed public page. It stores nothing and sends no email.</p>
        </div>

        <div className="homepage-demo__output" aria-live="polite" aria-busy={status === 'loading'}>
          <div className="homepage-demo__windowbar">
            <span className="homepage-demo__dots" aria-hidden="true"><i /><i /><i /></span>
            <span>GET /api/portfolio/page-check?page={selected}</span>
          </div>
          {result ? (
            <div className="homepage-demo__results">
              <p className="homepage-demo__response">200 OK · Checked {new Date(result.checkedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
              <h3>{result.page.label}</h3>
              <p className="homepage-demo__page-title">{result.title || 'No page title found'}</p>
              <div className="homepage-demo__checks">
                {result.checks.map((check) => (
                  <div key={check.label} className="homepage-demo__check">
                    <span className={check.passed ? 'homepage-demo__pass' : 'homepage-demo__review'}>
                      {check.passed ? <Check aria-hidden="true" /> : <X aria-hidden="true" />}
                    </span>
                    <div><strong>{check.label}</strong><span>{check.detail}</span></div>
                  </div>
                ))}
              </div>
              <div className="homepage-demo__outline">
                <p>Heading outline · {result.links} links found</p>
                {result.headings.slice(0, 4).map((heading, index) => (
                  <div key={`${heading.tag}-${index}`} className={heading.tag === 'h1' ? '' : 'homepage-demo__subheading'}>
                    <code>{heading.tag}</code><span>{heading.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="homepage-demo__empty">
              <span className="homepage-demo__empty-icon" aria-hidden="true">{status === 'error' ? '!' : '{ }'}</span>
              <h3>{status === 'loading' ? 'Reading the page…' : status === 'error' ? 'Check unavailable' : 'Ready when you are.'}</h3>
              <p role={status === 'error' ? 'alert' : undefined}>
                {status === 'error' ? error : status === 'loading'
                  ? 'The server is checking the actual page title, headings, and description.'
                  : 'Pick a page and run the check to see a real response from the server.'}
              </p>
            </div>
          )}
          <div className="homepage-demo__footer">
            <span>React UI → Next.js API → HTML inspection</span>
            <a href={`https://needthisdone.com${page.path}`} target="_blank" rel="noopener noreferrer">
              Open page <ExternalLink aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
