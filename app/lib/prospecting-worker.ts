import type { AgentTask } from '@/lib/prospecting-worker-types';
import { OpenRouterClient, estimateOpenRouterRequestCost } from '@/lib/openrouter-core';
import { isMovingOpenRouterModelAlias } from '@/lib/openrouter-model-config';
import { createProspectResearchPrompt, parseProspectDossierBatch, prospectDossierResponseJsonSchema, type ProspectDossierBatch } from '@/lib/prospect-dossier';
import { createWorkerSignature } from '@/lib/prospecting';

export interface ProspectingWorkerTransport {
  claim(workerId: string): Promise<AgentTask | null>;
  execute(task: AgentTask): Promise<Record<string, unknown>>;
  submit(task: AgentTask, output: Record<string, unknown>): Promise<void>;
  fail(task: AgentTask, error: string): Promise<void>;
}

/** Small injected foreground loop retained for deterministic local tests. */
export class ForegroundProspectingWorker {
  private stopped = false;
  constructor(private readonly workerId: string, private readonly transport: ProspectingWorkerTransport) {}

  stop() { this.stopped = true; }

  async runOnce() {
    if (this.stopped) return false;
    const task = await this.transport.claim(this.workerId);
    if (!task) return false;
    try { await this.transport.submit(task, await this.transport.execute(task)); }
    catch (error) { await this.transport.fail(task, error instanceof Error ? error.message : 'Worker task failed.'); }
    return true;
  }
}

export type PrivateResearchProfile = {
  id: string;
  targetMarket: string;
  geography: string;
  businessSize: string;
  painSignals: string[];
  exclusionRules: string[];
  offer: string;
  timezone: string;
  emergencyStop: boolean;
  modelRoute: string;
  selectedModelId: string | null;
  perRunModelCap: number;
  dailyModelCap: number;
};

export type ClaimedResearchTask = { task: AgentTask; profile: PrivateResearchProfile };

export type WorkerUsageReservation = {
  reservationKey: string;
  reservedCost: number;
};

export type WorkerResearchResult = {
  taskId: string;
  workerId: string;
  status: 'succeeded' | 'failed';
  output?: { dossiers: ProspectDossierBatch; providerCitations: Array<{ url: string; title: string; excerpt: string }> };
  error?: string;
  modelName?: string;
  promptTokens?: number;
  completionTokens?: number;
  cost?: number;
  reservationKey?: string;
  providerUsage?: Record<string, unknown>;
};

export interface PrivateResearchWorkerTransport {
  claim(workerId: string): Promise<ClaimedResearchTask | null>;
  reserve(input: {
    taskId: string;
    workerId: string;
    modelId: string;
    reservationKey: string;
    reservedCost: number;
  }): Promise<WorkerUsageReservation>;
  report(result: WorkerResearchResult): Promise<void>;
  schedule(workerId: string): Promise<{ queued: number }>;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function acceptedTarget(task: AgentTask) {
  const configured = Number(task.input?.targetAcceptedDossiers);
  return Number.isInteger(configured) && configured >= 1 && configured <= 2 ? configured : 2;
}

export const PRIVATE_RESEARCH_MODEL_ROUTES = ['selected-primary', 'selected-free', 'selected-deepseek-fallback'] as const;

export function privateResearchModelAllowed(profile: Pick<PrivateResearchProfile, 'emergencyStop' | 'modelRoute' | 'selectedModelId'>) {
  return !profile.emergencyStop
    && PRIVATE_RESEARCH_MODEL_ROUTES.includes(profile.modelRoute as (typeof PRIVATE_RESEARCH_MODEL_ROUTES)[number])
    && Boolean(profile.selectedModelId?.trim())
    && !isMovingOpenRouterModelAlias(profile.selectedModelId || '');
}

/**
 * Mac-only executor. It can research and report signed results, but it has no
 * sender implementation or sender route reference, so a worker task cannot
 * transmit outreach.
 */
export class MacMiniProspectingWorker {
  constructor(
    private readonly workerId: string,
    private readonly transport: PrivateResearchWorkerTransport,
    private readonly openRouter: OpenRouterClient,
  ) {}

  async scheduleDueTasks() {
    return this.transport.schedule(this.workerId);
  }

