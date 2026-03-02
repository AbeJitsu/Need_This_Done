// ============================================================================
// MonitorFrame — iMac-style display chrome
// ============================================================================
// What: Wraps children (ScaledIframe) in a realistic iMac frame
// Why: Provides the desktop device context in the showcase
// How: Aluminum gradient body → screen area → chin with logo → tapered stand → oval base
//
// The forwarded ref wraps only the body (shell + chin), NOT the stand/base.
// This lets DeviceShowcase measure just the screen area for centering
// tablet/phone devices correctly.

import { forwardRef } from 'react';

interface MonitorFrameProps {
  children: React.ReactNode;
}

const MonitorFrame = forwardRef<HTMLDivElement, MonitorFrameProps>(
  function MonitorFrame({ children }, ref) {
    return (
      <div>
        {/* Body (shell + chin) — ref here so measurements exclude stand/base */}
        <div ref={ref}>
          {/* Aluminum outer shell */}
          <div
            style={{
              background: 'linear-gradient(180deg, #2c2c2e 0%, #3a3a3c 2%, #2c2c2e 100%)',
              borderRadius: 12,
              padding: '8px 8px 0 8px',
              boxShadow:
                '0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            {/* Screen area */}
            <div
              style={{
                background: '#000',
                borderRadius: 4,
                overflow: 'hidden',
                aspectRatio: '1512 / 982',
                position: 'relative',
              }}
            >
              {children}
            </div>
          </div>

          {/* Aluminum chin with centered logo circle */}
          <div
            style={{
              height: 22,
              background: 'linear-gradient(180deg, #3a3a3c, #2c2c2e)',
              borderRadius: '0 0 12px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.1)',
              }}
            />
          </div>
        </div>

        {/* Tapered stand neck */}
        <div
          style={{
            width: 50,
            height: 48,
            margin: '0 auto',
            background: 'linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 100%)',
            clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        />

        {/* Flat oval base */}
        <div
          style={{
            width: '45%',
            height: 5,
            margin: '0 auto',
            background: 'linear-gradient(180deg, #3a3a3c, #2c2c2e)',
            borderRadius: '0 0 50% 50% / 0 0 100% 100%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        />
      </div>
    );
  }
);

export default MonitorFrame;
