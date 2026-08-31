import { createHash } from 'node:crypto';
import { mkdir, readFile, realpath, stat } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import type {
  BridgeApiClient,
  ClaimedTask,
  CompletionArtifact,
  JsonObject,
  ProspectingPayload,
} from './bridge-client.js';
import { OpenClawGatewayClient } from './openclaw-gateway.js';

const DAILY_MEDIA_CEILING_USD = 0.99;
const MAX_ARTIFACT_BYTES = 50 * 1024 * 1024;
const ALLOWED_TASK_TYPES = new Set([
  'coordinate',
  'research_public_web',
  'draft_outreach',
  'produce_daily_content',
  'review_artifacts',
  'regenerate_artifact',
]);

type RunnerOptions = {
  api: BridgeApiClient;
  gateway: OpenClawGatewayClient;
  artifactRoot: string;
  capabilities: string[];
  fetchImpl?: typeof fetch;
  reservationCostUsd?: number;
};

type RawArtifact = JsonObject & {
  artifactType?: string;
  title?: string;
  contentText?: string;
  localPath?: string;
  mimeType?: string;
  metadata?: JsonObject;
  byteSize?: number;
  sha256?: string;
};

function asRecord(value: unknown): JsonObject {
  return typeof value === 'object' && value !== null ? value as JsonObject : {};
}

function asRawArtifacts(result: unknown): RawArtifact[] {
  const candidate = asRecord(result).artifacts;
  if (!Array.isArray(candidate)) return [];
  return candidate.filter((value): value is RawArtifact => typeof value === 'object' && value !== null) as RawArtifact[];
}

function textFromValue(value: unknown, depth = 0): string | null {
  if (depth > 3) return null;
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    const text = value.map((item) => textFromValue(item, depth + 1)).filter(Boolean).join('\n');
    return text || null;
  }
  const record = asRecord(value);
  for (const key of ['text', 'contentText', 'content', 'summary', 'message', 'output', 'result']) {
    const text = textFromValue(record[key], depth + 1);
    if (text) return text;
  }
  return null;
}

function numberFromPaths(value: unknown, paths: string[][]) {
  for (const path of paths) {
    let current: unknown = value;
    for (const key of path) current = asRecord(current)[key];
    const number = typeof current === 'number' ? current : typeof current === 'string' ? Number(current) : NaN;
    if (Number.isFinite(number) && number >= 0) return number;
  }
  return null;
}

function actualCostFromResult(result: unknown) {
  return numberFromPaths(result, [
    ['actualCost'],
    ['costUsd'],
    ['usage', 'actualCost'],
    ['usage', 'costUsd'],
    ['usage', 'totalCost'],
    ['result', 'actualCost'],
    ['result', 'costUsd'],
    ['result', 'usage', 'costUsd'],
  ]);
}

function usageFromResult(result: unknown): JsonObject {
  const usage = asRecord(asRecord(result).usage);
  return Object.keys(usage).length ? usage : {};
}

function actualModelFromResult(result: unknown) {
  const record = asRecord(result);
  const usage = asRecord(record.usage);
  const nested = asRecord(record.result);
  const value = record.actualModelId ?? record.actual_model_id ?? record.model
    ?? usage.actualModelId ?? usage.actual_model_id ?? usage.model
    ?? nested.actualModelId ?? nested.actual_model_id ?? nested.model;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function outputFromResult(result: unknown): JsonObject {
  const record = asRecord(result);
  const serialized = JSON.stringify(record);
  if (serialized.length <= 100_000) return record;
  return { summary: textFromValue(result) || 'Gateway result was larger than the dashboard output limit.' };
}

function prospectingFromResult(result: unknown): ProspectingPayload | undefined {
  const candidate = asRecord(asRecord(result).prospecting);
  const dossiers = candidate.dossiers;
  const providerCitations = candidate.providerCitations;
  if (!Array.isArray(dossiers) || !Array.isArray(providerCitations)) return undefined;
  return {
    dossiers,
    providerCitations: providerCitations.filter((citation): citation is { url: string; title: string; excerpt: string } => {
      const item = asRecord(citation);
      return typeof item.url === 'string' && typeof item.title === 'string' && typeof item.excerpt === 'string';
    }),
    ...(typeof candidate.shortfallReason === 'string' ? { shortfallReason: candidate.shortfallReason } : {}),
  };
}

function artifactTypeForTask(task: ClaimedTask) {
  if (task.task_type === 'research_public_web') return 'research_dossier';
  if (task.task_type === 'draft_outreach') return 'email_draft';
  if (task.task_type === 'review_artifacts') return 'review_report';
  if (task.task_type === 'produce_daily_content') return 'content_package';
  return 'other';
}

function mimeForPath(path: string) {
  const extension = extname(path).toLowerCase();
  return ({
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.vtt': 'text/vtt',
    '.srt': 'application/x-subrip',
    '.txt': 'text/plain',
  } as Record<string, string>)[extension] || 'application/octet-stream';
}

function uploadArtifactType(type: string): 'thumbnail' | 'video' | 'audio' | 'subtitles' | 'other' {
  if (type === 'thumbnail' || type === 'video' || type === 'audio' || type === 'subtitles') return type;
  return 'other';
}

function safeError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Agent task failed.';
  return message.replace(/\s+/g, ' ').slice(0, 4_000);
}

