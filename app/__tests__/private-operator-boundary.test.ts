import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const appRoot = resolve(__dirname, '..');
const source = (path: string) => readFileSync(resolve(appRoot, path), 'utf8');

describe('operator-only private boundary', () => {
  it.each([
    'app/api/account/profile/route.ts',
    'app/api/dashboard/route.ts',
    'app/api/dashboard/actions/[id]/route.ts',
    'app/api/dashboard/priorities/route.ts',
    'app/api/dashboard/priorities/[id]/route.ts',
    'app/api/dashboard/reflection/route.ts',
    'app/api/employee/workspace/route.ts',
    'app/api/employee/work-items/route.ts',
    'app/api/employee/work-items/[id]/decision/route.ts',
    'app/api/employee/work-items/[id]/complete/route.ts',
    'app/api/employee/outcomes/route.ts',
    'app/api/projects/[id]/comments/route.ts',
    'app/api/projects/[id]/deliveries/route.ts',
    'app/api/files/[...path]/route.ts',
  ])('%s requires the shared operator check', (path) => {
    const route = source(path);
    expect(route).toMatch(/verifyAdmin\s*\(/);
    expect(route).not.toMatch(/verifyProjectAccess\s*\(|verifyAuth\s*\(/);
  });

  it.each([
    'app/api/projects/mine/route.ts',
    'app/api/projects/[id]/access/route.ts',
  ])('%s is an authenticated operator-only retired route', (path) => {
    const route = source(path);
    expect(route).toMatch(/verifyAdmin\s*\(/);
    expect(route).toMatch(/status:\s*410/);
  });

  it('does not attach a signed-in user to a new public project request', () => {
    const route = source('app/api/projects/route.ts');
    expect(route).not.toContain('userId = user.id');
    expect(route).toContain('user_id: null');
  });

  it('keeps GitHub handoff creation operator-only and draft-only', () => {
    const route = source('app/api/projects/[id]/deliveries/route.ts');
    expect(route).toContain("notification_status: 'draft'");
    expect(route).not.toContain('sendProjectGithubHandoff');
  });

  it.each([
    'app/dashboard/page.tsx',
    'app/employee/page.tsx',
  ])('%s renders only for an operator', (path) => {
    const page = source(path);
    expect(page).toContain('isAdmin');
    expect(page).toMatch(/!isAuthenticated\s*\|\|\s*!isAdmin/);
  });
});
