// ============================================================================
// FieldWrapper - Shared Label/Hint/Error Structure
// ============================================================================
// What: A wrapper component that provides consistent field structure
// Why: DRY - all field components share the same label, hint, error pattern
// How: Wraps any input element with label, optional required marker, and feedback

import { ReactNode } from 'react';
import { formInputColors, formValidationColors } from '@/lib/colors';

interface FieldWrapperProps {
  label: string;
  inputId: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export default function FieldWrapper({
  label,
  inputId,
  children,
  hint,
  error,
  required,
  className = '',
}: FieldWrapperProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={inputId}
        className={`block text-sm font-medium ${formInputColors.label}`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {children}

      {hint && !error && (
        <p className={`text-xs ${formInputColors.helper}`}>{hint}</p>
      )}

      {error && (
        <p className={`text-xs ${formValidationColors.error}`}>{error}</p>
      )}
    </div>
  );
}
