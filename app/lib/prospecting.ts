import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { MODEL_EVALUATION_DAILY_CAP_USD, MODEL_EVALUATION_PER_RUN_CAP_USD } from '@/lib/model-evaluation';

export function normalizeEmail(value: string | null | undefined) {
  return (value || '').trim().toLowerCase();
}

export function normalizeWebsite(value: string) {
  return value.trim().toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

export function prospectDeduplicationKey(email: string | null | undefined, website: string) {
  return normalizeEmail(email) || normalizeWebsite(website);
}

export function isPublicSourceUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  } catch {
    return false;
  }
}

export function modelBudgetAllowed(
  dailySpend: number,
  runSpend: number,
  dailyCap = MODEL_EVALUATION_DAILY_CAP_USD,
  runCap = MODEL_EVALUATION_PER_RUN_CAP_USD,
) {
  return dailySpend >= 0
    && runSpend >= 0
    && dailyCap >= 0
    && dailyCap <= MODEL_EVALUATION_DAILY_CAP_USD
    && runCap >= 0
    && runCap <= MODEL_EVALUATION_PER_RUN_CAP_USD
    && runSpend <= runCap
    && dailySpend + runSpend <= dailyCap;
}

export function createWorkerSignature(body: string, timestamp: string, nonce: string, secret: string) {
  return createHmac('sha256', secret).update(`${timestamp}.${nonce}.${body}`).digest('hex');
}

export function verifyWorkerSignature({ body, timestamp, nonce, signature, secret, now = Date.now(), maxAgeMs = 5 * 60 * 1000 }: {
  body: string; timestamp: string; nonce: string; signature: string; secret: string; now?: number; maxAgeMs?: number;
}) {
  const timestampMs = Number(timestamp) * 1000;
  if (!Number.isFinite(timestampMs) || Math.abs(now - timestampMs) > maxAgeMs || !nonce || !signature) return false;
  const expected = createWorkerSignature(body, timestamp, nonce, secret);
  const provided = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  return provided.length === expectedBuffer.length && timingSafeEqual(provided, expectedBuffer);
}

export function taskIdempotencyKey(taskType: string, value: string) {
  const digest = createHash('sha256').update(`${taskType}:${value}`).digest('hex').slice(0, 32);
  return `${digest.slice(0, 8)}-${digest.slice(8, 12)}-4${digest.slice(13, 16)}-8${digest.slice(17, 20)}-${digest.slice(20)}`;
}

export function normalizedFollowUpDays(value: number[]) {
  return [...new Set(value.filter((day) => Number.isInteger(day) && day > 0 && day <= 90))].sort((a, b) => a - b).slice(0, 6);
}
