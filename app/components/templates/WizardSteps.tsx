// ============================================================================
// Wizard Step Components
// ============================================================================
// What: Individual step UI components for the PageWizard
// Why: Extracted from PageWizard.tsx to reduce file size
// How: Each step is a focused component with single responsibility

import type { PageTemplate, TemplateCategory } from '@/lib/templates';
import {
  getWizardProgress,
  CATEGORY_INFO,
  ALL_CATEGORIES,
  COLOR_OPTIONS,
} from '@/lib/templates';
import { accentColors, softBgColors, cardBgColors, uiChromeBg, type AccentVariant } from '@/lib/colors';

// ============================================================================
// Step 1: Choose Category
// ============================================================================

interface StepCategoryProps {
  selected: TemplateCategory | null;
  onSelect: (cat: TemplateCategory) => void;
}

export function StepCategory({ selected, onSelect }: StepCategoryProps) {
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

// ============================================================================
// Step 2: Choose Template
// ============================================================================

interface StepTemplateProps {
  templates: PageTemplate[];
  selected: PageTemplate | null;
  onSelect: (t: PageTemplate) => void;
}

export function StepTemplate({ templates, selected, onSelect }: StepTemplateProps) {
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

// ============================================================================
// Step 3: Choose Color
// ============================================================================

interface StepColorProps {
  selected: AccentVariant;
  onSelect: (color: AccentVariant) => void;
}

export function StepColor({ selected, onSelect }: StepColorProps) {
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

// ============================================================================
// Step 4: Fill in Content
// ============================================================================

interface StepContentProps {
  template: PageTemplate;
  content: Record<string, string>;
  onChange: (content: Record<string, string>) => void;
}

export function StepContent({ template, content, onChange }: StepContentProps) {
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
                className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 ${cardBgColors.base} text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
            ) : (
              <input
                type="text"
                value={content[field.path] || field.defaultValue || ''}
                onChange={(e) => updateField(field.path, e.target.value)}
                placeholder={field.hint}
                className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 ${cardBgColors.base} text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
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

// ============================================================================
// Step 5: Preview
// ============================================================================

interface StepPreviewProps {
  template: PageTemplate;
  color: AccentVariant;
  content: Record<string, string>;
}

export function StepPreview({ template, color, content }: StepPreviewProps) {
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
        <div className={`${uiChromeBg.toolbar} px-4 py-2 flex items-center gap-2`}>
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
