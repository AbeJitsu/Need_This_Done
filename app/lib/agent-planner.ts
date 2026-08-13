import { z } from 'zod';
import {
  estimateOpenRouterRequestCost,
  type OpenRouterCompletion,
  type OpenRouterModel,
  type OpenRouterMessage,
} from '@/lib/openrouter-core';

export const SAFE_OPENCLAW_CAPABILITIES = [
  'coordinate',
  'read_public_web',
  'research_public_web',
  'draft_outreach',
  'review_artifacts',
  'create_script',
  'create_thumbnail',
  'create_video',
  'create_audio',
  'create_subtitles',
  'regenerate_artifact',
] as const;

export const REQUIRED_FORBIDDEN_ACTIONS = [
  'send_external_messages',
  'publish_content',
  'spend_money',
  'change_connected_accounts',
  'deliver_external_content',
] as const;

export const PLANNER_TASK_TYPES = [
  'coordinate',
  'research_public_web',
  'draft_outreach',
  'produce_daily_content',
  'review_artifacts',
  'regenerate_artifact',
] as const;

export const PLANNER_AGENT_ROLES = [
  'coordinator',
  'public_web_researcher',
  'outreach_writer',
  'daily_content_producer',
  'reviewer',
] as const;

const plannerStepSchema = z.object({
  key: z.string().trim().regex(/^[a-zA-Z0-9_-]{1,80}$/),
  title: z.string().trim().min(1).max(240),
  instruction: z.string().trim().min(1).max(8_000),
  taskType: z.enum(PLANNER_TASK_TYPES),
  agentRole: z.enum(PLANNER_AGENT_ROLES),
  capabilities: z.array(z.string().trim().min(1).max(80)).max(12),
  expectedArtifacts: z.array(z.string().trim().min(1).max(160)).max(12),
  estimatedCostUsd: z.number().finite().nonnegative(),
}).strict();

export const plannerOutputSchema = z.object({
  rewrittenInstruction: z.string().trim().min(1).max(12_000),
  steps: z.array(plannerStepSchema).min(1).max(12),
  allowedCapabilities: z.array(z.string().trim().min(1).max(80)).max(12),
  forbiddenActions: z.array(z.string().trim().min(1).max(120)).max(24),
  expectedArtifacts: z.array(z.string().trim().min(1).max(160)).max(24),
  estimatedUsage: z.object({
    promptTokens: z.number().int().nonnegative().max(100_000),
    completionTokens: z.number().int().nonnegative().max(100_000),
    webSearchCalls: z.number().int().nonnegative().max(100),
    estimatedCostUsd: z.number().finite().nonnegative(),
  }).strict(),
}).strict();

export type PlannerOutput = z.infer<typeof plannerOutputSchema>;
export type PlannerStep = PlannerOutput['steps'][number];

export type GrowthProfilePlannerContext = {
  id: string;
  name: string;
  targetMarket: string;
  geography: string;
  businessSize: string;
  painSignals: unknown;
  exclusionRules: unknown;
  offer: string;
  timezone: string;
};

export type NormalizedAgentPlan = {
  rewrittenInstruction: string;
  steps: PlannerStep[];
  allowedCapabilities: string[];
  forbiddenActions: string[];
  expectedArtifacts: string[];
  estimatedUsage: PlannerOutput['estimatedUsage'];
  openclawInstruction: Record<string, unknown>;
};

export type PlannerCompletionClient = {
  chatCompletion(request: {
    model: string;
    messages: OpenRouterMessage[];
    maxTokens: number;
    responseSchema?: Record<string, unknown>;
  }): Promise<OpenRouterCompletion>;
};

