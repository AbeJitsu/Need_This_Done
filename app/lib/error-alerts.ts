// ============================================================================
// Error Alert System - Store and Track Critical Errors
// ============================================================================
// What: Captures critical system errors for admin visibility
// Why: Production errors should be tracked and reviewed
// How: Store errors in localStorage + browser console, with admin review UI

import type { ErrorClassification } from './error-recovery';

// ============================================================================
// Types
// ============================================================================

export interface CriticalErrorAlert {
  id: string;
  timestamp: number;
  severity: 'critical' | 'permanent';
  code: string;
  message: string;
  context: string;
  url: string;
  userAgent: string;
  debugInfo: Record<string, unknown>;
}

// ============================================================================
// Storage Key
// ============================================================================

const ERROR_ALERTS_STORAGE_KEY = 'critical_error_alerts';
const MAX_STORED_ERRORS = 50; // Keep last 50 errors

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate unique ID for error alert
 */
function generateErrorId(): string {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get stored error alerts from localStorage
 */
function getStoredErrors(): CriticalErrorAlert[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(ERROR_ALERTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save error alerts to localStorage (keep only recent ones)
 */
function saveErrors(errors: CriticalErrorAlert[]): void {
  if (typeof window === 'undefined') return;

  try {
    // Keep only the most recent errors
    const recentErrors = errors.slice(-MAX_STORED_ERRORS);
    localStorage.setItem(ERROR_ALERTS_STORAGE_KEY, JSON.stringify(recentErrors));
  } catch (error) {
    // localStorage might be full or disabled - fail silently
    console.warn('Failed to save error alerts to localStorage', error);
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Record a critical error for admin review
 * This is called from error-recovery.ts when critical errors occur
 */
export function recordCriticalError(
  classified: ErrorClassification,
  context: string
): void {
  if (typeof window === 'undefined') return;

  const alert: CriticalErrorAlert = {
    id: generateErrorId(),
    timestamp: Date.now(),
    severity: classified.severity as 'critical' | 'permanent',
    code: classified.code,
    message: classified.message,
    context,
    url: window.location.href,
    userAgent: window.navigator.userAgent,
    debugInfo: classified.debugInfo,
  };

  // Get existing errors
  const errors = getStoredErrors();
  errors.push(alert);
  saveErrors(errors);

  // Also log to console with special formatting for visibility
  console.error(
    `%c[CRITICAL ERROR] ${classified.code}`,
    'background: #ff4444; color: white; padding: 4px 8px; border-radius: 3px; font-weight: bold;',
    {
      message: classified.message,
      context,
      severity: classified.severity,
      debugInfo: classified.debugInfo,
      timestamp: new Date().toISOString(),
    }
  );
}

/**
 * Get all stored critical errors
 * Use this in admin dashboard to display error history
 */
export function getCriticalErrors(): CriticalErrorAlert[] {
  return getStoredErrors();
}

/**
 * Get critical errors since a specific timestamp
 * Useful for real-time monitoring
 */
export function getErrorsSince(timestamp: number): CriticalErrorAlert[] {
  return getStoredErrors().filter(error => error.timestamp >= timestamp);
}

/**
 * Clear all stored error alerts
 * Call this after reviewing errors in admin dashboard
 */
export function clearCriticalErrors(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ERROR_ALERTS_STORAGE_KEY);
  } catch {
    // Fail silently
  }
}

/**
 * Clear errors by code (e.g., clear all "TIMEOUT" errors)
 */
export function clearErrorsByCode(code: string): void {
  const errors = getStoredErrors();
  const filtered = errors.filter(e => e.code !== code);
  saveErrors(filtered);
}

/**
 * Get error statistics for monitoring
 * Returns count by severity and code
 */
export function getErrorStats() {
  const errors = getStoredErrors();

  const byCode: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};

  errors.forEach(error => {
    byCode[error.code] = (byCode[error.code] || 0) + 1;
    bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
  });

  return {
    totalErrors: errors.length,
    byCode,
    bySeverity,
    lastError: errors[errors.length - 1] || null,
  };
}
