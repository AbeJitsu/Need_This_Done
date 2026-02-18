'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface ScenarioCardProps {
  icon: string; title: string; description: string; selected: boolean; onClick: () => void;
}

export default function ScenarioCard({ icon, title, description, selected, onClick }: ScenarioCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button" onClick={onClick} aria-pressed={selected}
      className={`w-full text-left rounded-xl border-2 p-4 transition-colors duration-200
        ${selected ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/20' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50 hover:shadow-md'}
        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`}
      animate={
        selected && !prefersReducedMotion
          ? { scale: [1, 1.03, 1] }
          : { scale: 1 }
      }
      whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0 mt-0.5" aria-hidden="true">{icon}</span>
        <div className="min-w-0">
          <p className={`font-semibold text-sm ${selected ? 'text-emerald-900' : 'text-gray-900'}`}>{title}</p>
          <p className={`text-sm mt-0.5 ${selected ? 'text-emerald-700' : 'text-gray-500'}`}>{description}</p>
        </div>
        <AnimatePresence>
          {selected && (
            <motion.svg
              className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
              fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"
              initial={prefersReducedMotion ? undefined : { scale: 0, opacity: 0 }}
              animate={prefersReducedMotion ? undefined : { scale: 1, opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}
