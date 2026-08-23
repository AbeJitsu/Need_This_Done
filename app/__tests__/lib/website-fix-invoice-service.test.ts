import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSupabaseAdmin, invoiceAdapter } = vi.hoisted(() => ({
  getSupabaseAdmin: vi.fn(),
  invoiceAdapter: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/lib/supabase', () => ({ getSupabaseAdmin }));
vi.mock('@/lib/provider-adapters', () => ({ invoiceAdapter }));

import { executeWebsiteFixInvoice } from '@/lib/website-fix-invoice-service';

const projectId = '10000000-0000-4000-8000-000000000001';
const operationId = '20000000-0000-4000-8000-000000000001';

function fixture(options: { stored?: Record<string, unknown>; retryable?: boolean; acceptError?: boolean } = {}) {
  const from = vi.fn((table: string) => {
    const builder: Record<string, ReturnType<typeof vi.fn>> = {};
    for (const method of ['select', 'eq']) builder[method] = vi.fn(() => builder);
    builder.maybeSingle = vi.fn(async () => {
      if (table === 'provider_operations') return { data: options.stored || null, error: null };
      if (table === 'projects') return { data: { id: projectId }, error: null };
      if (table === 'website_improvement_invoice_references') {
        return { data: { id: 'reference-1', stripe_invoice_id: 'in_fake_original-key', amount_cents: 25000, currency: 'usd', test_mode: true }, error: null };
      }
      throw new Error(`Unexpected table ${table}`);
    });
    return builder;
  });
  const rpc = vi.fn(async (name: string, args: Record<string, unknown>) => {
    if (name === 'upsert_provider_operation') return { data: {
      id: operationId, provider: 'stripe', operation_type: args.target_operation_type,
      idempotency_key: args.target_idempotency_key, status: args.target_status,
      provider_reference: args.target_provider_reference || null,
      request_metadata: args.target_request_metadata,
    }, error: null };
    if (name === 'assert_provider_operation_retryable') return { data: { retryable: options.retryable ?? true }, error: null };
    if (name === 'accept_website_improvement_invoice') return options.acceptError
      ? { data: null, error: { message: 'database unavailable' } }
      : { data: { id: 'reference-1', stripe_invoice_id: args.target_stripe_invoice_id, amount_cents: 25000, currency: 'usd', test_mode: true }, error: null };
    throw new Error(`Unexpected RPC ${name}`);
  });
  getSupabaseAdmin.mockReturnValue({ from, rpc });
  return { rpc };
}

describe('test-only Website Fix invoice service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('persists exactly 25000 cents USD in test mode before adapter access', async () => {
    const { rpc } = fixture();
    invoiceAdapter.mockReturnValue({ mode: 'disabled', adapter: null });
    const response = await executeWebsiteFixInvoice({ userId: 'operator-1', projectId });
    expect(response).toMatchObject({ status: 503, body: { operationId } });
    expect(rpc).toHaveBeenCalledWith('upsert_provider_operation', expect.objectContaining({
      target_request_metadata: { project_id: projectId, amount_cents: 25000, currency: 'usd', test_mode: true },
      target_status: 'pending',
    }));
  });

  it('keeps the calling adapter fixed to one invoice with no recurring or card-storage behavior', () => {
    const source = readFileSync(resolve(__dirname, '../../lib/provider-adapters.ts'), 'utf8');
    expect(source).toContain("currency: 'usd', amount: 25000");
    expect(source).toContain("description: 'Website Fix start invoice'");
    expect(source).not.toContain('subscriptions.create');
    expect(source).not.toContain('paymentMethods.create');
    expect(source).not.toContain('checkout.sessions.create');
  });

  it('retries with the stored exact key and commits the invoice reference', async () => {
    fixture({ stored: {
      id: operationId, provider: 'stripe', operation_type: 'website_improvement_start_invoice',
      idempotency_key: 'original-key', status: 'failed_retryable', provider_reference: null,
      request_metadata: { project_id: projectId, amount_cents: 25000, currency: 'usd', test_mode: true },
    } });
    const createStartInvoice = vi.fn().mockResolvedValue({ invoiceId: 'in_fake_original-key' });
    invoiceAdapter.mockReturnValue({ mode: 'fake', adapter: { createStartInvoice } });
    const response = await executeWebsiteFixInvoice({ userId: 'operator-1', operationId });
    expect(response.status).toBe(201);
    expect(createStartInvoice).toHaveBeenCalledWith({ idempotencyKey: 'original-key', projectId });
    expect(response.body).toMatchObject({ amountCents: 25000, currency: 'usd', testMode: true, operationId });
  });

  it('records fake/provider failure as retryable under the same key', async () => {
    const { rpc } = fixture();
    invoiceAdapter.mockReturnValue({
      mode: 'fake', adapter: { createStartInvoice: vi.fn().mockRejectedValue(new Error('deterministic fake failure')) },
    });
    const response = await executeWebsiteFixInvoice({ userId: 'operator-1', projectId });
    expect(response.status).toBe(502);
    expect(rpc).toHaveBeenCalledWith('upsert_provider_operation', expect.objectContaining({
      target_status: 'failed_retryable', target_error: 'deterministic fake failure',
    }));
  });

  it('records acceptance unknown when Stripe accepts before the database reference', async () => {
    const { rpc } = fixture({ acceptError: true });
    invoiceAdapter.mockReturnValue({
      mode: 'fake', adapter: { createStartInvoice: vi.fn().mockResolvedValue({ invoiceId: 'in_fake_unknown' }) },
    });
    const response = await executeWebsiteFixInvoice({ userId: 'operator-1', projectId });
    expect(response.status).toBe(503);
    expect(rpc).toHaveBeenCalledWith('upsert_provider_operation', expect.objectContaining({
      target_status: 'acceptance_unknown', target_provider_reference: 'in_fake_unknown',
    }));
  });
});
