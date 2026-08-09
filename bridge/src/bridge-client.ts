import { createHmac, randomUUID } from 'node:crypto';

export type JsonObject = Record<string, unknown>;

export type ClaimedTask = {
  id: string;
  owner_id: string;
  run_id: string;
  task_key: string;
  agent_role: string;
  agent_provider: string;
  model_id: string | null;
  capabilities: unknown;
  task_type: string;
  status: string;
  input: JsonObject;
  attempt_count: number;
  max_attempts: number;
  leased_by: string | null;
  lease_expires_at: string | null;
  progress: number;
};

export type UploadGrant = {
  path: string;
  token: string;
  signedUrl: string;
  mimeType: string;
  byteSize: number;
  expiresInSeconds: number;
};

export type CompletionArtifact = {
  artifactType: string;
  title: string;
  contentText?: string;
  storagePath?: string;
  mimeType?: string;
  byteSize?: number;
  sha256?: string;
  metadata: JsonObject;
};

export type BridgeClientOptions = {
  baseUrl: string;
  secret: string;
  ownerId: string;
  workerId: string;
  version: string;
  fetchImpl?: typeof fetch;
  now?: () => number;
  nonceFactory?: () => string;
};

export class BridgeApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'BridgeApiError';
    this.status = status;
    this.payload = payload;
  }
}

function isLoopback(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function errorMessage(payload: unknown, fallback: string) {
  if (typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string') {
    return payload.error;
  }
  return fallback;
}

export class BridgeApiClient {
  private readonly baseUrl: string;
  private readonly secret: string;
  private readonly ownerId: string;
  private readonly workerId: string;
  private readonly version: string;
  private readonly fetchImpl: typeof fetch;
  private readonly now: () => number;
  private readonly nonceFactory: () => string;

  constructor(options: BridgeClientOptions) {
    const parsed = new URL(options.baseUrl);
    if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && isLoopback(parsed.hostname))) {
      throw new Error('The bridge API must use HTTPS, except for loopback development URLs.');
    }
    this.baseUrl = options.baseUrl.endsWith('/') ? options.baseUrl : options.baseUrl + '/';
    this.secret = options.secret;
    this.ownerId = options.ownerId;
    this.workerId = options.workerId;
    this.version = options.version;
    this.fetchImpl = options.fetchImpl || fetch;
    this.now = options.now || (() => Date.now());
    this.nonceFactory = options.nonceFactory || randomUUID;
  }

  private async post<T>(path: string, payload: JsonObject): Promise<T> {
    const body = JSON.stringify(payload);
    const timestamp = Math.floor(this.now() / 1000).toString();
    const nonce = this.nonceFactory();
    const signature = createHmac('sha256', this.secret)
      .update(`agent-bridge.${path}.${timestamp}.${nonce}.${body}`)
      .digest('hex');
    const response = await this.fetchImpl(new URL(path, this.baseUrl), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-bridge-timestamp': timestamp,
        'x-bridge-nonce': nonce,
        'x-bridge-signature': signature,
        'user-agent': `needthisdone-agent-bridge/${this.version}`,
      },
      body,
    });
    const text = await response.text();
    let parsed: unknown = {};
    if (text) {
      try {
        parsed = JSON.parse(text) as unknown;
      } catch {
        parsed = { error: text.slice(0, 500) };
      }
    }
    if (!response.ok) throw new BridgeApiError(errorMessage(parsed, `Bridge request failed with HTTP ${response.status}.`), response.status, parsed);
    return parsed as T;
  }

  heartbeat(input: {
    status: 'online' | 'degraded' | 'offline' | 'stopped';
    capabilities: string[];
    activeTaskId?: string | null;
    error?: string | null;
  }) {
    return this.post<JsonObject>('/api/agent-bridge/heartbeat', {
      ownerId: this.ownerId,
      workerId: this.workerId,
      version: this.version,
      ...input,
    });
  }

  schedule(limit = 20) {
    return this.post<{ tasks: ClaimedTask[]; queued: number }>('/api/agent-bridge/schedule', {
      ownerId: this.ownerId,
      workerId: this.workerId,
      limit,
    });
  }

  async claim(leaseSeconds = 300) {
    const response = await this.post<{ task: ClaimedTask | null }>('/api/agent-bridge/claim', {
      ownerId: this.ownerId,
      workerId: this.workerId,
      leaseSeconds,
    });
    return response.task;
  }

  event(taskId: string, eventType: 'progress' | 'artifact', payload: JsonObject, progress?: number) {
    return this.post<JsonObject>('/api/agent-bridge/events', {
      taskId,
      workerId: this.workerId,
      eventType,
      payload,
      ...(progress === undefined ? {} : { progress }),
    });
  }

  reserveMedia(input: {
    taskId: string;
    reservationKey: string;
    mediaKind: 'image' | 'video' | 'audio' | 'render' | 'other';
    provider: string;
    reservedCost: number;
    localUsageDate?: string;
  }) {
    return this.post<{ reservation: JsonObject }>('/api/agent-bridge/reserve-media', {
      ownerId: this.ownerId,
      workerId: this.workerId,
      ...input,
    });
  }

  uploadUrl(input: {
    taskId: string;
    artifactType: 'thumbnail' | 'video' | 'audio' | 'subtitles' | 'other';
    mimeType: string;
    byteSize: number;
  }) {
    return this.post<UploadGrant>('/api/agent-bridge/upload-url', {
      ownerId: this.ownerId,
      workerId: this.workerId,
      ...input,
    });
  }

  complete(input: {
    taskId: string;
    status: 'succeeded' | 'failed';
    output?: JsonObject | null;
    error?: string | null;
    artifacts?: CompletionArtifact[];
    reservationKey?: string;
    actualCost?: number;
    provider?: string;
    providerUsage?: JsonObject;
  }) {
    return this.post<JsonObject>('/api/agent-bridge/complete', {
      ownerId: this.ownerId,
      workerId: this.workerId,
      ...input,
    });
  }
}