  async runOnce() {
    const claimed = await this.transport.claim(this.workerId);
    if (!claimed) return false;
    const { task, profile } = claimed;
    let reservation: WorkerUsageReservation | undefined;
    try {
      if (task.task_type !== 'discover_prospects') throw new Error('The private research worker only accepts daily discovery tasks.');
      if (profile.emergencyStop) throw new Error('Emergency stop is active.');
      const selectedModelId = profile.selectedModelId;
      if (!privateResearchModelAllowed(profile) || !selectedModelId) {
        throw new Error('Model evaluation is required before research work can run.');
      }

      const models = await this.openRouter.listModels();
      const model = models.find((item) => item.id === selectedModelId);
      if (!model || model.availability !== 'available') throw new Error('The pinned research model is unavailable in the current OpenRouter catalog.');
      const estimatedCost = estimateOpenRouterRequestCost(model, {
        maxPromptTokens: 6_000,
        maxCompletionTokens: 1_500,
        maxWebSearchCalls: 1,
      });
      if (estimatedCost === null || estimatedCost > profile.perRunModelCap || estimatedCost > 0.10) {
        throw new Error('The bounded research request cannot be reserved within the per-request model cap.');
      }

      const reservationKey = crypto.randomUUID();
      reservation = await this.transport.reserve({
        taskId: task.id,
        workerId: this.workerId,
        modelId: selectedModelId,
        reservationKey,
        reservedCost: estimatedCost,
      });
      const completion = await this.openRouter.chatCompletion({
        model: selectedModelId,
        messages: [
          { role: 'system', content: 'You are a private public-web research assistant. Follow the schema and safety instructions exactly.' },
          {
            role: 'user',
            content: createProspectResearchPrompt({
              targetMarket: profile.targetMarket,
              geography: profile.geography,
              businessSize: profile.businessSize,
              painSignals: asStringArray(profile.painSignals),
              exclusionRules: asStringArray(profile.exclusionRules),
              offer: profile.offer,
              targetAcceptedDossiers: acceptedTarget(task),
            }),
          },
        ],
        maxTokens: 1_500,
        responseSchema: prospectDossierResponseJsonSchema,
        webSearch: { maxResults: 8 },
      });
      const dossiers = parseProspectDossierBatch(completion.content, completion.citations);
      const actualCost = completion.usage.costUsd ?? reservation.reservedCost;
      await this.transport.report({
        taskId: task.id,
        workerId: this.workerId,
        status: 'succeeded',
        output: { dossiers, providerCitations: completion.citations },
        modelName: selectedModelId,
        promptTokens: completion.usage.promptTokens ?? undefined,
        completionTokens: completion.usage.completionTokens ?? undefined,
        cost: actualCost,
        reservationKey: reservation.reservationKey,
        providerUsage: completion.usage.raw,
      });
    } catch (error) {
      await this.transport.report({
        taskId: task.id,
        workerId: this.workerId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Private research worker failed.',
        reservationKey: reservation?.reservationKey,
        // If a provider error omits usage, reconcile the full reservation so a
        // retry cannot silently spend beyond the daily cap.
        cost: reservation?.reservedCost,
      });
    }
    return true;
  }
}

type FetchLike = typeof fetch;

/** Signed HTTP adapter used only by the Mac-mini process. */
export class SignedPrivateResearchWorkerTransport implements PrivateResearchWorkerTransport {
  constructor(
    private readonly baseUrl: string,
    private readonly secret: string,
    private readonly fetchImpl: FetchLike = fetch,
  ) {
    if (!baseUrl.startsWith('https://') && !baseUrl.startsWith('http://127.0.0.1') && !baseUrl.startsWith('http://localhost')) {
      throw new Error('The private worker base URL must use HTTPS (or an explicit local loopback URL).');
    }
    if (!secret.trim()) throw new Error('PROSPECTING_WORKER_SECRET is required for the private worker.');
  }

  private async post<T>(path: string, payload: Record<string, unknown>) {
    const body = JSON.stringify(payload);
    const timestamp = String(Math.floor(Date.now() / 1_000));
    const nonce = crypto.randomUUID();
    const signature = createWorkerSignature(body, timestamp, nonce, this.secret, path);
    const response = await this.fetchImpl(`${this.baseUrl.replace(/\/$/, '')}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-worker-timestamp': timestamp,
        'x-worker-nonce': nonce,
        'x-worker-signature': signature,
      },
      body,
    });
    const json = await response.json().catch(() => ({})) as Record<string, unknown>;
    if (!response.ok) throw new Error(typeof json.error === 'string' ? json.error : `Private worker endpoint failed (${response.status}).`);
    return json as T;
  }

  async claim(workerId: string) {
    const response = await this.post<{ task: AgentTask | null; profile?: PrivateResearchProfile }>('/api/prospecting/worker/claim', { workerId, leaseSeconds: 300 });
    return response.task && response.profile ? { task: response.task, profile: response.profile } : null;
  }

  async reserve(input: { taskId: string; workerId: string; modelId: string; reservationKey: string; reservedCost: number; }) {
    const response = await this.post<{ reservation: { reservation_key: string; reserved_cost: number } }>('/api/prospecting/worker/reserve', input);
    return { reservationKey: response.reservation.reservation_key, reservedCost: Number(response.reservation.reserved_cost) };
  }

  async report(result: WorkerResearchResult) {
    await this.post('/api/prospecting/worker/result', result as unknown as Record<string, unknown>);
  }

  async pinPrimary(workerId: string, profileId: string, modelId: string) {
    await this.post('/api/prospecting/worker/model/pin-primary', { workerId, profileId, modelId });
  }

  async schedule(workerId: string) {
    const response = await this.post<{ queued: number }>('/api/prospecting/worker/schedule', { workerId });
    return response;
  }
}
