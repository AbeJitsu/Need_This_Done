import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), '..');
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('AI employee product boundary', () => {
  it('publishes only the pilot and managed employee offerings', async () => {
    const { OFFERING_CATALOG } = await import('@/lib/offering-catalog');
    expect(OFFERING_CATALOG.map((item) => item.slug)).toEqual([
      'ai-growth-employee-pilot',
      'managed-ai-growth-employee',
    ]);
    expect(OFFERING_CATALOG.every((item) => item.priceCents === null)).toBe(true);
  });

  it('adds isolated customer records and idempotent decisions', () => {
    const migration = read('supabase/migrations/072_ai_employee_customer_boundary.sql');
    expect(migration).toContain('enable row level security');
    expect(migration).toContain('public.is_customer_member');
    expect(migration).toContain('unique (work_item_id, idempotency_key)');
    expect(migration).toContain('unique (employee_id, external_action_key)');
  });

  it('keeps all external actions under approval', () => {
    const workspace = read('app/components/employee/EmployeeWorkspace.tsx');
    expect(workspace).toContain('No outreach, publishing, system changes, or spending without a recorded approval');
    expect(workspace).toContain("'approve', 'revise', 'defer', 'reject'");
  });
});
