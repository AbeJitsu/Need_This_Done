import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdmin } from '@/lib/api-auth';
import {
  buildOpenClawInstruction,
  createPlannerPrompt,
  estimatePlannerRequest,
  planWithOpenRouter,
  type GrowthProfilePlannerContext,
} from '@/lib/agent-planner';
import { createServerOpenRouterClient } from '@/lib/openrouter';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  originalRequest: z.string().trim().min(1).max(12_000),
  workflowType: z.enum(['research_outreach', 'daily_content']),
  growthProfileId: z.string().uuid(),
  idempotencyKey: z.string().uuid().optional(),
}).strict();

function migrationUnavailable(error: { code?: string } | null) {
  return error?.code === '42P01' || error?.code === '42883';
}

function plannerFailure(error: unknown) {
  const message = error instanceof Error ? error.message : 'The planner could not prepare a draft plan.';
  return message.replace(/\s+/g, ' ').slice(0, 1_000);
}

export async function GET() {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  const supabase = await createSupabaseServerClient();
  const [plansResult, profilesResult] = await Promise.all([
    supabase.from('agent_plans').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('growth_profiles').select('id, name, target_market, geography, selected_model_id, model_route, emergency_stop').order('created_at', { ascending: true }),
  ]);
  const error = plansResult.error || profilesResult.error;
  if (error) {
    return NextResponse.json({
      error: migrationUnavailable(error) ? 'Agent planner is not configured yet.' : 'Agent plans could not be loaded.',
    }, { status: migrationUnavailable(error) ? 503 : 500 });
  }
  return NextResponse.json({ plans: plansResult.data || [], growthProfiles: profilesResult.data || [] });
}

export async function POST(request: Request) {
  const auth = await verifyAdmin();
  if (auth.error) return auth.error;
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid planner request.' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const idempotencyKey = parsed.data.idempotencyKey || crypto.randomUUID();
  if (parsed.data.idempotencyKey) {
    const { data: existing, error: existingError } = await supabase
      .from('agent_plans')
      .select('*')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();
    if (existingError) {
      return NextResponse.json({
        error: migrationUnavailable(existingError) ? 'Agent planner is not configured yet.' : 'The planner request could not be checked for an existing draft.',
      }, { status: migrationUnavailable(existingError) ? 503 : 500 });
    }
    if (existing) {
      if (existing.original_request !== parsed.data.originalRequest
        || existing.workflow_type !== parsed.data.workflowType
        || existing.growth_profile_id !== parsed.data.growthProfileId) {
        return NextResponse.json({ error: 'The planner idempotency key belongs to a different request.' }, { status: 409 });
      }
      return NextResponse.json({ plan: existing, duplicate: true }, { status: 200 });
    }
  }
  const { data: profile, error: profileError } = await supabase
    .from('growth_profiles')
    .select('*')
    .eq('id', parsed.data.growthProfileId)
    .eq('owner_id', auth.user.id)
    .maybeSingle();
  if (profileError) return NextResponse.json({ error: 'The target growth profile could not be loaded.' }, { status: 500 });
  if (!profile) return NextResponse.json({ error: 'The target growth profile was not found.' }, { status: 404 });
  if (profile.emergency_stop) return NextResponse.json({ error: 'The target growth profile has its emergency stop active.' }, { status: 409 });
  if (!profile.selected_model_id || !['selected-primary', 'selected-free'].includes(profile.model_route)) {
    return NextResponse.json({ error: 'Pin a primary model for this growth profile before planning.' }, { status: 409 });
  }

  const profileContext: GrowthProfilePlannerContext = {
    id: profile.id,
    name: profile.name,
    targetMarket: profile.target_market,
    geography: profile.geography,
    businessSize: profile.business_size,
    painSignals: profile.pain_signals,
    exclusionRules: profile.exclusion_rules,
    offer: profile.offer,
    timezone: profile.timezone,
  };
  const prompt = createPlannerPrompt({
    originalRequest: parsed.data.originalRequest,
    workflowType: parsed.data.workflowType,
    profile: profileContext,
  });

  let generated: Awaited<ReturnType<typeof planWithOpenRouter>>;
  let estimate: ReturnType<typeof estimatePlannerRequest>;
  try {
    const client = createServerOpenRouterClient();
    const models = await client.listModels();
    const pinnedModel = models.find((model) => model.id === profile.selected_model_id && model.availability === 'available');
    if (!pinnedModel) throw new Error('The database-pinned model is not available in the current OpenRouter catalog.');
    generated = await planWithOpenRouter({
      client,
      model: pinnedModel,
      prompt,
      workflowType: parsed.data.workflowType,
    });
    estimate = estimatePlannerRequest(pinnedModel, prompt, generated.plan);
  } catch (error) {
    return NextResponse.json({ error: plannerFailure(error) }, { status: 503 });
  }

  const openclawInstruction = buildOpenClawInstruction({
    workflowType: parsed.data.workflowType,
    rewrittenInstruction: generated.plan.rewrittenInstruction,
    steps: generated.plan.steps,
    allowedCapabilities: generated.plan.allowedCapabilities,
    forbiddenActions: generated.plan.forbiddenActions,
    expectedArtifacts: generated.plan.expectedArtifacts,
    growthProfileId: profile.id,
  });
  const plannerUsage = {
    promptTokens: generated.usage.promptTokens,
    completionTokens: generated.usage.completionTokens,
    costUsd: generated.usage.costUsd,
    estimatedPromptTokens: estimate.promptTokens,
    estimatedCompletionTokens: estimate.completionTokens,
    estimatedCostUsd: estimate.estimatedCostUsd,
  };
  const { data, error } = await supabase.rpc('create_agent_plan', {
    target_original_request: parsed.data.originalRequest,
    target_rewritten_instruction: generated.plan.rewrittenInstruction,
    target_steps: generated.plan.steps,
    target_allowed_capabilities: generated.plan.allowedCapabilities,
    target_forbidden_actions: generated.plan.forbiddenActions,
    target_expected_artifacts: generated.plan.expectedArtifacts,
    target_growth_profile_id: profile.id,
    target_workflow_type: parsed.data.workflowType,
    target_model_id: profile.selected_model_id,
    target_model_route: profile.model_route,
    target_estimated_prompt_tokens: estimate.promptTokens,
    target_estimated_completion_tokens: estimate.completionTokens,
    target_estimated_web_search_calls: 0,
    target_estimated_cost: estimate.estimatedCostUsd,
    target_planner_usage: plannerUsage,
    target_openclaw_instruction: openclawInstruction,
    target_idempotency_key: idempotencyKey,
  });
  if (error) {
    return NextResponse.json({
      error: migrationUnavailable(error) ? 'Agent planner is not configured yet.' : 'The planner draft could not be saved.',
    }, { status: migrationUnavailable(error) ? 503 : 409 });
  }
  const result = data as { duplicate?: boolean };
  return NextResponse.json(data, { status: result.duplicate ? 200 : 201 });
}
