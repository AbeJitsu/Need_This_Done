import { describe, expect, it } from 'vitest';
import { InMemoryOutboundSender } from '@/lib/outbound-sender';
import { createWorkerSignature, isPublicSourceUrl, modelBudgetAllowed, normalizeEmail, prospectDeduplicationKey, verifyWorkerSignature } from '@/lib/prospecting';
import { ForegroundProspectingWorker } from '@/lib/prospecting-worker';

describe('prospecting safety helpers', () => {
  it('normalizes email and deduplicates by email before website', () => {
    expect(normalizeEmail('  PERSON@Example.COM ')).toBe('person@example.com');
    expect(prospectDeduplicationKey('  PERSON@Example.COM ', 'https://example.com/')).toBe('person@example.com');
    expect(prospectDeduplicationKey('', 'https://www.example.com/')).toBe('example.com');
  });

  it('accepts public HTTPS evidence only', () => {
    expect(isPublicSourceUrl('https://example.com/about')).toBe(true);
    expect(isPublicSourceUrl('http://example.com/about')).toBe(false);
    expect(isPublicSourceUrl('https://localhost/private')).toBe(false);
  });

  it('enforces both per-run and daily model budgets', () => {
    expect(modelBudgetAllowed(0.8, 0.1)).toBe(true);
    expect(modelBudgetAllowed(0.8, 0.11)).toBe(false);
    expect(modelBudgetAllowed(0.95, 0.1)).toBe(false);
  });

  it('rejects stale or altered worker signatures', () => {
    const body = JSON.stringify({ taskId: 'one' });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = createWorkerSignature(body, timestamp, 'nonce-1', 'secret');
    expect(verifyWorkerSignature({ body, timestamp, nonce: 'nonce-1', signature, secret: 'secret' })).toBe(true);
    expect(verifyWorkerSignature({ body: `${body}!`, timestamp, nonce: 'nonce-1', signature, secret: 'secret' })).toBe(false);
    expect(verifyWorkerSignature({ body, timestamp: String(Number(timestamp) - 600), nonce: 'nonce-1', signature, secret: 'secret' })).toBe(false);
  });

  it('sends only complete approved records and is idempotent', async () => {
    const sender = new InMemoryOutboundSender();
    const message = { id: 'message-1', senderEmail: 'owner@example.com', recipientEmail: 'prospect@example.com', subject: 'Hello', body: 'Body', idempotencyKey: 'key-1' };
    expect(await sender.send(message)).toEqual({ providerMessageId: 'fake-1' });
    expect(await sender.send(message)).toEqual({ providerMessageId: 'fake-1' });
    expect(sender.sent.size).toBe(1);
    await expect(sender.send({ ...message, body: '' })).rejects.toThrow('incomplete');
  });

  it('runs one leased task and reports failures without looping forever', async () => {
    const calls: string[] = [];
    const task = { id: 'task-1', profile_id: 'profile-1', task_type: 'discover_prospects' as const, status: 'leased' as const, input: {}, attempt_count: 1, max_attempts: 3, idempotency_key: 'key' };
    const worker = new ForegroundProspectingWorker('local-worker', {
      claim: async () => task,
      execute: async () => { calls.push('execute'); throw new Error('deterministic failure'); },
      submit: async () => { calls.push('submit'); },
      fail: async (_task, error) => { calls.push(error); },
    });
    expect(await worker.runOnce()).toBe(true);
    expect(calls).toEqual(['execute', 'deterministic failure']);
    worker.stop();
    expect(await worker.runOnce()).toBe(false);
  });
});
