'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/Button';
import { ChevronDown } from 'lucide-react';

const keywords = ['websites', 'automations', 'AI tools'];
const keywordColors = ['#059669', '#2563eb', '#9333ea']; // emerald, blue, purple

// Animation timing standard: 0.5s for most interactions (per design plan)
// Keyword rotation: 3s (readability > standard timing for this element)
// Gradient drift: 8-12s (subtle, continuous background motion)

export function Hero() {
  const [currentKeywordIndex, setCurrentKeywordIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);

  // Rotate keywords every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentKeywordIndex((prev) => (prev + 1) % keywords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
    if (section) {
      section.addEventListener('mousemove', handleMouseMove);
      return () => section.removeEventListener('mousemove', handleMouseMove);
    }
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
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-20 md:py-0 bg-white"
    >
      {/* ============================================================
          BACKGROUND LAYER: Smooth Directional Gradient
          ============================================================ */}

      {/* Base gradient backdrop — clean and light */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100 z-0" />

      {/* Smooth directional gradient with subtle animation */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Main directional gradient: incremental opacity envelopes for smooth color transitions */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(45deg,
              rgba(167, 243, 208, 0.1) 0%,
              rgba(167, 243, 208, 0.25) 1%,
              rgba(167, 243, 208, 0.4) 2%,
              rgba(167, 243, 208, 0.55) 3%,
              rgba(167, 243, 208, 0.7) 4%,
              rgba(167, 243, 208, 0.85) 5%,
              #a7f3d0 6%,
              #a7f3d0 10%,
              rgba(167, 243, 208, 0.85) 11%,
              rgba(167, 243, 208, 0.7) 12%,
              rgba(167, 243, 208, 0.55) 13%,
              rgba(167, 243, 208, 0.4) 14%,
              rgba(167, 243, 208, 0.25) 15%,
              rgba(167, 243, 208, 0.1) 16%,
              white 18%,
              white 32%,
              rgba(191, 219, 254, 0.1) 33%,
              rgba(191, 219, 254, 0.25) 34%,
              rgba(191, 219, 254, 0.4) 35%,
              rgba(191, 219, 254, 0.55) 36%,
              rgba(191, 219, 254, 0.7) 37%,
              rgba(191, 219, 254, 0.85) 38%,
              #bfdbfe 39%,
              #bfdbfe 50%,
              rgba(191, 219, 254, 0.85) 51%,
              rgba(191, 219, 254, 0.7) 52%,
              rgba(191, 219, 254, 0.55) 53%,
              rgba(191, 219, 254, 0.4) 54%,
              rgba(191, 219, 254, 0.25) 55%,
              rgba(191, 219, 254, 0.1) 56%,
              white 58%,
              white 72%,
              rgba(216, 180, 254, 0.1) 73%,
              rgba(216, 180, 254, 0.25) 74%,
              rgba(216, 180, 254, 0.4) 75%,
              rgba(216, 180, 254, 0.55) 76%,
              rgba(216, 180, 254, 0.7) 77%,
              rgba(216, 180, 254, 0.85) 78%,
              #d8b4fe 79%,
              #d8b4fe 88%,
              rgba(216, 180, 254, 0.85) 89%,
              rgba(216, 180, 254, 0.7) 90%,
              rgba(216, 180, 254, 0.55) 91%,
              rgba(216, 180, 254, 0.4) 92%,
              rgba(216, 180, 254, 0.25) 93%,
              rgba(216, 180, 254, 0.1) 94%,
              white 96%,
              white 100%)`,
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
          ============================================================ */}

      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 md:px-12 text-center pt-12 sm:pt-20 md:pt-32">
        {/* Main Headline — MASSIVE, Bold, Gradient Text */}
        <motion.div
          className="mb-8"
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
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-black leading-[0.9] tracking-tighter">
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
          className="mb-12 h-16 flex items-center justify-center"
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
          className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          From concept to launch. Your vision, our execution. Built with precision.
        </motion.p>

        {/* CTA Button — Magnetic, Glowing */}
        <motion.div
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
              Start Your Project
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
            No templates
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
            Custom built
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full" />
            Full support
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

      {/* ============================================================
          DECORATIVE ELEMENTS: Visual Polish
          ============================================================ */}

      {/* Top gradient fade — premium polish */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white via-white/50 to-transparent pointer-events-none z-20" />

      {/* Subtle grid pattern (optional, commented out for now) */}
      {/* <div className="absolute inset-0 opacity-5 bg-[linear-gradient(90deg,#000_1px,transparent_1px),linear-gradient(#000_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" /> */}
    </section>
  );
}
