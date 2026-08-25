import { OpenRouterClient, type OpenRouterCompletion, type OpenRouterCompletionRequest } from '@/lib/openrouter-core';
import {
  DAILY_DESK_PROVIDER_POLICY,
  createDailyDeskResearchPrompt,
  dailyDeskProspectResponseJsonSchema,
  validateDailyDeskProspectBatch,
  type DailyDeskProspectBatch,
  type DailyDeskTextModelRoute,
} from '@/lib/daily-desk';
import { createWorkerSignature } from '@/lib/prospecting';

export type DailyDeskWorkerClaim = {
  run: { id: string; ownerId: string; localDate: string };
  brief: { id: string; region: string; offer: string; targetSegment: string; painFocus: string };
};

export type DailyDeskWorkerReport = {
  runId: string;
  workerId: string;
  status: 'succeeded' | 'shortfall' | 'failed';
  prospects: DailyDeskProspectBatch['prospects'];
  shortfallReason?: string;
  reservationKey?: string;
  actualModelId?: string;
  actualCostUsd?: number | null;
  providerUsage?: Record<string, unknown>;
  providerCitations?: Array<{ url: string; title: string; excerpt: string }>;
  promptTokens?: number | null;
  completionTokens?: number | null;
  error?: string;
};

export interface DailyDeskWorkerTransport {
  schedule(workerId: string): Promise<{ queued: number }>;
  claim(workerId: string): Promise<DailyDeskWorkerClaim | null>;
  route(input: { workerId: string; runId: string; ownerId: string }): Promise<{ route: DailyDeskTextModelRoute | null; reason?: string }>;
  reserve(input: {
    workerId: string;
    ownerId: string;
    runId: string;
    reservationKey: string;
    modelId: string;
    estimatedCostUsd: number;
    providerPolicy: typeof DAILY_DESK_PROVIDER_POLICY;
    rationale: string;
  }): Promise<{ reservationKey: string; reservedCost: number }>;
  report(result: DailyDeskWorkerReport): Promise<void>;
}

export type DailyDeskResearchClient = Pick<OpenRouterClient, 'chatCompletion'>;

function workerError(value: unknown) {
  return value instanceof Error ? value.message : 'The Daily Desk research worker failed.';
}

/**
 * Narrow Mac-mini executor. It can make one public-web research request for a
 * server-selected route and submit an auditable result. It deliberately has
 * no browser, desktop, email, publication, filesystem, or coding adapter.
 */
export class MacMiniDailyDeskResearchWorker {
  constructor(
    private readonly workerId: string,
    private readonly transport: DailyDeskWorkerTransport,
    private readonly openRouter: DailyDeskResearchClient,
  ) {}

  async scheduleDueRuns() {
    return this.transport.schedule(this.workerId);
  }

