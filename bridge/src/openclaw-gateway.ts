import { randomUUID } from 'node:crypto';
import type { ClaimedTask, JsonObject } from './bridge-client.js';

const PROTOCOL_VERSION = 4;
const DEFAULT_RPC_TIMEOUT_MS = 30_000;
const HANDSHAKE_TIMEOUT_MS = 15_000;

type SocketMessage = { data?: unknown };

export type WebSocketLike = {
  addEventListener(type: 'open', listener: () => void): void;
  addEventListener(type: 'message', listener: (event: SocketMessage) => void): void;
  addEventListener(type: 'error' | 'close', listener: (event: SocketMessage) => void): void;
  send(data: string): void;
  close(code?: number, reason?: string): void;
};

type GatewayResponse = {
  type: 'res';
  id: string;
  ok: boolean;
  payload?: unknown;
  error?: unknown;
};

type GatewayEvent = {
  type: 'event';
  event: string;
  payload?: unknown;
};

type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

type HandshakeState = {
  requestId: string;
  resolve: () => void;
  reject: (reason: Error) => void;
};

export type GatewayClientOptions = {
  url: string;
  token: string;
  clientVersion: string;
  requestTimeoutMs?: number;
  websocketFactory?: (url: string) => WebSocketLike;
  onEvent?: (event: GatewayEvent) => void;
};

export class GatewayRpcError extends Error {
  readonly code: string;
  readonly details: unknown;
  readonly retryable: boolean;

  constructor(error: unknown, fallback = 'OpenClaw Gateway request failed.') {
    const record = asRecord(error);
    const message = typeof record.message === 'string' ? record.message : fallback;
    super(message);
    this.name = 'GatewayRpcError';
    this.code = typeof record.code === 'string' ? record.code : 'GATEWAY_ERROR';
    this.details = record.details;
    this.retryable = record.retryable === true;
  }
}

function asRecord(value: unknown): JsonObject {
  return typeof value === 'object' && value !== null ? value as JsonObject : {};
}

function messageFromSocketEvent(event: SocketMessage) {
  return typeof event.data === 'string' ? event.data : 'OpenClaw Gateway socket closed.';
}

function defaultWebsocketFactory(url: string) {
  const WebSocketConstructor = globalThis.WebSocket;
  if (!WebSocketConstructor) throw new Error('Node WebSocket support is unavailable. Use Node 22 or provide a websocketFactory.');
  return new WebSocketConstructor(url) as unknown as WebSocketLike;
}

function isLoopbackGateway(url: URL) {
  return (url.protocol === 'ws:' || url.protocol === 'wss:')
    && (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '::1');
}

export class OpenClawGatewayClient {
  private readonly url: string;
  private readonly token: string;
  private readonly clientVersion: string;
  private readonly requestTimeoutMs: number;
  private readonly websocketFactory: (url: string) => WebSocketLike;
  private readonly onEvent?: (event: GatewayEvent) => void;
  private socket: WebSocketLike | null = null;
  private socketOpen = false;
  private connected = false;
  private connectSent = false;
  private connectPromise: Promise<void> | null = null;
  private handshake: HandshakeState | null = null;
  private handshakeTimer: ReturnType<typeof setTimeout> | null = null;
  private handshakeTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly pending = new Map<string, PendingRequest>();

  constructor(options: GatewayClientOptions) {
    const parsed = new URL(options.url);
    if (!isLoopbackGateway(parsed)) throw new Error('OpenClaw Gateway must remain on a loopback ws:// or wss:// URL.');
    if (!options.token.trim()) throw new Error('OpenClaw Gateway token is required.');
    this.url = options.url;
    this.token = options.token;
    this.clientVersion = options.clientVersion;
    this.requestTimeoutMs = options.requestTimeoutMs ?? DEFAULT_RPC_TIMEOUT_MS;
    if (!Number.isFinite(this.requestTimeoutMs) || this.requestTimeoutMs < 1) {
      throw new Error('OpenClaw Gateway request timeout must be a positive number.');
    }
    this.websocketFactory = options.websocketFactory || defaultWebsocketFactory;
    this.onEvent = options.onEvent;
  }

  async connect() {
    if (this.connected) return;
    if (this.connectPromise) return this.connectPromise;

    this.connectPromise = new Promise<void>((resolve, reject) => {
      this.handshake = { requestId: '', resolve, reject };
      this.socket = this.websocketFactory(this.url);
      this.socket.addEventListener('open', () => {
        this.socketOpen = true;
        this.handshakeTimer = setTimeout(() => this.sendConnect(), 250);
      });
      this.socket.addEventListener('message', (event) => this.handleMessage(event));
      this.socket.addEventListener('error', (event) => this.failConnection(new Error(messageFromSocketEvent(event))));
      this.socket.addEventListener('close', (event) => this.failConnection(new Error(messageFromSocketEvent(event))));
      this.handshakeTimeout = setTimeout(() => {
        if (!this.connected) this.failConnection(new Error(`OpenClaw Gateway handshake timed out after ${HANDSHAKE_TIMEOUT_MS}ms.`));
      }, HANDSHAKE_TIMEOUT_MS);
    });

    try {
      await this.connectPromise;
    } finally {
      this.connectPromise = null;
    }
  }

