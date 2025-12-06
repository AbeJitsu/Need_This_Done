// ============================================================================
// Shared Validation Constants and Utilities
// ============================================================================
// Centralized validation rules for use across API routes and forms.
// Keeps validation logic DRY and consistent throughout the application.

// ============================================================================
// File Upload Validation
// ============================================================================

export const FILE_VALIDATION = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_COUNT: 3,
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
} as const;

// ============================================================================
// Email Validation
// ============================================================================

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

// ============================================================================
// File Validation Helpers
// ============================================================================

export function isValidFileSize(file: File): boolean {
  return file.size <= FILE_VALIDATION.MAX_SIZE;
}

export function isValidFileType(file: File): boolean {
  return FILE_VALIDATION.ALLOWED_TYPES.includes(file.type as typeof FILE_VALIDATION.ALLOWED_TYPES[number]);
}

export function validateFiles(files: File[]): { valid: boolean; error?: string } {
  if (files.length > FILE_VALIDATION.MAX_COUNT) {
    return { valid: false, error: `Maximum ${FILE_VALIDATION.MAX_COUNT} files allowed` };
  }

  for (const file of files) {
    if (!isValidFileSize(file)) {
      return { valid: false, error: `File ${file.name} exceeds 5MB limit` };
    }
    if (!isValidFileType(file)) {
      return { valid: false, error: `File type not allowed: ${file.name}` };
    }
  }

  return { valid: true };
}

// ============================================================================
// Password Validation
// ============================================================================

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 6,
} as const;

export function isValidPassword(password: string): boolean {
  return !!password && password.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH;
}

// ============================================================================
// Field Trimming Utilities
// ============================================================================

/**
 * Trim whitespace from a field value and return null if empty after trim
 * @param value String value to trim, or null/undefined
 * @returns Trimmed string or null
 */
export function trimField(
  value: string | null | undefined
): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