  async runOnce() {
    const claimed = await this.transport.claim(this.workerId);
    if (!claimed) return false;
    let reservation: { reservationKey: string; reservedCost: number } | undefined;
    let completion: OpenRouterCompletion | undefined;
    try {
      const routed = await this.transport.route({ workerId: this.workerId, runId: claimed.run.id, ownerId: claimed.run.ownerId });
      if (!routed.route) {
        await this.transport.report({
          runId: claimed.run.id,
          workerId: this.workerId,
          status: 'shortfall',
          prospects: [],
          shortfallReason: routed.reason || 'No quality-approved, price-known candidate currently fits the Daily Desk policy and budget.',
        });
        return true;
      }

      const route = routed.route;
      reservation = await this.transport.reserve({
        workerId: this.workerId,
        ownerId: claimed.run.ownerId,
        runId: claimed.run.id,
        reservationKey: crypto.randomUUID(),
        modelId: route.modelId,
        estimatedCostUsd: route.estimatedCostUsd,
        providerPolicy: route.providerPolicy,
        rationale: route.rationale,
      });

      const request: OpenRouterCompletionRequest = {
        model: route.modelId,
        messages: [
          { role: 'system', content: 'You are a bounded private public-web research worker. Follow the supplied schema, cite only returned public-web evidence, and never take external action.' },
          { role: 'user', content: createDailyDeskResearchPrompt(claimed.brief) },
        ],
        maxTokens: 1_500,
        responseSchema: dailyDeskProspectResponseJsonSchema,
        webSearch: { maxResults: 8 },
        providerPolicy: route.providerPolicy,
      };
      completion = await this.openRouter.chatCompletion(request);

      if (completion.model !== route.modelId) {
        await this.transport.report({
          runId: claimed.run.id, workerId: this.workerId, status: 'failed', prospects: [],
          reservationKey: reservation.reservationKey, actualModelId: completion.model,
          actualCostUsd: completion.usage.costUsd, providerUsage: completion.usage.raw,
          promptTokens: completion.usage.promptTokens, completionTokens: completion.usage.completionTokens,
          error: 'The provider returned a model other than the server-selected, no-fallback route.',
        });
        return true;
      }
      if (completion.usage.costUsd === null) {
        await this.transport.report({
          runId: claimed.run.id, workerId: this.workerId, status: 'failed', prospects: [],
          reservationKey: reservation.reservationKey, actualModelId: completion.model,
          actualCostUsd: null, providerUsage: completion.usage.raw,
          promptTokens: completion.usage.promptTokens, completionTokens: completion.usage.completionTokens,
          error: 'The provider omitted actual cost, so this result is not accepted.',
        });
        return true;
      }
      if (!completion.citations.length) {
        throw new Error('The public-web research response did not include provider citations.');
      }

      const batch = validateDailyDeskProspectBatch(JSON.parse(completion.content), completion.citations);
      await this.transport.report({
        runId: claimed.run.id,
        workerId: this.workerId,
        status: batch.prospects.length === 2 ? 'succeeded' : 'shortfall',
        prospects: batch.prospects,
        shortfallReason: batch.shortfallReason,
        reservationKey: reservation.reservationKey,
        actualModelId: completion.model,
        actualCostUsd: completion.usage.costUsd,
        providerUsage: completion.usage.raw,
        providerCitations: completion.citations,
        promptTokens: completion.usage.promptTokens,
        completionTokens: completion.usage.completionTokens,
      });
    } catch (error) {
      await this.transport.report({
        runId: claimed.run.id,
        workerId: this.workerId,
        status: 'failed',
        prospects: [],
        reservationKey: reservation?.reservationKey,
        actualModelId: completion?.model,
        actualCostUsd: completion?.usage.costUsd ?? (reservation ? null : undefined),
        providerUsage: completion?.usage.raw,
        promptTokens: completion?.usage.promptTokens,
        completionTokens: completion?.usage.completionTokens,
        error: workerError(error),
      });
    }
    return true;
  }
}

type FetchLike = typeof fetch;

/** Signed outbound HTTP transport used only by the Mac-mini launchd process. */
export class SignedDailyDeskWorkerTransport implements DailyDeskWorkerTransport {
  constructor(
    private readonly baseUrl: string,
    private readonly secret: string,
    private readonly fetchImpl: FetchLike = fetch,
  ) {
    if (!baseUrl.startsWith('https://') && !baseUrl.startsWith('http://127.0.0.1') && !baseUrl.startsWith('http://localhost')) {
      throw new Error('The Daily Desk worker base URL must use HTTPS (or an explicit local loopback URL).');
    }
    if (!secret.trim()) throw new Error('DAILY_DESK_WORKER_SECRET is required for the private Daily Desk worker.');
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
    if (!response.ok) throw new Error(typeof json.error === 'string' ? json.error : `Daily Desk worker endpoint failed (${response.status}).`);
    return json as T;
  }

  async schedule(workerId: string) {
    return this.post<{ queued: number }>('/api/daily-desk/worker/schedule', { workerId });
  }

  async claim(workerId: string) {
    const response = await this.post<{ claim: DailyDeskWorkerClaim | null }>('/api/daily-desk/worker/claim', { workerId, leaseSeconds: 300 });
    return response.claim;
  }

  async route(input: { workerId: string; runId: string; ownerId: string }) {
    return this.post<{ route: DailyDeskTextModelRoute | null; reason?: string }>('/api/daily-desk/worker/route', input);
  }

  async reserve(input: {
    workerId: string; ownerId: string; runId: string; reservationKey: string; modelId: string; estimatedCostUsd: number;
    providerPolicy: typeof DAILY_DESK_PROVIDER_POLICY; rationale: string;
  }) {
    const response = await this.post<{ reservation: { reservation_key: string; reserved_cost: number | string } }>('/api/daily-desk/worker/reserve', input);
    return { reservationKey: response.reservation.reservation_key, reservedCost: Number(response.reservation.reserved_cost) };
  }

  async report(result: DailyDeskWorkerReport) {
    await this.post('/api/daily-desk/worker/result', result as unknown as Record<string, unknown>);
  }
}
