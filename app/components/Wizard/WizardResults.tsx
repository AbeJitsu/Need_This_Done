'use client';

import Link from 'next/link';
import { ArrowRight, Phone, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { TIMING } from '@/components/motion/variants';
import type { WizardRecommendation } from '@/lib/wizard-engine';

function fmt(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(cents / 100);
}

// Stagger container: children animate in sequence
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

// Each section fades up into place
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: TIMING.duration.fast, ease: TIMING.ease.smooth },
  },
};

// Reduced motion: fade only, no stagger delay
const reducedContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0 } },
};

const reducedItemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: TIMING.duration.fast } },
};

interface WizardResultsProps {
  recommendation: WizardRecommendation;
  onBookConsultation: () => void;
  onBack: () => void;
}

export default function WizardResults({ recommendation, onBookConsultation, onBack }: WizardResultsProps) {
  const prefersReducedMotion = useReducedMotion();

  const hasExtras = recommendation.addOns.length > 0 || recommendation.services.length > 0;
  const container = prefersReducedMotion ? reducedContainerVariants : containerVariants;
  const item = prefersReducedMotion ? reducedItemVariants : itemVariants;

  return (
    <motion.div
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {/* Badge */}
      <motion.div className="text-center" variants={item}>
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-full px-4 py-1.5 text-sm font-medium mb-3">
          <Sparkles size={14} />Your personalized recommendation
        </div>
      </motion.div>

      {/* Recommended plan card */}
      <motion.div
        className="rounded-xl border-2 border-emerald-500 bg-emerald-50/50 p-5 shadow-lg shadow-emerald-500/15"
        variants={item}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Recommended Plan</p>
            <h3 className="text-lg font-bold text-gray-900 mt-1">{recommendation.tier.title}</h3>
            <Link href={`/contact?offering=${recommendation.tier.handle}`} className="text-xs text-emerald-600 hover:text-emerald-800 font-medium hover:underline">
              Discuss this plan →
            </Link>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(recommendation.tier.price)}</p>
        </div>
      </motion.div>

      {/* Add-ons and services */}
      {hasExtras && (
        <motion.div className="space-y-2" variants={item}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Added to your plan</p>
          {recommendation.addOns.map((a) => (
            <motion.div key={a.handle} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3" variants={item}>
              <span className="text-sm font-medium text-gray-900">{a.title}</span>
              <span className="text-sm font-semibold text-gray-700">+{fmt(a.price)}</span>
            </motion.div>
          ))}
          {recommendation.services.map((s) => (
            <motion.div key={s.handle} className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-3" variants={item}>
              <span className="text-sm font-medium text-gray-900">{s.title}</span>
              <span className="text-sm font-semibold text-gray-700">+{fmt(s.price)}{s.handle === 'managed-ai' && <span className="text-xs text-gray-500">/mo</span>}</span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Total summary */}
      <motion.div className="rounded-xl bg-gray-50 p-4 space-y-2" variants={item}>
        <div className="flex justify-between text-sm"><span className="text-gray-600">Total</span><span className="font-bold text-gray-900">{fmt(recommendation.totalCents)}</span></div>
        {recommendation.depositCents > 0 && (
          <div className="flex justify-between text-sm"><span className="text-gray-500">50% deposit to start</span><span className="font-semibold text-emerald-700">{fmt(recommendation.depositCents)}</span></div>
        )}
      </motion.div>

      {/* CTA buttons */}
      <motion.div className="space-y-3" variants={item}>
        <motion.div
          whileHover={prefersReducedMotion ? undefined : { y: -2 }}
          whileTap={prefersReducedMotion ? undefined : { y: 1 }}
        >
          <Link
            href={`/api/offerings/${recommendation.tier.handle}/checkout`}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 px-6 font-semibold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/25 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Start This Project <ArrowRight size={16} />
          </Link>
        </motion.div>

        <motion.button
          type="button" onClick={onBookConsultation}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 px-6 font-semibold text-sm text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          whileHover={prefersReducedMotion ? undefined : { y: -2 }}
          whileTap={prefersReducedMotion ? undefined : { y: 1 }}
          transition={{ type: 'tween', duration: 0.15, ease: 'easeOut' }}
        >
          <Phone size={16} />Book a Free Call Instead
        </motion.button>
      </motion.div>

      {/* Change answers link */}
      <motion.div className="text-center" variants={item}>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-lg px-4 py-2"
        >
          Change my answers
        </button>
      </motion.div>

      {/* Footer text */}
      <motion.p className="text-xs text-center text-gray-400" variants={item}>
        Not sure? A free consultation helps us tailor the perfect solution.
      </motion.p>
    </motion.div>
  );
}
