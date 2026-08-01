import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const APP = resolve(__dirname, '..');
const ROOT = resolve(APP, '..');
const exists = (relativePath: string) => existsSync(resolve(APP, relativePath));
const source = (relativePath: string) => readFileSync(resolve(APP, relativePath), 'utf8');

describe('retained product inventory', () => {
  it('keeps the public growth-service and intake surfaces', () => {
    for (const path of [
      'app/page.tsx',
      'app/services/page.tsx',
      'app/pricing/page.tsx',
      'app/contact/page.tsx',
      'app/site-analyzer/page.tsx',
      'app/api/site-analyzer/route.ts',
      'app/api/projects/route.ts',
    ]) {
      expect(exists(path), `Expected retained surface ${path}`).toBe(true);
    }
  });

  it('keeps authenticated operator, client, and employee workspaces', () => {
    for (const path of [
      'app/admin/layout.tsx',
      'app/admin/reports/page.tsx',
      'app/dashboard/page.tsx',
      'app/employee/page.tsx',
      'app/api/employee/workspace/route.ts',
      'app/api/employee/work-items/[id]/decision/route.ts',
    ]) {
      expect(exists(path), `Expected retained workspace ${path}`).toBe(true);
    }
  });

  it('does not preserve retired ecommerce runtime surfaces', () => {
    for (const path of [
      'app/shop',
      'app/cart',
      'app/checkout',
      'app/orders',
      'app/admin/reviews',
      'app/api/reviews',
      'app/api/admin/reviews',
      'app/api/user/reviews',
      'app/api/account/saved-addresses',
      'components/account/SavedAddressesSection.tsx',
      'lib/hooks/useSavedAddresses.ts',
      'app/api/account/notification-preferences',
      'components/account/NotificationPreferencesSection.tsx',
      'app/admin/communication',
      'app/api/admin/email-campaigns',
      'app/api/admin/email-templates',
      'app/api/cron/retry-failed-emails',
    ]) {
      expect(exists(path), `Expected retired surface ${path} to be absent`).toBe(false);
    }
    expect(existsSync(resolve(ROOT, 'medusa-v2/package.json'))).toBe(false);
    expect(source('app/api/health/route.ts')).not.toMatch(/medusa|railway/i);
    expect(source('lib/cache.ts')).not.toMatch(/medusa:/i);
  });
});