function metadataForArtifact(raw: RawArtifact, task: ClaimedTask): JsonObject {
  return {
    ...asRecord(raw.metadata),
    provenance: {
      taskId: task.id,
      planId: task.plan_id || null,
      growthProfileId: task.growth_profile_id || null,
      agentRole: task.agent_role,
      provider: task.agent_provider,
      model: task.model_id,
    },
  };
}

function validateDailyVideo(artifact: CompletionArtifact) {
  if (artifact.artifactType !== 'video') return;
  if (artifact.mimeType !== 'video/mp4') throw new Error('Daily content video must be an MP4.');
  const duration = artifact.metadata.durationSeconds;
  if (typeof duration !== 'number' || !Number.isInteger(duration) || duration < 7 || duration > 15) {
    throw new Error('Daily content video duration must be an integer from 7 to 15 seconds.');
  }
  if (artifact.metadata.aspectRatio !== '9:16') throw new Error('Daily content video must use a 9:16 aspect ratio.');
}

export class AgentBridgeRunner {
  private readonly api: BridgeApiClient;
  private readonly gateway: OpenClawGatewayClient;
  private readonly artifactRoot: string;
  private readonly capabilities: string[];
  private readonly fetchImpl: typeof fetch;
  private readonly reservationCostUsd: number;
  private running = false;

  constructor(options: RunnerOptions) {
    this.api = options.api;
    this.gateway = options.gateway;
    this.artifactRoot = resolve(options.artifactRoot);
    this.capabilities = options.capabilities;
    this.fetchImpl = options.fetchImpl || fetch;
    this.reservationCostUsd = options.reservationCostUsd ?? DAILY_MEDIA_CEILING_USD;
    if (!Number.isFinite(this.reservationCostUsd) || this.reservationCostUsd < 0 || this.reservationCostUsd > DAILY_MEDIA_CEILING_USD) {
      throw new Error('The bridge media reservation must be between $0 and $0.99.');
    }
  }

  async runOnce() {
    if (this.running) return { status: 'busy' as const };
    this.running = true;
    try {
      await this.api.heartbeat({ status: 'online', capabilities: this.capabilities, activeTaskId: null });
      await this.api.schedule();
      const task = await this.api.claim();
      if (!task) return { status: 'idle' as const };
      return await this.execute(task);
    } catch (error) {
      await this.safeHeartbeat('degraded', safeError(error), null);
      throw error;
    } finally {
      this.running = false;
    }
  }

  async stop() {
    await this.safeHeartbeat('stopped', null, null);
    this.gateway.close();
  }

