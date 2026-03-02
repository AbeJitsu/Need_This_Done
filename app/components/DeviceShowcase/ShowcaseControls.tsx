// ============================================================================
// ShowcaseControls — URL input, layout toggles, reset button
// ============================================================================
// What: Control bar for the device showcase
// Why: Lets users change the preview URL and switch layouts
// How: Dark-themed inputs matching the admin design language

'use client';

import type { LayoutMode, DevicePosition } from './device-config';

interface ShowcaseControlsProps {
  url: string;
  onUrlChange: (url: string) => void;
  onLoad: () => void;
  layoutMode: LayoutMode;
  onLayoutChange: (mode: LayoutMode) => void;
  positions: Record<string, DevicePosition>;
  onReset: () => void;
}

export default function ShowcaseControls({
  url,
  onUrlChange,
  onLoad,
  layoutMode,
  onLayoutChange,
  positions,
  onReset,
}: ShowcaseControlsProps) {
  const hasCustomPositions = Object.values(positions).some(
    (p) => p.x !== 0 || p.y !== 0
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 50,
        flexWrap: 'wrap',
      }}
    >
      {/* URL input */}
      <div style={{ position: 'relative', width: 340 }}>
        <input
          type="url"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onLoad()}
          placeholder="http://localhost:3000"
          style={{
            background: '#1a1e28',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10,
            padding: '12px 18px',
            fontFamily: "'DM Sans', monospace",
            fontSize: '0.85rem',
            color: layoutMode === 'showcase' ? '#565a6e' : '#f0f0f2',
            width: '100%',
            outline: 'none',
          }}
        />
        {layoutMode === 'showcase' && (
          <span
            style={{
              position: 'absolute',
              right: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.7rem',
              color: '#8b8fa3',
              pointerEvents: 'none',
            }}
          >
            +?heroPhase
          </span>
        )}
      </div>

      {/* Load button */}
      <button
        onClick={onLoad}
        style={{
          border: 'none',
          borderRadius: 10,
          padding: '12px 22px',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #34d399, #2dd4a0)',
          color: '#0a0c10',
        }}
      >
        Load
      </button>

      {/* Layout toggles */}
      <ToggleButton
        active={layoutMode === 'grouped'}
        onClick={() => onLayoutChange('grouped')}
      >
        Grouped
      </ToggleButton>
      <ToggleButton
        active={layoutMode === 'spread'}
        onClick={() => onLayoutChange('spread')}
      >
        Side by Side
      </ToggleButton>
      <ToggleButton
        active={layoutMode === 'showcase'}
        onClick={() => onLayoutChange('showcase')}
      >
        Showcase
      </ToggleButton>

      {/* Reset positions — only visible when devices have been moved */}
      {hasCustomPositions && (
        <button
          onClick={onReset}
          style={{
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10,
            padding: '12px 18px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer',
            background: 'rgba(167, 139, 250, 0.08)',
            color: '#a78bfa',
          }}
        >
          Reset Positions
        </button>
      )}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        border: `1px solid ${active ? 'rgba(96, 165, 250, 0.3)' : 'rgba(255,255,255,0.12)'}`,
        borderRadius: 10,
        padding: '12px 22px',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.85rem',
        fontWeight: 600,
        cursor: 'pointer',
        background: active ? 'rgba(96, 165, 250, 0.12)' : '#1a1e28',
        color: active ? '#60a5fa' : '#8b8fa3',
      }}
    >
      {children}
    </button>
  );
}
