import { describe, expect, it } from 'vitest';
import { InMemoryOutboundSender } from '@/lib/outbound-sender';
import { createWorkerSignature, isPublicSourceUrl, normalizeEmail, prospectDeduplicationKey, verifyWorkerSignature } from '@/lib/prospecting';
import { createProspectingSender, getProspectingSenderProvider } from '@/lib/prospecting-sender';
import { ForegroundProspectingWorker, privateResearchModelAllowed } from '@/lib/prospecting-worker';

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

  it('refuses research while the profile remains evaluation-required', () => {
    expect(privateResearchModelAllowed({ emergencyStop: false, modelRoute: 'evaluation-required', selectedModelId: null })).toBe(false);
    expect(privateResearchModelAllowed({ emergencyStop: true, modelRoute: 'selected-free', selectedModelId: 'catalog/pinned' })).toBe(false);
    expect(privateResearchModelAllowed({ emergencyStop: false, modelRoute: 'selected-free', selectedModelId: 'catalog/pinned' })).toBe(true);
    expect(privateResearchModelAllowed({ emergencyStop: false, modelRoute: 'selected-primary', selectedModelId: 'provider/pinned-2026' })).toBe(true);
    expect(privateResearchModelAllowed({ emergencyStop: false, modelRoute: 'selected-primary', selectedModelId: 'provider/latest' })).toBe(false);
    expect(privateResearchModelAllowed({ emergencyStop: false, modelRoute: 'unexpected-route', selectedModelId: 'provider/pinned-2026' })).toBe(false);
  });

  it('keeps real prospecting delivery disabled unless an explicit provider is selected', async () => {
    const previousProvider = process.env.PROSPECTING_SENDER_PROVIDER;
    const previousOffline = process.env.OFFLINE_ASSEMBLY_PROOF;
    try {
      delete process.env.PROSPECTING_SENDER_PROVIDER;
      delete process.env.OFFLINE_ASSEMBLY_PROOF;
      expect(getProspectingSenderProvider()).toBe('disabled');
      expect(createProspectingSender()).toBeNull();
      process.env.PROSPECTING_SENDER_PROVIDER = 'fake';
      expect(getProspectingSenderProvider()).toBe('fake');
      expect(createProspectingSender()).not.toBeNull();
    } finally {
      if (previousProvider === undefined) delete process.env.PROSPECTING_SENDER_PROVIDER;
      else process.env.PROSPECTING_SENDER_PROVIDER = previousProvider;
      if (previousOffline === undefined) delete process.env.OFFLINE_ASSEMBLY_PROOF;
      else process.env.OFFLINE_ASSEMBLY_PROOF = previousOffline;
    }
  });

  it('rejects stale or altered worker signatures', () => {
    const body = JSON.stringify({ taskId: 'one' });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const nonce = 'nonce-1234567890';
    const purpose = '/api/prospecting/worker/result';
    const signature = createWorkerSignature(body, timestamp, nonce, 'secret', purpose);
    expect(verifyWorkerSignature({ body, timestamp, nonce, signature, secret: 'secret', purpose })).toBe(true);
    expect(verifyWorkerSignature({ body: `${body}!`, timestamp, nonce, signature, secret: 'secret', purpose })).toBe(false);
    expect(verifyWorkerSignature({ body, timestamp, nonce, signature, secret: 'secret', purpose: '/api/prospecting/worker/claim' })).toBe(false);
    expect(verifyWorkerSignature({ body, timestamp: String(Number(timestamp) - 600), nonce, signature, secret: 'secret', purpose })).toBe(false);
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
