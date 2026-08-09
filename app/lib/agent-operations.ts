export const DAILY_MEDIA_CEILING_USD = 0.99;
export const DEFAULT_CONTENT_DURATION_SECONDS = 10;
export const MIN_CONTENT_DURATION_SECONDS = 7;
export const MAX_CONTENT_DURATION_SECONDS = 15;
export const CONTENT_ASPECT_RATIO = '9:16' as const;

export const AGENT_ROLES = [
  'coordinator',
  'public_web_researcher',
  'outreach_writer',
  'daily_content_producer',
  'reviewer',
] as const;

export type AgentRole = (typeof AGENT_ROLES)[number];
export type AgentRunStatus = 'queued' | 'running' | 'paused' | 'cancelled' | 'completed' | 'failed' | 'emergency_stopped';
export type AgentTaskStatus = 'queued' | 'leased' | 'running' | 'succeeded' | 'failed' | 'blocked' | 'cancelled';
export type ArtifactStatus = 'pending_review' | 'approved' | 'rejected' | 'edited' | 'regeneration_requested' | 'archived';
export type ArtifactDecision = 'approve' | 'reject' | 'edit' | 'regenerate';

export type MediaReservation = {
  reserved_cost: number | string;
  actual_cost?: number | string | null;
  status: 'reserved' | 'reconciled' | 'released' | 'overage';
};

export type SubtitleCue = {
  startMs: number;
  endMs: number;
  text: string;
};

export function mediaBudgetAllowed(
  reservations: readonly MediaReservation[],
  proposedCost: number,
  ceiling = DAILY_MEDIA_CEILING_USD,
) {
  if (!Number.isFinite(proposedCost) || proposedCost < 0 || proposedCost > ceiling) return false;
  if (!Number.isFinite(ceiling) || ceiling < 0 || ceiling > DAILY_MEDIA_CEILING_USD) return false;
  const booked = reservations
    .filter((reservation) => reservation.status !== 'released')
    .reduce((total, reservation) => total + Number(reservation.actual_cost ?? reservation.reserved_cost), 0);
  return reservations.every((reservation) => Number.isFinite(Number(reservation.actual_cost ?? reservation.reserved_cost)))
    && booked >= 0
    && booked + proposedCost <= ceiling;
}

export function contentDurationAllowed(durationSeconds: number) {
  return Number.isInteger(durationSeconds)
    && durationSeconds >= MIN_CONTENT_DURATION_SECONDS
    && durationSeconds <= MAX_CONTENT_DURATION_SECONDS;
}

export function verticalVideoAllowed(input: {
  durationSeconds: number;
  width: number;
  height: number;
  mimeType: string;
}) {
  if (!contentDurationAllowed(input.durationSeconds)
    || !Number.isInteger(input.width)
    || !Number.isInteger(input.height)
    || input.width <= 0
    || input.height <= 0
    || input.mimeType !== 'video/mp4') return false;
  const ratio = input.width / input.height;
  return Math.abs(ratio - 9 / 16) <= 0.03;
}

export function subtitleCuesAllowed(cues: readonly SubtitleCue[], durationMs: number) {
  if (!Number.isInteger(durationMs) || durationMs < MIN_CONTENT_DURATION_SECONDS * 1000) return false;
  let previousEnd = 0;
  for (const cue of cues) {
    if (!Number.isInteger(cue.startMs)
      || !Number.isInteger(cue.endMs)
      || cue.startMs < 0
      || cue.endMs <= cue.startMs
      || cue.endMs > durationMs
      || !cue.text.trim()
      || cue.startMs < previousEnd) return false;
    previousEnd = cue.endMs;
  }
  return cues.length > 0;
}

const allowedRunTransitions: Record<AgentRunStatus, readonly AgentRunStatus[]> = {
  queued: ['running', 'paused', 'cancelled', 'emergency_stopped'],
  running: ['paused', 'cancelled', 'failed', 'completed', 'emergency_stopped'],
  paused: ['running', 'cancelled', 'emergency_stopped'],
  cancelled: ['queued'],
  failed: ['queued'],
  completed: [],
  emergency_stopped: ['queued'],
};

export function agentRunTransitionAllowed(from: AgentRunStatus, to: AgentRunStatus) {
  return from === to || allowedRunTransitions[from].includes(to);
}

export function artifactDecisionAllowed(status: ArtifactStatus, decision: ArtifactDecision) {
  if (status === 'archived') return false;
  if (status === 'regeneration_requested') return decision === 'regenerate';
  return true;
}

export function localDateForTimezone(timezone: string, now = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);
    const values = Object.fromEntries(
      parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]),
    );
    return String(values.year) + '-' + String(values.month) + '-' + String(values.day);
  } catch {
    return null;
  }
}

export function scheduledInstantForLocalDate(localDate: string, timezone: string, time = '09:00') {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [year, month, day] = localDate.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  if (![year, month, day, hour, minute].every(Number.isInteger) || hour > 23 || minute > 59) return null;
  try {
    const referenceMs = Date.UTC(year, month - 1, day, hour, minute);
    const reference = new Date(referenceMs);
    if (reference.getUTCFullYear() !== year
      || reference.getUTCMonth() !== month - 1
      || reference.getUTCDate() !== day
      || reference.getUTCHours() !== hour
      || reference.getUTCMinutes() !== minute) return null;
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    const parts = Object.fromEntries(
      formatter.formatToParts(reference).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]),
    );
    const observedMs = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
    );
    const offsetMs = observedMs - referenceMs;
    const scheduled = new Date(referenceMs - offsetMs);
    const check = Object.fromEntries(
      formatter.formatToParts(scheduled).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]),
    );
    if (Number(check.year) !== year
      || Number(check.month) !== month
      || Number(check.day) !== day
      || Number(check.hour) !== hour
      || Number(check.minute) !== minute) return null;
    return scheduled.toISOString();
  } catch {
    return null;
  }
}
