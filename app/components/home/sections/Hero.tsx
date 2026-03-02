'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Button from '@/components/Button';
import { ChevronDown } from 'lucide-react';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { HeroDevice } from './HeroDevice';

// Dev-only debug overlay — tree-shaken in production via dynamic import
const HeroLayoutDebug =
  process.env.NODE_ENV === 'development'
    ? dynamic(() => import('../debug/HeroLayoutDebug').then((m) => m.HeroLayoutDebug), { ssr: false })
    : null;

// Layout state type (inlined to avoid importing the debug module in production)
interface HeroLayoutState {
  tabletHeight: number;
  phoneHeight: number;
  tabletOffsetY: number;
  phoneOffsetY: number;
}

const HERO_LAYOUT_DEFAULTS: HeroLayoutState = {
  tabletHeight: 453, phoneHeight: 453,
  tabletOffsetY: 0, phoneOffsetY: 0,
};

const keywords = ['Websites', 'Automations', 'AI Tools'];
const keywordColors = ['#059669', '#2563eb', '#9333ea']; // emerald, blue, purple

// Animation timing standard: 0.5s for most interactions (per design plan)
// Keyword rotation: 3s (readability > standard timing for this element)
// Gradient drift: 8-12s (subtle, continuous background motion)

// Outer wrapper provides Suspense boundary for useSearchParams
export function Hero() {
  return (
    <Suspense fallback={<HeroInner initialPhase={0} autoRotate={false} />}>
      <HeroWithParams />
    </Suspense>
  );
}

// Reads ?heroPhase=N from URL to set initial keyword rotation index
// Used by DeviceShowcase to start each iframe at a different phase
function HeroWithParams() {
  const searchParams = useSearchParams();
  const initialPhase = Number(searchParams.get('heroPhase')) || 0;
  const debugFromUrl = searchParams.has('layout-debug');
  return <HeroInner initialPhase={initialPhase} debugFromUrl={debugFromUrl} />;
}

