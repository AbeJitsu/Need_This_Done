import { describe, expect, it, vi } from 'vitest';
import { DAILY_DESK_PROVIDER_POLICY } from '@/lib/daily-desk';
import { MacMiniDailyDeskResearchWorker, type DailyDeskWorkerTransport } from '@/lib/daily-desk-worker';

const claimed = {
  run: { id: 'run-1', ownerId: 'owner-1', localDate: '2026-08-24' },
  brief: {
    id: 'brief-1',
    region: 'Boston, Massachusetts',
    offer: 'Website Fix',
    targetSegment: 'Local business & operations consultants',
    painFocus: 'Offer and conversion-clarity pain',
  },
};

const twoProspects = {
  prospects: [
    {
      companyName: 'Northstar Operations', officialWebsite: 'https://northstar.example', role: 'Operations consultant', contactPath: 'https://northstar.example/contact',
      observedEvidence: [{ claim: 'Works with owner-led local companies.', citationUrls: ['https://northstar.example/about'] }],
      citations: [{ url: 'https://northstar.example/about', title: 'About Northstar', excerpt: 'Public operations consulting details.' }],
      draftSubject: 'A conversion-clarity observation', draftBody: 'A manual-only follow-up draft.',
    },
    {
      companyName: 'Harbor Business Systems', officialWebsite: 'https://harbor.example', role: 'Business consultant', contactPath: 'https://harbor.example/contact',
      observedEvidence: [{ claim: 'Advises nearby small businesses.', citationUrls: ['https://harbor.example/services'] }],
      citations: [{ url: 'https://harbor.example/services', title: 'Services', excerpt: 'Public business systems consulting details.' }],
      draftSubject: 'A contained website-fix thought', draftBody: 'A manual-only follow-up draft.',
    },
  ],
};

function transport(overrides: Partial<DailyDeskWorkerTransport> = {}) {
  return {
    schedule: vi.fn().mockResolvedValue({ queued: 1 }),
    claim: vi.fn().mockResolvedValue(claimed),
    route: vi.fn().mockResolvedValue({
      route: {
        modelId: 'provider/quality-priced', estimatedCostUsd: 0.12,
        providerPolicy: DAILY_DESK_PROVIDER_POLICY,
        rationale: 'quality-approved, price-known, and within the remaining budget',
      },
    }),
    reserve: vi.fn().mockResolvedValue({ reservationKey: 'reservation-1', reservedCost: 0.12 }),
    report: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } satisfies DailyDeskWorkerTransport;
}

describe('MacMiniDailyDeskResearchWorker', () => {
  it('reports a clear shortfall without a provider call when the Vercel policy cannot select a model', async () => {
    const signedTransport = transport({ route: vi.fn().mockResolvedValue({ route: null, reason: 'No quality-approved, price-known candidate fits the remaining budget.' }) });
    const chatCompletion = vi.fn();
    const worker = new MacMiniDailyDeskResearchWorker('mac-mini-1', signedTransport, { chatCompletion });

    await expect(worker.runOnce()).resolves.toBe(true);

    expect(chatCompletion).not.toHaveBeenCalled();
    expect(signedTransport.reserve).not.toHaveBeenCalled();
    expect(signedTransport.report).toHaveBeenCalledWith(expect.objectContaining({
      status: 'shortfall',
      prospects: [],
      shortfallReason: 'No quality-approved, price-known candidate fits the remaining budget.',
    }));
  });

  it('uses only the server-selected route, strict provider policy, public web search, and manual-only results', async () => {
    const signedTransport = transport();
    const chatCompletion = vi.fn().mockResolvedValue({
      model: 'provider/quality-priced',
      content: JSON.stringify(twoProspects),
      citations: [
        { url: 'https://northstar.example/about', title: 'About Northstar', excerpt: 'Public operations consulting details.' },
        { url: 'https://harbor.example/services', title: 'Services', excerpt: 'Public business systems consulting details.' },
      ],
      usage: { promptTokens: 100, completionTokens: 50, costUsd: 0.08, raw: { cost: 0.08 } },
    });
    const worker = new MacMiniDailyDeskResearchWorker('mac-mini-1', signedTransport, { chatCompletion });

    await expect(worker.runOnce()).resolves.toBe(true);

    expect(chatCompletion).toHaveBeenCalledWith(expect.objectContaining({
      model: 'provider/quality-priced',
      providerPolicy: DAILY_DESK_PROVIDER_POLICY,
      webSearch: { maxResults: 8 },
    }));
    expect(signedTransport.report).toHaveBeenCalledWith(expect.objectContaining({
      status: 'succeeded',
      actualCostUsd: 0.08,
      actualModelId: 'provider/quality-priced',
      prospects: twoProspects.prospects,
    }));
  });

  it('fails closed when the provider omits actual cost after a reserved request', async () => {
    const signedTransport = transport();
    const chatCompletion = vi.fn().mockResolvedValue({
      model: 'provider/quality-priced', content: JSON.stringify(twoProspects), citations: [],
      usage: { promptTokens: 100, completionTokens: 50, costUsd: null, raw: {} },
    });
    const worker = new MacMiniDailyDeskResearchWorker('mac-mini-1', signedTransport, { chatCompletion });

    await expect(worker.runOnce()).resolves.toBe(true);

    expect(signedTransport.report).toHaveBeenCalledWith(expect.objectContaining({
      status: 'failed', actualCostUsd: null, reservationKey: 'reservation-1',
    }));
  });

  it('rejects prospects when a public-web research response has no provider citations', async () => {
    const signedTransport = transport();
    const chatCompletion = vi.fn().mockResolvedValue({
      model: 'provider/quality-priced', content: JSON.stringify(twoProspects), citations: [],
      usage: { promptTokens: 100, completionTokens: 50, costUsd: 0.08, raw: { cost: 0.08 } },
    });
    const worker = new MacMiniDailyDeskResearchWorker('mac-mini-1', signedTransport, { chatCompletion });

    await expect(worker.runOnce()).resolves.toBe(true);

    expect(signedTransport.report).toHaveBeenCalledWith(expect.objectContaining({
      status: 'failed', prospects: [], reservationKey: 'reservation-1', actualCostUsd: 0.08,
    }));
  });
});
