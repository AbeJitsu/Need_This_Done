import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const APP_ROOT = resolve(__dirname, '..');
const source = (path: string) => readFileSync(resolve(APP_ROOT, path), 'utf8');

describe('Google-first authentication boundary', () => {
  it('keeps public password signup retired', () => {
    expect(existsSync(resolve(APP_ROOT, 'app/api/auth/signup/route.ts'))).toBe(false);
  });

  it('keeps Google and email/password sign-in visible together', () => {
    const login = source('app/login/LoginClient.tsx');
    expect(login).toContain('Continue with Google');
    expect(login).toContain('Email Address');
    expect(login).toContain('Password');
    expect(login).not.toContain('Use the recovery path');
    expect(login).toContain("signInWithNextAuth('google'");

    const bridge = source('app/api/auth/supabase-bridge/route.ts');
    expect(bridge).toContain('signInWithIdToken');
    expect(bridge).toContain("provider: 'google'");
    expect(bridge).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
  });

  it('does not restore browser or dashboard authorization bypasses', () => {
    const protectedSources = [
      'context/AuthContext.tsx',
      'lib/api-auth.ts',
    ].map(source).join('\n');

    expect(protectedSources).not.toContain('NEXT_PUBLIC_E2E_ADMIN_BYPASS');
    expect(protectedSources).not.toContain('getPreviewMode');
    expect(protectedSources).not.toContain('previewMode');

    const dashboard = source('app/dashboard/page.tsx');
    expect(dashboard).not.toContain('NEXT_PUBLIC_DASHBOARD_PREVIEW');
    expect(dashboard).not.toContain('localPreview');
    expect(dashboard).toContain('!isAuthenticated || !isAdmin');
  });
});