  private async execute(task: ClaimedTask) {
    let reservationKey: string | undefined;
    let modelReservationKey: string | undefined;
    let providerStarted = false;
    let gatewayResult: unknown = null;
    await this.safeHeartbeat('online', null, task.id);
    try {
      if (!ALLOWED_TASK_TYPES.has(task.task_type)) throw new Error(`Task type is not allowed on the bridge: ${task.task_type}.`);
      await this.api.event(task.id, 'progress', { message: 'Task claimed by the Mac bridge.', taskKey: task.task_key }, 5);

      if (task.task_type === 'produce_daily_content') {
        const reservationCost = typeof task.input.mediaReservationUsd === 'number'
          ? task.input.mediaReservationUsd
          : this.reservationCostUsd;
        if (!Number.isFinite(reservationCost) || reservationCost < 0 || reservationCost > DAILY_MEDIA_CEILING_USD) {
          throw new Error('Daily content has no valid media reservation amount under the $0.99 ceiling.');
        }
        reservationKey = crypto.randomUUID();
        await this.api.reserveMedia({
          taskId: task.id,
          reservationKey,
          mediaKind: 'render',
          provider: task.agent_provider,
          reservedCost: reservationCost,
          localUsageDate: typeof task.input.localDate === 'string' ? task.input.localDate : undefined,
        });
        await this.api.event(task.id, 'progress', { message: 'The full media ceiling is reserved before generation.', reservationKey }, 12);
      }

      if (task.plan_id) {
        const modelReservationCost = typeof task.input.modelReservationUsd === 'number'
          ? task.input.modelReservationUsd
          : 0;
        if (!Number.isFinite(modelReservationCost) || modelReservationCost < 0 || modelReservationCost > 100) {
          throw new Error('Approved OpenClaw task has no valid model usage reservation amount.');
        }
        const reserveModel = (this.api as BridgeApiClient & {
          reserveModelUsage?: (input: { taskId: string; reservationKey: string; reservedCost: number }) => Promise<unknown>;
        }).reserveModelUsage;
        if (!reserveModel) throw new Error('The bridge client does not support approved-plan model usage reservations.');
        modelReservationKey = crypto.randomUUID();
        await reserveModel.call(this.api, {
          taskId: task.id,
          reservationKey: modelReservationKey,
          reservedCost: modelReservationCost,
        });
        await this.api.event(task.id, 'progress', { message: 'The approved OpenClaw model usage is reserved before execution.', modelReservationKey }, 18);
      }

      providerStarted = true;
      gatewayResult = await this.gateway.runTask(task);
      await this.api.event(task.id, 'progress', { message: 'Gateway work returned; validating artifacts and usage.' }, 82);
      const artifacts = await this.prepareArtifacts(task, gatewayResult);
      const actualCost = actualCostFromResult(gatewayResult);
      const actualModelId = actualModelFromResult(gatewayResult);
      if (task.task_type === 'produce_daily_content' && actualCost === null) {
        throw new Error('Provider usage was not reported; daily media completion is failed closed.');
      }
      if (modelReservationKey && actualCost === null) {
        throw new Error('OpenClaw provider usage was not reported; model completion is failed closed.');
      }
      if (task.plan_id && (!actualModelId || actualModelId !== task.model_id)) {
        throw new Error('OpenClaw did not report the exact approved model ID; completion is failed closed.');
      }
      if (task.plan_id && Object.keys(usageFromResult(gatewayResult)).length === 0) {
        throw new Error('OpenClaw did not report provider usage; completion is failed closed.');
      }
      await this.api.complete({
        taskId: task.id,
        status: 'succeeded',
        output: outputFromResult(gatewayResult),
        artifacts,
        ...(reservationKey ? { reservationKey, actualCost: actualCost as number } : {}),
        ...(modelReservationKey ? { modelReservationKey, modelActualCost: actualCost as number } : {}),
        ...(actualModelId ? { actualModelId } : {}),
        ...(task.task_type === 'research_public_web' && prospectingFromResult(gatewayResult)
          ? { prospecting: prospectingFromResult(gatewayResult) } : {}),
        provider: task.agent_provider,
        providerUsage: usageFromResult(gatewayResult),
      });
      await this.safeHeartbeat('online', null, null);
      return { status: 'succeeded' as const, taskId: task.id, artifactCount: artifacts.length };
    } catch (error) {
      const errorText = safeError(error);
      const actualCost = reservationKey && providerStarted ? actualCostFromResult(gatewayResult) : reservationKey ? 0 : null;
      const modelActualCost = modelReservationKey && providerStarted ? actualCostFromResult(gatewayResult) : modelReservationKey ? 0 : null;
      const mediaCostUnknown = Boolean(reservationKey && actualCost === null);
      const modelCostUnknown = Boolean(modelReservationKey && modelActualCost === null);
      if (mediaCostUnknown || modelCostUnknown) {
        await this.safeEvent(task.id, { message: errorText, completion: 'held_for_cost_reconciliation' }, 85);
        await this.safeHeartbeat('degraded', errorText, task.id);
        return { status: 'held' as const, taskId: task.id, error: errorText };
      }
      try {
        await this.api.complete({
          taskId: task.id,
          status: 'failed',
          error: errorText,
          ...(reservationKey ? { reservationKey, actualCost: actualCost as number } : {}),
          ...(modelReservationKey ? { modelReservationKey, modelActualCost: modelActualCost as number } : {}),
          providerInvoked: providerStarted,
          provider: task.agent_provider,
          providerUsage: usageFromResult(gatewayResult),
        });
      } catch (completionError) {
        await this.safeHeartbeat('degraded', safeError(completionError), task.id);
        return { status: 'held' as const, taskId: task.id, error: safeError(completionError) };
      }
      await this.safeHeartbeat('degraded', errorText, null);
      return { status: 'failed' as const, taskId: task.id, error: errorText };
    }
  }

