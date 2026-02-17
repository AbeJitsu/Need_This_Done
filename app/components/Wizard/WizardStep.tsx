'use client';

import { type ReactNode } from 'react';

interface WizardStepProps {
  title: string; subtitle: string; currentStep: number; totalSteps: number;
  children: ReactNode; onBack: (() => void) | null; onNext: (() => void) | null;
  nextLabel?: string; nextDisabled?: boolean;
}

export default function WizardStep({ title, subtitle, currentStep, totalSteps, children, onBack, onNext, nextLabel = 'Continue', nextDisabled = false }: WizardStepProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center gap-2 mb-6">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-emerald-500' : i < currentStep ? 'w-2 bg-emerald-300' : 'w-2 bg-gray-200'}`} />
        ))}
      </div>
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">{children}</div>
      <div className="flex items-center justify-between pt-6 mt-4 border-t border-gray-100">
        {onBack ? (
          <button type="button" onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-lg px-4 py-2">Back</button>
        ) : <div />}
        {onNext && (
          <button type="button" onClick={onNext} disabled={nextDisabled}
            className={`text-sm font-semibold rounded-xl px-6 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
              ${nextDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/25'}`}
          >{nextLabel}</button>
        )}
      </div>
    </div>
  );
}
