import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), '..');
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('AI employee product boundary', () => {
  it('publishes only the current website-improvement and managed-operator offerings', async () => {
    const { OFFERING_CATALOG } = await import('@/lib/offering-catalog');
    expect(OFFERING_CATALOG.map((item) => item.slug)).toEqual([
      'website-improvement',
      'ai-operator',
    ]);
    expect(OFFERING_CATALOG.map((item) => item.priceCents)).toEqual([50000, null]);
  });

  it('adds isolated customer records and idempotent decisions', () => {
    const migration = read('supabase/migrations/072_ai_employee_customer_boundary.sql');
    expect(migration).toContain('enable row level security');
    expect(migration).toContain('public.is_customer_member');
    expect(migration).toContain('unique (work_item_id)');
    expect(migration).toContain('unique (idempotency_key)');
    expect(migration).toContain('unique (employee_id, external_action_key)');
    expect(migration).toContain('record_ai_employee_decision');
    expect(migration).toContain('grant execute');
  });

  it('keeps all external actions under approval', () => {
    const workspace = read('app/components/employee/EmployeeWorkspace.tsx');
    expect(workspace).toContain('No outreach, publishing, system changes, or spending without a recorded approval');
    expect(workspace).toContain("'approve', 'revise', 'defer', 'reject'");
    expect(workspace).toContain('/api/employee/workspace');
    expect(workspace).toContain('/decision');
    expect(workspace).toContain('MAX_QUEUE_ITEMS = 5');
  });
});
