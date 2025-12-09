// ============================================================================
// TextAreaField - Multi-line Text Input
// ============================================================================
// What: A styled textarea for longer content like descriptions
// Why: Some content needs multiple lines (descriptions, FAQ answers)
// How: Controlled textarea with auto-resize option

import { formInputColors, formValidationColors } from '@/lib/colors';

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  rows?: number;
  className?: string;
}

export default function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  required,
  rows = 3,
  className = '',
}: TextAreaFieldProps) {
  const inputId = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={inputId}
        className={`block text-sm font-medium ${formInputColors.label}`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <textarea
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`
          w-full px-3 py-2 rounded-lg border-2 text-sm resize-y
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          placeholder-gray-400 dark:placeholder-gray-500
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${
            error
              ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/50'
              : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-200 dark:focus:ring-blue-900/50'
          }
        `}
      />

      {hint && !error && (
        <p className={`text-xs ${formInputColors.helper}`}>{hint}</p>
      )}

      {error && (
        <p className={`text-xs ${formValidationColors.error}`}>{error}</p>
      )}
    </div>
  );
}
