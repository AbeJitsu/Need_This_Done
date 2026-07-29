import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: memberships, error: membershipError } = await supabase
    .from('customer_memberships')
    .select('customer_id, role, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(2);

  if (membershipError) {
    return NextResponse.json({ error: 'Employee workspace is not configured yet.' }, { status: 503 });
  }
  if (!memberships?.length) {
    return NextResponse.json({ workspace: null, reason: 'no_membership' });
  }
  if (memberships.length > 1) {
    return NextResponse.json(
      { workspace: null, reason: 'multiple_memberships', error: 'This account is linked to multiple customers.' },
      { status: 409 },
    );
  }
  const membership = memberships[0];

  const [{ data: customer, error: customerError }, { data: employees, error: employeeError }] = await Promise.all([
    supabase.from('customer_accounts').select('id, name').eq('id', membership.customer_id).single(),
    supabase.from('ai_employees').select('id, name, role_name, status, created_at')
      .eq('customer_id', membership.customer_id).order('created_at', { ascending: true }).limit(2),
  ]);

  if (customerError || employeeError) {
    return NextResponse.json({ error: 'Employee workspace could not be loaded.' }, { status: 500 });
  }
  if (!employees?.length) {
    return NextResponse.json({ workspace: null, reason: 'no_employee' });
  }
  if (employees.length > 1) {
    return NextResponse.json(
      { workspace: null, reason: 'multiple_employees', error: 'This customer has multiple employees.' },
      { status: 409 },
    );
  }
  const employee = employees[0];
  const scheduledDate = new Date().toISOString().slice(0, 10);

  const [briefResult, scheduleResult, workResult, outcomeResult] = await Promise.all([
    supabase.from('ai_employee_operating_briefs')
      .select('responsibilities, prohibited_actions, channels, tone, approval_rules, version')
      .eq('employee_id', employee.id).order('version', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('ai_employee_check_in_schedules')
      .select('check_in_type, local_time, timezone, enabled').eq('employee_id', employee.id),
    supabase.from('ai_employee_work_items')
      .select('id, predecessor_work_item_id, source_type, source_id, queue, scheduled_date, title, evidence, proposed_action, expected_outcome, risk_level, priority, status, created_at')
      .eq('employee_id', employee.id).eq('scheduled_date', scheduledDate)
      .order('priority', { ascending: true }).order('created_at', { ascending: true }),
    supabase.from('ai_employee_outcomes')
      .select('id, kind, value, notes, occurred_at').eq('employee_id', employee.id)
      .order('occurred_at', { ascending: false }).limit(100),
  ]);

  const queryError = briefResult.error || scheduleResult.error || workResult.error || outcomeResult.error;
  if (queryError) return NextResponse.json({ error: 'Employee workspace could not be loaded.' }, { status: 500 });

  const workItems = workResult.data || [];
  const workIds = workItems.map((item) => item.id);
  const decisionResult = workIds.length
    ? await supabase.from('ai_employee_decisions')
      .select('id, work_item_id, decision, instructions, created_at')
      .in('work_item_id', workIds).order('created_at', { ascending: false })
    : { data: [], error: null };

  if (decisionResult.error) {
    return NextResponse.json({ error: 'Employee activity could not be loaded.' }, { status: 500 });
  }

  return NextResponse.json({
    workspace: {
      customer,
      membershipRole: membership.role,
      scheduledDate,
      employee,
      brief: briefResult.data,
      schedules: scheduleResult.data || [],
      workItems,
      decisions: decisionResult.data || [],
      outcomes: outcomeResult.data || [],
    },
  });
}
