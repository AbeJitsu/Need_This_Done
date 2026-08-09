/**
 * Get the appropriate title for auth pages based on the current mode
 * @param isForgotPassword - Whether the user is in forgot password mode
 * @param isRecoveryMode - Whether the user is using the hidden recovery path
 * @returns The appropriate title text
 */
export function getAuthTitle(isForgotPassword: boolean, isRecoveryMode: boolean): { plain: string; gradient: string } {
  if (isForgotPassword) {
    return { plain: 'Reset', gradient: 'Password' };
  }

  if (isRecoveryMode) {
    return { plain: 'Account', gradient: 'Recovery' };
  }

  return { plain: 'Welcome', gradient: 'Back' };
}

/**
 * Get the appropriate description for auth pages based on the current mode
 * @param isForgotPassword - Whether the user is in forgot password mode
 * @param isRecoveryMode - Whether the user is using the hidden recovery path
 * @returns The appropriate description text
 */
export function getAuthDescription(isForgotPassword: boolean, isRecoveryMode: boolean): string {
  if (isForgotPassword) {
    return "No worries. We'll send you a reset link";
  }
  
  if (isRecoveryMode) {
    return 'Use the emergency account path if Google sign-in is unavailable';
  }
  
  return 'Sign in to review your work, evidence, and next step';
}
