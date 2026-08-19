import { createWorkerSignature } from '@/lib/prospecting';
import { MODEL_EVALUATION_TASKS, type ModelEvaluationTaskId } from '@/lib/model-evaluation';
import type { OpenRouterModelConfig } from '@/lib/openrouter-model-config';
import { isDynamicOpenRouterModel, validateOpenRouterBackupModelId } from '@/lib/openrouter-model-config';
import { OpenRouterClient, estimateOpenRouterRequestCost, resolveBenchmarkCandidates, supportsStructuredOutput, type OpenRouterModel, type ResolvedBenchmarkCandidate } from '@/lib/openrouter-core';

type FetchLike = typeof fetch;

type BenchmarkConfig = {
  profile: { id: string; timezone: string; modelRoute: string; selectedModelId: string | null };
  candidates: Array<{ candidate_id: string; provider_model_id: string; candidate_kind: 'free' | 'configured-primary' | 'configured-test' | 'router-free' }>;
  policy: { status: string; defaultModel: string | null; rationale: string };
};

type BenchmarkCandidate = ResolvedBenchmarkCandidate & { candidateKind: 'free' | 'configured-primary' | 'configured-test' | 'router-free' };

const benchmarkResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['answer'],
  properties: { answer: { type: 'string', minLength: 1, maxLength: 1_500 } },
} as const;

const benchmarkInputs: Record<ModelEvaluationTaskId, string> = {
  'classify-public-evidence': 'Public evidence: "Example Studio publishes a booking page and says it serves owner-led service businesses." Classify the fit in one concise sentence. Do not add facts.',
  'draft-approved-message': 'Write one short draft to an owner based only on: "Example Studio publishes a booking page." State that it is a draft for human approval and do not claim results.',
  'summarize-weekly-brief': 'Summarize these sanitized activity notes in two bullets: "Reviewed two public business websites. No outreach was sent." Do not invent outcomes.',
};

function parseStructuredAnswer(content: string) {
  try {
    const value = JSON.parse(content) as { answer?: unknown };
    return typeof value.answer === 'string' && value.answer.trim().length > 0 && value.answer.length <= 1_500;
  } catch {
    return false;
  }
}

export class SignedBenchmarkTransport {
  constructor(
    private readonly baseUrl: string,
    private readonly secret: string,
    private readonly fetchImpl: FetchLike = fetch,
  ) {}