export const plannerResponseJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['rewrittenInstruction', 'steps', 'allowedCapabilities', 'forbiddenActions', 'expectedArtifacts', 'estimatedUsage'],
  properties: {
    rewrittenInstruction: { type: 'string' },
    steps: {
      type: 'array', minItems: 1, maxItems: 12,
      items: {
        type: 'object', additionalProperties: false,
        required: ['key', 'title', 'instruction', 'taskType', 'agentRole', 'capabilities', 'expectedArtifacts', 'estimatedCostUsd'],
        properties: {
          key: { type: 'string' },
          title: { type: 'string' },
          instruction: { type: 'string' },
          taskType: { type: 'string', enum: [...PLANNER_TASK_TYPES] },
          agentRole: { type: 'string', enum: [...PLANNER_AGENT_ROLES] },
          capabilities: { type: 'array', items: { type: 'string' } },
          expectedArtifacts: { type: 'array', items: { type: 'string' } },
          estimatedCostUsd: { type: 'number', minimum: 0 },
        },
      },
    },
    allowedCapabilities: { type: 'array', items: { type: 'string' } },
    forbiddenActions: { type: 'array', items: { type: 'string' } },
    expectedArtifacts: { type: 'array', items: { type: 'string' } },
    estimatedUsage: {
      type: 'object', additionalProperties: false,
      required: ['promptTokens', 'completionTokens', 'webSearchCalls', 'estimatedCostUsd'],
      properties: {
        promptTokens: { type: 'integer', minimum: 0 },
        completionTokens: { type: 'integer', minimum: 0 },
        webSearchCalls: { type: 'integer', minimum: 0 },
        estimatedCostUsd: { type: 'number', minimum: 0 },
      },
    },
  },
} as const;

function listValue(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).map((item) => item.trim());
}

function parseModelJson(raw: string) {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try {
    return JSON.parse(cleaned) as unknown;
  } catch {
    throw new Error('The planner model did not return valid JSON.');
  }
}

function expectedRoleForTask(taskType: PlannerStep['taskType']) {
  if (taskType === 'coordinate') return 'coordinator';
  if (taskType === 'research_public_web') return 'public_web_researcher';
  if (taskType === 'draft_outreach') return 'outreach_writer';
  if (taskType === 'produce_daily_content') return 'daily_content_producer';
  return 'reviewer';
}

export function parsePlannerOutput(raw: string, workflowType: 'research_outreach' | 'daily_content') {
  const parsed = plannerOutputSchema.safeParse(parseModelJson(raw));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'The planner response did not match the required shape.');
  const value = parsed.data;
  for (const step of value.steps) {
    if (step.agentRole !== expectedRoleForTask(step.taskType)) {
      throw new Error(`Planner role does not match task type ${step.taskType}.`);
    }
    if (step.capabilities.some((capability) => !(SAFE_OPENCLAW_CAPABILITIES as readonly string[]).includes(capability))) {
      throw new Error('The planner requested a capability outside the OpenClaw allowlist.');
    }
  }
  const allowedCapabilities = [...new Set([...value.allowedCapabilities, ...value.steps.flatMap((step) => step.capabilities)])];
  if (allowedCapabilities.some((capability) => !(SAFE_OPENCLAW_CAPABILITIES as readonly string[]).includes(capability))) {
    throw new Error('The planner requested a capability outside the OpenClaw allowlist.');
  }
  const forbiddenActions = [...new Set([...value.forbiddenActions, ...REQUIRED_FORBIDDEN_ACTIONS])];
  const expectedArtifacts = [...new Set([...value.expectedArtifacts, ...value.steps.flatMap((step) => step.expectedArtifacts)])];
  const openclawInstruction = buildOpenClawInstruction({
    workflowType,
    rewrittenInstruction: value.rewrittenInstruction,
    steps: value.steps,
    allowedCapabilities,
    forbiddenActions,
    expectedArtifacts,
  });
  return {
    rewrittenInstruction: value.rewrittenInstruction,
    steps: value.steps,
    allowedCapabilities,
    forbiddenActions,
    expectedArtifacts,
    estimatedUsage: value.estimatedUsage,
    openclawInstruction,
  } satisfies NormalizedAgentPlan;
}

