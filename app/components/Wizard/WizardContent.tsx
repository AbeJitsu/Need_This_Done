'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useWizard } from './WizardProvider';
import WizardStep from './WizardStep';
import ScenarioCard from './ScenarioCard';
import WizardResults from './WizardResults';
import { useRouter } from 'next/navigation';
import { TIMING } from '@/components/motion/variants';

// ============================================
// WIZARD CONTENT
// ============================================
// Renders the current wizard step (question cards) or
// the results screen. Reads all state from WizardProvider.
// Uses AnimatePresence for direction-aware slide transitions.

// Direction-aware slide variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

// Reduced motion: fade only
const fadeOnlyVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

// Bouncing dot for the loading state
function BounceDot({ color, delay }: { color: string; delay: number }) {
  return (
    <motion.div
      className={`w-3 h-3 rounded-full ${color}`}
      animate={{ y: [0, -10, 0] }}
      transition={{
        duration: 0.6,
        ease: 'easeInOut',
        repeat: Infinity,
        delay,
      }}
    />
  );
}

export default function WizardContent() {
  const {
    currentStepIndex,
    responses,
    activeSteps,
    recommendation,
    isLoading,
    isOnResults,
    goNext,
    goBack,
    goToStep,
    selectSingle,
    toggleMulti,
    trackOutcome,
  } = useWizard();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  // Track navigation direction: positive = forward, negative = back
  const prevStepRef = useRef(currentStepIndex);
  const directionRef = useRef(1);

  useEffect(() => {
    if (currentStepIndex !== prevStepRef.current) {
      directionRef.current = currentStepIndex > prevStepRef.current ? 1 : -1;
      prevStepRef.current = currentStepIndex;
    }
  }, [currentStepIndex]);

  // Determine animation key and content
  const animKey = isLoading ? 'loading' : isOnResults ? 'results' : `step-${currentStepIndex}`;
  const variants = prefersReducedMotion ? fadeOnlyVariants : slideVariants;

  // Loading state — three bouncing dots in BJJ belt colors
  if (isLoading) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="loading"
          variants={variants}
          custom={directionRef.current}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: TIMING.duration.fast, ease: TIMING.ease.smooth }}
          className="flex flex-col items-center justify-center py-16 gap-4"
        >
          <div className="flex gap-2">
            <BounceDot color="bg-emerald-500" delay={0} />
            <BounceDot color="bg-blue-500" delay={0.15} />
            <BounceDot color="bg-purple-500" delay={0.3} />
          </div>
          <p className="text-sm text-gray-400">Building your options...</p>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Results screen
  if (isOnResults && recommendation) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="results"
          className="flex-1 min-h-0 overflow-y-auto"
          variants={variants}
          custom={directionRef.current}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: TIMING.duration.fast, ease: TIMING.ease.smooth }}
        >
          <WizardResults
            recommendation={recommendation}
            onAddedToCart={() => trackOutcome('added_to_cart')}
            onBookConsultation={() => {
              trackOutcome('booked_consultation');
              router.push('/contact#consultation');
            }}
            onBack={goBack}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Current question step
  const step = activeSteps[currentStepIndex];
  if (!step) return null;

  const currentResponse = responses[step.id as keyof typeof responses];
  const hasSelection =
    step.selectionType === 'single'
      ? !!currentResponse
      : Array.isArray(currentResponse) && currentResponse.length > 0;

  return (
    <AnimatePresence mode="wait" custom={directionRef.current}>
      <motion.div
        key={animKey}
        className="flex-1 min-h-0 flex flex-col"
        variants={variants}
        custom={directionRef.current}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: TIMING.duration.fast, ease: TIMING.ease.smooth }}
      >
        <WizardStep
          title={step.title}
          subtitle={step.subtitle}
          currentStep={currentStepIndex}
          totalSteps={activeSteps.length}
          onBack={currentStepIndex > 0 ? goBack : null}
          onNext={goNext}
          onGoToStep={goToStep}
          nextLabel={currentStepIndex === activeSteps.length - 1 ? 'See My Results' : 'Continue'}
          nextDisabled={step.selectionType === 'single' && !hasSelection}
        >
          <div className="grid gap-2 px-1 py-3">
            {step.scenarios.map((scenario) => {
              const isSelected =
                step.selectionType === 'single'
                  ? currentResponse === scenario.id
                  : Array.isArray(currentResponse) && currentResponse.includes(scenario.id);

              return (
                <ScenarioCard
                  key={scenario.id}
                  icon={scenario.icon}
                  title={scenario.title}
                  description={scenario.description}
                  selected={isSelected}
                  onClick={() => {
                    if (step.selectionType === 'single') {
                      selectSingle(step.id, scenario.id);
                    } else {
                      toggleMulti(step.id, scenario.id);
                    }
                  }}
                />
              );
            })}
          </div>
        </WizardStep>
      </motion.div>
    </AnimatePresence>
  );
}
