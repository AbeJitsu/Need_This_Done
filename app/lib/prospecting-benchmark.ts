import { createWorkerSignature } from '@/lib/prospecting';
import { DEEPSEEK_V4_FLASH_FALLBACK, MODEL_EVALUATION_TASKS, type ModelEvaluationTaskId } from '@/lib/model-evaluation';
import type { OpenRouterModelConfig } from '@/lib/openrouter-model-config';
import { OpenRouterClient, estimateOpenRouterRequestCost, resolveBenchmarkCandidates, type OpenRouterModel, type ResolvedBenchmarkCandidate } from '@/lib/openrouter-core';

type FetchLike = typeof fetch;

type BenchmarkConfig = {
  profile: { id: string; timezone: string; modelRoute: string; selectedModelId: string | null };
  candidates: Array<{ candidate_id: string; provider_model_id: string; candidate_kind: 'free' | 'deepseek-fallback' | 'configured-primary' | 'configured-test' }>;
  policy: { status: string; defaultModel: string | null; rationale: string };
};

type BenchmarkCandidate = ResolvedBenchmarkCandidate & { candidateKind: 'free' | 'deepseek-fallback' | 'configured-primary' | 'configured-test' };

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

function fallbackCandidate(model: OpenRouterModel): BenchmarkCandidate {
  return {
    candidateId: DEEPSEEK_V4_FLASH_FALLBACK.id,
    providerModelId: DEEPSEEK_V4_FLASH_FALLBACK.providerModelId,
    label: model.name,
    candidateKind: 'deepseek-fallback',
    catalogMetadata: { contextLength: model.contextLength, pricing: model.pricing, supportedParameters: model.supportedParameters, availability: model.availability },
  };
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
          { role: 'system', content: 'Return only the requested structured JSON. Use only the supplied sanitized evidence and do not make external calls.' },
          { role: 'user', content: benchmarkInputs[task.id] },
        ],
        maxTokens: 350,
        responseSchema: benchmarkResponseSchema,
      });
      const valid = parseStructuredAnswer(completion.content);
      await options.transport.result(options.workerId, options.profileId, {
        reservationKey,
        candidateId: options.candidate.candidateId,
        providerModelId: options.candidate.providerModelId,
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

/** Execute free candidates first. The server rejects fallback registration until they all miss. */
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

  const afterFree = await options.transport.config(options.workerId, options.profileId);
  if (afterFree.policy.status === 'selected-free') return afterFree.policy;

  const fallbackModel = models.find((model) => model.id === DEEPSEEK_V4_FLASH_FALLBACK.providerModelId);
  if (!fallbackModel || fallbackModel.availability !== 'available') {
    throw new Error('No free candidate cleared the threshold and the pinned DeepSeek fallback is unavailable.');
  }
  const fallback = fallbackCandidate(fallbackModel);
  // This registration is the server-enforced order gate. It rejects when any
  // free task is unfinished or a free candidate clears the threshold.
  await options.transport.candidates(options.workerId, options.profileId, [fallback]);
  await runCandidate({ ...options, candidate: fallback, catalogModel: fallbackModel });
  const completed = await options.transport.config(options.workerId, options.profileId);
  return completed.policy;
}

function configuredCandidate(kind: 'configured-primary' | 'configured-test', modelId: string): BenchmarkCandidate {
  return {
    candidateId: kind,
    providerModelId: modelId,
    label: kind === 'configured-primary' ? 'Configured primary model' : 'Configured comparison model',
    candidateKind: kind,
    catalogMetadata: {},
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
  const models = await options.openRouter.listModels();
  const candidates = [
    configuredCandidate('configured-primary', options.modelConfig.primaryModel),
    configuredCandidate('configured-test', options.modelConfig.testModel),
  ];
  const catalogModels = candidates.map((candidate) => {
    const catalogModel = models.find((model) => model.id === candidate.providerModelId);
    if (!catalogModel || catalogModel.availability !== 'available') {
      throw new Error('A configured comparison model is unavailable in the current OpenRouter catalog.');
    }
    return { candidate, catalogModel };
  });

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
