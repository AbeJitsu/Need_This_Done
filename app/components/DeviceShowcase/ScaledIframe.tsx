// ============================================================================
// ScaledIframe — ResizeObserver-based iframe scaling
// ============================================================================
// What: Renders a full-resolution iframe scaled to fit its container
// Why: Each device frame has a different container width, but the iframe must
//      render at native resolution (e.g. 1512px) for accurate CSS breakpoints
// How: ResizeObserver measures container width → computes scale factor →
//      CSS transform scales the native-size iframe down to fit

'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface ScaledIframeProps {
  url: string;
  nativeWidth: number;
  nativeHeight: number;
  /** Called once when iframe content has loaded (or after 8s fallback) */
  onLoad?: () => void;
}

export default function ScaledIframe({
  url,
  nativeWidth,
  nativeHeight,
  onLoad,
}: ScaledIframeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Compute scale from container width vs native width
  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    if (containerWidth > 0) {
      setScale(containerWidth / nativeWidth);
    }
  }, [nativeWidth]);

  // Watch container for resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateScale();

    const observer = new ResizeObserver(() => updateScale());
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateScale]);

  // Fallback timeout — hide spinner after 8s even if iframe doesn't fire onLoad
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 8000);
    return () => clearTimeout(timer);
  }, [url]);

  // Reset loaded state when URL changes
  useEffect(() => {
    setLoaded(false);
  }, [url]);

  // Notify parent when content finishes loading (iframe onLoad or 8s fallback)
  useEffect(() => {
    if (loaded && onLoad) onLoad();
  }, [loaded, onLoad]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
    >
      {/* Loading spinner */}
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 10,
            background: '#12151c',
            zIndex: 5,
            transition: 'opacity 0.5s ease',
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              border: '2px solid rgba(255,255,255,0.06)',
              borderTopColor: '#34d399',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span style={{ fontSize: '0.7rem', color: '#565a6e' }}>Loading...</span>
        </div>
      )}

      {/* Scaled iframe at native resolution */}
      {scale > 0 && (
        <iframe
          src={url}
          title="Device preview"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          onLoad={() => setLoaded(true)}
          style={{
            width: nativeWidth + 1,
            height: nativeHeight,
            border: 'none',
            transformOrigin: '0 0',
            transform: `scale(${scale})`,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      )}
    </div>
  );
}
