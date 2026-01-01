'use client';

import { useState, useCallback } from 'react';
import type { PageTemplate, WizardState, PuckPageData, TemplateCategory } from '@/lib/templates';
import {
  createInitialWizardState,
  completeWizard,
  STARTER_TEMPLATES,
  filterByCategory,
} from '@/lib/templates';
import type { AccentVariant } from '@/lib/colors';
import {
  StepCategory,
  StepTemplate,
  StepColor,
  StepContent,
  StepPreview,
} from './WizardSteps';

// ============================================================================
// PAGE WIZARD COMPONENT
// ============================================================================
// Phone-first wizard for creating pages in 5 simple steps.
// Each step is a single, focused question.
//
// FLOW:
// 1. What type of page? (category selection)
// 2. Pick a template (filtered by category)
// 3. Choose a color (accent color picker)
// 4. Fill in content (placeholder fields)
// 5. Preview & finish
//
// ORTHOGONALITY:
// - Doesn't know about storage or routing
// - Just collects input and outputs PuckPageData
// ============================================================================

interface PageWizardProps {
  /** Called when wizard is completed with the generated page data */
  onComplete: (data: PuckPageData, templateId: string) => void;
  /** Called when user wants to exit the wizard */
  onCancel?: () => void;
}

// Wizard steps
type WizardStepId = 'category' | 'template' | 'color' | 'content' | 'preview';

const WIZARD_STEPS: WizardStepId[] = ['category', 'template', 'color', 'content', 'preview'];

export default function PageWizard({ onComplete, onCancel }: PageWizardProps) {
  // Wizard state
  const [state, setState] = useState<WizardState>(createInitialWizardState());
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PageTemplate | null>(null);
  const [selectedColor, setSelectedColor] = useState<AccentVariant>('purple');
  const [content, setContent] = useState<Record<string, string>>({});

  // Current step
  const currentStepId = WIZARD_STEPS[state.currentStep];

  // Navigation
  const canGoBack = state.currentStep > 0;
  const canGoForward = (() => {
    switch (currentStepId) {
      case 'category':
        return selectedCategory !== null;
      case 'template':
        return selectedTemplate !== null;
      case 'color':
        return true; // Always has a default
      case 'content':
        return true; // Optional fields are okay
      case 'preview':
        return true;
      default:
        return false;
    }
  })();

  const goBack = useCallback(() => {
    if (canGoBack) {
      setState((s) => ({ ...s, currentStep: s.currentStep - 1 }));
    }
  }, [canGoBack]);

  const goForward = useCallback(() => {
    if (!canGoForward) return;

    // On final step, complete the wizard
    if (currentStepId === 'preview' && selectedTemplate) {
      const finalState: WizardState = {
        ...state,
        templateId: selectedTemplate.metadata.id,
        color: selectedColor,
        content,
        completed: true,
      };
      const pageData = completeWizard(selectedTemplate, finalState);
      onComplete(pageData, selectedTemplate.metadata.id);
      return;
    }

    // Otherwise, advance to next step
    setState((s) => ({ ...s, currentStep: s.currentStep + 1 }));
  }, [canGoForward, currentStepId, selectedTemplate, selectedColor, content, state, onComplete]);

  // Progress percentage
  const progress = ((state.currentStep + 1) / WIZARD_STEPS.length) * 100;

  // Get filtered templates for current category
  const availableTemplates = selectedCategory
    ? filterByCategory(STARTER_TEMPLATES, selectedCategory)
    : [];

  return (
    <div className="min-h-[600px] h-[calc(100dvh-72px)] bg-gray-100 dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* Header with progress */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex-shrink-0">
        <div className="max-w-2xl mx-auto">
          {/* Top row: back button and step indicator */}
          <div className="flex items-center justify-between mb-3">
            {canGoBack ? (
              <button
                onClick={goBack}
                className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm">Back</span>
              </button>
            ) : (
              onCancel && (
                <button
                  onClick={onCancel}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Cancel
                </button>
              )
            )}

            <span className="text-sm text-gray-500 dark:text-gray-400">
              Step {state.currentStep + 1} of {WIZARD_STEPS.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main content - step-specific */}
      <main className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {/* Step: Category */}
          {currentStepId === 'category' && (
            <StepCategory
              selected={selectedCategory}
              onSelect={(cat) => {
                setSelectedCategory(cat);
                setSelectedTemplate(null); // Reset template when category changes
              }}
            />
          )}

          {/* Step: Template */}
          {currentStepId === 'template' && (
            <StepTemplate
              templates={availableTemplates}
              selected={selectedTemplate}
              onSelect={setSelectedTemplate}
            />
          )}

          {/* Step: Color */}
          {currentStepId === 'color' && (
            <StepColor selected={selectedColor} onSelect={setSelectedColor} />
          )}

          {/* Step: Content */}
          {currentStepId === 'content' && selectedTemplate && (
            <StepContent
              template={selectedTemplate}
              content={content}
              onChange={setContent}
            />
          )}

          {/* Step: Preview */}
          {currentStepId === 'preview' && selectedTemplate && (
            <StepPreview
              template={selectedTemplate}
              color={selectedColor}
              content={content}
            />
          )}
        </div>
      </main>

      {/* Footer with action button - flex-shrink-0 keeps it pinned at bottom */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4 flex-shrink-0">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={goForward}
            disabled={!canGoForward}
            className={`w-full py-3.5 px-6 rounded-xl font-medium text-lg transition-all ${
              canGoForward
                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/25'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {currentStepId === 'preview' ? 'Create Page' : 'Continue'}
          </button>
        </div>
      </footer>
    </div>
  );
}
