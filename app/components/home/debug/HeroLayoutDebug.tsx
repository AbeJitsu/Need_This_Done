'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================
// TYPES
// ============================================================

interface HeroLayoutState {
  tabletHeight: number;
  phoneHeight: number;
  tabletOffsetY: number;
  phoneOffsetY: number;
}

export type { HeroLayoutState };

const DEFAULTS: HeroLayoutState = {
  tabletHeight: 453,
  phoneHeight: 453,
  tabletOffsetY: 0,
  phoneOffsetY: 0,
};

const CLAMP = {
  height: { min: 150, max: 600 },
  offsetY: { min: -200, max: 200 },
} as const;

// Device dimension formulas from DeviceMockup.tsx
// width = screenHeight * (nativeWidth / frameAspectHeight) + bezelPadding
function tabletWidth(h: number) {
  return Math.round(h * (820 / 1180) + 10);
}
function phoneWidth(h: number) {
  return Math.round(h * (393 / 852) + 10);
}

// ============================================================
// TAILWIND MAPPING
// ============================================================

function offsetYToTw(px: number): string {
  if (px === 0) return '(centered)';
  return `translate-y-[${px}px]`;
}

// ============================================================
// DRAG HOOK
// ============================================================

type DragAxis = 'x' | 'y';

function useDrag(
  axis: DragAxis,
  value: number,
  onChange: (v: number) => void,
  clampRange: { min: number; max: number },
  /** Invert drag direction (e.g., dragging left increases value) */
  invert = false,
) {
  const startVal = useRef(0);
  const startPos = useRef(0);
  const dragging = useRef(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      startVal.current = value;
      startPos.current = axis === 'x' ? e.clientX : e.clientY;
      dragging.current = true;
    },
    [axis, value],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const pos = axis === 'x' ? e.clientX : e.clientY;
      const delta = (pos - startPos.current) * (invert ? -1 : 1);
      const next = Math.round(Math.max(clampRange.min, Math.min(clampRange.max, startVal.current + delta)));
      onChange(next);
    },
    [axis, onChange, clampRange, invert],
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp };
}

// ============================================================
// MEASURED ELEMENT RECTS
// ============================================================

interface ElemRects {
  left: DOMRect | null;   // tablet device
  right: DOMRect | null;  // phone device
  center: DOMRect | null; // hero center column
  container: DOMRect | null; // grid wrapper
}

interface MeasuredGaps {
  outerLeft: number;
  innerLeft: number;
  innerRight: number;
  outerRight: number;
}

function computeGaps(rects: ElemRects): MeasuredGaps | null {
  if (!rects.left || !rects.right || !rects.center || !rects.container) return null;
  return {
    outerLeft: Math.round(rects.left.left - rects.container.left),
    innerLeft: Math.round(rects.center.left - rects.left.right),
    innerRight: Math.round(rects.right.left - rects.center.right),
    outerRight: Math.round(rects.container.right - rects.right.right),
  };
}

// ============================================================
// COMPONENT
// ============================================================

interface HeroLayoutDebugProps {
  state: HeroLayoutState;
  onChange: (s: HeroLayoutState) => void;
}