  async call<T>(method: string, params: JsonObject = {}, timeoutMs = this.requestTimeoutMs): Promise<T> {
    await this.connect();
    if (!this.socket || !this.connected) throw new Error('OpenClaw Gateway is not connected.');
    const id = randomUUID();
    const frame = { type: 'req', id, method, params };
    const response = new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`OpenClaw Gateway request timed out: ${method}.`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
    });
    try {
      this.socket.send(JSON.stringify(frame));
    } catch (error) {
      const pending = this.pending.get(id);
      this.pending.delete(id);
      if (pending) clearTimeout(pending.timer);
      throw error instanceof Error ? error : new Error('OpenClaw Gateway request could not be sent.');
    }
    return await response as T;
  }

  async runTask(task: ClaimedTask) {
    const taskInput = JSON.stringify(task.input).slice(0, 24_000);
    const params: JsonObject = {
      message: [
        'Execute this NeedThisDone task as a supervised internal worker.',
        `Task type: ${task.task_type}.`,
        `Assigned role: ${task.agent_role}.`,
        `Provider lane: ${task.agent_provider}.`,
        `Requested model: ${task.model_id || 'gateway default'}.`,
        'Return structured evidence and artifacts for the bridge to persist.',
        'Do not send email, publish content, spend money, modify connected accounts, or deliver an external message.',
        `Task input: ${taskInput}`,
      ].join('\n'),
      sessionKey: `needthisdone:${task.id}`,
      deliver: false,
      bestEffortDeliver: false,
      idempotencyKey: task.id,
    };
    if (task.model_id) params.model = task.model_id;
    return this.call<unknown>('agent', params);
  }

  close() {
    this.failConnection(new Error('OpenClaw Gateway client stopped.'));
  }

  private sendConnect() {
    if (!this.socket || !this.socketOpen || this.connectSent || this.connected) return;
    this.connectSent = true;
    if (this.handshakeTimer) clearTimeout(this.handshakeTimer);
    const requestId = randomUUID();
    if (this.handshake) this.handshake.requestId = requestId;
    this.socket.send(JSON.stringify({
      type: 'req',
      id: requestId,
      method: 'connect',
      params: {
        minProtocol: PROTOCOL_VERSION,
        maxProtocol: PROTOCOL_VERSION,
        client: {
          id: 'gateway-client',
          version: this.clientVersion,
          platform: 'macos',
          mode: 'backend',
        },
        role: 'operator',
        scopes: ['operator.read', 'operator.write'],
        caps: [],
        commands: [],
        permissions: {},
        auth: { token: this.token },
        locale: 'en-US',
        userAgent: `needthisdone-agent-bridge/${this.clientVersion}`,
      },
    }));
  }

  private handleMessage(event: SocketMessage) {
    if (typeof event.data !== 'string') return;
    let frame: unknown;
    try {
      frame = JSON.parse(event.data) as unknown;
    } catch {
      this.failConnection(new Error('OpenClaw Gateway sent invalid JSON.'));
      return;
    }
    const record = asRecord(frame);
    if (record.type === 'event') {
      const gatewayEvent = record as unknown as GatewayEvent;
      if (gatewayEvent.event === 'connect.challenge') this.sendConnect();
      this.onEvent?.(gatewayEvent);
      return;
    }
    if (record.type !== 'res') return;
    const response = record as unknown as GatewayResponse;
    if (this.handshake?.requestId === response.id) {
      if (!response.ok) {
        this.failConnection(new GatewayRpcError(response.error, 'OpenClaw Gateway rejected the handshake.'));
        return;
      }
      const hello = asRecord(response.payload);
      if (hello.type !== 'hello-ok') {
        this.failConnection(new Error('OpenClaw Gateway returned an unexpected handshake response.'));
        return;
      }
      this.connected = true;
      if (this.handshakeTimeout) clearTimeout(this.handshakeTimeout);
      this.handshakeTimeout = null;
      const handshake = this.handshake;
      this.handshake = null;
      handshake.resolve();
      return;
    }
    const pending = this.pending.get(response.id);
    if (!pending) return;
    this.pending.delete(response.id);
    clearTimeout(pending.timer);
    if (response.ok) pending.resolve(response.payload);
    else pending.reject(new GatewayRpcError(response.error));
  }

  private failConnection(error: Error) {
    const wasActive = Boolean(this.socket || this.handshake || this.pending.size);
    this.connected = false;
    this.socketOpen = false;
    this.connectSent = false;
    if (this.handshakeTimer) clearTimeout(this.handshakeTimer);
    this.handshakeTimer = null;
    if (this.handshakeTimeout) clearTimeout(this.handshakeTimeout);
    this.handshakeTimeout = null;
    const handshake = this.handshake;
    this.handshake = null;
    if (handshake) handshake.reject(error);
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(error);
    }
    this.pending.clear();
    const socket = this.socket;
    this.socket = null;
    if (socket && wasActive) socket.close();
  }
}