export function buildOpenClawInstruction(input: {
  workflowType: 'research_outreach' | 'daily_content';
  rewrittenInstruction: string;
  steps: PlannerStep[];
  allowedCapabilities: string[];
  forbiddenActions: string[];
  expectedArtifacts: string[];
  growthProfileId?: string;
}) {
  return {
    version: 1,
    executor: 'openclaw',
    workflowType: input.workflowType,
    growthProfileId: input.growthProfileId || null,
    goal: input.rewrittenInstruction,
    allowedCapabilities: input.allowedCapabilities,
    forbiddenActions: input.forbiddenActions,
    expectedArtifacts: input.expectedArtifacts,
    steps: input.steps.map((step) => ({
      key: step.key,
      title: step.title,
      instruction: step.instruction,
      taskType: step.taskType,
      agentRole: step.agentRole,
      capabilities: step.capabilities,
    })),
    approvalRequired: true,
    delivery: {
      deliver: false,
      bestEffortDeliver: false,
      externalMessages: false,
      publishing: false,
      spending: false,
      accountChanges: false,
    },
  } satisfies Record<string, unknown>;
}

export function createPlannerPrompt(input: {
  originalRequest: string;
  workflowType: 'research_outreach' | 'daily_content';
  profile: GrowthProfilePlannerContext;
}) {
  const painSignals = listValue(input.profile.painSignals);
  const exclusionRules = listValue(input.profile.exclusionRules);
  return [
    'You are the NeedThisDone app-side planning model.',
    'Create a reviewable execution plan only. Do not execute work, browse, send, publish, spend, log in, change accounts, or deliver anything externally.',
    `Requested workflow type: ${input.workflowType}.`,
    `Operator request: ${input.originalRequest.trim()}`,
    `Target growth profile: ${input.profile.name} (${input.profile.id}).`,
    `Target market: ${input.profile.targetMarket}. Geography: ${input.profile.geography}. Business size: ${input.profile.businessSize || 'not specified'}.`,
    `Pain signals: ${painSignals.join('; ') || 'not specified'}. Exclusions: ${exclusionRules.join('; ') || 'none listed'}.`,
    `Offer context: ${input.profile.offer}. Timezone: ${input.profile.timezone}.`,
    'Use only these task types: coordinate, research_public_web, draft_outreach, produce_daily_content, review_artifacts, regenerate_artifact.',
    'Use only safe capabilities for research, drafting, review, and media preparation. Every plan must forbid sending external messages, publishing, spending money, changing connected accounts, and external delivery.',
    'Steps must be ordered. Each step needs a unique key, one allowed task type and matching agent role, capabilities, expected artifacts, and an estimatedCostUsd number. Estimate the app-model request separately in estimatedUsage.',
    'Return JSON matching the supplied schema and nothing else.',
  ].join('\n');
}

export function estimatePlannerRequest(model: OpenRouterModel, prompt: string, output: PlannerOutput) {
  const promptTokens = Math.min(100_000, Math.max(1, Math.ceil(prompt.length / 4)));
  const completionTokens = Math.min(100_000, Math.max(1_200, output.estimatedUsage.completionTokens));
  const cost = estimateOpenRouterRequestCost(model, {
    maxPromptTokens: promptTokens,
    maxCompletionTokens: completionTokens,
    maxWebSearchCalls: 0,
  });
  if (cost === null) throw new Error('The pinned model does not expose enough pricing metadata for a planner estimate.');
  return {
    promptTokens,
    completionTokens,
    webSearchCalls: 0,
    estimatedCostUsd: Number(cost.toFixed(6)),
  };
}

export async function planWithOpenRouter(input: {
  client: PlannerCompletionClient;
  model: OpenRouterModel;
  prompt: string;
  workflowType: 'research_outreach' | 'daily_content';
}) {
  const completion = await input.client.chatCompletion({
    model: input.model.id,
    messages: [
      { role: 'system', content: 'Return only the requested structured JSON. This is a draft plan; never execute actions.' },
      { role: 'user', content: input.prompt },
    ],
    maxTokens: 4_000,
    responseSchema: plannerResponseJsonSchema,
  });
  const plan = parsePlannerOutput(completion.content, input.workflowType);
  return {
    plan,
    usage: {
      promptTokens: completion.usage.promptTokens,
      completionTokens: completion.usage.completionTokens,
      costUsd: completion.usage.costUsd,
    },
  };
}