export function HeroLayoutDebug({ state, onChange }: HeroLayoutDebugProps) {
  const set = useCallback(
    <K extends keyof HeroLayoutState>(key: K, val: HeroLayoutState[K]) =>
      onChange({ ...state, [key]: val }),
    [state, onChange],
  );

  // Measure all hero elements for guide lines + gap bars
  const [elemRects, setElemRects] = useState<ElemRects>({
    left: null, right: null, center: null, container: null,
  });

  useEffect(() => {
    let rafId: number;
    const measure = () => {
      const leftEl = document.querySelector('[data-hero-device="left"]');
      const rightEl = document.querySelector('[data-hero-device="right"]');
      const centerEl = document.querySelector('[data-hero-center]');
      const containerEl = document.querySelector('[data-hero-container]');
      const next: ElemRects = {
        left: leftEl?.getBoundingClientRect() ?? null,
        right: rightEl?.getBoundingClientRect() ?? null,
        center: centerEl?.getBoundingClientRect() ?? null,
        container: containerEl?.getBoundingClientRect() ?? null,
      };
      setElemRects((prev) => {
        if (
          prev.left?.top === next.left?.top &&
          prev.left?.bottom === next.left?.bottom &&
          prev.left?.left === next.left?.left &&
          prev.left?.right === next.left?.right &&
          prev.right?.top === next.right?.top &&
          prev.right?.bottom === next.right?.bottom &&
          prev.right?.left === next.right?.left &&
          prev.right?.right === next.right?.right &&
          prev.center?.left === next.center?.left &&
          prev.center?.right === next.center?.right &&
          prev.container?.left === next.container?.left &&
          prev.container?.right === next.container?.right
        ) return prev;
        return next;
      });
      rafId = requestAnimationFrame(measure);
    };
    rafId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const gaps = computeGaps(elemRects);

  // Drag handlers for adjustable values (height + Y offset only — gaps are CSS-managed)
  const tabletDrag = useDrag(
    'y', state.tabletHeight,
    (v) => set('tabletHeight', v),
    CLAMP.height,
  );

  const phoneDrag = useDrag(
    'y', state.phoneHeight,
    (v) => set('phoneHeight', v),
    CLAMP.height,
  );

  const tabletYDrag = useDrag(
    'y', state.tabletOffsetY,
    (v) => set('tabletOffsetY', v),
    CLAMP.offsetY,
  );

  const phoneYDrag = useDrag(
    'y', state.phoneOffsetY,
    (v) => set('phoneOffsetY', v),
    CLAMP.offsetY,
  );

  const reset = () => onChange({ ...DEFAULTS });

  // Collapsible output panel
  const [panelOpen, setPanelOpen] = useState(true);

  const codeOutput = [
    `/* Hero Layout Values (justify-evenly handles gaps) */`,
    `/* Tablet height:     ${state.tabletHeight}px  (${tabletWidth(state.tabletHeight)}px wide) */`,
    `/* Phone height:      ${state.phoneHeight}px  (${phoneWidth(state.phoneHeight)}px wide) */`,
    `/* Tablet Y offset:   ${offsetYToTw(state.tabletOffsetY)}  (${state.tabletOffsetY}px) */`,
    `/* Phone Y offset:    ${offsetYToTw(state.phoneOffsetY)}  (${state.phoneOffsetY}px) */`,
  ].join('\n');

  const copyCode = () => navigator.clipboard.writeText(codeOutput);

  // Handle styles — shared between drag handles
  // pointer-events-auto re-enables interaction on each handle (parent is pointer-events-none)
  const handleBase =
    'absolute pointer-events-auto flex items-center justify-center select-none touch-none';

  // Y position for gap measurement bars — just above the device tops
  const gapBarY = elemRects.left && elemRects.right
    ? Math.min(elemRects.left.top, elemRects.right.top) - 28
    : null;

  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      {/* Red box overlay around hero center column */}
      {elemRects.center && (
        <div
          className="fixed border-2 border-red-500 pointer-events-none z-[9998]"
          style={{
            left: elemRects.center.left,
            top: elemRects.center.top,
            width: elemRects.center.width,
            height: elemRects.center.height,
          }}
        />
      )}

      {/* Alignment guide lines — full-width horizontal lines at device edges */}
      {elemRects.left && (
        <>
          <GuideLine y={elemRects.left.top} label="T-top" />
          <GuideLine y={elemRects.left.bottom} label="T-btm" />
        </>
      )}
      {elemRects.right && (
        <>
          <GuideLine y={elemRects.right.top} label="P-top" />
          <GuideLine y={elemRects.right.bottom} label="P-btm" />
        </>
      )}

      {/* Gap measurement bars — read-only, showing CSS-computed equal gaps */}
      {gaps && gapBarY != null && elemRects.left && elemRects.right && elemRects.center && elemRects.container && (
        <>
          <GapBar x1={elemRects.container.left} x2={elemRects.left.left} y={gapBarY} value={gaps.outerLeft} label="outer" />
          <GapBar x1={elemRects.left.right} x2={elemRects.center.left} y={gapBarY} value={gaps.innerLeft} label="inner" />
          <GapBar x1={elemRects.center.right} x2={elemRects.right.left} y={gapBarY} value={gaps.innerRight} label="inner" />
          <GapBar x1={elemRects.right.right} x2={elemRects.container.right} y={gapBarY} value={gaps.outerRight} label="outer" />
        </>
      )}

      {/* [C] Tablet resize handle — bottom-right corner of left column */}
      <div
        className={`${handleBase} w-8 h-8 bg-emerald-600 rounded-full cursor-nwse-resize hover:bg-emerald-500 border-2 border-white shadow-lg shadow-emerald-500/40`}
        style={{ left: 'calc(33.33% - 28px)', top: '55%' }}
        title={`Tablet height: ${state.tabletHeight}px`}
        {...tabletDrag}
      >
        <span className="text-[9px] text-white font-bold">H</span>
      </div>
      {/* Label for tablet resize */}
      <div
        className="absolute text-[10px] font-mono text-emerald-600 bg-white/80 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap"
        style={{ left: 'calc(33.33% - 90px)', top: 'calc(55% + 4px)' }}
      >
        Tablet {state.tabletHeight}px
      </div>

      {/* [D] Phone resize handle — bottom-left corner of right column */}
      <div
        className={`${handleBase} w-8 h-8 bg-purple-600 rounded-full cursor-nwse-resize hover:bg-purple-500 border-2 border-white shadow-lg shadow-purple-500/40`}
        style={{ right: 'calc(33.33% - 28px)', top: '55%' }}
        title={`Phone height: ${state.phoneHeight}px`}
        {...phoneDrag}
      >
        <span className="text-[9px] text-white font-bold">H</span>
      </div>
      {/* Label for phone resize */}
      <div
        className="absolute text-[10px] font-mono text-purple-600 bg-white/80 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap"
        style={{ right: 'calc(33.33% - 90px)', top: 'calc(55% + 4px)' }}
      >
        Phone {state.phoneHeight}px
      </div>

      {/* [E] Tablet Y-offset handle — horizontal bar, dragged vertically */}
      <div
        className={`${handleBase} h-6 bg-emerald-500/80 rounded-md cursor-ns-resize hover:bg-emerald-400 shadow-lg shadow-emerald-500/30 border border-emerald-300/50`}
        style={{ left: 'calc(16.67% - 40px)', top: '45%', width: 80 }}
        title={`Tablet Y offset: ${state.tabletOffsetY}px`}
        {...tabletYDrag}
      >
        <span className="text-[10px] text-white font-mono font-bold whitespace-nowrap">
          Y {state.tabletOffsetY}px
        </span>
      </div>
      {/* Label for tablet Y offset */}
      <div
        className="absolute text-[10px] font-mono text-emerald-600 bg-white/80 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap"
        style={{ left: 'calc(16.67% - 40px)', top: 'calc(45% - 20px)' }}
      >
        Tablet Y
      </div>

      {/* [F] Phone Y-offset handle — horizontal bar, dragged vertically */}
      <div
        className={`${handleBase} h-6 bg-purple-500/80 rounded-md cursor-ns-resize hover:bg-purple-400 shadow-lg shadow-purple-500/30 border border-purple-300/50`}
        style={{ right: 'calc(16.67% - 40px)', top: '45%', width: 80 }}
        title={`Phone Y offset: ${state.phoneOffsetY}px`}
        {...phoneYDrag}
      >
        <span className="text-[10px] text-white font-mono font-bold whitespace-nowrap">
          Y {state.phoneOffsetY}px
        </span>
      </div>
      {/* Label for phone Y offset */}
      <div
        className="absolute text-[10px] font-mono text-purple-600 bg-white/80 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap"
        style={{ right: 'calc(16.67% - 40px)', top: 'calc(45% - 20px)' }}
      >
        Phone Y
      </div>

      {/* Output panel — bottom right, collapsible */}
      <div className="fixed bottom-4 right-4 z-[9999] pointer-events-auto bg-slate-900/95 text-white rounded-xl shadow-2xl font-mono text-xs backdrop-blur-sm border border-slate-700 max-w-sm">
        <button
          onClick={() => setPanelOpen((p) => !p)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-800/50 rounded-t-xl transition-colors"
        >
          <span className="text-[11px] font-bold text-blue-400 tracking-wide uppercase">
            Hero Layout Debug
          </span>
          <span className="text-slate-400 text-sm">{panelOpen ? '▾' : '▸'}</span>
        </button>
        {panelOpen && (
          <div className="px-4 pb-4">
            {/* justify-evenly note */}
            <div className="mb-3 p-2 bg-blue-900/50 rounded border border-blue-700/50 text-[10px] text-blue-300">
              Gaps managed by CSS <code className="text-blue-200">justify-evenly</code>
            </div>

            {/* Live measured gaps (read-only) */}
            {gaps && (
              <div className="mb-3 p-2 bg-slate-800 rounded border border-slate-600">
                <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-1">Measured Gaps (CSS)</div>
                <div className="grid grid-cols-4 gap-1 text-center">
                  <GapCell label="Outer L" value={gaps.outerLeft} />
                  <GapCell label="Inner L" value={gaps.innerLeft} />
                  <GapCell label="Inner R" value={gaps.innerRight} />
                  <GapCell label="Outer R" value={gaps.outerRight} />
                </div>
              </div>
            )}

            <table className="w-full">
              <tbody>
                <Row label="Tablet" value={`${state.tabletHeight}px h`} tw={`${tabletWidth(state.tabletHeight)}px w`} color="text-emerald-400" />
                <Row label="Phone" value={`${state.phoneHeight}px h`} tw={`${phoneWidth(state.phoneHeight)}px w`} color="text-purple-400" />
                <Row label="Tablet Y" value={`${state.tabletOffsetY}px`} tw={offsetYToTw(state.tabletOffsetY)} color="text-emerald-400" />
                <Row label="Phone Y" value={`${state.phoneOffsetY}px`} tw={offsetYToTw(state.phoneOffsetY)} color="text-purple-400" />
              </tbody>
            </table>
            <div className="flex gap-2 mt-3">
              <button
                onClick={copyCode}
                className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-[11px] font-semibold transition-colors"
              >
                Copy Code
              </button>
              <button
                onClick={reset}
                className="flex-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-[11px] font-semibold transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

// Alignment guide line — fixed full-width bright red line at a given Y position
function GuideLine({ y, label }: { y: number; label: string }) {
  return (
    <div
      className="fixed left-0 right-0 z-[9998] pointer-events-none"
      style={{ top: y }}
    >
      <div className="w-full" style={{ height: 2, background: '#ef4444', opacity: 0.9 }} />
      <div
        className="absolute right-2 -top-5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
        style={{ color: '#fff', background: '#ef4444' }}
      >
        {label} {Math.round(y)}px
      </div>
    </div>
  );
}

// Gap measurement bar — horizontal dimension line between two X positions
function GapBar({ x1, x2, y, value, label }: { x1: number; x2: number; y: number; value: number; label: string }) {
  const width = x2 - x1;
  if (width < 20) return null;
  const color = label === 'outer' ? '#f59e0b' : '#3b82f6'; // amber for outer, blue for inner
  return (
    <div
      className="fixed pointer-events-none z-[9997]"
      style={{ left: x1, top: y, width, height: 20 }}
    >
      {/* Horizontal line */}
      <div className="absolute top-1/2 left-0 right-0" style={{ height: 2, background: color }} />
      {/* Left cap */}
      <div className="absolute left-0 top-0 bottom-0" style={{ width: 2, background: color }} />
      {/* Right cap */}
      <div className="absolute right-0 top-0 bottom-0" style={{ width: 2, background: color }} />
      {/* Center label */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-mono font-bold px-1 rounded whitespace-nowrap"
        style={{ background: color, color: '#fff' }}
      >
        {value}px
      </div>
    </div>
  );
}

// Measured gap cell in the output panel
function GapCell({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-[8px] text-slate-500">{label}</div>
      <div className="text-[11px] text-amber-400 font-bold">{value}px</div>
    </div>
  );
}

// Output panel table row
function Row({ label, value, tw, color }: { label: string; value: string; tw: string; color: string }) {
  return (
    <tr>
      <td className={`pr-3 py-0.5 ${color}`}>{label}</td>
      <td className="pr-3 py-0.5 text-slate-300">{value}</td>
      <td className="py-0.5 text-yellow-300">{tw}</td>
    </tr>
  );
}

export { DEFAULTS as HERO_LAYOUT_DEFAULTS };
