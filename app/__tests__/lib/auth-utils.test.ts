import { describe, it, expect } from 'vitest';
import { getAuthTitle, getAuthDescription } from '@/lib/auth-utils';

describe('getAuthTitle', () => {
  it('should return "Reset Your Password" when isForgotPassword is true', () => {
    expect(getAuthTitle(true, false)).toBe('Reset Your Password');
    expect(getAuthTitle(true, true)).toBe('Reset Your Password'); // Forgot password takes precedence
  });

  it('should return "Join Us" when isSignUpMode is true and not forgot password', () => {
    expect(getAuthTitle(false, true)).toBe('Join Us');
  });

  it('should return "Welcome Back" when both are false (sign in mode)', () => {
    expect(getAuthTitle(false, false)).toBe('Welcome Back');
  });
});

describe('getAuthDescription', () => {
  it('should return forgot password description when isForgotPassword is true', () => {
    expect(getAuthDescription(true, false)).toBe("No worries. We'll send you a reset link");
    expect(getAuthDescription(true, true)).toBe("No worries. We'll send you a reset link");
  });

  it('should return sign up description when isSignUpMode is true and not forgot password', () => {
    expect(getAuthDescription(false, true)).toBe('Create an account to track your projects and stay in the loop');
  });

  it('should return sign in description when both are false', () => {
    expect(getAuthDescription(false, false)).toBe('Good to see you! Sign in to check on your projects');
  });
});