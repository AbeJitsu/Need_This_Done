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
  /** Static image shown instantly while iframe loads — same resolution as native content */
  placeholderSrc?: string;
  /** ms to wait after iframe onLoad before crossfading (lets page animations settle) */
  loadDelay?: number;
}

export default function ScaledIframe({
  url,
  nativeWidth,
  nativeHeight,
  onLoad,
  placeholderSrc,
  loadDelay = 1500,
}: ScaledIframeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadDelayRef = useRef<number>(0);
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
    clearTimeout(loadDelayRef.current);
  }, [url]);

  // Clean up delay timer on unmount
  useEffect(() => {
    return () => clearTimeout(loadDelayRef.current);
  }, []);

  // Notify parent when content finishes loading (iframe onLoad or 8s fallback)
  useEffect(() => {
    if (loaded && onLoad) onLoad();
  }, [loaded, onLoad]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
    >
      {/* Placeholder image — shown instantly while iframe loads, then crossfades out */}
      {placeholderSrc && scale > 0 && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden
          style={{
            width: nativeWidth + 1,
            height: nativeHeight,
            maxWidth: 'none',
            transformOrigin: '0 0',
            transform: `scale(${scale})`,
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 2,
            opacity: loaded ? 0 : 1,
            transition: 'opacity 0.5s ease',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Loading spinner — only shown when no placeholder image is provided */}
      {!placeholderSrc && (
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
            opacity: loaded ? 0 : 1,
            transition: 'opacity 0.5s ease',
            pointerEvents: loaded ? 'none' : undefined,
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
          ref={iframeRef}
          src={url}
          title="Device preview"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          onLoad={() => {
            // Hide scrollbar visually but keep scroll functionality so
            // content width matches the placeholder image (no ~15px shift)
            try {
              const doc = iframeRef.current?.contentDocument;
              if (doc && !doc.getElementById('__hide-scrollbar')) {
                const style = doc.createElement('style');
                style.id = '__hide-scrollbar';
                style.textContent =
                  'html::-webkit-scrollbar{display:none}html{scrollbar-width:none;-ms-overflow-style:none}';
                doc.head.appendChild(style);
              }
            } catch {
              // Cross-origin — scrollbar stays visible, acceptable fallback
            }

            if (loadDelay > 0) {
              loadDelayRef.current = window.setTimeout(() => setLoaded(true), loadDelay);
            } else {
              setLoaded(true);
            }
          }}
          style={{
            width: nativeWidth + 1,
            height: nativeHeight,
            border: 'none',
            transformOrigin: '0 0',
            transform: `scale(${scale})`,
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: 1,
          }}
        />
      )}
    </div>
  );
}
