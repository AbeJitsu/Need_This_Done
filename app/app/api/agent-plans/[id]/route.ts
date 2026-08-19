import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import {
  buildOpenClawInstruction,
  REQUIRED_FORBIDDEN_ACTIONS,
  type PlannerStep,
} from '@/lib/agent-planner';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const idSchema = z.string().uuid();
const patchSchema = z.object({
  action: z.enum(['edit', 'reject']).default('edit'),
  rewrittenInstruction: z.string().trim().min(1).max(12_000).optional(),
  steps: z.array(z.record(z.string(), z.unknown())).min(1).max(12).optional(),
  allowedCapabilities: z.array(z.string().trim().min(1).max(80)).max(12).optional(),
  forbiddenActions: z.array(z.string().trim().min(1).max(120)).max(24).optional(),
  expectedArtifacts: z.array(z.string().trim().min(1).max(160)).max(24).optional(),
  // Accepted for backwards-compatible callers, but never trusted. The
  // server rebuilds this instruction from the edited, validated fields.
  openclawInstruction: z.record(z.string(), z.unknown()).optional(),
  idempotencyKey: z.string().uuid().optional(),
  note: z.string().trim().max(2_000).default(''),
}).strict();

function migrationUnavailable(error: { code?: string } | null) {
  return error?.code === '42P01' || error?.code === '42883';
}

function routeError(error: { code?: string; message?: string } | null, fallback: string) {
  if (migrationUnavailable(error)) return { error: 'Agent planner is not configured yet.', status: 503 };
  if (error?.code === 'P0002') return { error: 'Agent plan not found.', status: 404 };
  if (error?.code === '22023') return { error: 'The agent plan action was rejected by the approval boundary.', status: 409 };
  if (error?.code === '23505') return { error: 'The agent plan action conflicts with an existing request.', status: 409 };
  return { error: fallback, status: 500 };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  if (!idSchema.safeParse((await params).id).success) return NextResponse.json({ error: 'Invalid agent plan.' }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data: plan, error: planError } = await supabase
    .from('agent_plans')
    .select('*')
    .eq('id', (await params).id)
    .maybeSingle();
  if (planError) {
    const mapped = routeError(planError, 'Agent plan could not be loaded.');
    return NextResponse.json({ error: mapped.error }, { status: mapped.status });
  }
  if (!plan) return NextResponse.json({ error: 'Agent plan not found.' }, { status: 404 });

  const [eventsResult, runResult, provenanceResult] = await Promise.all([
    supabase.from('agent_plan_events').select('*').eq('plan_id', (await params).id).order('created_at', { ascending: true }),
    plan.run_id ? supabase.from('agent_runs').select('*').eq('id', plan.run_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    supabase.from('prospecting_artifact_provenance').select('*').eq('plan_id', (await params).id).order('created_at', { ascending: false }),
  ]);
  const relatedError = eventsResult.error || runResult.error || provenanceResult.error;
  if (relatedError) return NextResponse.json({ error: 'Agent plan provenance could not be loaded.' }, { status: 500 });
  return NextResponse.json({
    plan,
    events: eventsResult.data || [],
    run: runResult.data || null,
    provenance: provenanceResult.data || [],
    ownerId: auth.user.id,
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  if (!idSchema.safeParse((await params).id).success) return NextResponse.json({ error: 'Invalid agent plan.' }, { status: 400 });
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid agent plan edit.' }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data: current, error: currentError } = await supabase.from('agent_plans').select('*').eq('id', (await params).id).maybeSingle();
  if (currentError) return NextResponse.json({ error: 'Agent plan could not be loaded.' }, { status: 500 });
  if (!current) return NextResponse.json({ error: 'Agent plan not found.' }, { status: 404 });

  const idempotencyKey = parsed.data.idempotencyKey || crypto.randomUUID();
  if (parsed.data.action === 'reject') {
    const { data, error } = await supabase.rpc('reject_agent_plan', {
      target_plan_id: (await params).id,
      target_idempotency_key: idempotencyKey,
      target_note: parsed.data.note,
    });
    if (error) {
      const mapped = routeError(error, 'Agent plan could not be rejected.');
      return NextResponse.json({ error: mapped.error }, { status: mapped.status });
    }
    return NextResponse.json(data);
  }

  const rewrittenInstruction = parsed.data.rewrittenInstruction || current.rewritten_instruction;
  const steps = (parsed.data.steps || current.steps) as PlannerStep[];
  const allowedCapabilities = parsed.data.allowedCapabilities || current.allowed_capabilities;
  const forbiddenActions = [...new Set([...(parsed.data.forbiddenActions || current.forbidden_actions), ...REQUIRED_FORBIDDEN_ACTIONS])];
  const expectedArtifacts = parsed.data.expectedArtifacts || current.expected_artifacts;
  const workflowType = current.workflow_type === 'daily_content' ? 'daily_content' : 'research_outreach';
  const openclawInstruction = buildOpenClawInstruction({
    workflowType,
    growthProfileId: current.growth_profile_id,
    rewrittenInstruction,
    steps,
    allowedCapabilities,
    forbiddenActions,
    expectedArtifacts,
  });
  const { data, error } = await supabase.rpc('update_agent_plan', {
    target_plan_id: (await params).id,
    target_rewritten_instruction: rewrittenInstruction,
    target_steps: steps,
    target_allowed_capabilities: allowedCapabilities,
    target_forbidden_actions: forbiddenActions,
    target_expected_artifacts: expectedArtifacts,
    target_openclaw_instruction: openclawInstruction,
    target_idempotency_key: idempotencyKey,
  });
  if (error) {
    const mapped = routeError(error, 'Agent plan could not be edited.');
    return NextResponse.json({ error: mapped.error }, { status: mapped.status });
  }
  return NextResponse.json(data);
}
