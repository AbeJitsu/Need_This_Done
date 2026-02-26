// ============================================================================
// Device Preview Page — /admin/dev/preview
// ============================================================================
// What: Admin page showing the site in 3 device frames (iMac, iPad, iPhone)
// Why: Quick visual QA across breakpoints without opening multiple browser windows
// How: DeviceShowcase orchestrates iframes with drag-and-drop repositioning

'use client';

import DeviceShowcase from '@/components/DeviceShowcase/DeviceShowcase';

export default function PreviewPage() {
  return (
    <>
      {/* Ambient glow orbs */}
      <div
        style={{
          position: 'fixed',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'rgba(52, 211, 153, 0.12)',
          filter: 'blur(140px)',
          top: -100,
          left: '10%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'fixed',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(167, 139, 250, 0.08)',
          filter: 'blur(140px)',
          bottom: -100,
          right: '10%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Page content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.72rem',
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#34d399',
              marginBottom: 20,
              padding: '5px 14px',
              border: '1px solid rgba(52, 211, 153, 0.2)',
              borderRadius: 100,
              background: 'rgba(52, 211, 153, 0.05)',
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#34d399',
                animation: 'blink 2s ease-in-out infinite',
              }}
            />
            Live Preview
          </div>
          <h1
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: 12,
            }}
          >
            Responsive{' '}
            <em
              style={{
                fontStyle: 'italic',
                background: 'linear-gradient(135deg, #34d399, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Device Showcase
            </em>
          </h1>
          <p
            style={{
              fontSize: '0.95rem',
              color: '#8b8fa3',
              fontWeight: 300,
              lineHeight: 1.6,
            }}
          >
            All three breakpoints, one view. Drag devices to reposition.
          </p>
        </header>

        <DeviceShowcase />

        {/* Footer */}
        <footer
          style={{
            textAlign: 'center',
            marginTop: 60,
            paddingTop: 30,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <p style={{ fontSize: '0.75rem', color: '#565a6e', fontWeight: 300 }}>
            Need This Done &mdash; Device Preview
          </p>
        </footer>
      </div>

      {/* Keyframe for blink animation */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