  private async post<T>(path: string, payload: Record<string, unknown>) {
    const body = JSON.stringify(payload);
    const timestamp = String(Math.floor(Date.now() / 1_000));
    const nonce = crypto.randomUUID();
    const signature = createWorkerSignature(body, timestamp, nonce, this.secret, path);
    const response = await this.fetchImpl(`${this.baseUrl.replace(/\/$/, '')}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-worker-timestamp': timestamp, 'x-worker-nonce': nonce, 'x-worker-signature': signature },
      body,
    });
    const json = await response.json().catch(() => ({})) as Record<string, unknown>;
    if (!response.ok) throw new Error(typeof json.error === 'string' ? json.error : `Benchmark endpoint failed (${response.status}).`);
    return json as T;
  }

  config(workerId: string, profileId: string) {
    return this.post<BenchmarkConfig>('/api/prospecting/worker/benchmark/config', { workerId, profileId });
  }

  candidates(workerId: string, profileId: string, candidates: BenchmarkCandidate[]) {
    return this.post('/api/prospecting/worker/benchmark/candidates', { workerId, profileId, candidates: candidates.map((candidate) => ({ ...candidate, catalogMetadata: candidate.catalogMetadata })) });
  }

  reserve(workerId: string, profileId: string, modelId: string, reservationKey: string, reservedCost: number) {
    return this.post<{ reservation: { reservation_key: string; reserved_cost: number } }>('/api/prospecting/worker/benchmark/reserve', { workerId, profileId, modelId, reservationKey, reservedCost });
  }

  result(workerId: string, profileId: string, result: Record<string, unknown>) {
    return this.post<{ policy?: { status: string; defaultModel: string | null } }>('/api/prospecting/worker/benchmark/result', { workerId, profileId, ...result });
  }
}

function candidateFromResolved(candidate: ResolvedBenchmarkCandidate): BenchmarkCandidate {
  return { ...candidate, candidateKind: 'free' };
}

async function runCandidate(options: {
  workerId: string;
  profileId: string;
  candidate: BenchmarkCandidate;
  catalogModel: OpenRouterModel;
  transport: SignedBenchmarkTransport;
  openRouter: OpenRouterClient;
  comparisonOnly?: boolean;
}) {
  const estimate = estimateOpenRouterRequestCost(options.catalogModel, { maxPromptTokens: 1_000, maxCompletionTokens: 350, maxWebSearchCalls: 0 }) ?? 0;
  for (const task of MODEL_EVALUATION_TASKS) {
    const reservationKey = crypto.randomUUID();
    const reserved = await options.transport.reserve(options.workerId, options.profileId, options.candidate.providerModelId, reservationKey, estimate);
    const started = Date.now();
    try {
      const completion = await options.openRouter.chatCompletion({
        model: options.candidate.providerModelId,
        messages: [
          { role: 'system', content: 'Return exactly one JSON object with one string field named answer. Use only the supplied sanitized evidence and do not make external calls.' },
          { role: 'user', content: benchmarkInputs[task.id] },
        ],
        maxTokens: 350,
        responseSchema: supportsStructuredOutput(options.catalogModel) ? benchmarkResponseSchema : undefined,
      });
      const valid = parseStructuredAnswer(completion.content);
      await options.transport.result(options.workerId, options.profileId, {
        reservationKey,
        candidateId: options.candidate.candidateId,
        providerModelId: options.candidate.providerModelId,
        actualModelId: completion.model,
        taskId: task.id,
        qualityScore: valid ? 0.95 : 0,
        toolUseScore: valid ? 0.95 : 0,
        latencyMs: Date.now() - started,
        costUsd: completion.usage.costUsd ?? Number(reserved.reservation.reserved_cost),
        failed: !valid,
        repairRequired: !valid,
        notes: valid ? 'Structured benchmark response validated against the fixed sanitized task.' : 'The structured benchmark response was malformed.',
        providerUsage: completion.usage.raw,
        comparisonOnly: options.comparisonOnly === true,
      });
    } catch (error) {
      await options.transport.result(options.workerId, options.profileId, {
        reservationKey,
        candidateId: options.candidate.candidateId,
        providerModelId: options.candidate.providerModelId,
        taskId: task.id,
        qualityScore: 0,
        toolUseScore: 0,
        latencyMs: Date.now() - started,
        costUsd: Number(reserved.reservation.reserved_cost),
        failed: true,
        repairRequired: true,
        notes: error instanceof Error ? error.message.slice(0, 4_000) : 'The benchmark request failed.',
        comparisonOnly: options.comparisonOnly === true,
      });
    }
  }
}

const freeRouterNoOpTool = {
  type: 'function',
  function: {
    name: 'record_noop_probe',
    description: 'A no-op declaration used only to verify tool-capable routing. Never invoke it.',
    parameters: { type: 'object', additionalProperties: false, properties: {} },
  },
} as const;

function routerProbeCandidate(providerModelId: string): BenchmarkCandidate {
  const dynamic = isDynamicOpenRouterModel(providerModelId);
  return {
    candidateId: dynamic ? 'openrouter-free-router' : 'openrouter-backup-probe',
    providerModelId,
    label: dynamic ? 'OpenRouter free dynamic router (probe only)' : 'Configured free backup (probe only)',
    candidateKind: 'router-free',
    catalogMetadata: { dynamic, providerModelId },
  };
}

/**
 * Run exactly two sanitized requests through the configured free backup. This
 * is deliberately separate from measured model selection: the probe candidate
 * is evidence-only, and the server keeps the profile evaluation-required.
 */
export async function runOpenRouterBackupProbe(options: {
  workerId: string;
  profileId: string;
  transport: SignedBenchmarkTransport;
  openRouter: OpenRouterClient;
  backupModel: string;
}) {
  let backupModel: string;
  try {
    // The stable backup is allowed as the manual replacement for a failed
    // dynamic probe, but it is still never a live selected model here.
    backupModel = validateOpenRouterBackupModelId(options.backupModel);
  } catch {
    throw new Error('OPENROUTER_BACKUP_MODEL must use the reviewed Gemma activation candidate.');
  }
  const initial = await options.transport.config(options.workerId, options.profileId);
  if (initial.profile.modelRoute !== 'evaluation-required' || initial.profile.selectedModelId) {
    throw new Error('The free-router probe is locked unless the profile remains evaluation-required.');
  }

  const candidate = routerProbeCandidate(backupModel);
  await options.transport.candidates(options.workerId, options.profileId, [candidate]);
  const probeRequests = [
    {
      taskId: 'classify-public-evidence' as const,
      messages: [
        { role: 'system' as const, content: 'Answer only from the supplied sanitized text. Do not call tools or make external requests.' },
        { role: 'user' as const, content: 'In one short sentence, classify this supplied evidence: "Example Studio publishes a booking page."' },
      ],
      maxTokens: 120,
      valid: (content: string) => content.trim().length > 0,
      responseSchema: undefined,
      tools: undefined,
      toolChoice: undefined,
    },
    {
      taskId: 'draft-approved-message' as const,
      messages: [
        { role: 'system' as const, content: 'Return exactly one JSON object with one string field named answer. Use only the supplied sanitized evidence. Do not call tools.' },
        { role: 'user' as const, content: 'Write one short draft for human approval based only on: "Example Studio publishes a booking page." Do not claim results.' },
      ],
      maxTokens: 180,
      valid: parseStructuredAnswer,
      responseSchema: benchmarkResponseSchema,
      tools: [freeRouterNoOpTool],
      toolChoice: 'none',
    },
  ];
  const results: Array<{ taskId: string; actualModelId: string | null; costUsd: number | null; ok: boolean }> = [];

  for (const probe of probeRequests) {
    const reservationKey = crypto.randomUUID();
    await options.transport.reserve(options.workerId, options.profileId, backupModel, reservationKey, 0);
    const started = Date.now();
    let actualModelId: string | null = null;
    let costUsd: number | null = null;
    let ok = false;
    try {
      const completion = await options.openRouter.chatCompletion({
        model: backupModel,
        messages: probe.messages,
        maxTokens: probe.maxTokens,
        responseSchema: probe.responseSchema,
        tools: probe.tools,
        toolChoice: probe.toolChoice,
      });
      actualModelId = completion.model;
      costUsd = completion.usage.costUsd;
      ok = probe.valid(completion.content) && Boolean(actualModelId) && !isDynamicOpenRouterModel(actualModelId) && costUsd === 0;
      await options.transport.result(options.workerId, options.profileId, {
        reservationKey,
        candidateId: candidate.candidateId,
        providerModelId: backupModel,
        actualModelId,
        taskId: probe.taskId,
        qualityScore: ok ? 0.95 : 0,
        toolUseScore: ok ? 0.95 : 0,
        latencyMs: Date.now() - started,
        costUsd: costUsd ?? 0,
        failed: !ok,
        repairRequired: !ok,
        notes: ok
          ? 'Sanitized backup probe passed non-empty/structured-output, actual-model, and zero-cost checks.'
          : 'Backup probe failed a response, actual-model, or zero-cost check.',
        providerUsage: completion.usage.raw,
      });
    } catch (error) {
      await options.transport.result(options.workerId, options.profileId, {
        reservationKey,
        candidateId: candidate.candidateId,
        providerModelId: backupModel,
        taskId: probe.taskId,
        qualityScore: 0,
        toolUseScore: 0,
        latencyMs: Date.now() - started,
        costUsd: 0,
        failed: true,
        repairRequired: true,
        notes: error instanceof Error ? error.message.slice(0, 4_000) : 'The backup probe request failed.',
      });
    }
    results.push({ taskId: probe.taskId, actualModelId, costUsd, ok });
  }

  if (results.length !== 2 || results.some((result) => !result.ok)) {
    throw new Error('The two-request free-router probe did not pass all checks; no retry was performed.');
  }
  return { requests: results.length, results, modelRoute: initial.profile.modelRoute, providerModelId: backupModel };
}

export async function runOpenRouterFreeRouterProbe(options: Parameters<typeof runOpenRouterBackupProbe>[0]) {
  return runOpenRouterBackupProbe(options);
}

/** Execute catalog-resolved free candidates without a hardcoded fallback. */
export async function runMeasuredBenchmark(options: {
  workerId: string;
  profileId: string;
  transport: SignedBenchmarkTransport;
  openRouter: OpenRouterClient;
}) {
  const initial = await options.transport.config(options.workerId, options.profileId);
  if (initial.profile.modelRoute !== 'evaluation-required') throw new Error('A model is already selected; benchmark execution is locked.');
  const models = await options.openRouter.listModels();
  const freeCandidates = resolveBenchmarkCandidates(models).map(candidateFromResolved);
  if (!freeCandidates.length) throw new Error('The current OpenRouter catalog has no eligible free structured-output candidates.');
  await options.transport.candidates(options.workerId, options.profileId, freeCandidates);
  for (const candidate of freeCandidates) {
    const catalogModel = models.find((model) => model.id === candidate.providerModelId);
    if (!catalogModel) throw new Error(`Catalog candidate ${candidate.providerModelId} disappeared before its benchmark.`);
    await runCandidate({ ...options, candidate, catalogModel });
  }

  const completed = await options.transport.config(options.workerId, options.profileId);
  return completed.policy;
}

function configuredCandidate(kind: 'configured-primary' | 'configured-test', model: OpenRouterModel): BenchmarkCandidate {
  return {
    candidateId: kind,
    providerModelId: model.id,
    label: kind === 'configured-primary' ? 'Configured primary model' : 'Configured comparison model',
    candidateKind: kind,
    catalogMetadata: {
      contextLength: model.contextLength,
      pricing: model.pricing,
      supportedParameters: model.supportedParameters,
      availability: model.availability,
    },
  };
}

/** Compare the two explicitly configured models using identical sanitized tasks. */
export async function runConfiguredModelComparison(options: {
  workerId: string;
  profileId: string;
  transport: SignedBenchmarkTransport;
  openRouter: OpenRouterClient;
  modelConfig: OpenRouterModelConfig;
}) {
  if (!options.modelConfig.testModel) throw new Error('OPENROUTER_TEST_MODEL is required for the configured model comparison.');
  const initial = await options.transport.config(options.workerId, options.profileId);
  if (initial.profile.modelRoute !== 'evaluation-required' || initial.profile.selectedModelId) {
    throw new Error('Model comparison is locked after a model has been selected.');
  }
  const models = await options.openRouter.listModels();
  const catalogModels = (['configured-primary', 'configured-test'] as const).map((kind) => {
    const providerModelId = kind === 'configured-primary' ? options.modelConfig.primaryModel : options.modelConfig.testModel!;
    const catalogModel = models.find((model) => model.id === providerModelId);
    if (!catalogModel || catalogModel.availability !== 'available') {
      throw new Error('A configured comparison model is unavailable in the current OpenRouter catalog.');
    }
    return { candidate: configuredCandidate(kind, catalogModel), catalogModel };
  });
  const candidates = catalogModels.map(({ candidate }) => candidate);

  await options.transport.candidates(options.workerId, options.profileId, candidates);
  for (const { candidate, catalogModel } of catalogModels) {
    await runCandidate({
      ...options,
      candidate,
      catalogModel,
      comparisonOnly: true,
    });
  }

  return { comparedModels: candidates.length, comparedTasks: candidates.length * MODEL_EVALUATION_TASKS.length };
}
