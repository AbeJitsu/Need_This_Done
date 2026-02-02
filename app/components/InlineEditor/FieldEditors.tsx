// ============================================================================
// Field Editors - Reusable input components for AdminSidebar
// ============================================================================
// What: Individual editor components for different field types
// Why: Eliminates duplication between section and item editing
// How: Each editor takes a value, path, and onChange handler

import { formInputColors, focusRingClasses } from '@/lib/colors';

// Common props for all field editors
interface FieldEditorProps {
  path: string;
  value: unknown;
  label: string;
  onChange: (path: string, newValue: unknown) => void;
}

// Color variant options
const colorVariants = ['blue', 'purple', 'green', 'gold', 'gray', 'teal'];

// ============================================================================
// Color Select Editor
// ============================================================================
export function ColorSelectEditor({ path, value, label, onChange }: FieldEditorProps) {
  const stringValue = value !== null && value !== undefined ? String(value) : '';

  return (
    <div className="mb-3">
      <label className={`block text-xs font-medium ${formInputColors.label} mb-1`}>
        {label}
      </label>
      <select
        value={stringValue}
        onChange={(e) => onChange(path, e.target.value)}
        className={`
          w-full px-2 py-1.5 rounded border text-sm
          ${formInputColors.base} ${formInputColors.focus}
          ${focusRingClasses.blue}
        `}
      >
        {colorVariants.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}

// ============================================================================
// Text Area Editor
// ============================================================================
export function TextAreaEditor({ path, value, label, onChange }: FieldEditorProps) {
  const stringValue = value !== null && value !== undefined ? String(value) : '';

  return (
    <div className="mb-3">
      <label className={`block text-xs font-medium ${formInputColors.label} mb-1`}>
        {label}
      </label>
      <textarea
        value={stringValue}
        onChange={(e) => onChange(path, e.target.value)}
        rows={3}
        className={`
          w-full px-2 py-1.5 rounded border text-sm resize-y
          ${formInputColors.base} ${formInputColors.focus}
          ${focusRingClasses.blue}
        `}
      />
    </div>
  );
}

// ============================================================================
// Boolean Toggle Editor
// ============================================================================
export function BooleanToggleEditor({ path, value, label, onChange }: FieldEditorProps) {
  const boolValue = typeof value === 'boolean' ? value : value === 'true';

  return (
    <div className="mb-3 flex items-center justify-between">
      <label className={`text-xs font-medium ${formInputColors.label}`}>
        {label}
      </label>
      <button
        type="button"
        onClick={() => onChange(path, !boolValue)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${boolValue ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        `}
        role="switch"
        aria-checked={boolValue}
        aria-label={`Toggle ${label}`}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${boolValue ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
}

// ============================================================================
// Number Editor
// ============================================================================
export function NumberEditor({ path, value, label, onChange }: FieldEditorProps) {
  const stringValue = value !== null && value !== undefined ? String(value) : '';

  return (
    <div className="mb-3">
      <label className={`block text-xs font-medium ${formInputColors.label} mb-1`}>
        {label}
      </label>
      <input
        type="number"
        value={stringValue}
        onChange={(e) => onChange(path, Number(e.target.value))}
        className={`
          w-full px-2 py-1.5 rounded border text-sm
          ${formInputColors.base} ${formInputColors.focus}
          ${focusRingClasses.blue}
        `}
      />
    </div>
  );
}

// ============================================================================
// Text Input Editor
// ============================================================================
export function TextInputEditor({ path, value, label, onChange }: FieldEditorProps) {
  const stringValue = value !== null && value !== undefined ? String(value) : '';

  return (
    <div className="mb-3">
      <label className={`block text-xs font-medium ${formInputColors.label} mb-1`}>
        {label}
      </label>
      <input
        type="text"
        value={stringValue}
        onChange={(e) => onChange(path, e.target.value)}
        className={`
          w-full px-2 py-1.5 rounded border text-sm
          ${formInputColors.base} ${formInputColors.focus}
          ${focusRingClasses.blue}
        `}
      />
    </div>
  );
}

// ============================================================================
// Smart Field Editor - Automatically selects the right editor type
// ============================================================================
// Human-readable labels for common field names (exported for use in AdminSidebar)
export const fieldLabels: Record<string, string> = {
  title: 'Title',
  description: 'Description',
  text: 'Text',
  variant: 'Style',
  href: 'Link URL',
  name: 'Name',
  price: 'Price',
  duration: 'Duration',
  linkText: 'Link Text',
  linkHref: 'Link URL',
  footer: 'Footer Text',
  footerLinkText: 'Footer Link Text',
  footerLinkHref: 'Footer Link URL',
  chatbotNote: 'Chatbot Note',
  number: 'Step Number',
  color: 'Color',
  _value: 'Value',
  tagline: 'Tagline',
  details: 'Details',
  cards: 'Service Cards',
  buttons: 'Buttons',
  options: 'Options',
  steps: 'Steps',
  answer: 'Answer',
  question: 'Question',
};

interface SmartFieldEditorProps {
  path: string;
  value: unknown;
  fieldName: string;
  onChange: (path: string, newValue: unknown) => void;
  customLabel?: string;
}

export function SmartFieldEditor({
  path,
  value,
  fieldName,
  onChange,
  customLabel,
}: SmartFieldEditorProps) {
  const stringValue = value !== null && value !== undefined ? String(value) : '';
  const label = customLabel || fieldLabels[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').trim();

  // Color variant selector
  if (fieldName === 'variant' || fieldName === 'color') {
    return <ColorSelectEditor path={path} value={value} label={label} onChange={onChange} />;
  }

  // Textarea for long text
  if (fieldName === 'description' || fieldName === 'chatbotNote' || fieldName === 'answer' || fieldName === 'details' || stringValue.length > 80) {
    return <TextAreaEditor path={path} value={value} label={label} onChange={onChange} />;
  }

  // Boolean toggle
  if (typeof value === 'boolean' || fieldName === 'popular' || fieldName === 'enabled') {
    return <BooleanToggleEditor path={path} value={value} label={label} onChange={onChange} />;
  }

  // Number input
  if (typeof value === 'number' || fieldName === 'number') {
    return <NumberEditor path={path} value={value} label={label} onChange={onChange} />;
  }

  // Default text input
  return <TextInputEditor path={path} value={value} label={label} onChange={onChange} />;
}
