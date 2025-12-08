// ============================================================================
// SelectField - Dropdown Select Input
// ============================================================================
// What: A styled select dropdown for choices like colors and variants
// Why: Used for predefined options (colors, button variants, etc.)
// How: Controlled select with typed options

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export default function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
  error,
  required,
  className = '',
}: SelectFieldProps) {
  const inputId = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <select
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full px-3 py-2 rounded-lg border-2 text-sm
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${
            error
              ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/50'
              : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-200 dark:focus:ring-blue-900/50'
          }
        `}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {hint && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

// ============================================================================
// Common Options
// ============================================================================

export const colorOptions: SelectOption[] = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'purple', label: 'Purple' },
  { value: 'orange', label: 'Orange' },
  { value: 'teal', label: 'Teal' },
  { value: 'gray', label: 'Gray' },
];

export const buttonVariantOptions: SelectOption[] = [
  { value: 'purple', label: 'Purple (Primary)' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'orange', label: 'Orange' },
  { value: 'teal', label: 'Teal' },
  { value: 'gray', label: 'Gray (Secondary)' },
];

export const hoverColorOptions: SelectOption[] = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'purple', label: 'Purple' },
  { value: 'orange', label: 'Orange' },
  { value: 'teal', label: 'Teal' },
];
