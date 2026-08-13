import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

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

export function isApprovedSenderConfigured(senderName: string | null | undefined, senderEmail: string | null | undefined) {
  return Boolean(senderName?.trim() && senderEmail?.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail.trim()));
}

export function createWorkerSignature(body: string, timestamp: string, nonce: string, secret: string, purpose = '') {
  const signedPayload = purpose ? `${purpose}.${timestamp}.${nonce}.${body}` : `${timestamp}.${nonce}.${body}`;
  return createHmac('sha256', secret).update(signedPayload).digest('hex');
}

export function verifyWorkerSignature({ body, timestamp, nonce, signature, secret, purpose = '', now = Date.now(), maxAgeMs = 5 * 60 * 1000 }: {
  body: string; timestamp: string; nonce: string; signature: string; secret: string; purpose?: string; now?: number; maxAgeMs?: number;
}) {
  const timestampMs = Number(timestamp) * 1000;
  if (!Number.isFinite(timestampMs) || !Number.isInteger(timestampMs / 1000) || Math.abs(now - timestampMs) > maxAgeMs || nonce.length < 16 || !signature) return false;
  const expected = createWorkerSignature(body, timestamp, nonce, secret, purpose);
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

export function localDateForTimezone(timezone: string, now = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);
    const values = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  } catch {
    return null;
  }
}
