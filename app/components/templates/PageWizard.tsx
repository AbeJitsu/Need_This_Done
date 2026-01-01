'use client';

import { useState, useCallback } from 'react';
import type { PageTemplate, WizardState, PuckPageData, TemplateCategory } from '@/lib/templates';
import {
  createInitialWizardState,
  completeWizard,
  getWizardProgress,
  STARTER_TEMPLATES,
  filterByCategory,
  CATEGORY_INFO,
  ALL_CATEGORIES,
  COLOR_OPTIONS,
} from '@/lib/templates';
import { accentColors, softBgColors, type AccentVariant } from '@/lib/colors';

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

// ============================================================================
// Step Components - Each step is its own focused UI
// ============================================================================

/** Step 1: Choose category */
function StepCategory({
  selected,
  onSelect,
}: {
  selected: TemplateCategory | null;
  onSelect: (cat: TemplateCategory) => void;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        What are you creating?
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Pick a category to see relevant templates
      </p>

      <div className="space-y-3">
        {ALL_CATEGORIES.map((catId) => {
          const cat = CATEGORY_INFO[catId];
          return (
            <button
              key={catId}
              onClick={() => onSelect(catId)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4 ${
                selected === catId
                  ? `border-purple-500 ${softBgColors.purple}`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="text-3xl">{cat.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {cat.label}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {cat.description}
                </p>
              </div>
              {selected === catId && (
                <svg
                  className="w-6 h-6 text-purple-600 ml-auto flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
              </svg>
            )}
          </button>
          );
        })}
      </div>
    </div>
  );
}

/** Step 2: Choose template */
function StepTemplate({
  templates,
  selected,
  onSelect,
}: {
  templates: PageTemplate[];
  selected: PageTemplate | null;
  onSelect: (t: PageTemplate) => void;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Pick a template
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Choose a starting point for your page
      </p>

      {templates.length > 0 ? (
        <div className="space-y-3">
          {templates.map((template) => (
            <button
              key={template.metadata.id}
              onClick={() => onSelect(template)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                selected?.metadata.id === template.metadata.id
                  ? `border-purple-500 ${softBgColors.purple}`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  {template.metadata.featured && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 mb-1">
                      ⭐ Featured
                    </span>
                  )}
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {template.metadata.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {template.metadata.description}
                  </p>
                </div>
                {selected?.metadata.id === template.metadata.id && (
                  <svg
                    className="w-6 h-6 text-purple-600 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No templates in this category yet.
        </div>
      )}
    </div>
  );
}

/** Step 3: Choose color */
function StepColor({
  selected,
  onSelect,
}: {
  selected: AccentVariant;
  onSelect: (color: AccentVariant) => void;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Pick a color
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        This will be used for buttons, links, and accents
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {COLOR_OPTIONS.map((color) => {
          const colorClasses = accentColors[color.id];
          const isSelected = selected === color.id;

          return (
            <button
              key={color.id}
              onClick={() => onSelect(color.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? `${colorClasses.border} ${colorClasses.bg}`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {/* Color swatch */}
              <div
                className={`w-12 h-12 rounded-full mx-auto mb-2 ${colorClasses.bg} ${colorClasses.border} border-2`}
              />
              <p className="text-center font-medium text-gray-900 dark:text-gray-100">
                {color.label}
              </p>
              {isSelected && (
                <p className="text-center text-xs text-purple-600 dark:text-purple-400 mt-1">
                  Selected
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Step 4: Fill in content */
function StepContent({
  template,
  content,
  onChange,
}: {
  template: PageTemplate;
  content: Record<string, string>;
  onChange: (content: Record<string, string>) => void;
}) {
  const fields = template.placeholders.fields;
  const progress = getWizardProgress(template, content);

  const updateField = (path: string, value: string) => {
    onChange({ ...content, [path]: value });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Add your content
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Fill in the details for your page
      </p>

      {/* Progress indicator */}
      {fields.some((f) => f.required) && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {progress}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Form fields */}
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.path}>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                value={content[field.path] || field.defaultValue || ''}
                onChange={(e) => updateField(field.path, e.target.value)}
                placeholder={field.hint}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            ) : (
              <input
                type="text"
                value={content[field.path] || field.defaultValue || ''}
                onChange={(e) => updateField(field.path, e.target.value)}
                placeholder={field.hint}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            )}

            {field.hint && !content[field.path] && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {field.hint}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Step 5: Preview */
function StepPreview({
  template,
  color,
  content,
}: {
  template: PageTemplate;
  color: AccentVariant;
  content: Record<string, string>;
}) {
  const colorClasses = accentColors[color];

  // Get the headline from content or template default
  const headlinePath = 'sections.0.props.heading';
  const headline = content[headlinePath] || 'Your Page';

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Ready to create!
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Here&apos;s a preview of what you&apos;re creating
      </p>

      {/* Preview card */}
      <div className={`rounded-xl border-2 ${colorClasses.border} overflow-hidden`}>
        {/* Mock browser header */}
        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              needthisdone.com/your-page
            </span>
          </div>
        </div>

        {/* Mock page content */}
        <div className={`${colorClasses.bg} p-6`}>
          <h2 className={`text-xl font-bold ${colorClasses.text} text-center`}>
            {headline}
          </h2>
        </div>

        {/* Template info */}
        <div className="bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Template</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {template.metadata.name}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600 dark:text-gray-400">Sections</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {template.sections.length}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600 dark:text-gray-400">Color</span>
            <span className={`font-medium ${colorClasses.text}`}>
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
        You can edit everything after creation in the page builder
      </p>
    </div>
  );
}
