// ============================================================================
// TextField - Single Line Text Input
// ============================================================================
// What: A styled text input field for the content editor
// Why: Consistent, accessible form inputs across all content forms
// How: Controlled input with label, optional hint text, and error state

import { formInputColors, formValidationColors } from '@/lib/colors';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export default function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  required,
  className = '',
}: TextFieldProps) {
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

      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full px-3 py-2 rounded-lg border-2 text-sm
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
