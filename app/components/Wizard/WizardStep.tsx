'use client';

import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { TIMING } from '@/components/motion/variants';

interface WizardStepProps {
  title: string; subtitle: string; currentStep: number; totalSteps: number;
  children: ReactNode; onBack: (() => void) | null; onNext: (() => void) | null;
  onGoToStep?: (index: number) => void;
  nextLabel?: string; nextDisabled?: boolean;
}

// Animated checkmark that "draws" itself
function AnimatedCheck({ reducedMotion }: { reducedMotion: boolean | null }) {
  return (
    <motion.svg
      width={14} height={14} viewBox="0 0 14 14" fill="none"
      className="text-white"
      initial={reducedMotion ? undefined : { scale: 0 }}
      animate={reducedMotion ? undefined : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
    >
      <motion.path
        d="M3 7.5L5.5 10L11 4"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reducedMotion ? undefined : { pathLength: 0 }}
        animate={reducedMotion ? undefined : { pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      />
    </motion.svg>
  );
}

// Step circle component — completed steps are clickable buttons
function StepCircle({ index, currentStep, reducedMotion, onGoToStep }: {
  index: number; currentStep: number; reducedMotion: boolean | null;
  onGoToStep?: (index: number) => void;
}) {
  const isCompleted = index < currentStep;
  const isActive = index === currentStep;

  if (isCompleted) {
    return (
      <button
        type="button"
        onClick={() => onGoToStep?.(index)}
        className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center transition-all duration-300 hover:ring-2 hover:ring-emerald-300 hover:ring-offset-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer"
        aria-label={`Go back to step ${index + 1}`}
      >
        <AnimatedCheck reducedMotion={reducedMotion} />
      </button>
    );
  }

  if (isActive) {
    return (
      <motion.div
        className="w-8 h-8 rounded-full border-2 border-emerald-500 bg-white flex items-center justify-center transition-colors duration-300"
        animate={reducedMotion ? undefined : { scale: [1, 1.08, 1] }}
        transition={reducedMotion ? undefined : { duration: 2, ease: 'easeInOut', repeat: Infinity }}
      >
        <span className="text-xs font-bold text-emerald-600">{index + 1}</span>
      </motion.div>
    );
  }

  return (
    <div
      className="w-8 h-8 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center transition-colors duration-300"
      aria-disabled="true"
    >
      <span className="text-xs font-medium text-gray-400">{index + 1}</span>
    </div>
  );
}

// Connecting line between step circles
function ConnectingLine({ index, currentStep }: { index: number; currentStep: number }) {
  const isCompleted = index < currentStep;
  return (
    <div className={`w-8 sm:w-12 h-0.5 transition-colors duration-300 ${isCompleted ? 'bg-emerald-400' : 'bg-gray-200'}`} />
  );
}

export default function WizardStep({ title, subtitle, currentStep, totalSteps, children, onBack, onNext, onGoToStep, nextLabel = 'Continue', nextDisabled = false }: WizardStepProps) {
  const prefersReducedMotion = useReducedMotion();
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Numbered step circles with connecting lines */}
      <nav
        className="flex items-center justify-center gap-1 mb-3"
        aria-label={`Wizard progress — step ${currentStep + 1} of ${totalSteps}`}
      >
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center">
            <StepCircle index={i} currentStep={currentStep} reducedMotion={prefersReducedMotion} onGoToStep={onGoToStep} />
            {i < totalSteps - 1 && <ConnectingLine index={i} currentStep={currentStep} />}
          </div>
        ))}
      </nav>

      {/* Thin gradient progress bar */}
      <div className="h-1 bg-gray-100 rounded-full max-w-xs mx-auto w-full mb-6">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: TIMING.duration.fast, ease: TIMING.ease.smooth }}
        />
      </div>

      {/* Title and subtitle */}
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>
      </div>

      {/* Step content (scenario cards) */}
      <div className="flex-1 overflow-y-auto min-h-0 -mx-1">{children}</div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-6 mt-4 border-t border-gray-100">
        {onBack ? (
          <motion.button
            type="button" onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-lg px-4 py-2 flex items-center gap-1"
            whileHover={prefersReducedMotion ? undefined : { x: -3 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
          ><ChevronLeft size={16} />Back</motion.button>
        ) : <div />}
        {onNext && (
          <motion.button
            type="button" onClick={onNext} disabled={nextDisabled}
            className={`text-sm font-semibold rounded-xl px-6 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
              ${nextDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/25'}`}
            whileHover={nextDisabled || prefersReducedMotion ? undefined : { y: -1 }}
            whileTap={nextDisabled || prefersReducedMotion ? undefined : { y: 1 }}
            transition={{ type: 'tween', duration: 0.15, ease: 'easeOut' }}
          >{nextLabel}</motion.button>
        )}
      </div>
    </div>
  );
}