  private async prepareArtifacts(task: ClaimedTask, result: unknown): Promise<CompletionArtifact[]> {
      const rawArtifacts = asRawArtifacts(result);
      const artifacts: RawArtifact[] = rawArtifacts.length ? rawArtifacts : (() => {
      const prospecting = prospectingFromResult(result);
      if (prospecting) {
        return [{
          artifactType: 'research_dossier',
          title: `${task.task_key} prospecting dossier result`,
          contentText: JSON.stringify(prospecting),
        }];
      }
      const text = textFromValue(result);
      if (!text) return [];
      const fallback: RawArtifact = {
        artifactType: artifactTypeForTask(task),
        title: `${task.task_key} result`,
        contentText: text,
      };
      return [fallback];
    })();
    const prepared: CompletionArtifact[] = [];
    for (const raw of artifacts) {
      const artifactType = typeof raw.artifactType === 'string' && raw.artifactType.trim()
        ? raw.artifactType.trim()
        : artifactTypeForTask(task);
      const title = typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : `${task.task_key} artifact`;
      const metadata = metadataForArtifact(raw, task);
      if (typeof raw.contentText === 'string' && raw.contentText.trim()) {
        const artifact: CompletionArtifact = { artifactType, title, contentText: raw.contentText, metadata };
        validateDailyVideo(artifact);
        prepared.push(artifact);
        continue;
      }
      if (typeof raw.localPath !== 'string' || !raw.localPath.trim()) throw new Error(`Artifact ${title} has no text or local file.`);
      await mkdir(this.artifactRoot, { recursive: true });
      const rootPath = await realpath(this.artifactRoot);
      const filePath = await realpath(resolve(this.artifactRoot, raw.localPath));
      if (filePath !== rootPath && !filePath.startsWith(rootPath + '/')) throw new Error('Bridge artifact paths must stay inside BRIDGE_ARTIFACT_ROOT.');
      const fileInfo = await stat(filePath);
      if (!fileInfo.isFile() || fileInfo.size <= 0 || fileInfo.size > MAX_ARTIFACT_BYTES) throw new Error(`Artifact ${title} is not a valid file under 50MB.`);
      const bytes = await readFile(filePath);
      const mimeType = typeof raw.mimeType === 'string' && raw.mimeType.trim() ? raw.mimeType : mimeForPath(filePath);
      const grant = await this.api.uploadUrl({ taskId: task.id, artifactType: uploadArtifactType(artifactType), mimeType, byteSize: bytes.byteLength });
      const upload = await this.fetchImpl(grant.signedUrl, { method: 'PUT', headers: { 'content-type': mimeType }, body: bytes });
      if (!upload.ok) throw new Error(`Private upload failed for artifact ${title}.`);
      const artifact: CompletionArtifact = {
        artifactType,
        title,
        storagePath: grant.path,
        mimeType,
        byteSize: bytes.byteLength,
        sha256: createHash('sha256').update(bytes).digest('hex'),
        metadata: { ...metadata, sourceExtension: extname(filePath).toLowerCase() },
      };
      validateDailyVideo(artifact);
      prepared.push(artifact);
    }
    if (task.task_type === 'produce_daily_content') {
      const types = new Set(prepared.map((artifact) => artifact.artifactType));
      if (!types.has('video') || !types.has('thumbnail') || !types.has('subtitles') || (!types.has('script') && !types.has('storyboard'))) {
        throw new Error('Daily content must return a video, thumbnail, subtitles, and script or storyboard artifact.');
      }
    }
    return prepared;
  }

  private async safeEvent(taskId: string, payload: JsonObject, progress: number) {
    try {
      await this.api.event(taskId, 'progress', payload, progress);
    } catch {
      // The original task error remains the useful signal; heartbeat captures
      // the degraded bridge state if the callback boundary is unavailable.
    }
  }

  private async safeHeartbeat(status: 'online' | 'degraded' | 'offline' | 'stopped', error: string | null, activeTaskId: string | null) {
    try {
      await this.api.heartbeat({ status, capabilities: this.capabilities, activeTaskId, error });
    } catch {
      // A failed heartbeat must not hide the task result or crash supervision.
    }
  }
}