function HeroInner({
  initialPhase,
  autoRotate = true,
  debugFromUrl = false,
}: {
  initialPhase: number;
  autoRotate?: boolean;
  debugFromUrl?: boolean;
}) {
  const isDesktop = useIsDesktop();
  const router = useRouter();
  // When devices flank the hero, shift hero to phase 1 so reading
  // left-to-right gives: Websites (tablet=0) -> Automations (hero=1) -> AI Tools (phone=2)
  const effectivePhase = isDesktop ? 1 : initialPhase;

  // Easter egg: listen for navigation messages from device preview iframes.
  // When someone clicks a link inside the tiny tablet/phone preview, the
  // iframe's HeroPreviewDetector intercepts it and postMessages the URL here.
  useEffect(() => {
    if (!isDesktop) return;

    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      // Handle widget button clicks (chatbot / wizard) from device iframes
      if (event.data?.type === 'hero-device-action') {
        const action = event.data.action as string;
        if (action === 'open-chatbot' || action === 'open-wizard') {
          window.dispatchEvent(new CustomEvent(action));
        }
        return;
      }

      if (event.data?.type !== 'hero-device-navigate') return;
      const url = event.data.url as string;
      if (!url) return;

      try {
        const parsed = new URL(url, window.location.origin);
        if (parsed.origin === window.location.origin) {
          router.push(parsed.pathname + parsed.search + parsed.hash);
        } else {
          window.location.href = url;
        }
      } catch {
        // Invalid URL — ignore silently
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [isDesktop, router]);

  // Mobile-specific breakpoint: matches Tailwind's `md:` threshold exactly.
  // Below 768px = mobile (dynamic gradient), 768px+ = Tailwind's md:bottom-[10%].
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const [currentKeywordIndex, setCurrentKeywordIndex] = useState(initialPhase % keywords.length);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Dynamic gradient bottom: measure the midpoint between subheading and CTA,
  // then position the gradient's bottom edge there (mobile only).
  const [gradientBottomPx, setGradientBottomPx] = useState<number | null>(null);

  const measureGradient = useCallback(() => {
    if (!sectionRef.current || !subheadingRef.current || !ctaRef.current) return;
    const sectionRect = sectionRef.current.getBoundingClientRect();
    const subRect = subheadingRef.current.getBoundingClientRect();
    const ctaRect = ctaRef.current.getBoundingClientRect();

    // Section-relative positions (scroll-independent)
    const subBottom = subRect.bottom - sectionRect.top;
    const ctaTop = ctaRect.top - sectionRect.top;
    const midpoint = (subBottom + ctaTop) / 2;

    // CSS `bottom` = distance from section's bottom edge
    setGradientBottomPx(sectionRect.height - midpoint);
  }, []);

  useEffect(() => {
    // Delay initial measure so entrance animations (y:20 transforms) settle.
    // Subheading: delay 0.4 + duration 0.6 = 1s; CTA: delay 0.5 + duration 0.6 = 1.1s
    const timer = setTimeout(measureGradient, 1200);

    const observer = new ResizeObserver(measureGradient);
    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [measureGradient]);

  // Layout debug tool state (dev only)
  const [debugActive, setDebugActive] = useState(debugFromUrl);
  const [layoutState, setLayoutState] = useState<HeroLayoutState>(HERO_LAYOUT_DEFAULTS);
  const onLayoutChange = useCallback((s: HeroLayoutState) => setLayoutState(s), []);

  // Ctrl+Shift+L / Cmd+Shift+L toggles debug overlay
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        setDebugActive((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Wall-clock keyword sync: all iframes derive the same base index from
  // Date.now(), so they never drift. initialPhase offsets each device to
  // show a DIFFERENT keyword at any given moment.
  useEffect(() => {
    if (!autoRotate) return;
    const CYCLE_MS = 3000;
    const TOTAL_CYCLE = CYCLE_MS * keywords.length;

    const update = () => {
      const now = Date.now();
      const elapsed = now % TOTAL_CYCLE;
      const baseIndex = Math.floor(elapsed / CYCLE_MS);
      setCurrentKeywordIndex((baseIndex + effectivePhase) % keywords.length);
      // Schedule next update at the exact transition boundary (+50ms buffer)
      const msUntilNext = CYCLE_MS - (elapsed % CYCLE_MS);
      return setTimeout(update, msUntilNext + 50);
    };

    const timer = update();
    return () => clearTimeout(timer);
  }, [autoRotate, effectivePhase]);

  // Track mouse position for cursor-reactive gradient
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const section = sectionRef.current;
    if (!section) return;
    section.addEventListener('mousemove', handleMouseMove);
    return () => section.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll to services section
  const handleScroll = () => {
    const servicesSection = document.getElementById('services-section');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center py-20 md:py-0 bg-white"
    >
      {/* ============================================================
          BACKGROUND LAYER: Smooth Directional Gradient
          ============================================================ */}

      {/* Base gradient backdrop — clean and light */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100 z-0" />

      {/* Smooth directional gradient with subtle animation */}
      <div
        className="absolute inset-x-0 top-0 bottom-[40%] md:bottom-[10%] z-0 overflow-hidden"
        style={
          isMobile && gradientBottomPx != null
            ? {
                bottom: `${gradientBottomPx}px`,
                WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 24px), transparent 100%)',
                maskImage: 'linear-gradient(to bottom, black calc(100% - 24px), transparent 100%)',
              }
            : undefined
        }
      >
        {/* Main directional gradient: green and purple as edges, blue in middle */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(45deg,
              #a7f3d0 0%,
              #a7f3d0 6%,
              rgba(167, 243, 208, 0.85) 7%,
              rgba(167, 243, 208, 0.7) 8%,
              rgba(167, 243, 208, 0.55) 9%,
              rgba(167, 243, 208, 0.4) 10%,
              rgba(167, 243, 208, 0.25) 11%,
              rgba(167, 243, 208, 0.1) 12%,
              rgba(191, 219, 254, 0.1) 18%,
              rgba(191, 219, 254, 0.25) 24%,
              rgba(191, 219, 254, 0.4) 30%,
              rgba(191, 219, 254, 0.55) 36%,
              rgba(191, 219, 254, 0.7) 42%,
              rgba(191, 219, 254, 0.85) 45%,
              #bfdbfe 48%,
              #bfdbfe 52%,
              rgba(191, 219, 254, 0.85) 55%,
              rgba(191, 219, 254, 0.7) 58%,
              rgba(191, 219, 254, 0.55) 64%,
              rgba(191, 219, 254, 0.4) 70%,
              rgba(191, 219, 254, 0.25) 76%,
              rgba(191, 219, 254, 0.1) 82%,
              rgba(216, 180, 254, 0.1) 84%,
              rgba(216, 180, 254, 0.25) 86%,
              rgba(216, 180, 254, 0.4) 88%,
              rgba(216, 180, 254, 0.55) 90%,
              rgba(216, 180, 254, 0.7) 92%,
              rgba(216, 180, 254, 0.85) 94%,
              #d8b4fe 96%,
              #d8b4fe 100%)`,
          }}
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.55, 0.7, 0.55],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Cursor-reactive glow — follows mouse */}
        <motion.div
          className="absolute w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/40 to-purple-400/30 blur-2xl pointer-events-none"
          animate={{
            x: mousePosition.x - 160,
            y: mousePosition.y - 160,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 60,
          }}
        />
      </div>

      {/* ============================================================
          CONTENT LAYER: Typography & Interactions
          Three-column grid on xl: [tablet] [hero content] [phone]
          Below xl: single column, no devices rendered
          ============================================================ */}

      {/* Layout debug overlay (dev only) — positioned over full section, outside grid */}
      {debugActive && HeroLayoutDebug && (
        <HeroLayoutDebug state={layoutState} onChange={onLayoutChange} />
      )}

      <div data-hero-container className="relative z-10 w-full xl:flex xl:justify-evenly xl:items-start xl:min-h-screen">
        {/* Left device — Tablet (phase 0 → Websites) */}
        {isDesktop && (
          <HeroDevice
            side="left"
            {...(debugActive ? { screenHeightOverride: layoutState.tabletHeight, offsetY: layoutState.tabletOffsetY } : {})}
          />
        )}

        <div
          data-hero-center
          className="max-w-5xl mx-auto xl:mx-0 xl:w-fit xl:px-0 px-6 sm:px-8 md:px-12 text-center pt-4 sm:pt-8 md:pt-12"
        >
        {/* Main Headline — MASSIVE, Bold, Gradient Text */}
        <motion.div
          className="mb-10 md:mb-12"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1,
              },
            },
          }}
        >
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black leading-[1.05] tracking-tighter">
            <motion.span
              className="inline-block bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent"
              variants={{
                hidden: { y: 100, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: { duration: 0.6, ease: 'easeOut' },
                },
              }}
            >
              We build
            </motion.span>
            <br />
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: 100, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: { duration: 0.6, ease: 'easeOut' },
                },
              }}
            >
              <span className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                what you need
              </span>
            </motion.span>
            <br />
            <motion.span
              className="inline-block bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent"
              variants={{
                hidden: { y: 100, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: { duration: 0.6, ease: 'easeOut' },
                },
              }}
            >
              done.
            </motion.span>
          </h1>
        </motion.div>

        {/* Rotating Keyword — BOLD Color, Larger */}
        <motion.div
          className="mb-10 md:mb-12 h-16 md:h-20 flex items-center justify-center"
          key={currentKeywordIndex}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{ duration: 0.5 }}
        >
          <span
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight"
            style={{
              color: keywordColors[currentKeywordIndex],
              textShadow: `0 0 30px ${keywordColors[currentKeywordIndex]}40`,
            }}
            role="region"
            aria-label="Rotating keywords"
          >
            {keywords[currentKeywordIndex]}
          </span>
        </motion.div>

        {/* Subheading — Refined, secondary */}
        <motion.p
          ref={subheadingRef}
          className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Small business tech that works as hard as you do. Ready in weeks, not months.
        </motion.p>

        {/* CTA Button — Magnetic, Glowing */}
        <motion.div
          ref={ctaRef}
          className="mb-16"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.5,
            type: 'spring',
            stiffness: 100,
          }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="green"
              size="lg"
              onClick={() => {
                window.location.href = '/pricing';
              }}
              className="relative px-12 py-4 text-lg font-semibold shadow-2xl shadow-emerald-500/40 motion-safe:hover:shadow-emerald-500/60 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              See Packages from $500
            </Button>
          </motion.div>
        </motion.div>

        {/* Trust Line — Subtle, refined */}
        <motion.div
          className="flex justify-center gap-8 text-sm text-slate-500 mb-16 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            Websites from $500
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
            50% to start
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full" />
            Live in 1–4 weeks
          </span>
        </motion.div>

        {/* Scroll Indicator — Animated arrow with glow */}
        <motion.button
          onClick={handleScroll}
          className="mt-8 mx-auto flex flex-col items-center gap-3 text-slate-600 hover:text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-full p-2"
          animate={{ y: [0, 12, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          aria-label="Scroll down to see services"
        >
          <span className="text-sm font-semibold tracking-wide uppercase">
            Scroll to explore
          </span>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <ChevronDown className="w-6 h-6 text-emerald-600" strokeWidth={3} />
          </motion.div>
        </motion.button>
        </div>

        {/* Right device — Phone (phase 2 → AI Tools) */}
        {isDesktop && (
          <HeroDevice
            side="right"
            {...(debugActive ? { screenHeightOverride: layoutState.phoneHeight, offsetY: layoutState.phoneOffsetY } : {})}
          />
        )}
      </div>

      {/* ============================================================
          DECORATIVE ELEMENTS: Visual Polish
          ============================================================ */}

      {/* Top gradient fade removed — was creating white gap at top */}

      {/* Subtle grid pattern (optional, commented out for now) */}
      {/* <div className="absolute inset-0 opacity-5 bg-[linear-gradient(90deg,#000_1px,transparent_1px),linear-gradient(#000_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" /> */}
    </section>
  );
}
