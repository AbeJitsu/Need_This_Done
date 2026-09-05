'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><head><style>{`button:hover { filter: brightness(.85); } button:active { filter: brightness(.7); } a:hover { text-decoration-thickness: 2px; } :focus-visible { outline: 3px solid #d0a94f; outline-offset: 3px; }`}</style></head><body style={{ margin: 0, background: '#f7f4ed', color: '#183229', fontFamily: 'system-ui, sans-serif' }}>
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '1.25rem', boxSizing: 'border-box' }}>
      <section style={{ maxWidth: '32rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem' }}>We could not load this page.</h1>
        <p style={{ lineHeight: 1.75 }}>Please try again. If the page still will not open, you can return home.</p>
        <button type="button" onClick={reset} style={{ minHeight: '48px', padding: '.75rem 1.75rem', borderRadius: '999px', border: 0, background: '#126b4e', color: 'white', font: 'inherit', fontWeight: 700, cursor: 'pointer' }}>Try Again</button>
        <p><a href="/" style={{ display: 'inline-flex', padding: '.75rem', color: '#126b4e' }}>Return Home</a></p>
      </section>
    </main>
  </body></html>;
}
