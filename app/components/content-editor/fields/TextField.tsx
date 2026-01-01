// ============================================================================
// TextField - Single Line Text Input
// ============================================================================
// What: A styled text input field for the content editor
// Why: Consistent, accessible form inputs across all content forms
// How: Uses FieldWrapper for structure, formInputClasses for styling

import { formInputClasses } from '@/lib/colors';
import FieldWrapper from './FieldWrapper';

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
    <FieldWrapper
      label={label}
      inputId={inputId}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? formInputClasses.inputError : formInputClasses.input}
      />
    </FieldWrapper>
  );
}
