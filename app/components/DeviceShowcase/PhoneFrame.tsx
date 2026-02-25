'use client';

import { useState, useEffect } from 'react';

// ============================================================================
// PhoneFrame — iPhone with Google Chrome browser chrome
// ============================================================================
// What: Wraps children (ScaledIframe) in an iPhone frame with Chrome UI
// Why: Shows how the site looks on mobile with actual browser chrome eating viewport
// How: All chrome zones (status bar, omnibox, toolbar, home indicator) are DIRECT
//      flex children of the aspect-ratio container so percentage heights resolve
//      correctly against the container's known height.
//
// The outer shell uses aspect-ratio 393/852 (full iPhone screen).
// Chrome UI takes ~15% of the screen (8% top, 7% bottom).
// The iframe sits in the remaining ~85% middle zone.

interface PhoneFrameProps {
  children: React.ReactNode;
}

function getFormattedTime(): string {
  const now = new Date();
  const h = now.getHours() % 12 || 12;
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
  const [time, setTime] = useState(getFormattedTime);

  useEffect(() => {
    const tick = () => setTime(getFormattedTime());
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      tick();
      interval = setInterval(tick, 60_000);
    }, msUntilNextMinute);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);
  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #2c2c2e 0%, #3a3a3c 2%, #2c2c2e 100%)',
        borderRadius: 20,
        padding: 5,
        boxShadow:
          '0 25px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      <div
        style={{
          background: '#000',
          borderRadius: 16,
          overflow: 'hidden',
          aspectRatio: '393 / 852',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Notch (absolute, sits on top of status bar) ── */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '36%',
            height: '2.2%',
            background: '#000',
            borderRadius: '0 0 16px 16px',
            zIndex: 12,
          }}
        />

        {/* ══════════════════════════════════════════════════
            iOS Status Bar — direct flex child (4% of screen)
            Dark bg matching notch area, white text
           ══════════════════════════════════════════════════ */}
        <div
          style={{
            height: '4%',
            flexShrink: 0,
            background: '#1c1c1e',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            padding: '2.5% 6% 0',
            fontFamily: "-apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif",
            fontSize: 7,
            fontWeight: 600,
            color: '#fff',
            letterSpacing: '0.01em',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <span style={{ flex: 1 }}>{time}</span>
          <span
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 3,
            }}
          >
            {/* Cellular signal */}
            <svg width="8" height="5" viewBox="0 0 17 10.7" fill="currentColor">
              <rect x="0" y="7.7" width="3" height="3" rx="0.5" />
              <rect x="4.5" y="5" width="3" height="5.7" rx="0.5" />
              <rect x="9" y="2.3" width="3" height="8.4" rx="0.5" />
              <rect x="13.5" y="0" width="3" height="10.7" rx="0.5" />
            </svg>
            {/* Battery */}
            <svg width="13" height="6" viewBox="0 0 27 13" fill="currentColor">
              <rect x="0.5" y="0.5" width="22" height="12" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M24 4v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="2" y="2" width="18" height="9" rx="1" fill="currentColor" />
            </svg>
          </span>
        </div>

        {/* ══════════════════════════════════════════════════
            Chrome Omnibox — direct flex child (4% of screen)
            Dark bg with translucent pill for URL
           ══════════════════════════════════════════════════ */}
        <div
          style={{
            height: '4%',
            flexShrink: 0,
            background: '#2c2c2e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 5%',
            borderBottom: '0.5px solid rgba(255,255,255,0.1)',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              width: '100%',
              height: '65%',
              background: 'rgba(255,255,255,0.12)',
              borderRadius: 6,
              fontFamily: "-apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif",
              fontSize: 6.5,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.8)',
              padding: '0 6px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {/* Lock icon */}
            <svg width="6" height="7" viewBox="0 0 12 14" fill="rgba(255,255,255,0.6)" style={{ flexShrink: 0 }}>
              <rect x="1" y="6" width="10" height="7" rx="2" />
              <path d="M3.5 6V4.5a2.5 2.5 0 0 1 5 0V6" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>
              needthisdone.com
            </span>
            {/* Three-dot menu icon (Chrome style) */}
            <svg width="6" height="7" viewBox="0 0 12 14" fill="rgba(255,255,255,0.6)" style={{ flexShrink: 0 }}>
              <circle cx="6" cy="3" r="1.2" />
              <circle cx="6" cy="7" r="1.2" />
              <circle cx="6" cy="11" r="1.2" />
            </svg>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            MIDDLE ZONE — iframe content (flex: 1 fills remaining)
            This is where ScaledIframe renders
           ══════════════════════════════════════════════════ */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {children}
        </div>

        {/* ══════════════════════════════════════════════════
            Chrome Toolbar — direct flex child (6% of screen)
            5 navigation icons
           ══════════════════════════════════════════════════ */}
        <div
          style={{
            height: '6%',
            flexShrink: 0,
            background: '#f9f9f9',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-around',
            padding: '4% 6% 0',
            borderTop: '0.5px solid rgba(0,0,0,0.1)',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Back arrow — thin chevron */}
          <svg width="8" height="8" viewBox="0 0 14 14" fill="none" stroke="#5f6368" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 2L4 7l5 5" />
          </svg>
          {/* Forward arrow */}
          <svg width="8" height="8" viewBox="0 0 14 14" fill="none" stroke="#5f6368" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 2l5 5-5 5" />
          </svg>
          {/* New tab (+) */}
          <svg width="8" height="8" viewBox="0 0 14 14" fill="none" stroke="#5f6368" strokeWidth="1.6" strokeLinecap="round">
            <path d="M7 2v10M2 7h10" />
          </svg>
          {/* Tab count — rounded square with "1" */}
          <svg width="8" height="8" viewBox="0 0 14 14" fill="none" stroke="#5f6368" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="10" height="10" rx="2" />
            <text x="7" y="10" textAnchor="middle" fill="#5f6368" stroke="none" fontSize="7" fontWeight="600" fontFamily="sans-serif">1</text>
          </svg>
          {/* More menu (···) — horizontal three dots */}
          <svg width="8" height="8" viewBox="0 0 14 14" fill="#5f6368">
            <circle cx="3" cy="7" r="1.2" />
            <circle cx="7" cy="7" r="1.2" />
            <circle cx="11" cy="7" r="1.2" />
          </svg>
        </div>

        {/* ══════════════════════════════════════════════════
            Home Indicator — direct flex child (1% of screen)
           ══════════════════════════════════════════════════ */}
        <div
          style={{
            height: '1%',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f9f9f9',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: '32%',
              height: 2.5,
              background: '#000',
              borderRadius: 100,
              opacity: 0.15,
            }}
          />
        </div>
      </div>
    </div>
  );
}
