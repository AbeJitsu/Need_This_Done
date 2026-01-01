// ============================================================================
// TextAreaField - Multi-line Text Input
// ============================================================================
// What: A styled textarea for longer content like descriptions
// Why: Some content needs multiple lines (descriptions, FAQ answers)
// How: Uses FieldWrapper for structure, formInputClasses for styling

import { formInputClasses } from '@/lib/colors';
import FieldWrapper from './FieldWrapper';

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
    <FieldWrapper
      label={label}
      inputId={inputId}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <textarea
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`${error ? formInputClasses.inputError : formInputClasses.input} resize-y`}
      />
    </FieldWrapper>
  );
}
