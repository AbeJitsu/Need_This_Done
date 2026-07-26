import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const APP_ROOT = resolve(__dirname, '..');

const retiredPaths = [
  'app/admin/enrollments/page.tsx',
  'app/api/admin/enrollments/route.ts',
  'app/api/enrollments/route.ts',
  'components/Certificate.tsx',
  'components/CourseCard.tsx',
  'components/EnrollButton.tsx',
  'components/LessonPlayer.tsx',
  'components/ProgressBar.tsx',
];

describe('retired LMS application surface', () => {
  it('keeps LMS routes and components out of the supported application', () => {
    for (const retiredPath of retiredPaths) {
      expect(existsSync(resolve(APP_ROOT, retiredPath)), `${retiredPath} should remain retired`).toBe(false);
    }
  });

  it('keeps enrollment calls and navigation out of retained dashboards', () => {
    const userDashboard = readFileSync(resolve(APP_ROOT, 'components/UserDashboard.tsx'), 'utf8');
    const adminSidebar = readFileSync(resolve(APP_ROOT, 'components/AdminSidebar.tsx'), 'utf8');

    expect(userDashboard).not.toContain('/api/enrollments');
    expect(userDashboard).not.toContain('My Learning');
    expect(adminSidebar).not.toContain('/admin/enrollments');
  });
});
