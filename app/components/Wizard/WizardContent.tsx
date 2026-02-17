'use client';

import { useWizard } from './WizardProvider';
import WizardStep from './WizardStep';
import ScenarioCard from './ScenarioCard';
import WizardResults from './WizardResults';
import { useRouter } from 'next/navigation';

// ============================================
// WIZARD CONTENT
// ============================================
// Renders the current wizard step (question cards) or
// the results screen. Reads all state from WizardProvider.

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
    selectSingle,
    toggleMulti,
    trackOutcome,
  } = useWizard();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading plans...</p>
      </div>
    );
  }

  // Results screen
  if (isOnResults && recommendation) {
    return (
      <WizardResults
        recommendation={recommendation}
        onAddedToCart={() => trackOutcome('added_to_cart')}
        onBookConsultation={() => {
          trackOutcome('booked_consultation');
          router.push('/contact#consultation');
        }}
      />
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
    <WizardStep
      title={step.title}
      subtitle={step.subtitle}
      currentStep={currentStepIndex}
      totalSteps={activeSteps.length}
      onBack={currentStepIndex > 0 ? goBack : null}
      onNext={goNext}
      nextLabel={currentStepIndex === activeSteps.length - 1 ? 'See My Results' : 'Continue'}
      nextDisabled={step.selectionType === 'single' && !hasSelection}
    >
      <div className="grid gap-3">
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
  );
}
