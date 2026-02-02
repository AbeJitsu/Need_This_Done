'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/Button';
import { ChevronDown } from 'lucide-react';

const keywords = ['websites', 'automations', 'AI tools'];

// Animation timing standard: 0.5s for most interactions (per design plan)
// Keyword rotation: 3s (readability > standard timing for this element)
// Gradient drift: 8-12s (subtle, continuous background motion)

export function Hero() {
  const [currentKeywordIndex, setCurrentKeywordIndex] = useState(0);

  // Rotate keywords every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentKeywordIndex((prev) => (prev + 1) % keywords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to services section
  const handleScroll = () => {
    const servicesSection = document.getElementById('services-section');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen lg:min-h-screen flex flex-col items-center justify-center overflow-hidden py-20 md:py-0">
      {/* Gradient Background Orbs */}
      <div className="absolute inset-0 z-0">
        {/* Bottom-left green orb */}
        <motion.div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-emerald-200 to-emerald-100 blur-3xl opacity-60"
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Top-right blue to purple orb */}
        <motion.div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 blur-3xl opacity-60"
          animate={{
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Right purple accent */}
        <motion.div
          className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-purple-200 blur-2xl opacity-40"
          animate={{
            x: [0, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Content - Above background with z-10 */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 md:px-12 text-center">
        {/* Main Headline - Word by word reveal animation */}
        <motion.div
          className="mb-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 leading-tight">
            {['We build what', 'you need done.'].map((phrase, idx) => (
              <motion.span
                key={idx}
                className="block"
                variants={{
                  hidden: { y: 50, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: { duration: 0.5, ease: 'easeOut' },
                  },
                }}
              >
                {phrase}
              </motion.span>
            ))}
          </h1>
        </motion.div>

        {/* Rotating Keyword */}
        <motion.div
          className="mb-12 h-12 flex items-center justify-center"
          key={currentKeywordIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <span
            className="text-2xl sm:text-3xl md:text-4xl font-semibold"
            style={{
              color: (() => {
                switch (currentKeywordIndex) {
                  case 0:
                    return '#059669'; // emerald (green)
                  case 1:
                    return '#2563eb'; // blue
                  case 2:
                    return '#9333ea'; // purple
                  default:
                    return '#059669';
                }
              })(),
            }}
            role="region"
            aria-label="Rotating keywords"
          >
            {keywords[currentKeywordIndex]}
          </span>
        </motion.div>

        {/* CTA Button - Magnetic effect */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Button
            variant="green"
            size="lg"
            onClick={() => {
              // Navigate to pricing or start project flow
              window.location.href = '/pricing';
            }}
            className="shadow-lg shadow-emerald-500/25 motion-safe:hover:scale-105 motion-safe:active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            Start Your Project
          </Button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.button
          onClick={handleScroll}
          className="mt-12 mx-auto flex flex-col items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-full p-2"
          animate={{ y: [0, 8, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          aria-label="Scroll down to see services"
        >
          <span className="text-sm font-medium">Scroll to explore</span>
          <ChevronDown className="w-6 h-6" />
        </motion.button>
      </div>
    </section>
  );
}
