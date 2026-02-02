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

// ============================================================================
// Path Sanitization (Security)
// ============================================================================
// Prevent directory traversal attacks in file paths

/**
 * Sanitize file path to prevent directory traversal attacks
 * Removes: ../, ..\, absolute paths, null bytes
 *
 * @param path User-provided file path
 * @returns Sanitized path safe for file operations
 * @throws Error if path contains dangerous patterns
 */
export function sanitizeFilePath(path: string): string {
  if (!path || typeof path !== 'string') {
    throw new Error('Invalid file path');
  }

  // Check for null bytes (path truncation attack)
  if (path.includes('\0')) {
    throw new Error('Invalid characters in file path');
  }

  // Remove directory traversal patterns
  const sanitized = path
    .replace(/\.\./g, '') // Remove ..
    .replace(/^\/+/, '') // Remove leading slashes (absolute paths)
    .replace(/^[A-Za-z]:\\/, '') // Remove Windows drive letters
    .trim();

  // Ensure path is not empty after sanitization
  if (!sanitized || sanitized.length === 0) {
    throw new Error('Invalid file path after sanitization');
  }

  // Block paths that still contain suspicious patterns
  if (sanitized.includes('..') || sanitized.startsWith('/')) {
    throw new Error('File path contains unsafe patterns');
  }

  return sanitized;
}

/**
 * Sanitize filename for safe storage
 * Allows: alphanumeric, hyphens, underscores, dots (for extensions)
 * Blocks: path separators, special characters
 *
 * @param filename User-provided filename
 * @returns Sanitized filename
 * @throws Error if filename is invalid
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Invalid filename');
  }

  // Remove any path components (in case full path was provided)
  const baseName = filename.split(/[/\\]/).pop() || '';

  // Allow only safe characters: alphanumeric, hyphen, underscore, dot
  const sanitized = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');

  if (!sanitized || sanitized.length === 0) {
    throw new Error('Filename contains no valid characters');
  }

  // Prevent hidden files and ensure reasonable length
  if (sanitized.startsWith('.') || sanitized.length > 255) {
    throw new Error('Invalid filename format');
  }

  return sanitized;
}

// ============================================================================
// Email Sanitization
// ============================================================================

/**
 * Sanitize and normalize email address
 * Converts to lowercase, trims whitespace
 *
 * @param email User-provided email
 * @returns Sanitized email
 * @throws Error if email format is invalid
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email');
  }

  const sanitized = email.trim().toLowerCase();

  if (!isValidEmail(sanitized)) {
    throw new Error('Invalid email format');
  }

  // Additional checks for email injection attempts
  if (sanitized.includes('\n') || sanitized.includes('\r')) {
    throw new Error('Invalid characters in email');
  }

  return sanitized;
}

// ============================================================================
// String Length Validation
// ============================================================================

/**
 * Validate string length is within acceptable bounds
 *
 * @param value String to validate
 * @param maxLength Maximum allowed length
 * @param fieldName Name of field (for error messages)
 * @returns true if valid
 * @throws Error if length exceeds maximum
 */
export function validateStringLength(
  value: string,
  maxLength: number,
  fieldName: string = 'Field'
): boolean {
  if (value && value.length > maxLength) {
    throw new Error(`${fieldName} exceeds maximum length of ${maxLength} characters`);
  }
  return true;
}

// ============================================================================
// Numeric Input Validation
// ============================================================================

/**
 * Validate and sanitize numeric input (amounts, quantities, IDs)
 * Prevents NaN, Infinity, negative values where inappropriate
 *
 * @param value Input value to validate
 * @param options Validation options
 * @returns Validated number
 * @throws Error if validation fails
 */
export function validateNumericInput(
  value: unknown,
  options: {
    min?: number;
    max?: number;
    allowDecimals?: boolean;
    fieldName?: string;
  } = {}
): number {
  const { min = 0, max = Number.MAX_SAFE_INTEGER, allowDecimals = false, fieldName = 'Value' } = options;

  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new Error(`${fieldName} must be a valid number`);
  }

  if (!allowDecimals && !Number.isInteger(value)) {
    throw new Error(`${fieldName} must be a whole number`);
  }

  if (value < min) {
    throw new Error(`${fieldName} must be at least ${min}`);
  }

  if (value > max) {
    throw new Error(`${fieldName} cannot exceed ${max}`);
  }

  return value;
}
