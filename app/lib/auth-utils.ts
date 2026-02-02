/**
 * Get the appropriate title for auth pages based on the current mode
 * @param isForgotPassword - Whether the user is in forgot password mode
 * @param isSignUpMode - Whether the user is in sign up mode
 * @returns The appropriate title text
 */
export function getAuthTitle(isForgotPassword: boolean, isSignUpMode: boolean): { plain: string; gradient: string } {
  if (isForgotPassword) {
    return { plain: 'Reset', gradient: 'Password' };
  }

  if (isSignUpMode) {
    return { plain: 'Create', gradient: 'Account' };
  }

  return { plain: 'Welcome', gradient: 'Back' };
}

/**
 * Get the appropriate description for auth pages based on the current mode
 * @param isForgotPassword - Whether the user is in forgot password mode
 * @param isSignUpMode - Whether the user is in sign up mode
 * @returns The appropriate description text
 */
export function getAuthDescription(isForgotPassword: boolean, isSignUpMode: boolean): string {
  if (isForgotPassword) {
    return "No worries. We'll send you a reset link";
  }
  
  if (isSignUpMode) {
    return 'Create an account to track your projects and stay in the loop';
  }
  
  return 'Good to see you! Sign in to check on your projects';
}