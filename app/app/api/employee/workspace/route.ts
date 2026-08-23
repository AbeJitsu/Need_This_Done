import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { dateInTimeZone, isValidTimeZone } from '@/lib/timezone';
import { verifyAdmin } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;

  const supabase = await createSupabaseServerClient();
  const { data: availableCustomerRows, error: customerListError } = await supabase
    .from('customer_accounts')
    .select('id, name, created_at')
    .order('created_at', { ascending: true });

  if (customerListError) {
    return NextResponse.json({ error: 'Employee workspace is not configured yet.' }, { status: 503 });
  }
  if (!availableCustomerRows?.length) {
    return NextResponse.json({ workspace: null, reason: 'no_customer' });
  }

  const requestedCustomerId = new URL(request.url).searchParams.get('customerId');
  const selectedCustomer = requestedCustomerId
    ? availableCustomerRows.find((candidate) => candidate.id === requestedCustomerId)
    : availableCustomerRows[0];
  if (!selectedCustomer) {
    return NextResponse.json({ error: 'Customer workspace not found.' }, { status: 404 });
  }

  const [{ data: customer, error: customerError }, { data: employees, error: employeeError }] = await Promise.all([
    supabase.from('customer_accounts').select('id, name').eq('id', selectedCustomer.id).single(),
    supabase.from('ai_employees').select('id, name, role_name, status, created_at')
      .eq('customer_id', selectedCustomer.id).order('created_at', { ascending: true }).limit(2),
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

  const [briefResult, scheduleResult, workResult, outcomeResult] = await Promise.all([
    supabase.from('ai_employee_operating_briefs')
      .select('responsibilities, prohibited_actions, channels, tone, approval_rules, version')
      .eq('employee_id', employee.id).order('version', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('ai_employee_check_in_schedules')
      .select('check_in_type, local_time, timezone, enabled').eq('employee_id', employee.id),
    supabase.from('ai_employee_work_items')
      .select('id, predecessor_work_item_id, source_type, source_id, queue, scheduled_date, title, evidence, proposed_action, expected_outcome, risk_level, priority, status, created_by, completed_by, completed_at, completion_notes, created_at')
      .eq('employee_id', employee.id)
      .order('created_at', { ascending: false }).limit(100),
    supabase.from('ai_employee_outcomes')
      .select('id, work_item_id, kind, value, amount_cents, currency, cost_category, notes, recorded_by, occurred_at')
      .eq('employee_id', employee.id)
      .order('occurred_at', { ascending: false }).limit(100),
  ]);

  const queryError = briefResult.error || scheduleResult.error || workResult.error || outcomeResult.error;
  if (queryError) return NextResponse.json({ error: 'Employee workspace could not be loaded.' }, { status: 500 });

  const schedules = scheduleResult.data || [];
  const configuredTimezone = schedules.find((schedule) => schedule.enabled)?.timezone || 'UTC';
  const timezone = isValidTimeZone(configuredTimezone) ? configuredTimezone : 'UTC';
  const scheduledDate = dateInTimeZone(new Date(), timezone);
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

  const outcomes = outcomeResult.data || [];
  const todaysOutcomes = outcomes.filter((outcome) => dateInTimeZone(new Date(outcome.occurred_at), timezone) === scheduledDate);
  const scorecards = new Map<string, { currency: string; grossRevenueCents: number; totalCostCents: number }>();
  for (const outcome of todaysOutcomes) {
    if ((outcome.kind !== 'revenue' && outcome.kind !== 'cost') || !outcome.currency || !outcome.amount_cents) continue;
    const scorecard = scorecards.get(outcome.currency) || {
      currency: outcome.currency, grossRevenueCents: 0, totalCostCents: 0,
    };
    if (outcome.kind === 'revenue') scorecard.grossRevenueCents += outcome.amount_cents;
    else scorecard.totalCostCents += outcome.amount_cents;
    scorecards.set(outcome.currency, scorecard);
  }

  const funnel = { leads: 0, replies: 0, meetings: 0, projects: 0 };
  let operatorMinutes = 0;
  for (const outcome of todaysOutcomes) {
    if (outcome.kind === 'lead') funnel.leads += Number(outcome.value);
    if (outcome.kind === 'reply') funnel.replies += Number(outcome.value);
    if (outcome.kind === 'meeting') funnel.meetings += Number(outcome.value);
    if (outcome.kind === 'project') funnel.projects += Number(outcome.value);
    if (outcome.kind === 'time_saved') operatorMinutes += Number(outcome.value);
  }

  const availableCustomers = availableCustomerRows.map((candidate) => ({
    id: candidate.id,
    name: candidate.name,
    role: 'operator' as const,
  }));

  return NextResponse.json({
    workspace: {
      customer,
      availableCustomers,
      membershipRole: 'operator',
      scheduledDate,
      timezone,
      employee,
      brief: briefResult.data,
      schedules,
      workItems,
      decisions: decisionResult.data || [],
      outcomes,
      dailyScorecards: [...scorecards.values()].map((scorecard) => ({
        ...scorecard,
        netRevenueCents: scorecard.grossRevenueCents - scorecard.totalCostCents,
        goalCents: 50_000,
      })).sort((left, right) => left.currency.localeCompare(right.currency)),
      funnel,
      operatorMinutes,
    },
  });
}
