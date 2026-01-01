// ============================================================================
// SelectField - Dropdown Select Input
// ============================================================================
// What: A styled select dropdown for choices like colors and variants
// Why: Used for predefined options (colors, button variants, etc.)
// How: Uses FieldWrapper for structure, formInputClasses for styling

import { formInputClasses } from '@/lib/colors';
import FieldWrapper from './FieldWrapper';

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
    <FieldWrapper
      label={label}
      inputId={inputId}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <select
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? formInputClasses.inputError : formInputClasses.input}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

// ============================================================================
// Common Options
// ============================================================================

export const colorOptions: SelectOption[] = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'purple', label: 'Purple' },
  { value: 'gold', label: 'Gold' },
  { value: 'teal', label: 'Teal' },
  { value: 'gray', label: 'Gray' },
];

export const buttonVariantOptions: SelectOption[] = [
  { value: 'purple', label: 'Purple (Primary)' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'gold', label: 'Gold' },
  { value: 'teal', label: 'Teal' },
  { value: 'gray', label: 'Gray (Secondary)' },
];

export const hoverColorOptions: SelectOption[] = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'purple', label: 'Purple' },
  { value: 'gold', label: 'Gold' },
  { value: 'teal', label: 'Teal' },
];
